import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import { FiPlus, FiTrash2, FiEdit2, FiEye, FiEyeOff, FiUsers } from 'react-icons/fi';

const TestList = () => {
  const [tests, setTests] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newTest, setNewTest] = useState({ name: '', description: '', duration: 180 });
  const navigate = useNavigate();

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const res = await API.get('/tests/admin/all');
      setTests(res.data);
    } catch (error) {
      toast.error('Failed to load tests');
    }
  };

  const createTest = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/tests', newTest);
      toast.success('Test created!');
      setShowCreate(false);
      setNewTest({ name: '', description: '', duration: 180 });
      navigate(`/admin/tests/${res.data._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create test');
    }
  };

  const togglePublish = async (testId, currentStatus) => {
    try {
      await API.put(`/tests/${testId}`, { isPublished: !currentStatus });
      fetchTests();
      toast.success(currentStatus ? 'Test unpublished' : 'Test published!');
    } catch (error) {
      toast.error('Failed to update test');
    }
  };

  const deleteTest = async (testId) => {
    if (!window.confirm('Delete this test? This will also delete all student attempts.')) return;
    try {
      await API.delete(`/tests/${testId}`);
      fetchTests();
      toast.success('Test deleted');
    } catch (error) {
      toast.error('Failed to delete test');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Tests</h1>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 px-4 py-2 bg-transparent border border-garud-highlight text-garud-highlight rounded-lg hover:bg-gray-100 hover:text-garud-highlight transition"
        >
          <FiPlus /> Create Test
        </button>
      </div>

      {/* Create Test Form */}
      {showCreate && (
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">New Test</h2>
          <form onSubmit={createTest} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Test Name</label>
                <input
                  type="text"
                  value={newTest.name}
                  onChange={(e) => setNewTest({ ...newTest, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-garud-accent outline-none"
                  placeholder="e.g., Physics Weekly Test 1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  value={newTest.duration}
                  onChange={(e) => setNewTest({ ...newTest, duration: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-garud-accent outline-none"
                  min="1"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={newTest.description}
                onChange={(e) => setNewTest({ ...newTest, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-garud-accent outline-none"
                rows={2}
                placeholder="Optional description..."
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-6 py-2 bg-garud-accent text-white rounded-lg hover:bg-blue-800 transition"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tests List */}
      <div className="space-y-4">
        {tests.map((test) => {
          const totalQuestions = test.sections?.reduce(
            (acc, s) => acc + (s.questions?.length || 0), 0
          ) || 0;

          return (
            <div key={test._id} className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-gray-800">{test.name}</h3>
                    <span
                      className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                        test.isPublished
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {test.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  {test.description && (
                    <p className="text-sm text-gray-500 mt-1">{test.description}</p>
                  )}
                  <div className="flex gap-4 mt-2 text-sm text-gray-500">
                    <span>Duration: {test.duration} min</span>
                    <span>Sections: {test.sections?.length || 0}</span>
                    <span>Questions: {totalQuestions}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => togglePublish(test._id, test.isPublished)}
                    className={`p-2 rounded-lg transition ${
                      test.isPublished
                        ? 'text-yellow-600 hover:bg-yellow-50'
                        : 'text-green-600 hover:bg-green-50'
                    }`}
                    title={test.isPublished ? 'Unpublish' : 'Publish'}
                  >
                    {test.isPublished ? <FiEyeOff /> : <FiEye />}
                  </button>
                  <button
                    onClick={() => navigate(`/admin/tests/${test._id}`)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    title="Edit"
                  >
                    <FiEdit2 />
                  </button>
                  <button
                    onClick={() => navigate(`/admin/tests/${test._id}/results`)}
                    className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition"
                    title="Results"
                  >
                    <FiUsers />
                  </button>
                  <button
                    onClick={() => deleteTest(test._id)}
                    className="p-2 text-garud-highlight hover:bg-gray-100 rounded-lg transition"
                    title="Delete"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {tests.length === 0 && (
          <div className="bg-white rounded-xl shadow-md p-12 text-center text-gray-400">
            No tests created yet. Click "Create Test" to get started.
          </div>
        )}
      </div>
    </div>
  );
};

export default TestList;
