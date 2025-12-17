import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiMaximize,
  FiMinimize,
  FiRotateCw,
  FiZoomIn,
  FiZoomOut,
  FiX,
  FiInfo,
  FiMapPin,
  FiPlay,
  FiPause,
} from 'react-icons/fi';

interface Hotspot {
  id: string;
  x: number; // percentage
  y: number; // percentage
  title: string;
  description?: string;
  targetScene?: string;
  icon?: string;
}

interface Scene {
  id: string;
  name: string;
  imageUrl: string;
  hotspots?: Hotspot[];
}

interface VirtualTourViewerProps {
  scenes: Scene[];
  initialScene?: string;
  className?: string;
  onClose?: () => void;
}

const VirtualTourViewer: React.FC<VirtualTourViewerProps> = ({
  scenes,
  initialScene,
  className = '',
  onClose,
}) => {
  const [currentSceneId, setCurrentSceneId] = useState<string>(
    initialScene || scenes[0]?.id || ''
  );
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [isAutoRotate, setIsAutoRotate] = useState<boolean>(false);
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const currentScene = scenes.find((s) => s.id === currentSceneId);

  // Auto-rotate effect
  useEffect(() => {
    if (!isAutoRotate) return;

    const interval = setInterval(() => {
      setRotation((prev) => (prev + 0.5) % 360);
    }, 50);

    return () => clearInterval(interval);
  }, [isAutoRotate]);

  // Fullscreen handling
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsPanning(true);
    setStartPos({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    const newX = e.clientX - startPos.x;
    const newY = e.clientY - startPos.y;
    setPanOffset({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // Zoom controls
  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.2, 0.5));
  };

  // Reset view
  const resetView = () => {
    setZoom(1);
    setRotation(0);
    setPanOffset({ x: 0, y: 0 });
    setIsAutoRotate(false);
  };

  return (
    <div
      ref={containerRef}
      className={`relative bg-black rounded-xl overflow-hidden ${className}`}
    >
      {/* Main Viewer */}
      <div
        className="relative w-full h-full min-h-[500px] cursor-move overflow-hidden"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {currentScene && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg) translate(${panOffset.x}px, ${panOffset.y}px)`,
              transition: isPanning ? 'none' : 'transform 0.3s ease',
            }}
          >
            <img
              ref={imageRef}
              src={currentScene.imageUrl}
              alt={currentScene.name}
              className="max-w-full max-h-full object-contain"
              draggable={false}
            />

            {/* Hotspots */}
            {currentScene.hotspots?.map((hotspot) => (
              <motion.div
                key={hotspot.id}
                className="absolute"
                style={{
                  left: `${hotspot.x}%`,
                  top: `${hotspot.y}%`,
                }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.2 }}
                onClick={() => {
                  if (hotspot.targetScene) {
                    setCurrentSceneId(hotspot.targetScene);
                    resetView();
                  } else {
                    setSelectedHotspot(hotspot);
                  }
                }}
              >
                <div className="relative">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center cursor-pointer shadow-lg animate-pulse">
                    <FiMapPin className="w-4 h-4 text-white" />
                  </div>
                  {hotspot.title && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-black/80 text-white text-xs rounded whitespace-nowrap pointer-events-none">
                      {hotspot.title}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Controls Overlay */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        {/* Zoom Controls */}
        <div className="flex flex-col gap-1 bg-black/70 rounded-lg p-2 backdrop-blur-sm">
          <button
            onClick={handleZoomIn}
            className="p-2 text-white hover:bg-white/20 rounded transition-colors"
            title="Zoom In"
          >
            <FiZoomIn className="w-5 h-5" />
          </button>
          <div className="h-px bg-gray-600 mx-2"></div>
          <button
            onClick={handleZoomOut}
            className="p-2 text-white hover:bg-white/20 rounded transition-colors"
            title="Zoom Out"
          >
            <FiZoomOut className="w-5 h-5" />
          </button>
        </div>

        {/* Rotation & Auto-Rotate */}
        <div className="flex flex-col gap-1 bg-black/70 rounded-lg p-2 backdrop-blur-sm">
          <button
            onClick={() => setRotation((prev) => (prev + 90) % 360)}
            className="p-2 text-white hover:bg-white/20 rounded transition-colors"
            title="Rotate 90°"
          >
            <FiRotateCw className="w-5 h-5" />
          </button>
          <div className="h-px bg-gray-600 mx-2"></div>
          <button
            onClick={() => setIsAutoRotate(!isAutoRotate)}
            className={`p-2 rounded transition-colors ${
              isAutoRotate ? 'bg-blue-500 text-white' : 'text-white hover:bg-white/20'
            }`}
            title="Auto Rotate"
          >
            {isAutoRotate ? <FiPause className="w-5 h-5" /> : <FiPlay className="w-5 h-5" />}
          </button>
        </div>

        {/* Fullscreen */}
        <button
          onClick={toggleFullscreen}
          className="p-2 bg-black/70 text-white hover:bg-white/20 rounded-lg transition-colors backdrop-blur-sm"
          title="Toggle Fullscreen"
        >
          {isFullscreen ? <FiMinimize className="w-5 h-5" /> : <FiMaximize className="w-5 h-5" />}
        </button>

        {/* Close */}
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 bg-red-500/70 text-white hover:bg-red-600/70 rounded-lg transition-colors backdrop-blur-sm"
            title="Close Tour"
          >
            <FiX className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Scene Selector */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 bg-black/70 rounded-lg p-2 backdrop-blur-sm max-w-full overflow-x-auto">
        {scenes.map((scene) => (
          <button
            key={scene.id}
            onClick={() => {
              setCurrentSceneId(scene.id);
              resetView();
            }}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              scene.id === currentSceneId
                ? 'bg-blue-500 text-white'
                : 'text-white hover:bg-white/20'
            }`}
          >
            {scene.name}
          </button>
        ))}
      </div>

      {/* Info Panel */}
      <div className="absolute top-4 left-4 bg-black/70 rounded-lg p-4 backdrop-blur-sm text-white max-w-xs">
        <div className="flex items-start gap-2">
          <FiInfo className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold">{currentScene?.name}</p>
            <p className="text-xs text-gray-300 mt-1">
              Use mouse to pan • Scroll to zoom • Click hotspots to navigate
            </p>
          </div>
        </div>
      </div>

      {/* Hotspot Info Modal */}
      <AnimatePresence>
        {selectedHotspot && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 flex items-center justify-center z-50"
            onClick={() => setSelectedHotspot(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {selectedHotspot.title}
                </h3>
                <button
                  onClick={() => setSelectedHotspot(null)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
              {selectedHotspot.description && (
                <p className="text-gray-600 dark:text-gray-400">
                  {selectedHotspot.description}
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls Info */}
      <div className="absolute bottom-4 right-4 text-xs text-white/70 bg-black/50 px-3 py-2 rounded backdrop-blur-sm">
        Zoom: {(zoom * 100).toFixed(0)}% | Rotation: {rotation.toFixed(0)}°
      </div>
    </div>
  );
};

export default VirtualTourViewer;
