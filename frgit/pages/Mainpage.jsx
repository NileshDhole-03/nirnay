import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Code2, Zap, Target, ArrowRight, CheckCircle, Star, Award, Menu, X, Layers, Cpu, Play, Terminal } from 'lucide-react';

// --- 3D INTERACTIVE BACKGROUND COMPONENT ---
const StarField3D = () => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    // Variables for 3D logic
    let stars = [];
    const numStars = 800;
    const focalLength = canvas.width;
    let centerX = canvas.width / 2;
    let centerY = canvas.height / 2;

    // Mouse interaction variables
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    // Initialize stars with random X, Y, Z
    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: Math.random() * canvas.width - canvas.width / 2,
        y: Math.random() * canvas.height - canvas.height / 2,
        z: Math.random() * canvas.width, // Depth
        size: Math.random() * 2,
        color: i % 3 === 0 ? '#10b981' : (i % 3 === 1 ? '#06b6d4' : '#ffffff') // Emerald, Cyan, White
      });
    }

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      centerX = canvas.width / 2;
      centerY = canvas.height / 2;
    };

    const handleMouseMove = (e) => {
      // Calculate mouse position relative to center (-1 to 1)
      targetX = (e.clientX - centerX) * 0.0005;
      targetY = (e.clientY - centerY) * 0.0005;
    };

    const render = () => {
      // Smooth camera movement
      mouseX += (targetX - mouseX) * 0.05;
      mouseY += (targetY - mouseY) * 0.05;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'; // Trail effect (lower opacity = longer trails)
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      stars.forEach((star) => {
        // Move star towards screen (decrease Z)
        star.z -= 2;

        // Reset star if it passes the screen
        if (star.z <= 0) {
          star.z = canvas.width;
          star.x = Math.random() * canvas.width - canvas.width / 2;
          star.y = Math.random() * canvas.height - canvas.height / 2;
        }

        // Project 3D coordinates to 2D screen
        // Apply rotation based on mouse position
        const scale = focalLength / star.z;
        const x2d = (star.x * scale) + centerX;
        const y2d = (star.y * scale) + centerY;

        // Apply visual rotation shift
        const shiftedX = x2d + (star.z * mouseX);
        const shiftedY = y2d + (star.z * mouseY);

        if (shiftedX > 0 && shiftedX < canvas.width && shiftedY > 0 && shiftedY < canvas.height) {
          ctx.beginPath();
          ctx.fillStyle = star.color;
          // Star grows as it gets closer
          const currentSize = star.size * (scale * 0.5);
          ctx.arc(shiftedX, shiftedY, currentSize, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    handleResize();
    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 bg-black pointer-events-none"
    />
  );
};

// --- CENTERED NAVBAR ---
const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Practice', path: '/Homepage' },
    { name: 'Courses', path: '/courses' },
    { name: 'DSAVisualizer', path: '/DSAVisualizer' },
    { name: '3D Visualizer', path: '/code-visualizer' },
    { name: 'Aptitude', path: '/aptitude' },
    { name: 'Leaderboard', path: '/leaderboard' },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4"
      >
        <div
          className={`
            relative flex items-center gap-8 px-6 py-3 rounded-full transition-all duration-500
            ${scrolled
              ? 'bg-black/70 backdrop-blur-xl border border-white/10 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
              : 'bg-white/5 backdrop-blur-md border border-white/5'
            }
          `}
        >
          {/* Logo */}
          <div
            className="flex items-center gap-2 cursor-pointer pr-4 border-r border-white/10"
            onClick={() => navigate('/')}
          >
            <div className="w-8 h-8 bg-gradient-to-tr from-emerald-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Code2 className="w-5 h-5 text-black font-bold" strokeWidth={2.5} />
            </div>
            <span className="text-lg font-bold tracking-tight text-white hidden sm:block">
              NIR<span className="text-emerald-400">NAY</span>
            </span>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 rounded-full transition-all"
              >
                {item.name}
              </button>
            ))}
          </div>

          {/* Mobile Toggle */}
          <button
            className="md:hidden text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center gap-8"
        >
          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={() => {
                navigate(item.path);
                setMobileMenuOpen(false);
              }}
              className="text-2xl font-bold text-gray-200 hover:text-emerald-400"
            >
              {item.name}
            </button>
          ))}
        </motion.div>
      )}
    </>
  );
};

// Hero Section
const Hero = () => {
  const navigate = useNavigate();

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Note: Background is handled by StarField3D in Mainpage component */}

      <div className="relative z-10 max-w-[1200px] mx-auto px-6 lg:px-12 text-center pt-32">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="inline-block mb-6"
        >
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-full px-5 py-2 backdrop-blur-md shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            <span className="text-emerald-400 font-medium text-sm tracking-wide flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              MASTER DSA IN 2026
            </span>
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-6xl sm:text-7xl lg:text-[120px] font-bold mb-8 leading-[0.95] tracking-tight drop-shadow-2xl"
        >
          <span className="block text-white mix-blend-difference">Learn to</span>
          <span className="block bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Code Better
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-xl lg:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed drop-shadow-md"
        >
          Master data structures and algorithms with interactive practice, visualizers, and expert courses. Built for developers who want to excel.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-5 justify-center items-center mb-20"
        >
          <motion.button
            onClick={() => navigate('/Homepage')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white text-black px-10 py-4 rounded-full font-bold text-lg hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] transition-all flex items-center gap-3"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </motion.button>

          <motion.button
            onClick={() => navigate('/courses')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="border border-white/20 bg-white/5 px-10 py-4 rounded-full font-semibold text-lg hover:bg-white/10 transition-all backdrop-blur-sm"
          >
            View Courses
          </motion.button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="grid grid-cols-3 gap-8 max-w-2xl mx-auto border-t border-white/10 pt-8"
        >
          {[
            { number: '50K+', label: 'Active Learners' },
            { number: '500+', label: 'DSA Problems' },
            { number: '95%', label: 'Success Rate' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + i * 0.1 }}
              className="text-center"
            >
              <div className="text-3xl lg:text-4xl font-bold mb-1 text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400">{stat.number}</div>
              <div className="text-sm text-gray-400 font-medium tracking-wide">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

// Practice Section
const Practice = () => {
  const features = [
    {
      icon: Target,
      title: 'Interview Ready',
      description: 'Curated problems from FAANG companies. Practice questions that actually appear in interviews.',
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Interactive visualizations make complex algorithms simple. Learn in minutes, not hours.',
    },
    {
      icon: Award,
      title: 'Track Progress',
      description: 'Comprehensive analytics dashboard. Monitor your growth with detailed insights.',
    },
  ];

  return (
    <section id="practice" className="relative py-32 px-6 lg:px-12">
      <div className="max-w-[1400px] mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl lg:text-7xl font-bold mb-6 tracking-tight">
            Everything You Need to
            <span className="block bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Succeed
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            All the tools, resources, and guidance in one powerful platform
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -10, rotateX: 5, rotateY: 5 }}
              className="group relative bg-black/40 backdrop-blur-md border border-white/10 rounded-3xl p-8 hover:border-emerald-500/50 transition-all duration-300 shadow-xl"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl pointer-events-none" />
              <div className="relative">
                <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-emerald-500/20">
                  <feature.icon className="w-7 h-7 text-emerald-400" strokeWidth={2} />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Courses Section
const Courses = () => {
  const navigate = useNavigate();
  const benefits = [
    'Access 500+ handpicked DSA problems',
    'Real-time algorithm visualization tools',
    'Step-by-step video explanations',
    'Company-specific interview preparation',
    'AI-powered personalized learning paths',
    'Weekly live coding sessions',
  ];

  return (
    <section id="courses" className="relative py-32 px-6 lg:px-12 bg-black/50 backdrop-blur-sm">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-block bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 mb-6">
              <span className="text-emerald-400 font-medium text-sm">COMPREHENSIVE LEARNING</span>
            </div>

            <h2 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight tracking-tight">
              Master DSA at
              <span className="block text-emerald-400">Your Own Pace</span>
            </h2>

            <p className="text-xl text-gray-400 mb-10 leading-relaxed">
              From fundamentals to advanced algorithms, our structured curriculum takes you from beginner to interview-ready professional.
            </p>

            <div className="space-y-4 mb-10">
              {benefits.map((benefit, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-start gap-4"
                >
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5 border border-emerald-500/30">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span className="text-gray-300 text-lg">{benefit}</span>
                </motion.div>
              ))}
            </div>

            <motion.button
              onClick={() => navigate('/courses')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-black px-8 py-4 rounded-full font-bold text-lg hover:bg-emerald-400 transition-colors shadow-lg"
            >
              Explore Courses
            </motion.button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="relative bg-gradient-to-br from-emerald-500/5 to-cyan-500/5 rounded-3xl p-10 border border-white/10 backdrop-blur-md shadow-2xl">
              <div className="space-y-6">
                {[
                  { name: 'Arrays & Strings', progress: 92, color: 'bg-emerald-500' },
                  { name: 'Trees & Graphs', progress: 78, color: 'bg-cyan-500' },
                  { name: 'Dynamic Programming', progress: 65, color: 'bg-blue-500' },
                  { name: 'System Design', progress: 45, color: 'bg-purple-500' },
                ].map((course, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-semibold text-lg">{course.name}</span>
                      <span className="text-emerald-400 font-bold">{course.progress}%</span>
                    </div>
                    <div className="bg-white/5 rounded-full h-2.5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${course.progress}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: i * 0.1 }}
                        className={`${course.color} h-full rounded-full shadow-[0_0_10px_currentColor]`}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-10 pt-8 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold">280/500</div>
                    <div className="text-gray-400 text-sm">Problems Solved</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-6 h-6 text-yellow-400 fill-yellow-400 animate-pulse" />
                    <div className="text-3xl font-bold">1,245</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// Visualizer Section
const Visualizer = () => {
  return (
    <section id="visualizer" className="relative py-32 px-6 lg:px-12">
      <div className="max-w-[1200px] mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-block bg-cyan-500/10 border border-cyan-500/20 rounded-full px-4 py-1.5 mb-6">
            <span className="text-cyan-400 font-medium text-sm">INTERACTIVE LEARNING</span>
          </div>

          <h2 className="text-5xl lg:text-7xl font-bold mb-6 tracking-tight">
            See Algorithms
            <span className="block bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Come to Life
            </span>
          </h2>

          <p className="text-xl text-gray-400 mb-16 max-w-3xl mx-auto">
            Interactive visualizations that transform complex algorithms into intuitive, easy-to-understand animations
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative bg-black/40 rounded-3xl p-12 lg:p-16 border border-cyan-500/20 backdrop-blur-md overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.1)]"
        >
          <div className="relative">
            <div className="flex justify-center items-end gap-3 h-64 mb-6 perspective-1000">
              {[42, 78, 23, 91, 15, 67, 34, 88, 52].map((value, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  whileInView={{ height: `${value}%` }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.5, type: 'spring' }}
                  className="bg-gradient-to-t from-cyan-500 to-blue-500 rounded-t-xl relative group cursor-pointer"
                  style={{ width: '8%', minHeight: '40px', transformStyle: 'preserve-3d' }}
                  whileHover={{ scale: 1.05, z: 20 }}
                >
                  {/* 3D Depth effect using CSS borders */}
                  <div className="absolute top-0 right-0 h-full w-2 bg-blue-700/50 origin-right transform skew-y-12 translate-x-full opacity-50" />
                  <div className="absolute -top-2 left-0 w-full h-2 bg-cyan-400/50 origin-bottom transform skew-x-12 -translate-y-full opacity-50" />

                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-white text-black text-xs font-bold px-2 py-1 rounded">
                      {value}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// CTA Section

import { useInView } from 'framer-motion';
//import { useNavigate } from 'react-router-dom';
//import { ArrowRight, CheckCircle, Code2, Terminal, Cpu } from 'lucide-react';

// --- CUSTOM SYNTAX HIGHLIGHTER FOR YOUR THEME ---
const highlightCode = (code) => {
  if (!code) return "";

  // 1. Escape HTML entities first
  let safeCode = code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // 2. Token Storage (To hide strings/comments from keyword highlighter)
  const tokens = [];
  const storeToken = (match, className) => {
    tokens.push(`<span class="${className}">${match}</span>`);
    return `__TOKEN_${tokens.length - 1}__`;
  };

  // 3. Extract Strings & Comments FIRST (Hide them)
  safeCode = safeCode
    // Strings (Emerald Green)
    .replace(/(".*?")/g, (match) => storeToken(match, "text-emerald-400"))
    // Comments (Gray Italic)
    .replace(/(\/\/.*)/g, (match) => storeToken(match, "text-gray-500 italic"));

  // 4. Highlight Keywords (Now safe to run without breaking HTML)
  safeCode = safeCode
    // Keywords (Cyan/Blue)
    .replace(/\b(using|namespace|int|main|return|string|cout|endl|std|vector|void|class|public|private|bool|const)\b/g, '<span class="text-cyan-400 font-bold">$1</span>')
    // Macros (Pink)
    .replace(/(#include)/g, '<span class="text-pink-400">$1</span>');

  // 5. Restore the hidden tokens
  tokens.forEach((token, i) => {
    safeCode = safeCode.replace(`__TOKEN_${i}__`, token);
  });

  return safeCode;
};

const CTA = () => {
  const navigate = useNavigate();
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [showOutput, setShowOutput] = useState(false);
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  // --- HINDI / CASUAL CODE SNIPPET ---
  const codeSnippet = `#include <iostream>
using namespace std;

int main() {
    // Chalo shuru karte hai! 🚀
    string goal = "Crack FAANG";
    
    cout << "Arre Bhai! Welcome to NIRNAY." << endl;
    cout << "Ab DSA banega ekdam Halwa! 🍲" << endl;
    cout << "Let's code our future." << endl;

    return 0; // Mission Successful
}`;

  useEffect(() => {
    if (isInView && isTyping) {
      let currentIndex = 0;
      // Slower typing speed (100ms)
      const interval = setInterval(() => {
        if (currentIndex <= codeSnippet.length) {
          setDisplayedText(codeSnippet.slice(0, currentIndex));
          currentIndex++;
        } else {
          setIsTyping(false);
          clearInterval(interval);
          setTimeout(() => setShowOutput(true), 500);
        }
      }, 100);

      return () => clearInterval(interval);
    }
  }, [isInView, isTyping]);

  return (
    <section className="relative py-32 px-6 lg:px-12 overflow-hidden bg-black">
      {/* Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-900/10 rounded-full blur-[120px]" />

      <div className="max-w-[1200px] mx-auto grid lg:grid-cols-2 gap-20 items-center relative z-10">

        {/* LEFT: Text Content */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold mb-6 tracking-wider uppercase">
            <Cpu size={14} />
            Rular Dev Community
          </div>

          <h2 className="text-5xl lg:text-7xl font-bold mb-6 tracking-tight text-white">
            Ready to <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Compile</span>
            <br /> Your Dream Job?
          </h2>

          <p className="text-xl text-gray-400 mb-8 leading-relaxed">
            Join thousands of Indian developers mastering DSA.
            Ratna band karo, samajhna shuru karo.
          </p>

          <div className="flex flex-wrap gap-4 mb-10">
            {['100% Free', 'Hindi/English', 'Live Feedback'].map((item, i) => (
              <div key={i} className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/5 backdrop-blur-sm">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span className="text-sm text-gray-300 font-medium">{item}</span>
              </div>
            ))}
          </div>

          <motion.button
            onClick={() => navigate('/Homepage')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-emerald-500 text-black px-10 py-4 rounded-xl font-bold text-lg hover:bg-emerald-400 transition-all shadow-[0_0_25px_rgba(16,185,129,0.4)] inline-flex items-center gap-2"
          >
            Start Coding Now
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </motion.div>

        {/* RIGHT: The Live Editor */}
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0, y: 50, rotateX: 10 }}
          whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative perspective-1000"
        >
          {/* Editor Window */}
          <div className="relative bg-[#09090b] rounded-xl border border-white/10 shadow-2xl overflow-hidden font-mono text-sm leading-relaxed transform transition-transform hover:scale-[1.02] duration-500">

            {/* Header */}
            <div className="bg-[#121214] px-4 py-3 flex items-center justify-between border-b border-white/5">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
                <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
              </div>
              <div className="text-gray-400 text-xs font-medium flex items-center gap-2 opacity-70">
                <Code2 className="w-3 h-3 text-emerald-500" />
                Welcome_From_Nilesh.cpp
              </div>
              <div className="flex items-center gap-2">
                <Play size={12} className={isTyping ? "text-gray-600" : "text-emerald-500"} />
              </div>
            </div>

            {/* Code Content */}
            <div className="p-6 overflow-x-auto min-h-[220px] bg-black/50 backdrop-blur-sm relative">
              <div className="flex">
                {/* Line Numbers */}
                <div className="flex flex-col text-right text-gray-700 select-none pr-4 border-r border-white/5 mr-4 font-mono text-xs leading-6">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <span key={i}>{i + 1}</span>
                  ))}
                </div>

                {/* Code Area */}
                <div className="w-full">
                  <pre className="font-mono text-gray-300 text-xs sm:text-sm leading-6 whitespace-pre-wrap">
                    {/* Highlighted text injected safely */}
                    <code dangerouslySetInnerHTML={{ __html: highlightCode(displayedText) }} />

                    {/* Blinking Cursor */}
                    {isTyping && (
                      <motion.span
                        animate={{ opacity: [1, 0] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                        className="inline-block w-2 h-4 bg-emerald-500 align-middle ml-0.5"
                      />
                    )}
                  </pre>
                </div>
              </div>
            </div>

            {/* TERMINAL OUTPUT (Appears after typing) */}
            {showOutput && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                className="border-t border-white/10 bg-[#0c0c0e] p-4 font-mono text-xs sm:text-sm"
              >
                <div className="flex items-center gap-2 text-gray-500 mb-2">
                  <Terminal size={12} />
                  <span>g++ main.cpp -o output && ./output</span>
                </div>
                <div className="text-white space-y-1 pl-2 border-l-2 border-emerald-500/30">
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    Arre Bhai! Welcome to <span className="text-emerald-400 font-bold">NIRNAY</span>.
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 }}
                  >
                    Ab DSA banega ekdam <span className="text-yellow-400 font-bold">Halwa! 🍲</span>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.4 }}
                  >
                    Let's code our future.
                  </motion.div>
                </div>
              </motion.div>
            )}

            {/* Status Bar */}
            <div className="bg-[#121214] px-4 py-1 flex items-center justify-between text-[10px] text-gray-500 border-t border-white/5">
              <span>Ln 12, Col 1</span>
              <span>UTF-8</span>
              <span className="text-emerald-500">C++</span>
            </div>
          </div>

          {/* Glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl blur opacity-20 -z-10 animate-pulse" />
        </motion.div>

      </div>
    </section>
  );
};

// Footer
const Footer = () => {
  return (
    <footer className="bg-black/80 backdrop-blur-md border-t border-white/5 py-16 px-6 lg:px-12 relative z-10">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid md:grid-cols-5 gap-12 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-lg flex items-center justify-center">
                <Code2 className="w-6 h-6 text-black" strokeWidth={2.5} />
              </div>
              <span className="text-2xl font-bold text-white">NIRNAY<span className="text-emerald-400"></span></span>
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Empowering developers worldwide to master data structures and algorithms through interactive learning.
            </p>
            <div className="flex gap-4">
              {['Twitter', 'GitHub', 'LinkedIn'].map((social) => (
                <a key={social} href="#" className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-lg flex items-center justify-center transition-colors">
                  <span className="text-xs text-gray-400">{social[0]}</span>
                </a>
              ))}
            </div>
          </div>

          {[
            { title: 'Product', links: ['Practice', 'Courses', 'Visualizer', 'Pricing'] },
            { title: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
            { title: 'Resources', links: ['Documentation', 'Community', 'Support', 'FAQ'] },
          ].map((section, i) => (
            <div key={i}>
              <h3 className="font-semibold mb-4 text-sm tracking-wide uppercase text-gray-400">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            © 2025 NIRNAY. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-gray-500">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

// Main App - Landing Page
export default function Mainpage() {
  return (
    <div className="bg-black text-white min-h-screen antialiased relative">
      <StarField3D /> {/* 3D Background active on entire page */}
      <Navbar />
      <Hero />
      <Practice />
      <Courses />
      <Visualizer />
      <CTA />
      <Footer />
    </div>
  );
}