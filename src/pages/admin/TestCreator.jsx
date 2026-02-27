import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import { FiPlus, FiTrash2, FiArrowLeft, FiFilter, FiCheck } from 'react-icons/fi';

const TestCreator = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);

  // Section form
  const [newSectionName, setNewSectionName] = useState('');

  // Question picker
  const [showPicker, setShowPicker] = useState(null); // sectionId
  const [questions, setQuestions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [topics, setTopics] = useState([]);
  const [filterSubject, setFilterSubject] = useState('');
  const [filterChapter, setFilterChapter] = useState('');
  const [filterTopic, setFilterTopic] = useState('');

  // Marks
  const [positiveMarks, setPositiveMarks] = useState(4);
  const [negativeMarks, setNegativeMarks] = useState(1);

  useEffect(() => {
    fetchTest();
    fetchSubjects();
  }, [testId]);

  useEffect(() => {
    if (filterSubject) {
      fetchChapters(filterSubject);
      setFilterChapter('');
      setFilterTopic('');
      setTopics([]);
    }
  }, [filterSubject]);

  useEffect(() => {
    if (filterChapter) {
      fetchTopics(filterChapter);
      setFilterTopic('');
    }
  }, [filterChapter]);

  useEffect(() => {
    fetchQuestions();
  }, [filterSubject, filterChapter, filterTopic]);

  const fetchTest = async () => {
    try {
      const res = await API.get(`/tests/admin/${testId}`);
      setTest(res.data);
    } catch (error) {
      toast.error('Failed to load test');
      navigate('/admin/tests');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const res = await API.get('/subjects');
      setSubjects(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchChapters = async (subjectId) => {
    try {
      const res = await API.get(`/chapters/subject/${subjectId}`);
      setChapters(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchTopics = async (chapterId) => {
    try {
      const res = await API.get(`/topics/chapter/${chapterId}`);
      setTopics(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchQuestions = async () => {
    try {
      const params = {};
      if (filterSubject) params.subject = filterSubject;
      if (filterChapter) params.chapter = filterChapter;
      if (filterTopic) params.topic = filterTopic;
      const res = await API.get('/questions', { params });
      setQuestions(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const addSection = async () => {
    if (!newSectionName.trim()) return;
    try {
      const res = await API.post(`/tests/${testId}/sections`, { name: newSectionName.trim() });
      setTest(res.data);
      setNewSectionName('');
      toast.success('Section added!');
    } catch (error) {
      toast.error('Failed to add section');
    }
  };

  const removeSection = async (sectionId) => {
    if (!window.confirm('Remove this section?')) return;
    try {
      const res = await API.delete(`/tests/${testId}/sections/${sectionId}`);
      setTest(res.data);
      toast.success('Section removed');
    } catch (error) {
      toast.error('Failed to remove section');
    }
  };

  const addQuestionToSection = async (sectionId, questionId) => {
    try {
      const res = await API.post(`/tests/${testId}/sections/${sectionId}/questions`, {
        questionId,
        positiveMarks,
        negativeMarks,
      });
      setTest(res.data);
      toast.success('Question added!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add question');
    }
  };

  const removeQuestionFromSection = async (sectionId, questionEntryId) => {
    try {
      const res = await API.delete(
        `/tests/${testId}/sections/${sectionId}/questions/${questionEntryId}`
      );
      setTest(res.data);
      toast.success('Question removed');
    } catch (error) {
      toast.error('Failed to remove question');
    }
  };

  // Check if a question is already in any section
  const isQuestionInTest = (questionId) => {
    if (!test) return false;
    return test.sections.some((s) =>
      s.questions.some((q) => q.question?._id === questionId)
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-garud-highlight"></div>
      </div>
    );
  }

  if (!test) return null;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/admin/tests')}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{test.name}</h1>
          <p className="text-sm text-gray-500">
            Duration: {test.duration} min |{' '}
            {test.sections.reduce((acc, s) => acc + s.questions.length, 0)} questions total
          </p>
        </div>
      </div>

      {/* Add Section */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6">
        <div className="flex gap-2 items-center">
          <input
            type="text"
            value={newSectionName}
            onChange={(e) => setNewSectionName(e.target.value)}
            placeholder="New section name (e.g., Physics, Chemistry, Math)"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-garud-accent outline-none"
            onKeyDown={(e) => e.key === 'Enter' && addSection()}
          />
          <button
            onClick={addSection}
            className="flex items-center gap-2 px-4 py-2 bg-garud-accent text-white rounded-lg hover:bg-blue-800 transition"
          >
            <FiPlus /> Add Section
          </button>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-6">
        {test.sections.map((section, sIdx) => (
          <div key={section._id} className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="flex items-center justify-between p-4 bg-gray-50 border-b">
              <h3 className="font-bold text-gray-800">
                Section {sIdx + 1}: {section.name}
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({section.questions.length} questions)
                </span>
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowPicker(showPicker === section._id ? null : section._id)}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm bg-garud-highlight text-white rounded-lg hover:bg-red-600 transition"
                >
                  <FiPlus /> Add Questions
                </button>
                <button
                  onClick={() => removeSection(section._id)}
                  className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>

            {/* Section Questions */}
            <div className="p-4">
              {section.questions.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">
                  No questions added yet. Click "Add Questions" to browse the question bank.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {section.questions.map((entry, qIdx) => (
                    <div
                      key={entry._id}
                      className="flex gap-3 p-3 border border-gray-200 rounded-lg group"
                    >
                      <div className="flex-shrink-0 w-8 h-8 bg-garud-accent text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {qIdx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <img
                          src={entry.question?.imageUrl}
                          alt={`Q${qIdx + 1}`}
                          className="w-full h-24 object-contain rounded border bg-gray-50"
                        />
                        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                          <span>
                            {entry.question?.type?.toUpperCase()} | +{entry.positiveMarks} / -
                            {entry.negativeMarks}
                          </span>
                          <button
                            onClick={() => removeQuestionFromSection(section._id, entry._id)}
                            className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Question Picker */}
            {showPicker === section._id && (
              <div className="border-t p-4 bg-blue-50">
                <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <FiFilter /> Browse Question Bank
                </h4>

                {/* Marks config */}
                <div className="flex gap-4 mb-3">
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-500">+Marks:</label>
                    <input
                      type="number"
                      value={positiveMarks}
                      onChange={(e) => setPositiveMarks(parseInt(e.target.value) || 0)}
                      className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                      min="0"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-500">-Marks:</label>
                    <input
                      type="number"
                      value={negativeMarks}
                      onChange={(e) => setNegativeMarks(parseInt(e.target.value) || 0)}
                      className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                      min="0"
                    />
                  </div>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <select
                    value={filterSubject}
                    onChange={(e) => setFilterSubject(e.target.value)}
                    className="px-2 py-1.5 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="">All Subjects</option>
                    {subjects.map((s) => (
                      <option key={s._id} value={s._id}>{s.name}</option>
                    ))}
                  </select>
                  <select
                    value={filterChapter}
                    onChange={(e) => setFilterChapter(e.target.value)}
                    className="px-2 py-1.5 border border-gray-300 rounded-lg text-sm"
                    disabled={!filterSubject}
                  >
                    <option value="">All Chapters</option>
                    {chapters.map((c) => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                  <select
                    value={filterTopic}
                    onChange={(e) => setFilterTopic(e.target.value)}
                    className="px-2 py-1.5 border border-gray-300 rounded-lg text-sm"
                    disabled={!filterChapter}
                  >
                    <option value="">All Topics</option>
                    {topics.map((t) => (
                      <option key={t._id} value={t._id}>{t.name}</option>
                    ))}
                  </select>
                </div>

                {/* Questions Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-80 overflow-y-auto">
                  {questions.map((q) => {
                    const inTest = isQuestionInTest(q._id);
                    return (
                      <div
                        key={q._id}
                        className={`relative border rounded-lg overflow-hidden cursor-pointer transition ${
                          inTest
                            ? 'border-green-400 bg-green-50 opacity-60'
                            : 'border-gray-200 hover:border-blue-400 hover:bg-blue-50'
                        }`}
                        onClick={() => !inTest && addQuestionToSection(section._id, q._id)}
                      >
                        <img
                          src={q.imageUrl}
                          alt="Question"
                          className="w-full h-24 object-contain bg-white"
                        />
                        <div className="p-1.5 text-xs text-gray-500">
                          <span className="font-medium">{q.type.toUpperCase()}</span>
                          {' | '}
                          {q.subject?.name}
                        </div>
                        {inTest && (
                          <div className="absolute top-1 right-1 bg-green-500 text-white rounded-full p-0.5">
                            <FiCheck className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {questions.length === 0 && (
                    <p className="col-span-full text-center text-gray-400 py-4 text-sm">
                      No questions found. Try changing filters or upload questions first.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {test.sections.length === 0 && (
          <div className="bg-white rounded-xl shadow-md p-12 text-center text-gray-400">
            No sections yet. Add a section above to start building the test.
          </div>
        )}
      </div>
    </div>
  );
};

export default TestCreator;
