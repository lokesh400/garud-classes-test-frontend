import { useState, useEffect } from 'react';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import { FiUploadCloud, FiImage } from 'react-icons/fi';

const QuestionUpload = () => {
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [topics, setTopics] = useState([]);

  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [questionType, setQuestionType] = useState('mcq');
  const [correctOption, setCorrectOption] = useState('A');
  const [correctNumerical, setCorrectNumerical] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Recently uploaded
  const [recentQuestions, setRecentQuestions] = useState([]);

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (selectedSubject) {
      fetchChapters(selectedSubject);
      setSelectedChapter('');
      setSelectedTopic('');
      setTopics([]);
    }
  }, [selectedSubject]);

  useEffect(() => {
    if (selectedChapter) {
      fetchTopics(selectedChapter);
      setSelectedTopic('');
    }
  }, [selectedChapter]);

  const fetchSubjects = async () => {
    try {
      const res = await API.get('/subjects');
      setSubjects(res.data);
    } catch (error) {
      toast.error('Failed to load subjects');
    }
  };

  const fetchChapters = async (subjectId) => {
    try {
      const res = await API.get(`/chapters/subject/${subjectId}`);
      setChapters(res.data);
    } catch (error) {
      toast.error('Failed to load chapters');
    }
  };

  const fetchTopics = async (chapterId) => {
    try {
      const res = await API.get(`/topics/chapter/${chapterId}`);
      setTopics(res.data);
    } catch (error) {
      toast.error('Failed to load topics');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!imageFile) {
      toast.error('Please select a question image');
      return;
    }
    if (!selectedSubject || !selectedChapter || !selectedTopic) {
      toast.error('Please select subject, chapter, and topic');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('type', questionType);
      formData.append('subject', selectedSubject);
      formData.append('chapter', selectedChapter);
      formData.append('topic', selectedTopic);

      if (questionType === 'mcq') {
        formData.append('correctOption', correctOption);
      } else {
        formData.append('correctNumericalAnswer', correctNumerical);
      }

      const res = await API.post('/questions', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Question uploaded successfully!');
      setRecentQuestions((prev) => [res.data, ...prev]);

      // Reset image
      setImageFile(null);
      setImagePreview(null);
      setCorrectOption('A');
      setCorrectNumerical('');

      // Reset file input
      const fileInput = document.getElementById('question-image');
      if (fileInput) fileInput.value = '';
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Upload Questions</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Form */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <form onSubmit={handleUpload} className="space-y-4">
            {/* Subject / Chapter / Topic */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-garud-accent outline-none"
                required
              >
                <option value="">Select Subject</option>
                {subjects.map((s) => (
                  <option key={s._id} value={s._id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Chapter</label>
              <select
                value={selectedChapter}
                onChange={(e) => setSelectedChapter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-garud-accent outline-none"
                required
                disabled={!selectedSubject}
              >
                <option value="">Select Chapter</option>
                {chapters.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-garud-accent outline-none"
                required
                disabled={!selectedChapter}
              >
                <option value="">Select Topic</option>
                {topics.map((t) => (
                  <option key={t._id} value={t._id}>{t.name}</option>
                ))}
              </select>
            </div>

            {/* Question Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Question Type</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="mcq"
                    checked={questionType === 'mcq'}
                    onChange={(e) => setQuestionType(e.target.value)}
                    className="text-garud-accent"
                  />
                  <span className="text-sm">MCQ (A/B/C/D)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="numerical"
                    checked={questionType === 'numerical'}
                    onChange={(e) => setQuestionType(e.target.value)}
                    className="text-garud-accent"
                  />
                  <span className="text-sm">Numerical</span>
                </label>
              </div>
            </div>

            {/* Correct Answer */}
            {questionType === 'mcq' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Correct Option</label>
                <div className="flex gap-3">
                  {['A', 'B', 'C', 'D'].map((opt) => (
                    <label
                      key={opt}
                      className={`flex items-center justify-center w-12 h-12 rounded-lg border-2 cursor-pointer transition font-semibold ${
                        correctOption === opt
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-300 hover:border-gray-400 text-gray-500'
                      }`}
                    >
                      <input
                        type="radio"
                        value={opt}
                        checked={correctOption === opt}
                        onChange={(e) => setCorrectOption(e.target.value)}
                        className="hidden"
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Correct Numerical Answer
                </label>
                <input
                  type="number"
                  step="any"
                  value={correctNumerical}
                  onChange={(e) => setCorrectNumerical(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-garud-accent outline-none"
                  placeholder="Enter correct answer"
                  required
                />
              </div>
            )}

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Question Image
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-garud-accent transition">
                <input
                  type="file"
                  id="question-image"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <label htmlFor="question-image" className="cursor-pointer">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-h-48 mx-auto rounded-lg"
                    />
                  ) : (
                    <div className="flex flex-col items-center text-gray-400">
                      <FiImage className="w-12 h-12 mb-2" />
                      <p className="text-sm">Click to upload question image</p>
                      <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP up to 10MB</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="w-full py-3 bg-transparent border border-garud-highlight text-garud-highlight font-semibold rounded-lg hover:bg-gray-100 hover:text-garud-highlight transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <FiUploadCloud className="w-5 h-5" />
              {uploading ? 'Uploading...' : 'Upload Question'}
            </button>
          </form>
        </div>

        {/* Recent Uploads */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Recently Uploaded</h2>
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {recentQuestions.length === 0 ? (
              <p className="text-gray-400 text-center py-8">
                Uploaded questions will appear here
              </p>
            ) : (
              recentQuestions.map((q) => (
                <div key={q._id} className="flex gap-3 p-3 border border-gray-200 rounded-lg">
                  <img
                    src={q.imageUrl}
                    alt="Question"
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="text-sm">
                    <p className="font-medium text-gray-700">
                      {q.subject?.name} → {q.chapter?.name} → {q.topic?.name}
                    </p>
                    <p className="text-gray-500 mt-1">
                      Type: <span className="font-medium">{q.type.toUpperCase()}</span>
                    </p>
                    <p className="text-gray-500">
                      Answer:{' '}
                      <span className="font-medium text-green-600">
                        {q.type === 'mcq' ? q.correctOption : q.correctNumericalAnswer}
                      </span>
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionUpload;
