import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import QuestionBank from './pages/admin/QuestionBank';
import QuestionUpload from './pages/admin/QuestionUpload';
import TestList from './pages/admin/TestList';
import TestCreator from './pages/admin/TestCreator';
import TestResults from './pages/admin/TestResults';

// Student Pages
import StudentDashboard from './pages/student/Dashboard';
import TestAttempt from './pages/student/TestAttempt';
import Results from './pages/student/Results';

const HomeRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-garud-highlight"></div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/student/dashboard" replace />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-100">
          <Navbar />
          <Routes>
            {/* Public */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Home redirect */}
            <Route path="/" element={<HomeRedirect />} />

            {/* Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute role="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/question-bank"
              element={
                <ProtectedRoute role="admin">
                  <QuestionBank />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/upload"
              element={
                <ProtectedRoute role="admin">
                  <QuestionUpload />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/tests"
              element={
                <ProtectedRoute role="admin">
                  <TestList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/tests/:testId"
              element={
                <ProtectedRoute role="admin">
                  <TestCreator />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/tests/:testId/results"
              element={
                <ProtectedRoute role="admin">
                  <TestResults />
                </ProtectedRoute>
              }
            />

            {/* Student Routes */}
            <Route
              path="/student/dashboard"
              element={
                <ProtectedRoute role="student">
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/tests"
              element={
                <ProtectedRoute role="student">
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/test/:testId"
              element={
                <ProtectedRoute role="student">
                  <TestAttempt />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/results/:testId"
              element={
                <ProtectedRoute role="student">
                  <Results />
                </ProtectedRoute>
              }
            />

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              borderRadius: '10px',
              background: '#333',
              color: '#fff',
            },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
