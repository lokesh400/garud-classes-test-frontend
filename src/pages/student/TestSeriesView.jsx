import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiClock, FiFileText, FiPlay, FiCheckCircle, FiLayers } from 'react-icons/fi';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (document.getElementById('razorpay-script')) return resolve(true);
    const script = document.createElement('script');
    script.id = 'razorpay-script';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const TestSeriesView = () => {
  const { seriesId } = useParams();
  const navigate = useNavigate();
  const [series, setSeries] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchased, setPurchased] = useState(false);
  const [price, setPrice] = useState(0);

  useEffect(() => {
    fetchSeries();
  }, [seriesId]);

  const fetchSeries = async () => {
    try {
      const res = await API.get(`/test-series/published/${seriesId}`);
      setSeries(res.data);
      setPrice(res.data.price || 0);
      setPurchased(res.data.purchasedBy?.includes(JSON.parse(localStorage.getItem('user'))?._id));
    } catch (error) {
      toast.error('Failed to load test series');
      navigate('/student/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    const ok = await loadRazorpayScript();
    if (!ok) return toast.error('Failed to load payment gateway');
    try {
      const { data } = await API.post('/payments/create-order', { seriesId });
      const user = JSON.parse(localStorage.getItem('user'));
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        name: series.name,
        description: series.description,
        order_id: data.orderId,
        handler: async function (response) {
          await API.post('/payments/verify', {
            seriesId,
            paymentId: response.razorpay_payment_id,
          });
          toast.success('Payment successful! Access granted.');
          setPurchased(true);
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: { color: '#e94560' },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Payment failed');
    }
  };

  const handleFreeAccess = async () => {
    try {
      await API.post('/payments/free-access', { seriesId });
      toast.success('Access granted!');
      setPurchased(true);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to claim free access');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-garud-highlight"></div>
      </div>
    );
  }

  if (!series) return null;

  const totalTests = series.tests.length;
  const attemptedTests = series.tests.filter((t) => t.attempted).length;
  const submittedTests = series.tests.filter((t) => t.isSubmitted).length;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/student/dashboard')}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{series.name}</h1>
          {series.description && (
            <p className="text-sm text-gray-500 mt-1">{series.description}</p>
          )}
          {price > 0 && !purchased && (
            <button
              onClick={handlePurchase}
              className="mt-3 px-6 py-2 bg-transparent border border-garud-highlight text-garud-highlight rounded-lg font-semibold hover:bg-gray-100 hover:text-garud-highlight transition"
            >
              Purchase Series ₹{price}
            </button>
          )}
          {price === 0 && !purchased && (
            <button
              onClick={handleFreeAccess}
              className="mt-3 px-6 py-2 bg-garud-accent text-white rounded-lg font-semibold hover:bg-blue-800 transition"
            >
              Claim Free Access
            </button>
          )}
          {purchased && price > 0 && (
            <span className="mt-3 px-6 py-2 bg-green-500 text-white rounded-lg font-semibold">Purchased</span>
          )}
        </div>
      </div>

      {/* Progress */}
      <div className="bg-white rounded-xl shadow-md p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-700">Your Progress</h3>
          <span className="text-sm text-gray-500">
            {submittedTests}/{totalTests} completed
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-garud-accent to-garud-highlight h-3 rounded-full transition-all"
            style={{ width: totalTests > 0 ? `${(submittedTests / totalTests) * 100}%` : '0%' }}
          ></div>
        </div>
      </div>

      {/* Tests */}
      <div className="space-y-4">
        {purchased || price === 0 ? (
          <>
            {series.tests.map((test, idx) => (
              <div
                key={test._id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition"
              >
                <div className="flex items-stretch">
                  {/* Index */}
                  <div className={`w-16 flex items-center justify-center text-white font-bold text-lg ${
                    test.isSubmitted
                      ? 'bg-green-500'
                      : test.attempted
                      ? 'bg-yellow-500'
                      : 'bg-garud-accent'
                  }`}>
                    {idx + 1}
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">{test.name}</h3>
                        {test.description && (
                          <p className="text-sm text-gray-500 mt-1">{test.description}</p>
                        )}
                        <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <FiClock className="text-garud-accent" />
                            {test.duration} min
                          </span>
                          <span className="flex items-center gap-1">
                            <FiFileText className="text-garud-accent" />
                            {test.totalQuestions} questions
                          </span>
                          <span>{test.sectionCount} sections</span>
                        </div>
                      </div>

                      <div>
                        {test.isSubmitted ? (
                          <button
                            onClick={() => navigate(`/student/results/${test._id}`)}
                            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition"
                          >
                            <FiCheckCircle /> View Results
                          </button>
                        ) : test.attempted ? (
                          <button
                            onClick={() => navigate(`/student/test/${test._id}`)}
                            className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-600 transition"
                          >
                            <FiPlay /> Continue
                          </button>
                        ) : (
                          <button
                            onClick={() => navigate(`/student/test/${test._id}`)}
                            className="flex items-center gap-2 px-4 py-2 bg-transparent border border-garud-highlight text-garud-highlight font-semibold rounded-lg hover:bg-gray-100 hover:text-garud-highlight transition"
                          >
                            <FiPlay /> Start Test
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {series.tests.length === 0 && (
              <div className="bg-white rounded-xl shadow-md p-12 text-center text-gray-400">
                No tests available in this series yet.
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-12 text-center text-gray-400">
            Please purchase this series to access the tests.
          </div>
        )}
      </div>
    </div>
  );
};

export default TestSeriesView;
