import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiCheck, FiX } from 'react-icons/fi';

const Results = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResult();
  }, [testId]);

  const fetchResult = async () => {
    try {
      const res = await API.get(`/tests/${testId}/my-result`);
      setResult(res.data.attempt);
      setTest(res.data.test);
    } catch (error) {
      toast.error('No results found');
      navigate('/student/dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-garud-highlight"></div>
      </div>
    );
  }

  if (!result || !test) return null;

  const percentage = result.maxScore > 0 ? ((result.totalScore / result.maxScore) * 100).toFixed(1) : 0;
  const totalAnswered = result.answers.filter(
    (a) => a.selectedOption || a.numericalAnswer !== null
  ).length;
  const totalCorrect = result.answers.filter((a) => a.isCorrect).length;
  const totalWrong = totalAnswered - totalCorrect;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/student/dashboard')}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{test.name} — Results</h1>
          <p className="text-sm text-gray-500">
            Submitted: {new Date(result.submittedAt).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Score Card */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-md p-5 text-center">
          <p className="text-sm text-gray-500">Score</p>
          <p className="text-3xl font-bold text-garud-accent mt-1">
            {result.totalScore}/{result.maxScore}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-5 text-center">
          <p className="text-sm text-gray-500">Percentage</p>
          <p
            className={`text-3xl font-bold mt-1 ${
              percentage >= 60 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {percentage}%
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-5 text-center">
          <p className="text-sm text-gray-500">Correct</p>
          <p className="text-3xl font-bold text-green-600 mt-1">{totalCorrect}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-5 text-center">
          <p className="text-sm text-gray-500">Wrong</p>
          <p className="text-3xl font-bold text-red-600 mt-1">{totalWrong}</p>
        </div>
      </div>

      {/* Section-wise Review */}
      {test.sections.map((section, sIdx) => (
        <div key={section._id} className="bg-white rounded-xl shadow-md mb-6 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b">
            <h3 className="font-bold text-gray-800">
              Section {sIdx + 1}: {section.name}
            </h3>
          </div>
          <div className="p-6 space-y-6">
            {section.questions.map((qEntry, qIdx) => {
              const question = qEntry.question;
              const answer = result.answers.find(
                (a) =>
                  a.question?._id === question._id &&
                  a.sectionId === section._id
              );

              return (
                <div key={qEntry._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                        answer?.isCorrect
                          ? 'bg-green-500'
                          : answer?.selectedOption || answer?.numericalAnswer !== null
                          ? 'bg-red-500'
                          : 'bg-gray-400'
                      }`}
                    >
                      {qIdx + 1}
                    </div>
                    <div className="flex-1">
                      <img
                        src={question.imageUrl}
                        alt={`Q${qIdx + 1}`}
                        className="max-h-48 object-contain rounded border bg-gray-50 mb-3"
                      />

                      <div className="flex flex-wrap gap-4 text-sm">
                        {question.type === 'mcq' ? (
                          <>
                            <div className="flex items-center gap-1">
                              <span className="text-gray-500">Your answer:</span>
                              <span
                                className={`font-bold ${
                                  answer?.isCorrect ? 'text-green-600' : 'text-red-600'
                                }`}
                              >
                                {answer?.selectedOption || 'Not answered'}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-gray-500">Correct answer:</span>
                              <span className="font-bold text-green-600">
                                {question.correctOption}
                              </span>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex items-center gap-1">
                              <span className="text-gray-500">Your answer:</span>
                              <span
                                className={`font-bold ${
                                  answer?.isCorrect ? 'text-green-600' : 'text-red-600'
                                }`}
                              >
                                {answer?.numericalAnswer !== null
                                  ? answer.numericalAnswer
                                  : 'Not answered'}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-gray-500">Correct answer:</span>
                              <span className="font-bold text-green-600">
                                {question.correctNumericalAnswer}
                              </span>
                            </div>
                          </>
                        )}
                        <div className="flex items-center gap-1">
                          <span className="text-gray-500">Marks:</span>
                          <span
                            className={`font-bold ${
                              (answer?.marksObtained || 0) > 0
                                ? 'text-green-600'
                                : (answer?.marksObtained || 0) < 0
                                ? 'text-red-600'
                                : 'text-gray-400'
                            }`}
                          >
                            {answer?.marksObtained > 0 ? '+' : ''}
                            {answer?.marksObtained || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      {answer?.isCorrect ? (
                        <FiCheck className="w-6 h-6 text-green-500" />
                      ) : answer?.selectedOption || answer?.numericalAnswer !== null ? (
                        <FiX className="w-6 h-6 text-red-500" />
                      ) : (
                        <span className="text-xs text-gray-400">Skipped</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Results;
