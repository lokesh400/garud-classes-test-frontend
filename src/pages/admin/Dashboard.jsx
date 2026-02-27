import { useState, useEffect } from 'react';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import { FiBook, FiFileText, FiUsers, FiClipboard } from 'react-icons/fi';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    subjects: 0,
    questions: 0,
    tests: 0,
    publishedTests: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [subjects, questions, tests] = await Promise.all([
          API.get('/subjects'),
          API.get('/questions'),
          API.get('/tests/admin/all'),
        ]);

        setStats({
          subjects: subjects.data.length,
          questions: questions.data.length,
          tests: tests.data.length,
          publishedTests: tests.data.filter((t) => t.isPublished).length,
        });
      } catch (error) {
        toast.error('Failed to load dashboard data');
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { label: 'Subjects', value: stats.subjects, icon: FiBook, color: 'bg-blue-500' },
    { label: 'Questions', value: stats.questions, icon: FiFileText, color: 'bg-green-500' },
    { label: 'Total Tests', value: stats.tests, icon: FiClipboard, color: 'bg-purple-500' },
    { label: 'Published Tests', value: stats.publishedTests, icon: FiUsers, color: 'bg-orange-500' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{card.label}</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{card.value}</p>
              </div>
              <div className={`${card.color} p-3 rounded-lg`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Guide</h2>
        <div className="space-y-3 text-gray-600">
          <p>
            <span className="font-semibold text-garud-accent">1.</span> Go to{' '}
            <span className="font-semibold">Question Bank</span> to manage Subjects → Chapters → Topics
          </p>
          <p>
            <span className="font-semibold text-garud-accent">2.</span> Use the{' '}
            <span className="font-semibold">Upload</span> page to upload question images to Cloudinary
          </p>
          <p>
            <span className="font-semibold text-garud-accent">3.</span> Create tests in the{' '}
            <span className="font-semibold">Tests</span> section with sections and assign questions
          </p>
          <p>
            <span className="font-semibold text-garud-accent">4.</span> Publish tests to make them
            visible to students
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
