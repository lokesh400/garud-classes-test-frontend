import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import toast from 'react-hot-toast';

const TestAttempt = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showPalette, setShowPalette] = useState(false);

  // Navigation
  const [currentSection, setCurrentSection] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  // Answers map: { `${sectionId}_${questionId}`: { selectedOption, numericalAnswer } }
  const [answers, setAnswers] = useState({});

  // NTA-style statuses
  const [visited, setVisited] = useState({}); // keys that have been visited
  const [markedForReview, setMarkedForReview] = useState({}); // keys marked for review

  // Timer
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    startTest();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [testId]);

  // Mark first question as visited on load
  useEffect(() => {
    if (test) {
      const section = test.sections[0];
      if (section?.questions[0]) {
        const key = `${section._id}_${section.questions[0].question._id}`;
        setVisited((prev) => ({ ...prev, [key]: true }));
      }
    }
  }, [test]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0 && test) {
      handleSubmit(true);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [timeLeft > 0]);

  const startTest = async () => {
    try {
      const res = await API.post(`/tests/${testId}/start`);
      setTest(res.data.test);
      setAttempt(res.data.attempt);

      // Calculate remaining time
      const startedAt = new Date(res.data.attempt.startedAt).getTime();
      const duration = res.data.test.duration * 60;
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      const remaining = Math.max(0, duration - elapsed);
      setTimeLeft(remaining);

      // Restore saved answers
      if (res.data.attempt.answers) {
        const savedAnswers = {};
        const savedVisited = {};
        res.data.attempt.answers.forEach((a) => {
          const key = `${a.sectionId}_${a.question}`;
          savedAnswers[key] = {
            selectedOption: a.selectedOption,
            numericalAnswer: a.numericalAnswer,
          };
          savedVisited[key] = true;
        });
        setAnswers(savedAnswers);
        setVisited(savedVisited);
      }
    } catch (error) {
      if (error.response?.data?.message === 'You have already submitted this test') {
        toast.error('You have already submitted this test');
        navigate(`/student/results/${testId}`);
      } else {
        toast.error(error.response?.data?.message || 'Failed to start test');
        navigate('/student/dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  const saveAnswer = useCallback(
    async (sectionId, questionId, answerData) => {
      try {
        await API.post(`/tests/${testId}/answer`, {
          questionId,
          sectionId,
          ...answerData,
        });
      } catch (error) {
        console.error('Failed to auto-save answer');
      }
    },
    [testId]
  );

  const handleAnswerChange = (sectionId, questionId, type, value) => {
    const key = `${sectionId}_${questionId}`;
    const newAnswers = { ...answers };

    if (type === 'mcq') {
      newAnswers[key] = { selectedOption: value, numericalAnswer: null };
    } else {
      newAnswers[key] = { selectedOption: null, numericalAnswer: value };
    }

    setAnswers(newAnswers);
    // Don't auto-save on every change; save on "Save & Next"
  };

  const clearAnswer = (sectionId, questionId) => {
    const key = `${sectionId}_${questionId}`;
    const newAnswers = { ...answers };
    newAnswers[key] = { selectedOption: null, numericalAnswer: null };
    setAnswers(newAnswers);
    saveAnswer(sectionId, questionId, newAnswers[key]);
  };

  // NTA-style: Save & Next
  const handleSaveAndNext = () => {
    if (!section || !questionEntry) return;
    const key = `${section._id}_${questionEntry.question._id}`;
    const ans = answers[key];
    if (ans) {
      saveAnswer(section._id, questionEntry.question._id, ans);
    }
    goToNext();
  };

  // NTA-style: Mark for Review & Next
  const handleMarkForReviewAndNext = () => {
    if (!section || !questionEntry) return;
    const key = `${section._id}_${questionEntry.question._id}`;
    setMarkedForReview((prev) => ({ ...prev, [key]: true }));
    const ans = answers[key];
    if (ans) {
      saveAnswer(section._id, questionEntry.question._id, ans);
    }
    goToNext();
  };

  const goToNext = () => {
    if (currentQuestion < section.questions.length - 1) {
      navigateToQuestion(currentSection, currentQuestion + 1);
    } else if (currentSection < test.sections.length - 1) {
      navigateToQuestion(currentSection + 1, 0);
    }
  };

  const goToPrev = () => {
    if (currentQuestion > 0) {
      navigateToQuestion(currentSection, currentQuestion - 1);
    } else if (currentSection > 0) {
      const prevSec = currentSection - 1;
      navigateToQuestion(prevSec, test.sections[prevSec].questions.length - 1);
    }
  };

  const navigateToQuestion = (secIdx, qIdx) => {
    setCurrentSection(secIdx);
    setCurrentQuestion(qIdx);
    const s = test.sections[secIdx];
    const q = s.questions[qIdx];
    if (q) {
      const key = `${s._id}_${q.question._id}`;
      setVisited((prev) => ({ ...prev, [key]: true }));
    }
  };

  const handleSubmit = async (autoSubmit = false) => {
    if (!autoSubmit) {
      const confirmed = window.confirm(
        'Are you sure you want to submit the test? You cannot change answers after submission.'
      );
      if (!confirmed) return;
    }

    setSubmitting(true);
    try {
      await API.post(`/tests/${testId}/submit`);
      toast.success(autoSubmit ? 'Time up! Test auto-submitted.' : 'Test submitted successfully!');
      navigate(`/student/results/${testId}`);
    } catch (error) {
      toast.error('Failed to submit test');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Determine NTA-style status for a question key
  const getQuestionStatus = (key) => {
    const isAnswered =
      answers[key]?.selectedOption != null ||
      (answers[key]?.numericalAnswer != null && answers[key]?.numericalAnswer !== '');
    const isVisited = visited[key];
    const isMarked = markedForReview[key];

    if (isMarked && isAnswered) return 'answered-marked'; // purple + green
    if (isMarked) return 'marked'; // purple
    if (isAnswered) return 'answered'; // green
    if (isVisited) return 'not-answered'; // red/orange
    return 'not-visited'; // gray
  };

  // Status colors matching NTA
  const statusStyles = {
    'not-visited': 'bg-[#c0c0c0] text-gray-700',
    'not-answered': 'bg-[#e74c3c] text-white',
    answered: 'bg-[#27ae60] text-white',
    marked: 'bg-[#8e44ad] text-white',
    'answered-marked': 'bg-[#8e44ad] text-white ring-2 ring-[#27ae60] ring-offset-1',
  };

  useEffect(() => {
    // Request browser to go fullscreen when test loads
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    }
    return () => {
      // Exit fullscreen when leaving test
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f0f2f5]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-3"></div>
          <p className="text-gray-500 text-sm">Loading test...</p>
        </div>
      </div>
    );
  }

  if (!test) return null;

  const section = test.sections[currentSection];
  const questionEntry = section?.questions[currentQuestion];
  const answerKey = `${section?._id}_${questionEntry?.question?._id}`;
  const currentAnswer = answers[answerKey];

  // Count stats per status
  const getStats = () => {
    let answered = 0,
      notAnswered = 0,
      marked = 0,
      answeredMarked = 0,
      notVisited = 0;
    test.sections.forEach((s) => {
      s.questions.forEach((q) => {
        const key = `${s._id}_${q.question._id}`;
        const st = getQuestionStatus(key);
        if (st === 'answered') answered++;
        else if (st === 'not-answered') notAnswered++;
        else if (st === 'marked') marked++;
        else if (st === 'answered-marked') answeredMarked++;
        else notVisited++;
      });
    });
    return { answered, notAnswered, marked, answeredMarked, notVisited };
  };

  const stats = getStats();

  return (
    <div className="h-screen bg-[#e8eaf0] flex flex-col overflow-hidden">
      {/* ===== NTA-style Header ===== */}
      <header className="bg-gradient-to-r from-[#1a237e] to-[#283593] text-white shadow-md flex-shrink-0">
        <div className="flex items-center justify-between px-4 py-2.5">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-base sm:text-lg font-bold leading-tight">{test.name}</h1>
              <p className="text-[11px] text-blue-200">Garud Classes Test Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Timer */}
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded font-mono font-bold text-sm sm:text-base ${
                timeLeft < 300
                  ? 'bg-red-600 animate-pulse'
                  : timeLeft < 600
                  ? 'bg-orange-500'
                  : 'bg-[#1b5e20]'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {formatTime(timeLeft)}
            </div>
            {/* Mobile palette toggle */}
            <button
              onClick={() => setShowPalette(!showPalette)}
              className="md:hidden bg-white/20 p-2 rounded"
              title="Question Palette"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* ===== Section Tabs ===== */}
      <div className="bg-white border-b shadow-sm flex-shrink-0">
        <div className="flex overflow-x-auto">
          {test.sections.map((s, idx) => (
            <button
              key={s._id}
              onClick={() => navigateToQuestion(idx, 0)}
              className={`px-5 py-2.5 text-sm font-semibold whitespace-nowrap border-b-3 transition-all ${
                currentSection === idx
                  ? 'border-b-[3px] border-[#1a237e] text-[#1a237e] bg-blue-50'
                  : 'border-b-[3px] border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>

      {/* ===== Main Content ===== */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Question Panel */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {questionEntry && (
            <>
              {/* Question Header */}
              <div className="bg-white border-b px-4 sm:px-6 py-3 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <span className="bg-[#1a237e] text-white text-xs font-bold px-3 py-1 rounded">
                    Q.{currentQuestion + 1}
                  </span>
                  <span className="text-sm text-gray-500">
                    {questionEntry.question.type === 'mcq'
                      ? 'Multiple Choice'
                      : 'Numerical Value'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded font-semibold">
                    +{questionEntry.positiveMarks}
                  </span>
                  <span className="bg-red-100 text-red-700 px-2.5 py-1 rounded font-semibold">
                    -{questionEntry.negativeMarks}
                  </span>
                </div>
              </div>

              {/* Question Body - scrollable */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                {/* Question Image */}
                <div className="bg-white rounded-lg border shadow-sm p-4 mb-5">
                  <div className="flex justify-start">
                    <img
                      src={questionEntry.question.imageUrl}
                      alt={`Question ${currentQuestion + 1}`}
                      className="max-w-full max-h-[45vh] object-contain"
                    />
                  </div>
                </div>

                {/* Answer Input */}
                {questionEntry.question.type === 'mcq' ? (
                  <div className="space-y-2.5">
                    {['A', 'B', 'C', 'D'].map((opt) => {
                      const isSelected = currentAnswer?.selectedOption === opt;
                      return (
                        <button
                          key={opt}
                          onClick={() =>
                            handleAnswerChange(
                              section._id,
                              questionEntry.question._id,
                              'mcq',
                              opt
                            )
                          }
                          className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg border-2 transition-all text-left ${
                            isSelected
                              ? 'border-[#1a237e] bg-[#e8eaf6] shadow-sm'
                              : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <span
                            className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                              isSelected
                                ? 'bg-[#1a237e] text-white'
                                : 'bg-gray-100 text-gray-600 border border-gray-300'
                            }`}
                          >
                            {opt}
                          </span>
                          <span
                            className={`text-sm font-medium ${
                              isSelected ? 'text-[#1a237e]' : 'text-gray-700'
                            }`}
                          >
                            Option {opt}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-white rounded-lg border shadow-sm p-5">
                    <label className="block text-sm font-semibold text-gray-600 mb-2">
                      Enter your answer:
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={currentAnswer?.numericalAnswer ?? ''}
                      onChange={(e) =>
                        handleAnswerChange(
                          section._id,
                          questionEntry.question._id,
                          'numerical',
                          e.target.value ? parseFloat(e.target.value) : null
                        )
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-lg focus:ring-2 focus:ring-[#1a237e] focus:border-transparent outline-none"
                      placeholder="Type your numerical answer..."
                    />
                  </div>
                )}
              </div>

              {/* ===== NTA-style Bottom Action Bar ===== */}
              <div className="bg-white border-t shadow-[0_-2px_8px_rgba(0,0,0,0.06)] flex-shrink-0">
                <div className="flex flex-wrap items-center justify-between gap-2 px-3 sm:px-5 py-3">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={handleMarkForReviewAndNext}
                      className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold bg-[#8e44ad] text-white rounded hover:bg-[#7d3c98] transition-colors"
                    >
                      Mark for Review & Next
                    </button>
                    <button
                      onClick={() => clearAnswer(section._id, questionEntry.question._id)}
                      className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                    >
                      Clear Response
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={goToPrev}
                      disabled={currentSection === 0 && currentQuestion === 0}
                      className="px-3 sm:px-5 py-2 text-xs sm:text-sm font-semibold bg-[#1565c0] text-white rounded hover:bg-[#0d47a1] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      &lt;&lt; Back
                    </button>
                    <button
                      onClick={handleSaveAndNext}
                      className="px-3 sm:px-5 py-2 text-xs sm:text-sm font-semibold bg-[#27ae60] text-white rounded hover:bg-[#219a52] transition-colors"
                    >
                      Save & Next &gt;&gt;
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* ===== NTA-style Question Palette (Right Panel) ===== */}
        {/* Mobile overlay backdrop */}
        {showPalette && (
          <div
            className="md:hidden fixed inset-0 bg-black/40 z-30"
            onClick={() => setShowPalette(false)}
          />
        )}

        <div
          className={`${
            showPalette ? 'translate-x-0' : 'translate-x-full'
          } md:translate-x-0 fixed md:static right-0 top-0 md:top-auto h-full z-40 md:z-auto w-72 md:w-64 bg-white border-l shadow-lg md:shadow-none flex flex-col flex-shrink-0 transition-transform duration-300`}
        >
          {/* Palette Header */}
          <div className="bg-[#1a237e] text-white px-4 py-3 flex items-center justify-between flex-shrink-0">
            <span className="text-sm font-bold">Question Palette</span>
            <button onClick={() => setShowPalette(false)} className="md:hidden text-white/80 hover:text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Question Grid - scrollable */}
          <div className="flex-1 overflow-y-auto p-3">
            {test.sections.map((s, sIdx) => (
              <div key={s._id} className="mb-4">
                <p className="text-xs font-bold text-[#1a237e] uppercase tracking-wide mb-2 px-1">
                  {s.name}
                </p>
                <div className="grid grid-cols-5 gap-2">
                  {s.questions.map((q, qIdx) => {
                    const key = `${s._id}_${q.question._id}`;
                    const status = getQuestionStatus(key);
                    const isCurrent = currentSection === sIdx && currentQuestion === qIdx;

                    return (
                      <button
                        key={q._id}
                        onClick={() => {
                          navigateToQuestion(sIdx, qIdx);
                          setShowPalette(false);
                        }}
                        title={`Q${qIdx + 1} - ${status.replace('-', ' ')}`}
                        className={`relative w-10 h-10 rounded-md text-xs font-bold transition-all ${
                          statusStyles[status]
                        } ${isCurrent ? 'scale-110 shadow-lg ring-2 ring-yellow-400' : 'hover:scale-105'}`}
                      >
                        {qIdx + 1}
                        {/* Green dot for answered+marked */}
                        {status === 'answered-marked' && (
                          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#27ae60] rounded-full border-2 border-white"></span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* ===== NTA Legend ===== */}
          <div className="border-t bg-gray-50 px-3 py-3 flex-shrink-0">
            <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-[11px]">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-sm bg-[#27ae60] inline-flex items-center justify-center text-white font-bold text-[9px]">
                  1
                </span>
                <span className="text-gray-600">Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-sm bg-[#e74c3c] inline-flex items-center justify-center text-white font-bold text-[9px]">
                  2
                </span>
                <span className="text-gray-600">Not Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-sm bg-[#c0c0c0] inline-flex items-center justify-center text-gray-700 font-bold text-[9px]">
                  3
                </span>
                <span className="text-gray-600">Not Visited</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-sm bg-[#8e44ad] inline-flex items-center justify-center text-white font-bold text-[9px]">
                  4
                </span>
                <span className="text-gray-600">Marked Review</span>
              </div>
              <div className="flex items-center gap-2 col-span-2">
                <span className="relative w-5 h-5 rounded-sm bg-[#8e44ad] inline-flex items-center justify-center text-white font-bold text-[9px]">
                  5
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#27ae60] rounded-full border border-white"></span>
                </span>
                <span className="text-gray-600">Answered & Marked for Review</span>
              </div>
            </div>
          </div>

          {/* Status Summary */}
          <div className="border-t bg-white px-3 py-2.5 flex-shrink-0">
            <div className="flex justify-between text-[10px] text-gray-500 font-medium">
              <span>
                <b className="text-[#27ae60]">{stats.answered}</b> Ans
              </span>
              <span>
                <b className="text-[#e74c3c]">{stats.notAnswered}</b> N/A
              </span>
              <span>
                <b className="text-[#8e44ad]">{stats.marked + stats.answeredMarked}</b> Rev
              </span>
              <span>
                <b className="text-gray-400">{stats.notVisited}</b> Left
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <div className="border-t px-3 py-3 flex-shrink-0">
            <button
              onClick={() => handleSubmit(false)}
              disabled={submitting}
              className="w-full py-2.5 bg-[#1a237e] text-white font-bold text-sm rounded hover:bg-[#0d1559] transition-colors disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Test'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestAttempt;
