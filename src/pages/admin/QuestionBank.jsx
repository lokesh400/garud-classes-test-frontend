import { useState, useEffect } from 'react';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import { FiPlus, FiTrash2, FiEdit2, FiChevronRight, FiBook, FiLayers, FiTag } from 'react-icons/fi';

const QuestionBank = () => {
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [topics, setTopics] = useState([]);

  // Forms
  const [newSubject, setNewSubject] = useState('');
  const [newChapter, setNewChapter] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [newTopic, setNewTopic] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('');

  // View state
  const [activeSubject, setActiveSubject] = useState(null);
  const [activeChapter, setActiveChapter] = useState(null);

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (activeSubject) {
      fetchChapters(activeSubject._id);
    }
  }, [activeSubject]);

  useEffect(() => {
    if (activeChapter) {
      fetchTopics(activeChapter._id);
    }
  }, [activeChapter]);

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

  const addSubject = async (e) => {
    e.preventDefault();
    if (!newSubject.trim()) return;
    try {
      await API.post('/subjects', { name: newSubject.trim() });
      setNewSubject('');
      fetchSubjects();
      toast.success('Subject added!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add subject');
    }
  };

  const addChapter = async (e) => {
    e.preventDefault();
    if (!newChapter.trim() || !selectedSubject) return;
    try {
      await API.post('/chapters', { name: newChapter.trim(), subject: selectedSubject });
      setNewChapter('');
      if (activeSubject && activeSubject._id === selectedSubject) {
        fetchChapters(selectedSubject);
      }
      toast.success('Chapter added!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add chapter');
    }
  };

  const addTopic = async (e) => {
    e.preventDefault();
    if (!newTopic.trim() || !selectedChapter) return;
    try {
      await API.post('/topics', { name: newTopic.trim(), chapter: selectedChapter });
      setNewTopic('');
      if (activeChapter && activeChapter._id === selectedChapter) {
        fetchTopics(selectedChapter);
      }
      toast.success('Topic added!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add topic');
    }
  };

  const deleteSubject = async (id) => {
    if (!window.confirm('Delete this subject? This may affect related chapters and topics.')) return;
    try {
      await API.delete(`/subjects/${id}`);
      fetchSubjects();
      if (activeSubject?._id === id) {
        setActiveSubject(null);
        setChapters([]);
        setActiveChapter(null);
        setTopics([]);
      }
      toast.success('Subject deleted');
    } catch (error) {
      toast.error('Failed to delete subject');
    }
  };

  const deleteChapter = async (id) => {
    if (!window.confirm('Delete this chapter?')) return;
    try {
      await API.delete(`/chapters/${id}`);
      if (activeSubject) fetchChapters(activeSubject._id);
      if (activeChapter?._id === id) {
        setActiveChapter(null);
        setTopics([]);
      }
      toast.success('Chapter deleted');
    } catch (error) {
      toast.error('Failed to delete chapter');
    }
  };

  const deleteTopic = async (id) => {
    if (!window.confirm('Delete this topic?')) return;
    try {
      await API.delete(`/topics/${id}`);
      if (activeChapter) fetchTopics(activeChapter._id);
      toast.success('Topic deleted');
    } catch (error) {
      toast.error('Failed to delete topic');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Question Bank Manager</h1>

      {/* Add Forms */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Add Subject */}
        <form onSubmit={addSubject} className="bg-white rounded-xl shadow-md p-4">
          <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <FiBook className="text-blue-500" /> Add Subject
          </h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              placeholder="Subject name"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 outline-none"
            />
            <button
              type="submit"
              className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              <FiPlus />
            </button>
          </div>
        </form>

        {/* Add Chapter */}
        <form onSubmit={addChapter} className="bg-white rounded-xl shadow-md p-4">
          <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <FiLayers className="text-green-500" /> Add Chapter
          </h3>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-2 focus:ring-2 focus:ring-green-400 outline-none"
          >
            <option value="">Select Subject</option>
            {subjects.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <input
              type="text"
              value={newChapter}
              onChange={(e) => setNewChapter(e.target.value)}
              placeholder="Chapter name"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-400 outline-none"
            />
            <button
              type="submit"
              className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
            >
              <FiPlus />
            </button>
          </div>
        </form>

        {/* Add Topic */}
        <form onSubmit={addTopic} className="bg-white rounded-xl shadow-md p-4">
          <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <FiTag className="text-purple-500" /> Add Topic
          </h3>
          <select
            value={selectedChapter}
            onChange={(e) => setSelectedChapter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-2 focus:ring-2 focus:ring-purple-400 outline-none"
          >
            <option value="">Select Chapter</option>
            {chapters.length > 0
              ? chapters.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))
              : activeSubject &&
                chapters.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
          </select>
          <div className="flex gap-2">
            <input
              type="text"
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value)}
              placeholder="Topic name"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-400 outline-none"
            />
            <button
              type="submit"
              className="px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
            >
              <FiPlus />
            </button>
          </div>
        </form>
      </div>

      {/* Hierarchy Browser */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Browse Hierarchy</h2>

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <button
            onClick={() => {
              setActiveSubject(null);
              setActiveChapter(null);
              setChapters([]);
              setTopics([]);
            }}
            className="hover:text-garud-accent font-medium"
          >
            All Subjects
          </button>
          {activeSubject && (
            <>
              <FiChevronRight />
              <button
                onClick={() => {
                  setActiveChapter(null);
                  setTopics([]);
                }}
                className="hover:text-garud-accent font-medium"
              >
                {activeSubject.name}
              </button>
            </>
          )}
          {activeChapter && (
            <>
              <FiChevronRight />
              <span className="font-medium text-garud-accent">{activeChapter.name}</span>
            </>
          )}
        </div>

        {/* Subjects List */}
        {!activeSubject && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {subjects.map((subject) => (
              <div
                key={subject._id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition cursor-pointer group"
              >
                <div
                  className="flex items-center gap-3 flex-1"
                  onClick={() => setActiveSubject(subject)}
                >
                  <FiBook className="text-blue-500 w-5 h-5" />
                  <span className="font-medium text-gray-700">{subject.name}</span>
                </div>
                <button
                  onClick={() => deleteSubject(subject._id)}
                  className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition"
                >
                  <FiTrash2 />
                </button>
              </div>
            ))}
            {subjects.length === 0 && (
              <p className="text-gray-400 col-span-3 text-center py-8">
                No subjects yet. Add one above!
              </p>
            )}
          </div>
        )}

        {/* Chapters List */}
        {activeSubject && !activeChapter && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {chapters.map((chapter) => (
              <div
                key={chapter._id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition cursor-pointer group"
              >
                <div
                  className="flex items-center gap-3 flex-1"
                  onClick={() => setActiveChapter(chapter)}
                >
                  <FiLayers className="text-green-500 w-5 h-5" />
                  <span className="font-medium text-gray-700">{chapter.name}</span>
                </div>
                <button
                  onClick={() => deleteChapter(chapter._id)}
                  className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition"
                >
                  <FiTrash2 />
                </button>
              </div>
            ))}
            {chapters.length === 0 && (
              <p className="text-gray-400 col-span-3 text-center py-8">
                No chapters in this subject. Add one above!
              </p>
            )}
          </div>
        )}

        {/* Topics List */}
        {activeChapter && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {topics.map((topic) => (
              <div
                key={topic._id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition group"
              >
                <div className="flex items-center gap-3 flex-1">
                  <FiTag className="text-purple-500 w-5 h-5" />
                  <span className="font-medium text-gray-700">{topic.name}</span>
                </div>
                <button
                  onClick={() => deleteTopic(topic._id)}
                  className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition"
                >
                  <FiTrash2 />
                </button>
              </div>
            ))}
            {topics.length === 0 && (
              <p className="text-gray-400 col-span-3 text-center py-8">
                No topics in this chapter. Add one above!
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionBank;
