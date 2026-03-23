import React, { useState, useEffect } from 'react';
import axiosClient from '../utils/axiosClient';
import TopicCard from '../components/TopicCard';

const Aptitude = () => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const response = await axiosClient.get('/aptitude/topics');
        setTopics(response.data.data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch topics:', err);
        setError('Failed to load topics. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
  }, []);

  return (
    <div className="min-h-screen bg-[#000000] text-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-24">
        
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-widest uppercase mb-4 inline-block">
            Aptitude Practice
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Master the core concepts of mathematics and logic. Select a topic below to begin solving carefully curated problems to boost your placement readiness.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
             <span className="loading loading-spinner loading-lg text-white"></span>
          </div>
        ) : error ? (
          <div className="text-center text-red-400 py-20 bg-gray-900 border border-gray-800 rounded-xl">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="text-2xl font-semibold mb-2">Error Loading Content</h3>
            <p>{error}</p>
          </div>
        ) : topics.length === 0 ? (
          <div className="text-center text-gray-500 py-20 bg-gray-900 border border-gray-800 rounded-xl">
            <h3 className="text-2xl font-semibold mb-2">No Topics Found</h3>
            <p>Check back later for new aptitude topics!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {topics.map((topic) => (
              <TopicCard key={topic._id} topic={topic} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Aptitude;
