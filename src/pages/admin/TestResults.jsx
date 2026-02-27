import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import { FiArrowLeft } from 'react-icons/fi';

const TestResults = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [testName, setTestName] = useState('');

  useEffect(() => {
    fetchResults();
  }, [testId]);

  const fetchResults = async () => {
    try {
      const [resultsRes, testRes] = await Promise.all([
        API.get(`/tests/${testId}/results`),
        API.get(`/tests/admin/${testId}`),
      ]);
      setResults(resultsRes.data);
      setTestName(testRes.data.name);
    } catch (error) {
      toast.error('Failed to load results');
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/admin/tests')}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Test Results</h1>
          <p className="text-sm text-gray-500">{testName}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Rank</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Student</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Score</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Max</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Percentage</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Submitted</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {results.map((result, idx) => (
              <tr key={result._id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                      idx === 0
                        ? 'bg-yellow-100 text-yellow-700'
                        : idx === 1
                        ? 'bg-gray-100 text-gray-700'
                        : idx === 2
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-white text-gray-500'
                    }`}
                  >
                    {idx + 1}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium text-gray-800">{result.user?.name}</td>
                <td className="px-4 py-3 text-gray-500">{result.user?.email}</td>
                <td className="px-4 py-3 text-right font-bold text-garud-accent">
                  {result.totalScore}
                </td>
                <td className="px-4 py-3 text-right text-gray-500">{result.maxScore}</td>
                <td className="px-4 py-3 text-right">
                  <span
                    className={`font-medium ${
                      result.maxScore > 0 && (result.totalScore / result.maxScore) * 100 >= 60
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {result.maxScore > 0
                      ? ((result.totalScore / result.maxScore) * 100).toFixed(1)
                      : 0}
                    %
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-gray-500">
                  {result.submittedAt
                    ? new Date(result.submittedAt).toLocaleString()
                    : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {results.length === 0 && (
          <div className="p-12 text-center text-gray-400">
            No students have submitted this test yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default TestResults;
