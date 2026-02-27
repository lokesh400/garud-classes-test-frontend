import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import { FiClock, FiSend, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const TestAttempt = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Navigation
  const [currentSection, setCurrentSection] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  // Answers map: { `${sectionId}_${questionId}`: { selectedOption, numericalAnswer } }
  const [answers, setAnswers] = useState({});

  // Timer
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    startTest();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [testId]);

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
      const duration = res.data.test.duration * 60; // seconds
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      const remaining = Math.max(0, duration - elapsed);
      setTimeLeft(remaining);

      // Restore saved answers
      if (res.data.attempt.answers) {
        const savedAnswers = {};
        res.data.attempt.answers.forEach((a) => {
          const key = `${a.sectionId}_${a.question}`;
          savedAnswers[key] = {
            selectedOption: a.selectedOption,
            numericalAnswer: a.numericalAnswer,
          };
        });
        setAnswers(savedAnswers);
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
    saveAnswer(sectionId, questionId, newAnswers[key]);
  };

  const clearAnswer = (sectionId, questionId) => {
    const key = `${sectionId}_${questionId}`;
    const newAnswers = { ...answers };
    newAnswers[key] = { selectedOption: null, numericalAnswer: null };
    setAnswers(newAnswers);
    saveAnswer(sectionId, questionId, newAnswers[key]);
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
      const res = await API.post(`/tests/${testId}/submit`);
      toast.success(
        autoSubmit ? 'Time up! Test auto-submitted.' : 'Test submitted successfully!'
      );
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-garud-highlight"></div>
      </div>
    );
  }

  if (!test) return null;

  const section = test.sections[currentSection];
  const questionEntry = section?.questions[currentQuestion];
  const answerKey = `${section?._id}_${questionEntry?.question?._id}`;
  const currentAnswer = answers[answerKey];

  // Total questions for navigation
  const totalQuestionsFlat = test.sections.flatMap((s) => s.questions);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Bar */}
      <div className="bg-garud-dark text-white sticky top-0 z-20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-bold">{test.name}</h1>
          <div className="flex items-center gap-4">
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono font-bold ${
                timeLeft < 300 ? 'bg-red-600 animate-pulse' : 'bg-garud-accent'
              }`}
            >
              <FiClock />
              {formatTime(timeLeft)}
            </div>
            <button
              onClick={() => handleSubmit(false)}
              disabled={submitting}
              className="flex items-center gap-2 px-4 py-1.5 bg-garud-highlight rounded-lg hover:bg-red-600 transition font-semibold disabled:opacity-50"
            >
              <FiSend /> Submit
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4 flex gap-4">
        {/* Main Area */}
        <div className="flex-1">
          {/* Section Tabs */}
          <div className="flex gap-2 mb-4 overflow-x-auto">
            {test.sections.map((s, idx) => (
              <button
                key={s._id}
                onClick={() => {
                  setCurrentSection(idx);
                  setCurrentQuestion(0);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                  currentSection === idx
                    ? 'bg-garud-accent text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>

          {/* Question Display */}
          {questionEntry && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800">
                  Question {currentQuestion + 1} of {section.questions.length}
                </h3>
                <div className="text-sm text-gray-500">
                  +{questionEntry.positiveMarks} / -{questionEntry.negativeMarks} marks
                </div>
              </div>

              {/* Question Image */}
              <div className="mb-6 flex justify-center bg-gray-50 rounded-lg p-4">
                <img
                  src={questionEntry.question.imageUrl}
                  alt="Question"
                  className="max-w-full max-h-96 object-contain"
                />
              </div>

              {/* Answer Input */}
              {questionEntry.question.type === 'mcq' ? (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-600 mb-2">Select your answer:</p>
                  <div className="grid grid-cols-2 gap-3">
                    {['A', 'B', 'C', 'D'].map((opt) => (
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
                        className={`p-4 rounded-lg border-2 text-lg font-semibold transition ${
                          currentAnswer?.selectedOption === opt
                            ? 'border-garud-accent bg-blue-50 text-garud-accent'
                            : 'border-gray-200 hover:border-gray-300 text-gray-600'
                        }`}
                      >
                        Option {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Enter numerical answer:</p>
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
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-lg focus:ring-2 focus:ring-garud-accent focus:border-transparent outline-none"
                    placeholder="Type your answer here..."
                  />
                </div>
              )}

              {/* Clear & Navigation */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t">
                <button
                  onClick={() => clearAnswer(section._id, questionEntry.question._id)}
                  className="px-4 py-2 text-sm text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                >
                  Clear Response
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                    disabled={currentQuestion === 0}
                    className="flex items-center gap-1 px-4 py-2 text-sm bg-gray-100 rounded-lg hover:bg-gray-200 transition disabled:opacity-40"
                  >
                    <FiChevronLeft /> Previous
                  </button>
                  <button
                    onClick={() =>
                      setCurrentQuestion(
                        Math.min(section.questions.length - 1, currentQuestion + 1)
                      )
                    }
                    disabled={currentQuestion === section.questions.length - 1}
                    className="flex items-center gap-1 px-4 py-2 text-sm bg-garud-accent text-white rounded-lg hover:bg-blue-800 transition disabled:opacity-40"
                  >
                    Next <FiChevronRight />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Question Navigation Panel */}
        <div className="w-64 flex-shrink-0 hidden md:block">
          <div className="bg-white rounded-xl shadow-md p-4 sticky top-20">
            <h4 className="font-semibold text-gray-700 mb-3">Question Navigator</h4>
            {test.sections.map((s, sIdx) => (
              <div key={s._id} className="mb-4">
                <p className="text-xs font-medium text-gray-500 mb-2">{s.name}</p>
                <div className="grid grid-cols-5 gap-1.5">
                  {s.questions.map((q, qIdx) => {
                    const aKey = `${s._id}_${q.question._id}`;
                    const answered =
                      answers[aKey]?.selectedOption || answers[aKey]?.numericalAnswer !== null;
                    const isCurrent = currentSection === sIdx && currentQuestion === qIdx;

                    return (
                      <button
                        key={q._id}
                        onClick={() => {
                          setCurrentSection(sIdx);
                          setCurrentQuestion(qIdx);
                        }}
                        className={`w-9 h-9 rounded-lg text-xs font-medium transition ${
                          isCurrent
                            ? 'bg-garud-accent text-white ring-2 ring-garud-highlight'
                            : answered
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {qIdx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Legend */}
            <div className="mt-4 pt-3 border-t space-y-1.5 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-green-500"></div>
                <span className="text-gray-600">Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-gray-100 border"></div>
                <span className="text-gray-600">Not Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-garud-accent ring-2 ring-garud-highlight"></div>
                <span className="text-gray-600">Current</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestAttempt;
