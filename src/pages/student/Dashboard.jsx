import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import { FiClock, FiFileText, FiPlay, FiCheckCircle } from 'react-icons/fi';

const StudentDashboard = () => {
  const [tests, setTests] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const res = await API.get('/tests/published');
      setTests(res.data);
    } catch (error) {
      toast.error('Failed to load tests');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome, Student!</h1>
      <p className="text-gray-500 mb-8">Here are the available tests for you.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tests.map((test) => (
          <div
            key={test._id}
            className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition"
          >
            <div className="h-2 bg-gradient-to-r from-garud-accent to-garud-highlight"></div>
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-2">{test.name}</h3>
              {test.description && (
                <p className="text-sm text-gray-500 mb-4">{test.description}</p>
              )}

              <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-4">
                <span className="flex items-center gap-1">
                  <FiClock className="text-garud-accent" />
                  {test.duration} min
                </span>
                <span className="flex items-center gap-1">
                  <FiFileText className="text-garud-accent" />
                  {test.totalQuestions} questions
                </span>
                <span className="flex items-center gap-1">
                  {test.sectionCount} sections
                </span>
              </div>

              {test.isSubmitted ? (
                <button
                  onClick={() => navigate(`/student/results/${test._id}`)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition"
                >
                  <FiCheckCircle /> View Results
                </button>
              ) : test.attempted ? (
                <button
                  onClick={() => navigate(`/student/test/${test._id}`)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-600 transition"
                >
                  <FiPlay /> Continue Test
                </button>
              ) : (
                <button
                  onClick={() => navigate(`/student/test/${test._id}`)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-garud-highlight text-white font-semibold rounded-lg hover:bg-red-600 transition"
                >
                  <FiPlay /> Start Test
                </button>
              )}
            </div>
          </div>
        ))}

        {tests.length === 0 && (
          <div className="col-span-full bg-white rounded-xl shadow-md p-12 text-center text-gray-400">
            No tests available at the moment. Check back later!
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
