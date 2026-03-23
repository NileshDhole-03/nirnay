import { useState, useRef, useEffect, useCallback } from 'react';
import { Pause, Play, Volume2, VolumeX, Maximize, RefreshCw } from 'lucide-react';

/**
 * A custom, accessible, and feature-rich video player component for React.
 *
 * @param {object} props - The component props.
 * @param {string} props.secureUrl - The secure URL of the video source.
 * @param {string} props.thumbnailUrl - The URL for the video's poster image.
 * @param {number} props.duration - The total duration of the video in seconds.
 * @returns {JSX.Element} The rendered video player component.
 */
const Editorial = ({ secureUrl, thumbnailUrl, duration }) => {
  const videoRef = useRef(null);
  const playerContainerRef = useRef(null);
  const progressBarRef = useRef(null);

  // --- State Management ---
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isVideoEnded, setIsVideoEnded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // --- Utility Functions ---
  /**
   * Formats time in seconds to a MM:SS string.
   * @param {number} timeInSeconds - The time to format.
   * @returns {string} The formatted time string.
   */
  const formatTime = (timeInSeconds) => {
    const totalSeconds = Math.floor(timeInSeconds);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // --- Core Player Logic (Memoized with useCallback) ---
  const togglePlayPause = useCallback(() => {
    if (!videoRef.current) return;
    
    if (isVideoEnded) {
        videoRef.current.currentTime = 0;
        videoRef.current.play();
        setIsVideoEnded(false);
        setIsPlaying(true);
        return;
    }

    const newIsPlaying = !videoRef.current.paused;
    if (newIsPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
  }, [isVideoEnded]);

  const handleVolumeChange = useCallback((e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
        videoRef.current.volume = newVolume;
        videoRef.current.muted = newVolume === 0;
    }
    setIsMuted(newVolume === 0);
  }, []);
  
  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    const newMutedState = !videoRef.current.muted;
    videoRef.current.muted = newMutedState;
    setIsMuted(newMutedState);
    if (!newMutedState && volume === 0) {
        setVolume(0.5); // Restore to a sensible volume if unmuting from 0
        videoRef.current.volume = 0.5;
    }
  }, [volume]);
  
  const handleProgressChange = useCallback((e) => {
    const newTime = Number(e.target.value);
    setCurrentTime(newTime);
    if(videoRef.current) {
        videoRef.current.currentTime = newTime;
    }
  }, []);
  
  const toggleFullScreen = useCallback(() => {
      const playerElement = playerContainerRef.current;
      if (!document.fullscreenElement) {
          playerElement?.requestFullscreen().catch(err => {
            alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
          });
      } else {
          document.exitFullscreen();
      }
  }, []);

  // --- Event Handlers for Video Element ---
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleTimeUpdate = () => {
        if (!video.seeking) {
            setCurrentTime(video.currentTime);
        }
    };
    const handleCanPlay = () => setIsLoading(false);
    const handleWaiting = () => setIsLoading(true);
    const handleEnded = () => {
        setIsVideoEnded(true);
        setIsPlaying(false);
    }
    const handleVolumeStateChange = () => {
        setIsMuted(video.muted);
        setVolume(video.volume);
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('volumechange', handleVolumeStateChange);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('volumechange', handleVolumeStateChange);
    };
  }, []);

  // --- Keyboard Shortcuts ---
  useEffect(() => {
    const handleKeyDown = (e) => {
        // Ignore shortcuts if user is focused on an input field
        if (e.target.tagName === 'INPUT') return;

        switch(e.key) {
            case ' ': // Spacebar for play/pause
                e.preventDefault();
                togglePlayPause();
                break;
            case 'm': // 'm' for mute/unmute
                toggleMute();
                break;
            case 'f': // 'f' for fullscreen
                toggleFullScreen();
                break;
            case 'ArrowRight': // Right arrow to seek forward
                if (videoRef.current) videoRef.current.currentTime += 5;
                break;
            case 'ArrowLeft': // Left arrow to seek backward
                if (videoRef.current) videoRef.current.currentTime -= 5;
                break;
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlayPause, toggleMute, toggleFullScreen]);

  return (
    <div 
      ref={playerContainerRef}
      className="relative w-full max-w-3xl mx-auto rounded-lg overflow-hidden shadow-2xl bg-black group/player"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <video
        ref={videoRef}
        src={secureUrl}
        poster={thumbnailUrl}
        onClick={togglePlayPause}
        onDoubleClick={toggleFullScreen}
        className="w-full h-full aspect-video cursor-pointer"
        preload="metadata"
      />
      
      {/* Loading Spinner */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 pointer-events-none">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      )}

      {/* Center Play/Replay Button */}
      {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <button 
                  onClick={togglePlayPause}
                  className="bg-black bg-opacity-50 text-white p-4 rounded-full transition-transform transform hover:scale-110 pointer-events-auto"
                  aria-label={isVideoEnded ? "Replay" : "Play"}
              >
                  {isVideoEnded ? <RefreshCw size={48} /> : <Play size={48} />}
              </button>
          </div>
      )}

      {/* Controls Overlay */}
      <div 
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300
          ${isHovering || !isPlaying ? 'opacity-100' : 'opacity-0'}`}
      >
        {/* Progress Bar */}
        <input
          ref={progressBarRef}
          type="range"
          min="0"
          max={duration || 0}
          value={currentTime}
          onChange={handleProgressChange}
          className="range range-primary range-xs w-full cursor-pointer"
          style={{'--range-shdw': '#661AE6'}} // daisyUI variable for thumb color
        />
        
        {/* Bottom Controls */}
        <div className="flex items-center justify-between w-full mt-2 text-white">
          <div className="flex items-center gap-4">
            <button
              onClick={togglePlayPause}
              className="hover:text-primary transition-colors"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause size={24}/> : <Play size={24}/>}
            </button>
            <div className="flex items-center gap-2 group/volume">
                <button onClick={toggleMute} aria-label={isMuted ? "Unmute" : "Mute"}>
                    {isMuted || volume === 0 ? <VolumeX size={24} /> : <Volume2 size={24} />}
                </button>
                <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.05" 
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-0 group-hover/volume:w-20 transition-all duration-300 h-1 accent-primary cursor-pointer"
                />
            </div>
          </div>
          
          <div className='flex items-center gap-4'>
            <span className="text-sm font-mono select-none">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
            <button 
                onClick={toggleFullScreen} 
                className="hover:text-primary transition-colors"
                aria-label="Toggle Fullscreen"
            >
                <Maximize size={22} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Editorial;
