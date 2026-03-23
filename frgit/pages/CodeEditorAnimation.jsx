import React, { useRef, useState, useEffect, useMemo } from 'react';
// R3F: Canvas is the gateway into the Three.js world
import { Canvas, useFrame } from '@react-three/fiber'; 
// Drei: Helpful utilities, Box for easy geometry, OrbitControls for easy camera interaction
import { Box, OrbitControls } from '@react-three/drei'; 

// --- A. 3D Editor Model Component ---
function EditorScreen() {
  const meshRef = useRef();

  // Add subtle, slow rotation to the 3D object for a dynamic feel
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.001;
      meshRef.current.rotation.x = Math.sin(Date.now() * 0.0001) * 0.05;
    }
  });

  return (
    <group position={[0, 0, 0]} ref={meshRef}>
      {/* 1. Computer Monitor Body (Dark frame) */}
      <Box args={[3.2, 2.2, 0.1]} position={[0, 0, 0]} castShadow>
        <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.3} />
      </Box>
      
      {/* 2. Screen Area (Slightly inset, darker, and slightly emissive) */}
      <Box args={[3, 2, 0.05]} position={[0, 0, 0.05]} castShadow>
        <meshStandardMaterial 
          color="#0f0f0f" 
          emissive="#00ccff" 
          emissiveIntensity={0.05} 
        />
      </Box>
      
      {/* 3. Base/Stand */}
      <Box args={[1.5, 0.1, 1]} position={[0, -1.1, 0.5]} castShadow>
        <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.3} />
      </Box>
    </group>
  );
}

// --- B. 2D Typing Overlay Component (The hybrid trick) ---
function TypingOverlay() {
  const textToType = useMemo(() => 
`function solveAnagram(s, t) {
  if (s.length !== t.length) return false;
  
  const map = {};
  for (let char of s) {
    map[char] = (map[char] || 0) + 1;
  }
  
  for (let char of t) {
    if (!map[char]) return false;
    map[char]--;
  }
  
  return true;
}

// Running... Success!`, []);

  const [typedText, setTypedText] = useState('');
  const speed = 40; // Typing speed in milliseconds

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < textToType.length) {
        // Use a functional update to prevent stale state issues
        setTypedText(prev => prev + textToType.charAt(index)); 
        index++;
      } else {
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval); // Cleanup on unmount
  }, [textToType, speed]);

  return (
    // This div is absolutely positioned over the canvas
    <div
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10"
      style={{
        // IMPORTANT: These dimensions are crucial for aligning with the 3D screen. 
        // 3D Screen is 3 units wide by 2 units high. 
        // Adjust these pixel values if your canvas container size changes.
        width: '300px', 
        height: '200px', 
        padding: '10px',
      }}
    >
      <pre 
        className="text-emerald-400 font-mono text-xs overflow-hidden" 
        style={{ whiteSpace: 'pre-wrap', lineHeight: 1.4 }}
      >
        {typedText}
        {/* Blinking cursor effect (requires CSS, see Section 2) */}
        <span className="cursor-blink">|</span>
      </pre>
    </div>
  );
}


// --- C. Main Component ---
 function CodeEditorAnimation() {
  return (
    <div className="relative h-[500px] w-full bg-[#0f0f0f] border-b border-white/5">
      
      {/* 1. The 2D HTML/React component overlay (Sits on top) */}
      <TypingOverlay /> 

      {/* 2. The 3D Canvas (Sits underneath) */}
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        shadows
        className="z-0"
      >
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} castShadow />
        <spotLight position={[0, 0, 5]} intensity={0.5} color="#00ccff" angle={Math.PI / 4} penumbra={1} />

        {/* 3D Editor Model */}
        <EditorScreen />

        {/* Controls (Helpful for development and presentation) */}
        <OrbitControls enableZoom={true} enablePan={false} />
      </Canvas>
    </div>
  );
}

export default CodeEditorAnimation;