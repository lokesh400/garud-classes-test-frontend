import { useState, useEffect } from 'react';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const PurchaseTestSeries = () => {
  const [seriesList, setSeriesList] = useState([]);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchSeries();
  }, []);

  const fetchSeries = async () => {
    try {
      const res = await API.get('/test-series/published');
      setSeriesList(res.data);
    } catch (error) {
      toast.error('Failed to load test series');
    }
  };

  const filtered = filter === 'all' ? seriesList : seriesList.filter(s => s.madeFor === filter);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Purchase Test Series</h1>
      <div className="mb-6 flex gap-4">
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700"
        >
          <option value="all">All Categories</option>
          <option value="jee">JEE</option>
          <option value="neet">NEET</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(series => (
          <div key={series._id} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition group">
            <div className="h-2 bg-gradient-to-r from-garud-accent via-purple-500 to-garud-highlight"></div>
            <div className="p-6 flex flex-col justify-between h-full">
              <div>
                {series.image && (
                  <img src={series.image} alt={series.name} className="w-full h-36 object-cover rounded-lg mb-3 bg-gray-100" />
                )}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{series.madeFor?.toUpperCase()}</span>
                  {series.tags && series.tags.length > 0 && (
                    <span className="text-xs text-gray-500">{series.tags.join(', ')}</span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{series.name}</h3>
                {series.description && <p className="text-sm text-gray-500 mb-3">{series.description}</p>}
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xl font-bold text-garud-highlight">₹{series.price || 0}</span>
                <button
                  onClick={async () => {
                    if (series.price > 0) {
                      navigate(`/student/test-series/${series._id}`);
                    } else {
                      try {
                        await API.post('/payments/free-access', { seriesId: series._id });
                        toast.success('Enrolled successfully!');
                      } catch (error) {
                        toast.error(error.response?.data?.message || 'Failed to enroll');
                      }
                    }
                  }}
                  className="px-5 py-2 bg-transparent border border-garud-highlight text-garud-highlight rounded-lg font-semibold hover:bg-gray-100 hover:text-garud-highlight transition"
                >
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full bg-white rounded-xl shadow-md p-12 text-center text-gray-400">
            No test series found for this category.
          </div>
        )}
      </div>
    </div>
  );
};

export default PurchaseTestSeries;
