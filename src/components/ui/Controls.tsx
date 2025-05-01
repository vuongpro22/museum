import React, { useState, useEffect, useRef } from "react";
import { Keyboard, Info, Volume2, VolumeX, Play, Pause, SkipForward, Music } from "lucide-react";
import { useDetectGPU } from "@react-three/drei";

interface ControlsProps {
  style?: React.CSSProperties;
}

const Controls: React.FC<ControlsProps> = ({ style }) => {
  const { isMobile } = useDetectGPU();
  const [displaySettings, setDisplaySettings] = useState<
    "none" | "information" | "settings"
  >("none");
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showMusicControls, setShowMusicControls] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const songs = [
    { name: "Background Music 1", path: "/music/bgmusic.mp3" },
    { name: "Background Music 2", path: "/music/bgmusic2.mp3" }
  ];

  useEffect(() => {
    const audio = new Audio(songs[currentSongIndex].path);
    audio.loop = false;
    audio.volume = isMuted ? 0 : 0.06;
    audioRef.current = audio;

    const updateTime = () => {
      if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime);
        setDuration(audioRef.current.duration);
      }
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateTime);
    audio.addEventListener('ended', () => {
      playNextSong();
    });

    const playAudio = () => {
      if (audioRef.current) {
        audioRef.current.play().catch((error) => {
          console.error(
            "Error playing audio waiting for user interaction",
            error
          );
        });
      }
    };

    playAudio();

    const handleUserInteraction = () => {
      playAudio();
      document.removeEventListener("click", handleUserInteraction);
      document.removeEventListener("keydown", handleUserInteraction);
    };

    document.addEventListener("click", handleUserInteraction);
    document.addEventListener("keydown", handleUserInteraction);

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener('timeupdate', updateTime);
        audioRef.current.removeEventListener('loadedmetadata', updateTime);
        audioRef.current.removeEventListener('ended', () => {
          playNextSong();
        });
        audioRef.current = null;
      }
      document.removeEventListener("click", handleUserInteraction);
      document.removeEventListener("keydown", handleUserInteraction);
    };
  }, [currentSongIndex]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0.06 : 0;
      setIsMuted(!isMuted);
    }
  };

  const playNextSong = () => {
    setCurrentSongIndex((prevIndex) => (prevIndex + 1) % songs.length);
    setIsPlaying(true);
  };

  return (
    <div style={style}>
      {/* Floating Music Button */}
      <button
        onClick={() => setShowMusicControls(!showMusicControls)}
        className={`fixed ${isMobile ? 'bottom-20 right-4' : 'bottom-4 right-4'} bg-white/10 backdrop-blur-md p-3 rounded-full hover:bg-white/20 transition-colors z-50`}
        aria-label="Music Controls"
      >
        <Music size={20} className="text-white" />
      </button>

      {/* Music Controls Panel */}
      {showMusicControls && (
        <div className={`fixed ${isMobile ? 'bottom-32 right-4' : 'bottom-16 right-4'} bg-black/80 backdrop-blur-md p-4 rounded-lg text-white z-50`}>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="text-white text-sm">{songs[currentSongIndex].name}</span>
              <span className="text-white/70 text-xs">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>
            
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, white ${(currentTime / (duration || 100)) * 100}%, rgba(255, 255, 255, 0.2) ${(currentTime / (duration || 100)) * 100}%)`
              }}
            />

            <div className="flex items-center gap-2">
              <button
                onClick={togglePlay}
                className="bg-white/10 backdrop-blur-md p-2 rounded-full hover:bg-white/20 transition-colors"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <Pause size={16} className="text-white" />
                ) : (
                  <Play size={16} className="text-white" />
                )}
              </button>

              <button
                onClick={playNextSong}
                className="bg-white/10 backdrop-blur-md p-2 rounded-full hover:bg-white/20 transition-colors"
                aria-label="Next song"
              >
                <SkipForward size={16} className="text-white" />
              </button>

              <button
                onClick={toggleMute}
                className="bg-white/10 backdrop-blur-md p-2 rounded-full hover:bg-white/20 transition-colors"
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? (
                  <VolumeX size={16} className="text-white" />
                ) : (
                  <Volume2 size={16} className="text-white" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings and Information Panels */}
      {displaySettings === "settings" && (
        <div className="absolute bottom-20 right-4 bg-black/80 backdrop-blur-md p-4 rounded-lg text-white w-96">
          <h3 className="text-lg font-semibold mb-2">Controls</h3>

          <h5 className="font-semibold">Starting the Tour</h5>
          <ul className="text-sm">
            <li>• Click "Start the Tour" to view the first artwork.</li>
            <li>
              • Use the left (←) and right (→) arrow keys or the on-screen
              buttons to navigate between artworks.
            </li>
          </ul>
          <h5 className="mt-3 font-semibold">Exploring Freely</h5>
          <ul className="text-sm">
            <li>• Click on any artwork to display it directly.</li>
            <li>
              • From there, navigate using the arrow keys or buttons as in the
              guided tour.
            </li>
          </ul>

          <h5 className="mt-3 font-semibold">Exiting the Tour</h5>
          <ul className="text-sm">
            <li>
              • Press Esc or click on the displayed artwork to return to the
              beginning.
            </li>
          </ul>

          <h5 className="mt-3 font-semibold">Audio</h5>
          <ul className="text-sm">
            <li>• Click the sound icon to mute/unmute the background music.</li>
          </ul>
        </div>
      )}

      {displaySettings === "information" && (
        <div className="absolute bottom-20 right-4 bg-black/80 backdrop-blur-md p-4 rounded-lg text-white w-96">
          <h3 className="text-lg font-semibold mb-2">Information</h3>

          <p>
            Welcome to my interactive 3D museum! This project was created to
            showcase my drawings in an immersive way using Three.js and React.
          </p>
          <br />
          <p>
            "Metal Bench" 3D model by{" "}
            <a
              href="https://sketchfab.com/JanStano"
              target="_blank"
              className="underline"
            >
              JanStano
            </a>
          </p>
          <br />
          <p>
            Developed by{" "}
            <a
              href="https://x.com/tymek_dev"
              target="_blank"
              className="underline"
            >
              @tymek_dev
            </a>
          </p>
        </div>
      )}
    </div>
  );
};

export default Controls;