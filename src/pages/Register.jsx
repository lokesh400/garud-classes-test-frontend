import { useState } from 'react';
import { FiCheckCircle, FiArrowRight, FiArrowLeft } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Register = () => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [studentClass, setStudentClass] = useState('');
  const [targetExam, setTargetExam] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await register(
        name,
        email,
        password,
        'student',
        studentClass,
        targetExam,
        mobile
      );
      toast.success('Registration successful!');
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-300">
      <div className="max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-600">GARUD</h1>
          <p className="text-gray-500 mt-1">Classes Test Portal</p>
        </div>
        <div className="bg-white rounded-xl shadow-2xl p-8">
          <div className="flex items-center justify-center mb-6">
            <div className={`flex items-center gap-2 text-sm font-semibold ${step === 1 ? 'text-primary-600' : 'text-gray-400'}`}>Step 1 <FiArrowRight /></div>
            <div className={`flex items-center gap-2 text-sm font-semibold ${step === 2 ? 'text-primary-600' : 'text-gray-400'}`}>Step 2 <FiArrowRight /></div>
            <div className={`flex items-center gap-2 text-sm font-semibold ${step === 3 ? 'text-primary-600' : 'text-gray-400'}`}>Review <FiCheckCircle /></div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {step === 1 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                  <select
                    value={studentClass}
                    onChange={(e) => setStudentClass(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                    required
                  >
                    <option value="">Select Class</option>
                    <option value="9">9</option>
                    <option value="10">10</option>
                    <option value="11">11</option>
                    <option value="12">12</option>
                    <option value="Dropper">Dropper</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Exam</label>
                  <select
                    value={targetExam}
                    onChange={(e) => setTargetExam(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                    required
                  >
                    <option value="">Select Exam</option>
                    <option value="JEE">JEE</option>
                    <option value="NEET">NEET</option>
                    <option value="FOUNDATION">FOUNDATION</option>
                    <option value="CUET">CUET</option>
                    <option value="NDA">NDA</option>
                  </select>
                </div>
                <div className="flex justify-end mt-6">
                  <button type="button" className="px-6 py-2 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-600 transition" onClick={() => setStep(2)} disabled={!name || !studentClass || !targetExam}>Next <FiArrowRight /></button>
                </div>
              </>
            )}
            {step === 2 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                  <input
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                    minLength={6}
                    required
                  />
                </div>
                <div className="flex justify-between mt-6">
                  <button type="button" className="px-6 py-2 bg-gray-100 text-primary-600 rounded-lg font-semibold hover:bg-gray-200 transition" onClick={() => setStep(1)}><FiArrowLeft /> Back</button>
                  <button type="button" className="px-6 py-2 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-600 transition" onClick={() => setStep(3)} disabled={!mobile || !email || !password}>Next <FiArrowRight /></button>
                </div>
              </>
            )}
            {step === 3 && (
              <>
                <div className="mb-4">
                  <div className="text-lg font-bold text-primary-600 mb-2">Review Details</div>
                  <div className="space-y-2">
                    <div><span className="font-medium text-gray-700">Name:</span> {name}</div>
                    <div><span className="font-medium text-gray-700">Class:</span> {studentClass}</div>
                    <div><span className="font-medium text-gray-700">Exam:</span> {targetExam}</div>
                    <div><span className="font-medium text-gray-700">Mobile:</span> {mobile}</div>
                    <div><span className="font-medium text-gray-700">Email:</span> {email}</div>
                  </div>
                </div>
                <div className="flex justify-between mt-6">
                  <button type="button" className="px-6 py-2 bg-gray-100 text-primary-600 rounded-lg font-semibold hover:bg-gray-200 transition" onClick={() => setStep(2)}><FiArrowLeft /> Back</button>
                  <button type="submit" disabled={loading} className="px-6 py-2 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-600 transition disabled:opacity-50">{loading ? 'Registering...' : 'Register'}</button>
                </div>
              </>
            )}
          </form>
          <p className="mt-4 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
