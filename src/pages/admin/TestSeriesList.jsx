import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import { FiPlus, FiTrash2, FiEdit2, FiEye, FiEyeOff, FiLayers } from 'react-icons/fi';

const TestSeriesList = () => {
  const [seriesList, setSeriesList] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newSeries, setNewSeries] = useState({ name: '', description: '', price: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    fetchSeries();
  }, []);

  const fetchSeries = async () => {
    try {
      const res = await API.get('/test-series/admin/all');
      setSeriesList(res.data);
    } catch (error) {
      toast.error('Failed to load test series');
    }
  };

  const createSeries = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/test-series', newSeries);
      toast.success('Test series created!');
      setShowCreate(false);
      setNewSeries({ name: '', description: '', price: 0 });
      navigate(`/admin/test-series/${res.data._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create');
    }
  };

  const togglePublish = async (id, currentStatus) => {
    try {
      await API.put(`/test-series/${id}`, { isPublished: !currentStatus });
      fetchSeries();
      toast.success(currentStatus ? 'Series unpublished' : 'Series published!');
    } catch (error) {
      toast.error('Failed to update');
    }
  };

  const deleteSeries = async (id) => {
    if (!window.confirm('Delete this test series?')) return;
    try {
      await API.delete(`/test-series/${id}`);
      fetchSeries();
      toast.success('Test series deleted');
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Test Series</h1>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 px-4 py-2 bg-transparent border border-garud-highlight text-garud-highlight rounded-lg hover:bg-gray-100 hover:text-garud-highlight transition"
        >
          <FiPlus /> Create Series
        </button>
      </div>

      {/* Create Form */}
      {showCreate && (
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">New Test Series</h2>
          <form onSubmit={createSeries} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Series Name</label>
              <input
                type="text"
                value={newSeries.name}
                onChange={(e) => setNewSeries({ ...newSeries, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-garud-accent outline-none"
                placeholder="e.g., NEET 2026 Full Test Series"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={newSeries.description}
                onChange={(e) => setNewSeries({ ...newSeries, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-garud-accent outline-none"
                rows={2}
                placeholder="Optional description..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
              <input
                type="number"
                min="0"
                value={newSeries.price}
                onChange={(e) => setNewSeries({ ...newSeries, price: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-garud-accent outline-none"
                placeholder="0 for free"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
              <input
                type="text"
                value={newSeries.tags || ''}
                onChange={(e) => setNewSeries({ ...newSeries, tags: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-garud-accent outline-none"
                placeholder="e.g., physics,chemistry,maths"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Made For</label>
              <select
                value={newSeries.madeFor || 'other'}
                onChange={(e) => setNewSeries({ ...newSeries, madeFor: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-garud-accent outline-none"
              >
                <option value="jee">JEE</option>
                <option value="neet">NEET</option>
                <option value="other">Other</option>
              </select>
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

      {/* Series List */}
      <div className="space-y-4">
        {seriesList.map((series) => (
          <div key={series._id} className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <FiLayers className="text-garud-accent w-5 h-5" />
                  <h3 className="text-lg font-bold text-gray-800">{series.name}</h3>
                  <span
                    className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                      series.isPublished
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {series.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>
                {series.description && (
                  <p className="text-sm text-gray-500 mt-1 ml-8">{series.description}</p>
                )}
                <div className="flex gap-4 mt-2 ml-8 text-sm text-gray-500">
                  <span>{series.tests?.length || 0} tests</span>
                  <span>
                    Created: {new Date(series.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Test thumbnails */}
                {series.tests?.length > 0 && (
                  <div className="ml-8 mt-3 flex flex-wrap gap-2">
                    {series.tests.map((test) => (
                      <span
                        key={test._id}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
                      >
                        {test.name}
                        <span className="text-gray-400">({test.duration}m)</span>
                      </span>
                    ))}
                  </div>
                )}

                <div className="ml-8 mt-2 text-sm text-gray-700">
                  <span className="font-semibold">Price:</span> ₹{series.price || 0}
                </div>

                {/* Purchase history */}
                {series.purchasedBy && series.purchasedBy.length > 0 && (
                  <div className="ml-8 mt-3">
                    <span className="font-semibold text-xs text-gray-500">Purchased by:</span>
                    <ul className="list-disc ml-4 text-xs text-gray-700">
                      {series.purchasedBy.map((user) => (
                        <li key={user._id}>
                          {user.name} ({user.email})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => togglePublish(series._id, series.isPublished)}
                  className={`p-2 rounded-lg transition ${
                    series.isPublished
                      ? 'text-yellow-600 hover:bg-yellow-50'
                      : 'text-green-600 hover:bg-green-50'
                  }`}
                  title={series.isPublished ? 'Unpublish' : 'Publish'}
                >
                  {series.isPublished ? <FiEyeOff /> : <FiEye />}
                </button>
                <button
                  onClick={() => navigate(`/admin/test-series/${series._id}`)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  title="Manage"
                >
                  <FiEdit2 />
                </button>
                <button
                  onClick={() => deleteSeries(series._id)}
                  className="p-2 text-garud-highlight hover:bg-gray-100 rounded-lg transition"
                  title="Delete"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          </div>
        ))}

        {seriesList.length === 0 && (
          <div className="bg-white rounded-xl shadow-md p-12 text-center text-gray-400">
            No test series created yet. Click "Create Series" to get started.
          </div>
        )}
      </div>
    </div>
  );
};

export default TestSeriesList;
