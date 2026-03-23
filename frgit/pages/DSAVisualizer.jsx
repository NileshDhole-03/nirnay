import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Code2, Play, Pause, RotateCcw, FastForward, Rewind, 
  ChevronRight, ChevronLeft, Settings, Info, Menu, X, 
  Sun, Moon, Zap, Layers, Search, BarChart2, GitGraph
} from 'lucide-react';

// --- UTILITY FUNCTIONS ---
const generateRandomArray = (size, min, max) => {
  const arr = [];
  for (let i = 0; i < size; i++) {
    arr.push(Math.floor(Math.random() * (max - min + 1)) + min);
  }
  return arr;
};

// ===============================================
// === ALGORITHM LOGIC IMPLEMENTATIONS ===
// ===============================================

function getBubbleSortSteps(array) {
  const arr = [...array];
  const steps = [];
  let n = arr.length;
  let swapped;
  
  steps.push({ type: 'initial', indices: [], message: 'Starting Bubble Sort.', arr: [...arr] });

  do {
    swapped = false;
    for (let i = 0; i < n - 1; i++) {
      steps.push({ type: 'compare', indices: [i, i + 1], message: `Comparing ${arr[i]} and ${arr[i + 1]}.`, arr: [...arr] });
      if (arr[i] > arr[i + 1]) {
        steps.push({ type: 'swap', indices: [i, i + 1], message: `Swapping ${arr[i]} and ${arr[i + 1]}.`, arr: [...arr] });
        [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
        swapped = true;
      }
    }
    n--;
    if (n >= 0) steps.push({ type: 'sorted', indices: [n], message: `${arr[n]} is sorted.`, arr: [...arr] });
  } while (swapped);
  
  steps.push({ type: 'complete', indices: [], message: 'Sorted!', arr: [...arr] });
  return steps;
}

function getSelectionSortSteps(array) {
  const arr = [...array];
  const steps = [];
  const n = arr.length;

  steps.push({ type: 'initial', indices: [], message: 'Starting Selection Sort.', arr: [...arr] });

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < n; j++) {
      steps.push({ type: 'compare', indices: [minIdx, j], message: `Comparing current min with ${arr[j]}.`, arr: [...arr] });
      if (arr[j] < arr[minIdx]) {
        minIdx = j;
      }
    }
    if (minIdx !== i) {
      steps.push({ type: 'swap', indices: [i, minIdx], message: `Swapping ${arr[i]} with new min ${arr[minIdx]}.`, arr: [...arr] });
      [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
    }
    steps.push({ type: 'sorted', indices: [i], message: `${arr[i]} is sorted.`, arr: [...arr] });
  }
  steps.push({ type: 'complete', indices: [], message: 'Sorted!', arr: [...arr] });
  return steps;
}

function getInsertionSortSteps(array) {
  const arr = [...array];
  const steps = [];
  steps.push({ type: 'initial', indices: [], message: 'Starting Insertion Sort.', arr: [...arr] });

  for (let i = 1; i < arr.length; i++) {
    let key = arr[i];
    let j = i - 1;
    steps.push({ type: 'compare', indices: [i], message: `Inserting ${key}.`, arr: [...arr] });

    while (j >= 0 && arr[j] > key) {
      steps.push({ type: 'swap', indices: [j, j + 1], message: `Shifting ${arr[j]}.`, arr: [...arr] });
      arr[j + 1] = arr[j];
      j = j - 1;
    }
    arr[j + 1] = key;
    steps.push({ type: 'sorted', indices: [j + 1], message: `${key} inserted.`, arr: [...arr] });
  }
  steps.push({ type: 'complete', indices: [], message: 'Sorted!', arr: [...arr] });
  return steps;
}

function getMergeSortSteps(array) {
  const steps = [];
  const arr = [...array];
  steps.push({ type: 'initial', indices: [], message: 'Starting Merge Sort.', arr: [...arr] });

  function merge(arr, left, mid, right) {
    const leftArr = arr.slice(left, mid + 1);
    const rightArr = arr.slice(mid + 1, right + 1);
    let i = 0, j = 0, k = left;

    while (i < leftArr.length && j < rightArr.length) {
      steps.push({ type: 'compare', indices: [left + i, mid + 1 + j], message: 'Comparing halves.', arr: [...arr] });
      if (leftArr[i] <= rightArr[j]) {
        arr[k] = leftArr[i];
        i++;
      } else {
        arr[k] = rightArr[j];
        j++;
      }
      steps.push({ type: 'overwrite', indices: [k], message: 'Merging value.', arr: [...arr] });
      k++;
    }
    while (i < leftArr.length) {
      arr[k] = leftArr[i];
      steps.push({ type: 'overwrite', indices: [k], message: 'Merging remaining left.', arr: [...arr] });
      i++; k++;
    }
    while (j < rightArr.length) {
      arr[k] = rightArr[j];
      steps.push({ type: 'overwrite', indices: [k], message: 'Merging remaining right.', arr: [...arr] });
      j++; k++;
    }
  }

  function mergeSort(arr, left, right) {
    if (left < right) {
      const mid = Math.floor((left + right) / 2);
      mergeSort(arr, left, mid);
      mergeSort(arr, mid + 1, right);
      merge(arr, left, mid, right);
    }
  }

  mergeSort(arr, 0, arr.length - 1);
  steps.push({ type: 'complete', indices: [], message: 'Sorted!', arr: [...arr] });
  return steps;
}

function getQuickSortSteps(array) {
  const arr = [...array];
  const steps = [];
  steps.push({ type: 'initial', indices: [], message: 'Starting Quick Sort.', arr: [...arr] });

  function partition(arr, low, high) {
    const pivot = arr[high];
    steps.push({ type: 'pivot', indices: [high], message: `Pivot: ${pivot}`, arr: [...arr] });
    let i = low - 1;
    for (let j = low; j < high; j++) {
      steps.push({ type: 'compare', indices: [j, high], message: `Compare ${arr[j]} vs Pivot`, arr: [...arr] });
      if (arr[j] <= pivot) {
        i++;
        [arr[i], arr[j]] = [arr[j], arr[i]];
        steps.push({ type: 'swap', indices: [i, j], message: 'Swapping.', arr: [...arr] });
      }
    }
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    steps.push({ type: 'swap', indices: [i + 1, high], message: 'Placing pivot.', arr: [...arr] });
    return i + 1;
  }

  function quickSort(arr, low, high) {
    if (low < high) {
      const pi = partition(arr, low, high);
      quickSort(arr, low, pi - 1);
      quickSort(arr, pi + 1, high);
    }
  }

  quickSort(arr, 0, arr.length - 1);
  steps.push({ type: 'complete', indices: [], message: 'Sorted!', arr: [...arr] });
  return steps;
}

function getHeapSortSteps(array) {
  const arr = [...array];
  const steps = [];
  const n = arr.length;
  steps.push({ type: 'initial', indices: [], message: 'Starting Heap Sort.', arr: [...arr] });

  function heapify(arr, n, i) {
    let largest = i;
    const left = 2 * i + 1;
    const right = 2 * i + 2;

    if (left < n && arr[left] > arr[largest]) largest = left;
    if (right < n && arr[right] > arr[largest]) largest = right;

    if (largest !== i) {
      steps.push({ type: 'swap', indices: [i, largest], message: 'Heapifying.', arr: [...arr] });
      [arr[i], arr[largest]] = [arr[largest], arr[i]];
      heapify(arr, n, largest);
    }
  }

  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) heapify(arr, n, i);

  for (let i = n - 1; i >= 0; i--) {
    steps.push({ type: 'swap', indices: [0, i], message: 'Extracting max.', arr: [...arr] });
    [arr[0], arr[i]] = [arr[i], arr[0]];
    steps.push({ type: 'sorted', indices: [i], message: `${arr[i]} sorted.`, arr: [...arr] });
    heapify(arr, i, 0);
  }
  steps.push({ type: 'complete', indices: [], message: 'Sorted!', arr: [...arr] });
  return steps;
}

function getLinearSearchSteps(array, target) {
  const arr = [...array];
  const steps = [];
  for (let i = 0; i < arr.length; i++) {
    steps.push({ type: 'compare', indices: [i], message: `Checking index ${i}`, arr: [...arr] });
    if (arr[i] === target) {
      steps.push({ type: 'found', indices: [i], message: `Found ${target}!`, arr: [...arr] });
      return steps;
    }
  }
  steps.push({ type: 'not-found', indices: [], message: 'Not found.', arr: [...arr] });
  return steps;
}

function getBinarySearchSteps(array, target) {
  const arr = [...array].sort((a, b) => a - b); // Binary search requires sorted array
  const steps = [{ type: 'initial', indices: [], message: 'Sorted array for Binary Search.', arr: [...arr] }];
  let low = 0, high = arr.length - 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    steps.push({ type: 'compare', indices: [mid, low, high], message: `Checking mid ${mid}`, arr: [...arr] });
    if (arr[mid] === target) {
      steps.push({ type: 'found', indices: [mid], message: `Found ${target}!`, arr: [...arr] });
      return steps;
    } else if (arr[mid] < target) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }
  steps.push({ type: 'not-found', indices: [], message: 'Not found.', arr: [...arr] });
  return steps;
}

function getBFSSteps(array) {
  const steps = [];
  const arr = [...array];
  const visited = new Array(arr.length).fill(false);
  const queue = [0]; // Start at index 0
  steps.push({ type: 'initial', indices: [], message: 'Starting BFS.', arr: [...arr] });

  while (queue.length > 0) {
    const curr = queue.shift();
    if (!visited[curr]) {
      visited[curr] = true;
      steps.push({ type: 'visit', indices: [curr], message: `Visiting index ${curr}`, arr: [...arr] });
      // Simulate neighbors: left and right indices
      if (curr - 1 >= 0 && !visited[curr - 1]) queue.push(curr - 1);
      if (curr + 1 < arr.length && !visited[curr + 1]) queue.push(curr + 1);
    }
  }
  return steps;
}

function getDFSSteps(array) {
  const steps = [];
  const arr = [...array];
  const visited = new Array(arr.length).fill(false);
  steps.push({ type: 'initial', indices: [], message: 'Starting DFS.', arr: [...arr] });

  function traverse(idx) {
    if (idx < 0 || idx >= arr.length || visited[idx]) return;
    visited[idx] = true;
    steps.push({ type: 'visit', indices: [idx], message: `Visiting index ${idx}`, arr: [...arr] });
    traverse(idx - 1);
    traverse(idx + 1);
  }
  traverse(0);
  return steps;
}

// ===============================================
// === ALGORITHM CONFIGURATION ===
// ===============================================

const algorithms = {
  sorting: {
    'Bubble Sort': { complexity: { time: 'O(n²)', space: 'O(1)' }, description: 'Repeatedly swaps adjacent elements if they are in the wrong order.', visualizer: getBubbleSortSteps },
    'Selection Sort': { complexity: { time: 'O(n²)', space: 'O(1)' }, description: 'Selects the smallest element and moves it to the sorted section.', visualizer: getSelectionSortSteps },
    'Insertion Sort': { complexity: { time: 'O(n²)', space: 'O(1)' }, description: 'Builds the sorted array one item at a time.', visualizer: getInsertionSortSteps },
    'Merge Sort': { complexity: { time: 'O(n log n)', space: 'O(n)' }, description: 'Divides array into halves, sorts them, and merges them.', visualizer: getMergeSortSteps },
    'Quick Sort': { complexity: { time: 'O(n log n)', space: 'O(log n)' }, description: 'Partitions array around a pivot element.', visualizer: getQuickSortSteps },
    'Heap Sort': { complexity: { time: 'O(n log n)', space: 'O(1)' }, description: 'Uses a binary heap to extract max elements.', visualizer: getHeapSortSteps },
  },
  searching: {
    'Linear Search': { complexity: { time: 'O(n)', space: 'O(1)' }, description: 'Checks every element until target is found.', visualizer: (arr, t) => getLinearSearchSteps(arr, t) },
    'Binary Search': { complexity: { time: 'O(log n)', space: 'O(1)' }, description: 'Searches a sorted array by dividing search interval in half.', visualizer: (arr, t) => getBinarySearchSteps(arr, t) },
  },
  graph: {
    'BFS': { complexity: { time: 'O(V+E)', space: 'O(V)' }, description: 'Breadth-First Search: Explores neighbor nodes first.', visualizer: getBFSSteps },
    'DFS': { complexity: { time: 'O(V+E)', space: 'O(V)' }, description: 'Depth-First Search: Explores as far as possible along each branch.', visualizer: getDFSSteps },
  },
};

// ===============================================
// === SUB-COMPONENTS ===
// ===============================================

const ArrayVisualizer = ({ data, activeIndices = [], statusIndices = [], isDarkMode }) => {
  const maxValue = Math.max(...data, 1);
  const minValue = Math.min(...data, 0);
  const range = maxValue - minValue || 1;

  return (
    <div className="flex justify-center items-end h-64 w-full gap-1 px-4 pb-0">
      {data.map((value, index) => {
        const heightPercent = Math.max(((value - minValue) / range) * 90 + 10, 5);
        const isActive = activeIndices.includes(index);
        const isStatus = statusIndices.includes(index);

        // Styling Logic matching the NIYATI theme (Emerald/Zinc)
        let bgClass = isDarkMode ? 'bg-indigo-500/40' : 'bg-indigo-200';
        if (isActive) bgClass = 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]'; 
        else if (isStatus) bgClass = 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]'; 

        return (
          <motion.div
            key={`${index}-${value}`}
            layout
            initial={{ height: 0 }}
            animate={{ 
              height: `${heightPercent}%`, 
              backgroundColor: isActive ? '#f59e0b' : isStatus ? '#10b981' : isDarkMode ? '#6366f1' : '#a5b4fc' 
            }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={`w-full max-w-[20px] rounded-t-md relative group ${bgClass}`}
          >
            {/* Tooltip for value */}
            <span className={`absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-mono opacity-0 group-hover:opacity-100 transition-opacity ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} pointer-events-none`}>
              {value}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
};

const Controls = ({ isPlaying, onPlayPause, onReset, speed, onSpeedChange, currentStep, totalSteps, isDarkMode }) => {
  const btnClass = `p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-white/10 text-gray-300' : 'hover:bg-gray-100 text-gray-700'}`;
  
  return (
    <div className={`flex items-center gap-4 px-6 py-3 rounded-2xl border backdrop-blur-md shadow-xl ${isDarkMode ? 'bg-[#18181b]/80 border-zinc-800' : 'bg-white/80 border-gray-200'}`}>
      
      <button onClick={onReset} className={btnClass} title="Reset">
        <RotateCcw size={18} />
      </button>

      <div className="h-6 w-px bg-gray-500/20"></div>

      <button onClick={onPlayPause} className={`p-3 rounded-full flex items-center justify-center transition-transform active:scale-95 ${isPlaying ? 'bg-amber-500 text-black' : 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'}`}>
        {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-0.5" />}
      </button>

      <div className="h-6 w-px bg-gray-500/20"></div>

      <div className="flex items-center gap-3">
        <Zap size={16} className={isDarkMode ? 'text-yellow-400' : 'text-yellow-600'} />
        <input
          type="range"
          min="10"
          max="1000"
          value={speed}
          onChange={onSpeedChange}
          className="w-24 h-1.5 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-emerald-500"
        />
      </div>

      <div className={`text-xs font-mono ml-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
        {currentStep} / {totalSteps}
      </div>
    </div>
  );
};

// ===============================================
// === MAIN PAGE COMPONENT ===
// ===============================================

const DSAVisualizer = () => {
  const navigate = useNavigate();
  // --- STATE ---
  const [selectedAlgorithm, setSelectedAlgorithm] = useState({ ...algorithms.sorting['Bubble Sort'], name: 'Bubble Sort', category: 'sorting' });
  const [arraySize, setArraySize] = useState(20);
  const [data, setData] = useState(() => generateRandomArray(20, 10, 100));
  const [steps, setSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(500);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [targetValue, setTargetValue] = useState(null);
  const [message, setMessage] = useState('Select an algorithm to start.');
  const [sortedIndices, setSortedIndices] = useState([]);
  const [foundIndex, setFoundIndex] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const timeoutRef = useRef(null);

  // --- LOGIC ---
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) setIsDarkMode(savedTheme === 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  useEffect(() => {
    // Generate steps based on current algorithm and data
    let newSteps = [];
    try {
      if (selectedAlgorithm.category === 'searching') {
        if (targetValue !== null) newSteps = selectedAlgorithm.visualizer(data, targetValue);
        else newSteps = [{ type: 'waiting', indices: [], message: 'Enter a target value.', arr: [...data] }];
      } else {
        newSteps = selectedAlgorithm.visualizer(data);
      }
    } catch (e) {
      console.error(e);
      newSteps = [{ type: 'error', indices: [], message: 'Error generating steps', arr: [...data] }];
    }
    setSteps(newSteps);
    setCurrentStepIndex(0);
    setSortedIndices([]);
    setFoundIndex(null);
    setIsPlaying(false);
  }, [selectedAlgorithm, data, targetValue]);

  useEffect(() => {
    if (isPlaying && currentStepIndex < steps.length - 1) {
      timeoutRef.current = setTimeout(() => {
        const nextIndex = currentStepIndex + 1;
        const currentStep = steps[nextIndex];
        if (currentStep.type === 'sorted') setSortedIndices(prev => [...prev, ...currentStep.indices]);
        if (currentStep.type === 'found') setFoundIndex(currentStep.indices[0]);
        setMessage(currentStep.message);
        setCurrentStepIndex(nextIndex);
      }, 1001 - speed);
    } else if (isPlaying && currentStepIndex >= steps.length - 1) {
      setIsPlaying(false);
    }
    return () => clearTimeout(timeoutRef.current);
  }, [isPlaying, currentStepIndex, steps, speed]);

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
    setSortedIndices([]);
    setFoundIndex(null);
    setData(generateRandomArray(arraySize, 10, 100));
    setMessage('Reset complete.');
  };

  // --- STYLING HELPERS (Theme Matching) ---
  const bgClass = isDarkMode ? 'bg-[#09090b]' : 'bg-gray-50'; // Zinc-950
  const textPrimary = isDarkMode ? 'text-zinc-100' : 'text-gray-900';
  const textSecondary = isDarkMode ? 'text-zinc-400' : 'text-gray-500';
  const cardBg = isDarkMode ? 'bg-[#18181b]' : 'bg-white'; // Zinc-900
  const borderClass = isDarkMode ? 'border-zinc-800' : 'border-gray-200';

  return (
    <div className={`min-h-screen ${bgClass} font-sans flex overflow-hidden`}>
      
      {/* SIDEBAR */}
      <motion.aside 
        initial={{ width: 280 }}
        animate={{ width: sidebarOpen ? 280 : 0 }}
        className={`fixed left-0 top-0 h-full z-40 border-r ${borderClass} ${cardBg} overflow-hidden flex flex-col`}
      >
        <div className="p-6 flex items-center gap-3 border-b border-zinc-800/50">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-cyan-600 rounded-lg flex items-center justify-center">
             <Code2 className="w-5 h-5 text-white" />
          </div>
          <span className={`font-bold text-lg ${textPrimary}`}>NIRNAY</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {Object.keys(algorithms).map((category) => (
            <div key={category}>
              <h3 className={`text-xs font-bold uppercase tracking-wider mb-3 ${textSecondary} flex items-center gap-2`}>
                {category === 'sorting' && <BarChart2 size={14} />}
                {category === 'searching' && <Search size={14} />}
                {category === 'graph' && <GitGraph size={14} />}
                {category}
              </h3>
              <div className="space-y-1">
                {Object.keys(algorithms[category]).map(algo => (
                  <button
                    key={algo}
                    onClick={() => setSelectedAlgorithm({ ...algorithms[category][algo], name: algo, category })}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedAlgorithm.name === algo 
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                        : `${textSecondary} hover:bg-zinc-800/50 hover:text-zinc-200`
                    }`}
                  >
                    {algo}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-zinc-800/50">
           <button onClick={() => navigate('/')} className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium ${textSecondary} hover:text-white transition-colors`}>
             <ChevronLeft size={16} /> Back to Home
           </button>
        </div>
      </motion.aside>

      {/* MAIN CONTENT */}
      <main className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${sidebarOpen ? 'ml-[280px]' : 'ml-0'}`}>
        
        {/* Navbar */}
        <header className={`h-16 border-b ${borderClass} ${bgClass} flex items-center justify-between px-6 sticky top-0 z-30`}>
           <div className="flex items-center gap-4">
             <button onClick={() => setSidebarOpen(!sidebarOpen)} className={`p-2 rounded-lg hover:bg-zinc-800 ${textSecondary}`}>
                <Menu size={20} />
             </button>
             <h1 className={`text-lg font-semibold ${textPrimary}`}>{selectedAlgorithm.name}</h1>
             <span className={`text-xs px-2 py-0.5 rounded border ${isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-400' : 'bg-gray-100 border-gray-300 text-gray-500'}`}>
                {selectedAlgorithm.complexity.time}
             </span>
           </div>

           <div className="flex items-center gap-3">
              <button onClick={toggleTheme} className={`p-2 rounded-lg hover:bg-zinc-800 ${textSecondary}`}>
                 {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
           </div>
        </header>

        <div className="p-6 lg:p-10 max-w-6xl mx-auto w-full space-y-6">
           
           {/* Visualizer Card */}
           <div className={`rounded-2xl border ${borderClass} ${cardBg} p-1 shadow-sm relative overflow-hidden h-[400px] flex flex-col`}>
              <div className="absolute top-4 right-4 z-10 flex gap-2">
                 <div className={`px-3 py-1 rounded-full text-xs font-medium border backdrop-blur-md ${isDarkMode ? 'bg-black/30 border-white/10 text-white' : 'bg-white/50 border-black/5 text-black'}`}>
                    Size: {data.length}
                 </div>
              </div>
              
              <div className="flex-1 flex items-end justify-center pb-4 relative">
                 <ArrayVisualizer 
                    data={steps[currentStepIndex]?.arr || data} 
                    activeIndices={steps[currentStepIndex]?.indices || []} 
                    statusIndices={foundIndex !== null ? [foundIndex] : sortedIndices}
                    isDarkMode={isDarkMode}
                 />
              </div>

              {/* Status Message Bar */}
              <div className={`h-10 border-t ${borderClass} bg-zinc-900/50 flex items-center justify-center text-sm font-mono ${textSecondary}`}>
                 {message}
              </div>
           </div>

           {/* Config Panel */}
           <div className={`grid grid-cols-1 md:grid-cols-3 gap-6`}>
              <div className={`md:col-span-2 rounded-2xl border ${borderClass} ${cardBg} p-6`}>
                 <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-sm font-bold uppercase tracking-wider ${textSecondary}`}>Configuration</h3>
                    <button onClick={handleReset} className={`text-xs text-emerald-500 hover:text-emerald-400 font-medium`}>Reset Default</button>
                 </div>
                 
                 <div className="space-y-4">
                    <div>
                       <label className={`text-xs ${textSecondary} mb-2 block`}>Array Size ({arraySize})</label>
                       <input 
                         type="range" min="5" max="100" value={arraySize} 
                         onChange={(e) => { setArraySize(Number(e.target.value)); handleReset(); }} 
                         className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                       />
                    </div>
                    {selectedAlgorithm.category === 'searching' && (
                       <div>
                          <label className={`text-xs ${textSecondary} mb-2 block`}>Target Value</label>
                          <input 
                            type="number" 
                            placeholder="Value to find..." 
                            className={`w-full p-2.5 rounded-lg border ${borderClass} ${isDarkMode ? 'bg-[#09090b]' : 'bg-gray-50'} ${textPrimary} focus:border-emerald-500 outline-none text-sm transition-all`}
                            onChange={(e) => setTargetValue(Number(e.target.value))}
                          />
                       </div>
                    )}
                 </div>
              </div>

              {/* Algorithm Info */}
              <div className={`rounded-2xl border ${borderClass} ${cardBg} p-6 flex flex-col justify-between`}>
                 <div>
                    <h3 className={`text-sm font-bold uppercase tracking-wider ${textSecondary} mb-2`}>Details</h3>
                    <p className={`text-sm leading-relaxed ${textPrimary}`}>
                       {selectedAlgorithm.description}
                    </p>
                 </div>
                 <div className="mt-4 pt-4 border-t border-zinc-800 grid grid-cols-2 gap-4">
                    <div>
                       <span className={`block text-[10px] uppercase ${textSecondary}`}>Time</span>
                       <span className={`font-mono text-emerald-500`}>{selectedAlgorithm.complexity.time}</span>
                    </div>
                    <div>
                       <span className={`block text-[10px] uppercase ${textSecondary}`}>Space</span>
                       <span className={`font-mono text-emerald-500`}>{selectedAlgorithm.complexity.space}</span>
                    </div>
                 </div>
              </div>
           </div>

        </div>

        {/* Floating Controls */}
        <div className="fixed bottom-8 left-[calc(50%+140px)] transform -translate-x-1/2 z-50">
           <Controls 
              isPlaying={isPlaying} 
              onPlayPause={() => setIsPlaying(!isPlaying)} 
              onReset={handleReset} 
              speed={speed} 
              onSpeedChange={(e) => setSpeed(Number(e.target.value))}
              currentStep={currentStepIndex + 1}
              totalSteps={steps.length}
              isDarkMode={isDarkMode}
           />
        </div>

      </main>
    </div>
  );
};

export default DSAVisualizer;