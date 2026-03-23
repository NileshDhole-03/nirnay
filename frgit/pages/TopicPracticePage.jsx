import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../utils/axiosClient';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import QuestionBlock from '../components/QuestionBlock';

const restoreMangledLatex = (str) => {
  if (!str) return '';
  let s = str
    .replace(/[\x08]/g, '\\b')   // \b backspace → \b (fixes \bar, \binom, \begin)
    .replace(/\t/g, '\\t')       // \t tab → \t (fixes \times, \text, \theta)
    .replace(/\f/g, '\\f')       // \f form feed → \f (fixes \frac, \forall)
    .replace(/\r/g, '\\r')       // \r carriage return → \r (fixes \right, \rho)
    .replace(/\v/g, '\\v')       // \v vertical tab → \v (fixes \vec, \vdots)
    .replace(/\0/g, '')          // null bytes → remove
    .replace(/\\u([0-9a-fA-F]{4})/g, (match, p1) => String.fromCharCode(parseInt(p1, 16))); // Decode literal \uXXXX sequences

  return s;
};

const TopicPracticePage = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const [parts, setParts] = useState([]);
  const [theory, setTheory] = useState('');
  const [topicName, setTopicName] = useState('Topic Practice');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('theory'); // 'theory' | 'practice'

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch topics to get the name of the current topic
        const topicRes = await axiosClient.get('/aptitude/topics');
        const currentTopic = topicRes.data.data.find(t => t._id === topicId);
        if (currentTopic) setTopicName(currentTopic.name);

        // Fetch topic payload (parts, theory, etc)
        const response = await axiosClient.get(`/aptitude/topics/${topicId}/questions`);
        
        if (response.data.data) {
          setParts(response.data.data.parts || []);
          setTheory(response.data.data.theory || '');
        }
        setError(null);
      } catch (err) {
        console.error('Error fetching questions:', err);
        setError('Failed to load topic details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [topicId]);

  return (
    <div className="min-h-screen bg-[#000000] text-gray-200">
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-24">
        
        {/* Header Section */}
        <div className="flex items-center gap-4 mb-10 border-b border-gray-800 pb-6">
          <button 
            onClick={() => navigate('/aptitude')}
            className="btn btn-circle btn-sm bg-gray-800 text-white border-none hover:bg-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-wide">{topicName}</h1>
            <p className="text-gray-400 text-sm mt-1">
              {parts.reduce((acc, part) => acc + (part.questions?.length || 0), 0)} Questions available
            </p>
          </div>
        </div>

        {/* Tabs */}
        {!loading && (
          <div className="flex border-b border-gray-800 mb-8 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('theory')}
              className={`px-6 py-4 font-bold text-sm tracking-widest uppercase whitespace-nowrap transition-colors duration-200 ${
                activeTab === 'theory' 
                  ? 'text-white border-b-2 border-white bg-white/5' 
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              Notes & Formulae
            </button>
            <button
              onClick={() => setActiveTab('practice')}
              className={`px-6 py-4 font-bold text-sm tracking-widest uppercase whitespace-nowrap transition-colors duration-200 ${
                activeTab === 'practice' 
                  ? 'text-white border-b-2 border-white bg-white/5' 
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              Practice Engine
            </button>
          </div>
        )}

        {/* Dynamic Content Section */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
             <span className="loading loading-spinner loading-lg text-white"></span>
          </div>
        ) : error ? (
          <div className="text-center text-red-400 py-20 bg-gray-900 border border-gray-800 rounded-xl">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="text-2xl font-semibold mb-2">Error Loading Topic</h3>
            <p>{error}</p>
          </div>
        ) : activeTab === 'theory' ? (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 shadow-2xl">
            {theory ? (
              <div className="prose prose-invert max-w-none text-gray-300 leading-loose">
                <ReactMarkdown
                  remarkPlugins={[remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                  components={{
                    h1: ({node, ...props}) => <h1 className="text-3xl font-extrabold text-white mb-6 border-b border-gray-800 pb-2" {...props} />,
                    h2: ({node, ...props}) => <h2 className="text-2xl font-bold text-white mt-10 mb-4" {...props} />,
                    h3: ({node, ...props}) => <h3 className="text-xl font-bold text-white mt-8 mb-3" {...props} />,
                    p: ({node, ...props}) => <p className="mb-4" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-4 marker:text-gray-600" {...props} />,
                    ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-4 marker:text-gray-600" {...props} />,
                    li: ({node, ...props}) => <li className="pl-2 mb-1" {...props} />,
                    strong: ({node, ...props}) => <strong className="text-white font-semibold" {...props} />,
                    blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-gray-600 pl-4 py-1 italic bg-black/20 my-4" {...props} />,
                    code: ({node, ...props}) => <code className="bg-black text-gray-300 px-1.5 py-0.5 rounded text-sm font-mono border border-gray-800" {...props} />
                  }}
                >
                  {restoreMangledLatex(theory)}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="text-center py-16">
                <h3 className="text-xl text-gray-500 font-light">No study notes generated for this topic yet.</h3>
              </div>
            )}
          </div>
        ) : parts.length === 0 ? (
          <div className="text-center bg-gray-900 border border-gray-800 rounded-xl p-12">
            <h3 className="text-xl text-gray-400 font-light">No questions available for this topic yet.</h3>
          </div>
        ) : (
          <div className="space-y-16">
            {parts.map((part, partIndex) => (
              <div key={part._id || partIndex}>
                <h2 className="text-2xl font-bold text-white tracking-widest uppercase mb-8 pb-3 border-b border-gray-800 inline-block px-1">
                  {part.partName}
                </h2>
                <div className="space-y-8">
                  {part.questions && part.questions.map((q, index) => (
                    <QuestionBlock key={q._id || `${partIndex}-${index}`} question={q} index={index} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TopicPracticePage;
