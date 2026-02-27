import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiPlus, FiTrash2, FiClock, FiFileText, FiCheck } from 'react-icons/fi';

const TestSeriesManager = () => {
  const { seriesId } = useParams();
  const navigate = useNavigate();
  const [series, setSeries] = useState(null);
  const [allTests, setAllTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    fetchData();
  }, [seriesId]);

  const fetchData = async () => {
    try {
      const [seriesRes, testsRes] = await Promise.all([
        API.get(`/test-series/admin/${seriesId}`),
        API.get('/tests/admin/all'),
      ]);
      setSeries(seriesRes.data);
      setAllTests(testsRes.data);
    } catch (error) {
      toast.error('Failed to load data');
      navigate('/admin/test-series');
    } finally {
      setLoading(false);
    }
  };

  const addTest = async (testId) => {
    try {
      const res = await API.post(`/test-series/${seriesId}/tests`, { testId });
      setSeries(res.data);
      toast.success('Test added to series!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add test');
    }
  };

  const removeTest = async (testId) => {
    try {
      const res = await API.delete(`/test-series/${seriesId}/tests/${testId}`);
      setSeries(res.data);
      toast.success('Test removed from series');
    } catch (error) {
      toast.error('Failed to remove test');
    }
  };

  const togglePublish = async () => {
    try {
      const res = await API.put(`/test-series/${seriesId}`, {
        isPublished: !series.isPublished,
      });
      setSeries(res.data);
      toast.success(series.isPublished ? 'Series unpublished' : 'Series published!');
    } catch (error) {
      toast.error('Failed to update');
    }
  };

  const isTestInSeries = (testId) => {
    return series?.tests?.some((t) => t._id === testId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-garud-highlight"></div>
      </div>
    );
  }

  if (!series) return null;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/test-series')}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-800">{series.name}</h1>
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
              <p className="text-sm text-gray-500 mt-1">{series.description}</p>
            )}
            <p className="text-sm text-gray-400 mt-1">{series.tests.length} tests in this series</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={togglePublish}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              series.isPublished
                ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            {series.isPublished ? 'Unpublish' : 'Publish'}
          </button>
          <button
            onClick={() => setShowPicker(!showPicker)}
            className="flex items-center gap-2 px-4 py-2 bg-transparent border border-garud-highlight text-garud-highlight rounded-lg hover:bg-gray-100 hover:text-garud-highlight transition"
          >
            <FiPlus /> Add Tests
          </button>
        </div>
      </div>

      {/* Test Picker */}
      {showPicker && (
        <div className="bg-blue-50 rounded-xl shadow-md p-6 mb-6">
          <h3 className="font-semibold text-gray-700 mb-4">Select tests to add to this series</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
            {allTests.map((test) => {
              const inSeries = isTestInSeries(test._id);
              const totalQ = test.sections?.reduce(
                (acc, s) => acc + (s.questions?.length || 0),
                0
              ) || 0;

              return (
                <div
                  key={test._id}
                  onClick={() => !inSeries && addTest(test._id)}
                  className={`p-4 border rounded-lg transition cursor-pointer ${
                    inSeries
                      ? 'border-green-300 bg-green-50 opacity-70'
                      : 'border-gray-200 bg-white hover:border-blue-400 hover:bg-blue-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-gray-800 text-sm">{test.name}</h4>
                      <div className="flex gap-3 mt-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <FiClock /> {test.duration}m
                        </span>
                        <span className="flex items-center gap-1">
                          <FiFileText /> {totalQ} Q
                        </span>
                      </div>
                    </div>
                    {inSeries && (
                      <div className="bg-green-500 text-white rounded-full p-1">
                        <FiCheck className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                  <div className="mt-1">
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded ${
                        test.isPublished
                          ? 'bg-green-100 text-green-600'
                          : 'bg-yellow-100 text-yellow-600'
                      }`}
                    >
                      {test.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>
                </div>
              );
            })}
            {allTests.length === 0 && (
              <p className="col-span-full text-center text-gray-400 py-4">
                No tests created yet. Create tests first.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Tests in Series */}
      <div className="space-y-3">
        {series.tests.map((test, idx) => {
          const totalQ = test.sections?.reduce(
            (acc, s) => acc + (s.questions?.length || 0),
            0
          ) || 0;

          return (
            <div
              key={test._id}
              className="bg-white rounded-xl shadow-md p-5 flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-garud-accent text-white rounded-lg flex items-center justify-center font-bold">
                  {idx + 1}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">{test.name}</h4>
                  {test.description && (
                    <p className="text-xs text-gray-500 mt-0.5">{test.description}</p>
                  )}
                  <div className="flex gap-4 mt-1 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <FiClock /> {test.duration} min
                    </span>
                    <span className="flex items-center gap-1">
                      <FiFileText /> {totalQ} questions
                    </span>
                    <span className="flex items-center gap-1">
                      {test.sections?.length || 0} sections
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded ${
                        test.isPublished
                          ? 'bg-green-100 text-green-600'
                          : 'bg-yellow-100 text-yellow-600'
                      }`}
                    >
                      {test.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate(`/admin/tests/${test._id}`)}
                  className="px-3 py-1.5 text-xs text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
                >
                  Edit Test
                </button>
                <button
                  onClick={() => removeTest(test._id)}
                  className="p-2 text-garud-highlight hover:bg-gray-100 rounded-lg transition opacity-0 group-hover:opacity-100"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          );
        })}

        {series.tests.length === 0 && (
          <div className="bg-white rounded-xl shadow-md p-12 text-center text-gray-400">
            No tests in this series yet. Click "Add Tests" to add existing tests.
          </div>
        )}
      </div>
    </div>
  );
};

export default TestSeriesManager;
