import React, { useRef, useState, useEffect, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Environment, Line, PerspectiveCamera } from '@react-three/drei';
import { motion } from 'framer-motion';
import Editor from '@monaco-editor/react';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import {
    Play, Pause, RotateCcw, ChevronLeft,
    Code2, Sun, Moon, Zap, Layers, SkipForward, SkipBack, Sparkles, Loader2
} from 'lucide-react';
import axiosClient from '../utils/axiosClient';

// =============================================
// 3D ARRAY BAR COMPONENT
// =============================================
const ArrayBar = ({ position, value, maxValue, index, state, isDarkMode }) => {
    const meshRef = useRef();
    const height = (value / maxValue) * 4 + 0.5;
    
    const colors = {
        default: isDarkMode ? '#6366f1' : '#818cf8',
        comparing: '#f59e0b',
        swapping: '#ef4444',
        sorted: '#10b981',
        pivot: '#8b5cf6'
    };
    
    const color = colors[state] || colors.default;
    
    useFrame(() => {
        if (meshRef.current) {
            meshRef.current.scale.y += (height - meshRef.current.scale.y) * 0.1;
            meshRef.current.position.y = meshRef.current.scale.y / 2;
        }
    });

    return (
        <group position={position}>
            <mesh ref={meshRef} castShadow>
                <boxGeometry args={[0.6, 1, 0.6]} />
                <meshStandardMaterial color={color} metalness={0.3} roughness={0.4}
                    emissive={state !== 'default' ? color : '#000'} emissiveIntensity={state !== 'default' ? 0.3 : 0} />
            </mesh>
            <Text position={[0, height + 0.3, 0]} fontSize={0.3} color={isDarkMode ? '#fff' : '#000'} anchorX="center">{value}</Text>
            <Text position={[0, -0.3, 0]} fontSize={0.2} color="#666" anchorX="center">[{index}]</Text>
        </group>
    );
};

// =============================================
// 3D TREE NODE COMPONENT
// =============================================
const TreeNode3D = ({ node, position, level, maxDepth, state, isDarkMode, parentPos }) => {
    const colors = {
        default: isDarkMode ? '#6366f1' : '#818cf8',
        visiting: '#f59e0b',
        found: '#10b981',
        comparing: '#ef4444',
        inserted: '#8b5cf6'
    };
    
    const color = colors[state] || colors.default;
    const horizontalSpacing = 3 / (level + 1);
    
    const leftChildPos = [position[0] - horizontalSpacing, position[1] - 1.5, position[2]];
    const rightChildPos = [position[0] + horizontalSpacing, position[1] - 1.5, position[2]];

    return (
        <group>
            {/* Node sphere */}
            <mesh position={position} castShadow>
                <sphereGeometry args={[0.4, 32, 32]} />
                <meshStandardMaterial color={color} metalness={0.4} roughness={0.3}
                    emissive={state !== 'default' ? color : '#000'} emissiveIntensity={state !== 'default' ? 0.4 : 0} />
            </mesh>
            <Text position={[position[0], position[1], position[2] + 0.5]} fontSize={0.3} color="#fff" anchorX="center">{node.value}</Text>
            
            {/* Connection line to parent */}
            {parentPos && (
                <Line points={[parentPos, position]} color="#444" lineWidth={2} />
            )}
            
            {/* Render children */}
            {node.left && (
                <TreeNode3D node={node.left} position={leftChildPos} level={level + 1} maxDepth={maxDepth}
                    state={node.left.state || 'default'} isDarkMode={isDarkMode} parentPos={position} />
            )}
            {node.right && (
                <TreeNode3D node={node.right} position={rightChildPos} level={level + 1} maxDepth={maxDepth}
                    state={node.right.state || 'default'} isDarkMode={isDarkMode} parentPos={position} />
            )}
        </group>
    );
};

// =============================================
// 3D STACK COMPONENT
// =============================================
const StackVisual3D = ({ items, activeIndex, isDarkMode }) => {
    return (
        <group>
            {items.map((item, index) => {
                const isActive = index === activeIndex;
                const isTop = index === items.length - 1;
                return (
                    <group key={index} position={[0, index * 0.8, 0]}>
                        <mesh castShadow>
                            <boxGeometry args={[1.5, 0.7, 1.5]} />
                            <meshStandardMaterial 
                                color={isActive ? '#f59e0b' : isTop ? '#10b981' : isDarkMode ? '#6366f1' : '#818cf8'}
                                metalness={0.3} roughness={0.4}
                                emissive={isActive ? '#f59e0b' : '#000'} emissiveIntensity={isActive ? 0.3 : 0} />
                        </mesh>
                        <Text position={[0, 0, 0.8]} fontSize={0.4} color="#fff" anchorX="center">{item}</Text>
                    </group>
                );
            })}
            <Text position={[0, items.length * 0.8 + 0.5, 0]} fontSize={0.25} color="#10b981">← TOP</Text>
        </group>
    );
};

// =============================================
// 3D QUEUE COMPONENT
// =============================================
const QueueVisual3D = ({ items, frontIndex, rearIndex, isDarkMode }) => {
    return (
        <group>
            {items.map((item, index) => {
                const isFront = index === frontIndex;
                const isRear = index === rearIndex;
                return (
                    <group key={index} position={[index * 1.2 - (items.length * 0.6), 0, 0]}>
                        <mesh castShadow>
                            <boxGeometry args={[1, 0.8, 0.8]} />
                            <meshStandardMaterial 
                                color={isFront ? '#10b981' : isRear ? '#f59e0b' : isDarkMode ? '#6366f1' : '#818cf8'}
                                metalness={0.3} roughness={0.4} />
                        </mesh>
                        <Text position={[0, 0, 0.5]} fontSize={0.3} color="#fff" anchorX="center">{item}</Text>
                        {isFront && <Text position={[0, -0.7, 0]} fontSize={0.2} color="#10b981">FRONT</Text>}
                        {isRear && <Text position={[0, 0.7, 0]} fontSize={0.2} color="#f59e0b">REAR</Text>}
                    </group>
                );
            })}
        </group>
    );
};

// =============================================
// 3D LINKED LIST COMPONENT
// =============================================
const LinkedListVisual3D = ({ nodes, activeIndex, isDarkMode }) => {
    return (
        <group>
            {nodes.map((node, index) => {
                const isActive = index === activeIndex;
                const xPos = index * 2 - (nodes.length);
                return (
                    <group key={index}>
                        <mesh position={[xPos, 0, 0]} castShadow>
                            <sphereGeometry args={[0.5, 32, 32]} />
                            <meshStandardMaterial 
                                color={isActive ? '#f59e0b' : isDarkMode ? '#6366f1' : '#818cf8'}
                                metalness={0.4} roughness={0.3}
                                emissive={isActive ? '#f59e0b' : '#000'} emissiveIntensity={isActive ? 0.4 : 0} />
                        </mesh>
                        <Text position={[xPos, 0, 0.6]} fontSize={0.3} color="#fff" anchorX="center">{node}</Text>
                        {index < nodes.length - 1 && (
                            <Line points={[[xPos + 0.5, 0, 0], [xPos + 1.5, 0, 0]]} color="#10b981" lineWidth={3} />
                        )}
                        {index === 0 && <Text position={[xPos, -0.8, 0]} fontSize={0.2} color="#10b981">HEAD</Text>}
                        {index === nodes.length - 1 && <Text position={[xPos, -0.8, 0]} fontSize={0.2} color="#ef4444">TAIL</Text>}
                    </group>
                );
            })}
        </group>
    );
};

// =============================================
// 3D GRAPH COMPONENT
// =============================================
const GraphVisual3D = ({ nodes, edges, activeNode, visitedNodes, isDarkMode }) => {
    // Simple circular layout for nodes
    const nodePositions = useMemo(() => {
        const positions = {};
        const count = nodes.length;
        nodes.forEach((node, i) => {
            const angle = (i / count) * Math.PI * 2;
            positions[node.id] = [Math.cos(angle) * 3, Math.sin(angle) * 3, 0];
        });
        return positions;
    }, [nodes]);

    return (
        <group>
            {/* Edges */}
            {edges.map((edge, i) => {
                const start = nodePositions[edge.from];
                const end = nodePositions[edge.to];
                if (!start || !end) return null;
                return <Line key={i} points={[start, end]} color="#444" lineWidth={2} />;
            })}
            
            {/* Nodes */}
            {nodes.map((node) => {
                const pos = nodePositions[node.id];
                const isActive = node.id === activeNode;
                const isVisited = visitedNodes?.includes(node.id);
                return (
                    <group key={node.id}>
                        <mesh position={pos} castShadow>
                            <sphereGeometry args={[0.5, 32, 32]} />
                            <meshStandardMaterial 
                                color={isActive ? '#f59e0b' : isVisited ? '#10b981' : isDarkMode ? '#6366f1' : '#818cf8'}
                                metalness={0.4} roughness={0.3}
                                emissive={isActive ? '#f59e0b' : '#000'} emissiveIntensity={isActive ? 0.4 : 0} />
                        </mesh>
                        <Text position={[pos[0], pos[1], pos[2] + 0.6]} fontSize={0.4} color="#fff" anchorX="center">{node.label || node.id}</Text>
                    </group>
                );
            })}
        </group>
    );
};

// =============================================
// UNIFIED 3D SCENE
// =============================================
const Scene3D = ({ dsType, data, isDarkMode }) => {
    return (
        <>
            <PerspectiveCamera makeDefault position={[0, 5, 15]} fov={50} />
            <OrbitControls enablePan enableZoom enableRotate minDistance={5} maxDistance={40} />
            <ambientLight intensity={0.4} />
            <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
            <pointLight position={[-10, 10, -5]} intensity={0.5} color="#10b981" />
            
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
                <planeGeometry args={[50, 50]} />
                <meshStandardMaterial color={isDarkMode ? '#18181b' : '#f3f4f6'} />
            </mesh>
            
            {dsType === 'array' && data.arr && (
                <>
                    {data.arr.map((value, index) => {
                        let state = 'default';
                        if (data.sortedIndices?.includes(index)) state = 'sorted';
                        if (data.pivotIndex === index) state = 'pivot';
                        if (data.indices?.includes(index)) state = data.indices.length === 2 ? 'swapping' : 'comparing';
                        const startX = -(data.arr.length) / 2;
                        return (
                            <ArrayBar key={index} position={[startX + index, 0, 0]} value={value}
                                maxValue={Math.max(...data.arr, 1)} index={index} state={state} isDarkMode={isDarkMode} />
                        );
                    })}
                </>
            )}
            
            {dsType === 'tree' && data.tree && (
                <TreeNode3D node={data.tree} position={[0, 4, 0]} level={0} maxDepth={5}
                    state={data.tree.state || 'default'} isDarkMode={isDarkMode} parentPos={null} />
            )}
            
            {dsType === 'stack' && data.stack && (
                <StackVisual3D items={data.stack} activeIndex={data.activeIndex} isDarkMode={isDarkMode} />
            )}
            
            {dsType === 'queue' && data.queue && (
                <QueueVisual3D items={data.queue} frontIndex={data.frontIndex || 0} 
                    rearIndex={data.rearIndex || data.queue.length - 1} isDarkMode={isDarkMode} />
            )}
            
            {dsType === 'linkedlist' && data.list && (
                <LinkedListVisual3D nodes={data.list} activeIndex={data.activeIndex} isDarkMode={isDarkMode} />
            )}
            
            {dsType === 'graph' && data.nodes && (
                <GraphVisual3D nodes={data.nodes} edges={data.edges || []} 
                    activeNode={data.activeNode} visitedNodes={data.visitedNodes} isDarkMode={isDarkMode} />
            )}
            
            <Environment preset="city" />
        </>
    );
};

// =============================================
// CODE EXECUTION ENGINE (Multi-DS)
// =============================================
const executeCode = (code, dsType) => {
    const instrumentedCode = `
    const __steps = [];
    let __currentDS = null;
    
    // === ARRAY TRACKING ===
    const createTrackedArray = (arr) => {
        __currentDS = { type: 'array', data: [...arr] };
        __steps.push({ dsType: 'array', type: 'init', arr: [...arr], indices: [], message: 'Initial array' });
        return arr;
    };
    const compare = (i, j, arr) => {
        __steps.push({ dsType: 'array', type: 'compare', arr: [...arr], indices: [i, j], message: \`Comparing arr[\${i}]=\${arr[i]} with arr[\${j}]=\${arr[j]}\` });
    };
    const swap = (i, j, arr) => {
        __steps.push({ dsType: 'array', type: 'swap', arr: [...arr], indices: [i, j], message: \`Swapping arr[\${i}] ↔ arr[\${j}]\` });
        [arr[i], arr[j]] = [arr[j], arr[i]];
        __steps.push({ dsType: 'array', type: 'after-swap', arr: [...arr], indices: [i, j], message: \`Swapped!\` });
    };
    const markSorted = (i, arr) => {
        __steps.push({ dsType: 'array', type: 'sorted', arr: [...arr], sortedIndices: [i], indices: [], message: \`Index \${i} sorted\` });
    };
    const setPivot = (i, arr) => {
        __steps.push({ dsType: 'array', type: 'pivot', arr: [...arr], pivotIndex: i, indices: [], message: \`Pivot: \${arr[i]}\` });
    };
    
    // === TREE TRACKING ===
    let __tree = null;
    const createTree = () => {
        __tree = null;
        __steps.push({ dsType: 'tree', type: 'init', tree: null, message: 'Creating tree' });
        return { insert: insertNode, getTree: () => JSON.parse(JSON.stringify(__tree)) };
    };
    const insertNode = (value) => {
        const newNode = { value, left: null, right: null, state: 'inserted' };
        if (!__tree) { __tree = newNode; }
        else {
            let current = __tree;
            while (true) {
                if (value < current.value) {
                    if (!current.left) { current.left = newNode; break; }
                    current = current.left;
                } else {
                    if (!current.right) { current.right = newNode; break; }
                    current = current.right;
                }
            }
        }
        __steps.push({ dsType: 'tree', type: 'insert', tree: JSON.parse(JSON.stringify(__tree)), message: \`Inserted \${value}\` });
    };
    const visitNode = (node) => {
        if (node) node.state = 'visiting';
        __steps.push({ dsType: 'tree', type: 'visit', tree: JSON.parse(JSON.stringify(__tree)), message: \`Visiting \${node?.value}\` });
    };
    
    // === STACK TRACKING ===
    let __stack = [];
    const createStack = () => {
        __stack = [];
        __steps.push({ dsType: 'stack', type: 'init', stack: [], message: 'Stack created' });
        return __stack;
    };
    const push = (val) => {
        __stack.push(val);
        __steps.push({ dsType: 'stack', type: 'push', stack: [...__stack], activeIndex: __stack.length - 1, message: \`Push \${val}\` });
    };
    const pop = () => {
        const val = __stack.pop();
        __steps.push({ dsType: 'stack', type: 'pop', stack: [...__stack], message: \`Pop \${val}\` });
        return val;
    };
    
    // === QUEUE TRACKING ===
    let __queue = [];
    const createQueue = () => {
        __queue = [];
        __steps.push({ dsType: 'queue', type: 'init', queue: [], message: 'Queue created' });
        return __queue;
    };
    const enqueue = (val) => {
        __queue.push(val);
        __steps.push({ dsType: 'queue', type: 'enqueue', queue: [...__queue], rearIndex: __queue.length - 1, message: \`Enqueue \${val}\` });
    };
    const dequeue = () => {
        const val = __queue.shift();
        __steps.push({ dsType: 'queue', type: 'dequeue', queue: [...__queue], frontIndex: 0, message: \`Dequeue \${val}\` });
        return val;
    };
    
    // === LINKED LIST TRACKING ===
    let __list = [];
    const createLinkedList = (arr) => {
        __list = [...arr];
        __steps.push({ dsType: 'linkedlist', type: 'init', list: [...__list], message: 'List created' });
        return __list;
    };
    const traverse = (index) => {
        __steps.push({ dsType: 'linkedlist', type: 'traverse', list: [...__list], activeIndex: index, message: \`At node \${index}\` });
    };
    
    // === GRAPH TRACKING ===
    let __nodes = [];
    let __edges = [];
    let __visited = [];
    const createGraph = (nodeLabels) => {
        __nodes = nodeLabels.map((label, i) => ({ id: i, label }));
        __edges = [];
        __visited = [];
        __steps.push({ dsType: 'graph', type: 'init', nodes: [...__nodes], edges: [], message: 'Graph created' });
    };
    const addEdge = (from, to) => {
        __edges.push({ from, to });
        __steps.push({ dsType: 'graph', type: 'addEdge', nodes: [...__nodes], edges: [...__edges], message: \`Edge \${from} → \${to}\` });
    };
    const visitVertex = (id) => {
        __visited.push(id);
        __steps.push({ dsType: 'graph', type: 'visit', nodes: [...__nodes], edges: [...__edges], activeNode: id, visitedNodes: [...__visited], message: \`Visit \${id}\` });
    };
    
    try {
        ${code}
        __steps.push({ dsType: __steps[0]?.dsType || 'array', type: 'complete', message: 'Complete!' });
    } catch (e) {
        __steps.push({ type: 'error', message: 'Error: ' + e.message });
    }
    return __steps;
    `;
    
    try {
        return new Function(instrumentedCode)();
    } catch (e) {
        return [{ type: 'error', message: 'Syntax error: ' + e.message }];
    }
};

// =============================================
// CODE TEMPLATES
// =============================================
const CODE_TEMPLATES = {
    array_bubble: `// Bubble Sort
let arr = createTrackedArray([64, 34, 25, 12, 22, 11, 90]);
for (let i = 0; i < arr.length - 1; i++) {
    for (let j = 0; j < arr.length - i - 1; j++) {
        compare(j, j + 1, arr);
        if (arr[j] > arr[j + 1]) swap(j, j + 1, arr);
    }
    markSorted(arr.length - 1 - i, arr);
}`,
    tree_bst: `// Binary Search Tree Insertion
const tree = createTree();
[50, 30, 70, 20, 40, 60, 80].forEach(val => tree.insert(val));`,
    stack_ops: `// Stack Operations
createStack();
push(10); push(20); push(30);
pop(); push(40); pop(); pop();`,
    queue_ops: `// Queue Operations
createQueue();
enqueue('A'); enqueue('B'); enqueue('C');
dequeue(); enqueue('D'); dequeue();`,
    linkedlist_traverse: `// Linked List Traversal
createLinkedList([1, 2, 3, 4, 5]);
for (let i = 0; i < 5; i++) traverse(i);`,
    graph_bfs: `// Graph BFS
createGraph(['A', 'B', 'C', 'D', 'E']);
addEdge(0, 1); addEdge(0, 2); addEdge(1, 3); addEdge(2, 4);
[0, 1, 2, 3, 4].forEach(v => visitVertex(v));`
};

// =============================================
// MAIN COMPONENT
// =============================================
const CodeVisualizer = () => {
    const navigate = useNavigate();
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [code, setCode] = useState(CODE_TEMPLATES.array_bubble);
    const [steps, setSteps] = useState([]);
    const [currentStep, setCurrentStep] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [speed, setSpeed] = useState(500);
    const [error, setError] = useState(null);
    const [isTransforming, setIsTransforming] = useState(false);
    const [selectedDS, setSelectedDS] = useState('array');
    
    const intervalRef = useRef(null);
    
    useEffect(() => {
        const saved = localStorage.getItem('theme');
        if (saved) setIsDarkMode(saved === 'dark');
    }, []);
    
    const toggleTheme = () => {
        const newTheme = !isDarkMode;
        setIsDarkMode(newTheme);
        localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    };
    
    const runCode = () => {
        setError(null);
        setIsPlaying(false);
        setCurrentStep(0);
        const result = executeCode(code, selectedDS);
        if (result[0]?.type === 'error') {
            setError(result[0].message);
            setSteps([]);
        } else {
            setSteps(result);
            if (result[0]?.dsType) setSelectedDS(result[0].dsType);
        }
    };
    
    const transformWithAI = async () => {
        setIsTransforming(true);
        setError(null);
        try {
            const response = await axiosClient.post('/visualizer/transform', { code });
            if (response.data.success) setCode(response.data.transformedCode);
            else setError('AI transformation failed');
        } catch (err) {
            setError('AI Error: ' + (err.response?.data?.error || err.message));
        } finally {
            setIsTransforming(false);
        }
    };
    
    useEffect(() => {
        if (isPlaying && currentStep < steps.length - 1) {
            intervalRef.current = setTimeout(() => setCurrentStep(prev => prev + 1), 1001 - speed);
        } else if (currentStep >= steps.length - 1) {
            setIsPlaying(false);
        }
        return () => clearTimeout(intervalRef.current);
    }, [isPlaying, currentStep, steps.length, speed]);
    
    const currentData = useMemo(() => {
        const step = steps[currentStep] || {};
        const sortedIndices = [];
        for (let i = 0; i <= currentStep; i++) {
            if (steps[i]?.type === 'sorted' && steps[i].sortedIndices) {
                sortedIndices.push(...steps[i].sortedIndices);
            }
        }
        return { ...step, sortedIndices: [...new Set(sortedIndices)] };
    }, [steps, currentStep]);
    
    const bgMain = isDarkMode ? 'bg-[#0a0a0a]' : 'bg-gray-50';
    const cardBg = isDarkMode ? 'bg-[#121212]' : 'bg-white';
    const borderCol = isDarkMode ? 'border-zinc-800' : 'border-gray-200';
    const textPrimary = isDarkMode ? 'text-white' : 'text-gray-900';
    const textSecondary = isDarkMode ? 'text-zinc-400' : 'text-gray-500';

    return (
        <div className={`h-screen flex flex-col ${bgMain} overflow-hidden font-sans`}>
            <header className={`h-14 border-b ${borderCol} ${cardBg} flex items-center justify-between px-4`}>
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/')} className={`flex items-center gap-2 ${textSecondary} hover:text-white`}>
                        <ChevronLeft size={18} /><span className="text-sm">Back</span>
                    </button>
                    <div className="w-px h-6 bg-zinc-700" />
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-gradient-to-br from-purple-500 to-indigo-600 rounded flex items-center justify-center">
                            <Layers size={16} className="text-white" />
                        </div>
                        <span className={`font-bold ${textPrimary}`}>3D DS Visualizer</span>
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    <select value={selectedDS} onChange={(e) => {
                        setSelectedDS(e.target.value);
                        const templateMap = { array: 'array_bubble', tree: 'tree_bst', stack: 'stack_ops', queue: 'queue_ops', linkedlist: 'linkedlist_traverse', graph: 'graph_bfs' };
                        setCode(CODE_TEMPLATES[templateMap[e.target.value]]);
                    }} className={`text-xs px-3 py-1.5 rounded-lg border ${borderCol} ${cardBg} ${textPrimary}`}>
                        <option value="array">Array</option>
                        <option value="tree">Binary Tree</option>
                        <option value="stack">Stack</option>
                        <option value="queue">Queue</option>
                        <option value="linkedlist">Linked List</option>
                        <option value="graph">Graph</option>
                    </select>
                    <button onClick={toggleTheme} className={`p-2 rounded-lg hover:bg-zinc-800 ${textSecondary}`}>
                        {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                    </button>
                </div>
            </header>
            
            <div className="flex-1 flex overflow-hidden">
                <div className={`w-1/2 flex flex-col border-r ${borderCol}`}>
                    <div className={`flex items-center justify-between px-4 py-2 border-b ${borderCol} ${isDarkMode ? 'bg-[#1a1a1a]' : 'bg-gray-100'}`}>
                        <div className="flex items-center gap-2">
                            <Code2 size={16} className="text-emerald-500" />
                            <span className={`text-sm font-medium ${textPrimary}`}>JavaScript</span>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={transformWithAI} disabled={isTransforming}
                                className="flex items-center gap-2 px-3 py-1.5 bg-purple-500 hover:bg-purple-400 disabled:opacity-50 text-white font-bold text-sm rounded-lg">
                                {isTransforming ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />} AI
                            </button>
                            <button onClick={runCode}
                                className="flex items-center gap-2 px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm rounded-lg">
                                <Play size={14} fill="currentColor" /> Run
                            </button>
                        </div>
                    </div>
                    <div className="flex-1">
                        <Editor height="100%" defaultLanguage="javascript" theme={isDarkMode ? 'vs-dark' : 'light'}
                            value={code} onChange={(v) => setCode(v || '')}
                            options={{ fontSize: 13, minimap: { enabled: false }, scrollBeyondLastLine: false, padding: { top: 16 } }} />
                    </div>
                    {error && <div className="px-4 py-3 bg-red-500/10 border-t border-red-500/20 text-red-400 text-sm">{error}</div>}
                </div>
                
                <div className="w-1/2 flex flex-col">
                    <div className={`flex-1 ${isDarkMode ? 'bg-[#0d0d0d]' : 'bg-gray-100'}`}>
                        <Canvas shadows>
                            <Suspense fallback={null}>
                                <Scene3D dsType={currentData.dsType || selectedDS} data={currentData} isDarkMode={isDarkMode} />
                            </Suspense>
                        </Canvas>
                    </div>
                    <div className={`h-10 border-t ${borderCol} ${cardBg} flex items-center justify-center ${textSecondary} text-sm font-mono`}>
                        {currentData.message || 'Run code to visualize'}
                    </div>
                    <div className={`border-t ${borderCol} ${cardBg} p-4`}>
                        <div className="flex items-center justify-center gap-4">
                            <button onClick={() => { setCurrentStep(0); setIsPlaying(false); }} className={`p-2 rounded-lg hover:bg-zinc-800 ${textSecondary}`}>
                                <RotateCcw size={18} />
                            </button>
                            <button onClick={() => setCurrentStep(Math.max(0, currentStep - 1))} className={`p-2 rounded-lg hover:bg-zinc-800 ${textSecondary}`}>
                                <SkipBack size={18} />
                            </button>
                            <button onClick={() => setIsPlaying(!isPlaying)}
                                className={`p-3 rounded-full ${isPlaying ? 'bg-amber-500' : 'bg-emerald-500'} text-white shadow-lg`}>
                                {isPlaying ? <Pause size={20} /> : <Play size={20} fill="currentColor" className="ml-0.5" />}
                            </button>
                            <button onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))} className={`p-2 rounded-lg hover:bg-zinc-800 ${textSecondary}`}>
                                <SkipForward size={18} />
                            </button>
                            <div className="flex items-center gap-2 ml-4">
                                <Zap size={14} className="text-yellow-400" />
                                <input type="range" min="100" max="1000" value={speed} onChange={(e) => setSpeed(Number(e.target.value))}
                                    className="w-24 h-1 bg-zinc-700 rounded appearance-none cursor-pointer accent-emerald-500" />
                            </div>
                            <div className={`text-xs font-mono ${textSecondary} ml-4`}>{currentStep + 1} / {steps.length || 1}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CodeVisualizer;
