import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PlayCircle, BookOpen, Clock, Loader2, AlertCircle } from 'lucide-react';
import axiosClient from '../utils/axiosClient';

const Courses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // 1. Fetch Courses from API
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const { data } = await axiosClient.get('/course/getAll');
        setCourses(data);
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // 2. Load Theme Preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) setIsDarkMode(savedTheme === 'dark');
  }, []);

  // Theme Styles
  const bgClass = isDarkMode ? 'bg-black' : 'bg-gray-50';
  const textPrimary = isDarkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = isDarkMode ? 'text-gray-400' : 'text-gray-600';
  const cardBg = isDarkMode ? 'bg-[#121212]' : 'bg-white';
  const borderClass = isDarkMode ? 'border-white/10' : 'border-gray-200';

  if (loading) {
    return (
      <div className={`min-h-screen ${bgClass} flex flex-col items-center justify-center`}>
        <Loader2 className="w-10 h-10 text-emerald-400 animate-spin mb-4" />
        <p className={textSecondary}>Loading your courses...</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bgClass} pt-24 px-6 lg:px-12`}>
      {/* Header */}
      <div className="max-w-[1400px] mx-auto mb-12 text-center">
        <h1 className={`text-4xl font-bold mb-4 ${textPrimary}`}>
          Explore Best Courses<span className="text-emerald-400"> Present On The Internet</span>
        </h1>
        <p className={textSecondary}>
          Curated learning paths to master coding skills
        </p>
      </div>

      {/* Content Grid */}
      <div className="max-w-[1400px] mx-auto pb-20">
        {courses.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-800/50 mb-4">
              <AlertCircle className="w-8 h-8 text-gray-500" />
            </div>
            <h3 className={`text-xl font-bold ${textPrimary} mb-2`}>No courses found</h3>
            <p className={textSecondary}>Check back later for new content!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course, index) => (
              <motion.div
                key={course._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className={`${cardBg} border ${borderClass} rounded-2xl overflow-hidden cursor-pointer group shadow-lg hover:shadow-emerald-500/10 transition-all duration-300`}
                onClick={() => navigate(`/course/${course._id}`)}
              >
                {/* Thumbnail */}
                <div className="relative h-48 overflow-hidden bg-gray-900">
                  <img 
                    src={course.thumbnail} 
                    alt={course.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100" 
                  />
                  {/* Overlay Play Button */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <PlayCircle className="w-14 h-14 text-white fill-emerald-500 drop-shadow-xl" />
                    </motion.div>
                  </div>
                  
                  {/* Badge (Optional: e.g., 'Free' or 'New') */}
                  <div className="absolute top-3 right-3">
                    <span className="px-2 py-1 text-xs font-bold bg-black/60 text-white backdrop-blur-md rounded-md border border-white/10">
                      {course.instructor || "DSAHub"}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {course.tags?.slice(0, 3).map((tag, i) => (
                      <span key={i} className="text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <h3 className={`text-xl font-bold mb-2 ${textPrimary} line-clamp-1 group-hover:text-emerald-400 transition-colors`}>
                    {course.title}
                  </h3>
                  
                  <p className={`text-sm ${textSecondary} mb-6 line-clamp-2 h-10`}>
                    {course.description}
                  </p>

                  {/* Footer Meta Info */}
                  <div className={`flex items-center justify-between pt-4 border-t ${borderClass}`}>
                    <div className={`flex items-center gap-2 text-xs font-medium ${textSecondary}`}>
                      <BookOpen className="w-3.5 h-3.5" /> 
                      {/* Handle case where totalLessons might not be in the lightweight API response */}
                      <span>{course.totalLessons ? `${course.totalLessons} Lessons` : "Start Learning"}</span>
                    </div>
                    <div className={`flex items-center gap-2 text-xs font-medium ${textSecondary}`}>
                      <Clock className="w-3.5 h-3.5" /> 
                      <span>{course.duration || "Self-paced"}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Courses;