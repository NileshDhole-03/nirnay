import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Play, FileText, CheckCircle, ChevronDown, ChevronRight, 
  Menu, X, Loader2, Clock, BookOpen, MessageCircle, Download 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axiosClient from '../utils/axiosClient';

const CourseViewer = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState([0]); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // New state for tabs below video
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const { data } = await axiosClient.get(`/course/get/${courseId}`);
        setCourse(data);
        const firstLesson = data?.curriculum?.[0]?.lessons?.[0];
        if (firstLesson) setCurrentLesson(firstLesson);
      } catch (error) {
        console.error("Error loading course", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourseData();
  }, [courseId]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) setIsDarkMode(savedTheme === 'dark');
  }, []);

  const getYouTubeEmbedUrl = (url) => {
    if (!url || typeof url !== 'string') return "";
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    const id = (match && match[2].length === 11) ? match[2] : null;
    return id ? `https://www.youtube.com/embed/${id}?modestbranding=1&rel=0` : "";
  };

  const toggleSection = (index) => {
    setExpandedSections(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const bgMain = isDarkMode ? 'bg-[#0f0f0f]' : 'bg-gray-50';
  const bgPanel = isDarkMode ? 'bg-[#1e1e1e]' : 'bg-white';
  const textPrimary = isDarkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = isDarkMode ? 'text-gray-400' : 'text-gray-600';
  const borderClass = isDarkMode ? 'border-white/10' : 'border-gray-200';

  if (loading) return (
    <div className={`h-screen w-full flex items-center justify-center ${bgMain}`}>
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-10 h-10 text-emerald-400 animate-spin" />
        <p className={textSecondary}>Loading Class...</p>
      </div>
    </div>
  );

  if (!course) return (
    <div className={`h-screen w-full flex items-center justify-center ${bgMain}`}>
      <div className="text-center">
        <h2 className={`text-2xl font-bold ${textPrimary} mb-2`}>Course Not Found</h2>
        <button onClick={() => navigate('/courses')} className="text-emerald-400 hover:underline">Back to Courses</button>
      </div>
    </div>
  );

  const totalLessons = course.curriculum?.reduce((acc, curr) => acc + (curr.lessons?.length || 0), 0) || 0;

  return (
    <div className={`h-screen flex flex-col ${bgMain} overflow-hidden font-sans`}>
      
      {/* Top Navbar */}
      <div className={`h-14 border-b ${borderClass} ${bgPanel} flex items-center justify-between px-4 z-20 shrink-0`}>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/courses')} className={`p-2 rounded-full hover:bg-white/10 ${textSecondary} transition-colors`}>
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className={`text-sm font-bold ${textPrimary} line-clamp-1`}>{course.title}</h1>
            <p className="text-xs text-emerald-400 font-medium">0% Completed</p>
          </div>
        </div>
        <button className="lg:hidden p-2 text-emerald-400" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          {isSidebarOpen ? <X /> : <Menu />}
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        
        {/* --- Main Video Area --- */}
        <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar relative">
          
          {/* Theater Mode Container */}
          <div className="w-full bg-black flex justify-center items-center relative group min-h-[300px] lg:min-h-[480px]">
            {currentLesson?.videoUrl ? (
              <iframe 
                src={getYouTubeEmbedUrl(currentLesson.videoUrl)} 
                title={currentLesson.title}
                className="w-full h-full absolute inset-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              ></iframe>
            ) : (
              <div className="text-gray-500 flex flex-col items-center gap-2">
                <Play className="w-12 h-12 opacity-50" />
                <span>Select a lesson to start</span>
              </div>
            )}
          </div>
          
          {/* Content Below Video */}
          {currentLesson && (
            <div className="flex-1">
              {/* Sticky Info Bar */}
              <div className={`px-6 py-4 border-b ${borderClass} ${bgPanel} sticky top-0 z-10 shadow-sm`}>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 max-w-5xl mx-auto">
                  <div>
                    <h2 className={`text-xl font-bold ${textPrimary} mb-1`}>{currentLesson.title}</h2>
                    <p className={`text-xs ${textSecondary} flex items-center gap-2`}>
                      <Clock className="w-3 h-3" /> {currentLesson.duration || "10:00"}
                    </p>
                  </div>
                  <button className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-black text-sm font-bold rounded-lg transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 whitespace-nowrap">
                    <CheckCircle className="w-4 h-4" /> Mark Complete
                  </button>
                </div>
              </div>

              {/* Tabs Navigation */}
              <div className="max-w-5xl mx-auto px-6 mt-6">
                <div className={`flex gap-6 border-b ${borderClass} mb-6`}>
                  {['overview', 'resources', 'discussion'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`pb-3 text-sm font-medium transition-all capitalize ${
                        activeTab === tab 
                          ? 'text-emerald-400 border-b-2 border-emerald-400' 
                          : `${textSecondary} hover:text-white`
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div className="pb-20">
                  {activeTab === 'overview' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                      <div className={`${bgPanel} rounded-xl p-6 border ${borderClass}`}>
                        <h3 className={`text-sm font-bold ${textPrimary} mb-3 uppercase tracking-wider`}>About this lesson</h3>
                        <p className={`${textSecondary} text-sm leading-relaxed whitespace-pre-wrap`}>
                          {currentLesson.description || "In this lesson, we will dive deep into the core concepts. Make sure to follow along with the code examples and check the resources tab for additional reading materials."}
                        </p>
                      </div>
                    </div>
                  )}

                  {activeTab === 'resources' && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
                      <div className={`flex items-center justify-between p-4 rounded-xl border ${borderClass} ${bgPanel} hover:border-emerald-500/30 transition-colors cursor-pointer group`}>
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-black transition-colors">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <p className={`text-sm font-medium ${textPrimary}`}>Lecture Slides</p>
                            <p className="text-xs text-gray-500">PDF • 2.4 MB</p>
                          </div>
                        </div>
                        <Download className={`w-4 h-4 ${textSecondary} group-hover:text-emerald-400`} />
                      </div>
                      
                      <div className={`flex items-center justify-between p-4 rounded-xl border ${borderClass} ${bgPanel} hover:border-emerald-500/30 transition-colors cursor-pointer group`}>
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-500 group-hover:text-black transition-colors">
                            <Code2 className="w-5 h-5" />
                          </div>
                          <div>
                            <p className={`text-sm font-medium ${textPrimary}`}>Source Code</p>
                            <p className="text-xs text-gray-500">ZIP • 5 MB</p>
                          </div>
                        </div>
                        <Download className={`w-4 h-4 ${textSecondary} group-hover:text-blue-400`} />
                      </div>
                    </div>
                  )}

                  {activeTab === 'discussion' && (
                    <div className="text-center py-10">
                      <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MessageCircle className="w-8 h-8 text-gray-500" />
                      </div>
                      <h3 className={`text-lg font-bold ${textPrimary}`}>Discussion Forum</h3>
                      <p className={`text-sm ${textSecondary} mb-4`}>Have questions? Ask your instructor and peers.</p>
                      <button className="px-4 py-2 border border-gray-700 rounded-lg text-sm hover:bg-white/5 transition-colors text-gray-300">
                        View 12 Comments
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* --- Sidebar Curriculum --- */}
        <div 
          className={`
            fixed lg:relative w-80 lg:w-96 h-full border-l ${borderClass} ${bgPanel} 
            transition-transform duration-300 z-10
            ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
            right-0 top-0 flex flex-col shadow-2xl lg:shadow-none
          `}
        >
          <div className={`p-5 border-b ${borderClass} bg-gradient-to-r from-emerald-900/10 to-transparent`}>
            <h2 className={`font-bold ${textPrimary} flex items-center gap-2`}>
              <BookOpen className="w-4 h-4 text-emerald-400" />
              Course Content
            </h2>
            <div className="mt-4 w-full bg-gray-700 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full w-[0%] rounded-full"></div> {/* Progress Bar */}
            </div>
            <p className={`text-xs ${textSecondary} mt-2 flex justify-between`}>
              <span>0% Completed</span>
              <span>0/{totalLessons} Lessons</span>
            </p>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pb-20">
            {(course.curriculum || []).map((section, sIndex) => (
              <div key={section._id || sIndex} className={`border-b ${borderClass}`}>
                <button 
                  onClick={() => toggleSection(sIndex)}
                  className={`w-full p-4 flex items-center justify-between transition-colors ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}
                >
                  <span className={`font-semibold text-sm ${textPrimary} text-left line-clamp-1`}>{section.title}</span>
                  {expandedSections.includes(sIndex) ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
                </button>

                <AnimatePresence>
                  {expandedSections.includes(sIndex) && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden bg-black/20"
                    >
                      {(section.lessons || []).map((lesson, lIndex) => {
                        const isActive = currentLesson?._id === lesson._id;
                        return (
                          <div 
                            key={lesson._id || lIndex}
                            onClick={() => {
                              setCurrentLesson(lesson);
                              if (window.innerWidth < 1024) setIsSidebarOpen(false); 
                            }}
                            className={`
                              p-3 pl-5 pr-4 flex gap-3 cursor-pointer transition-all text-sm border-l-[3px] group
                              ${isActive 
                                ? 'bg-emerald-500/10 border-emerald-500' 
                                : `border-transparent ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-100'}`}
                            `}
                          >
                            <div className="mt-0.5">
                              {isActive 
                                ? <Play className="w-4 h-4 text-emerald-400 fill-current" />
                                : <div className="w-4 h-4 rounded-full border-2 border-gray-600 group-hover:border-emerald-400 transition-colors"></div>
                              }
                            </div>
                            <div className="flex-1">
                              <p className={`line-clamp-2 ${isActive ? 'text-emerald-400 font-medium' : textSecondary} group-hover:text-white transition-colors`}>
                                {lesson.title}
                              </p>
                              <span className="text-[10px] text-gray-600 flex items-center gap-1 mt-1 font-medium">
                                <Clock className="w-3 h-3" /> {lesson.duration || "10:00"}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

// Helper component for Code Icon since it was missing in lucide import
const Code2 = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>);

export default CourseViewer;