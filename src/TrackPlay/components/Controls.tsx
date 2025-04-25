import React from 'react';
import { FaPlay, FaPause, FaMinus, FaPlus, FaBackward, FaForward } from 'react-icons/fa';

interface ControlsProps {
  isPlaying: boolean;
  disabled: boolean;
  animationSpeed: number;
  onPlayPause: () => void;
  onReset: () => void;
  onSpeedIncrease: () => void;
  onSpeedDecrease: () => void;
  onStepForward?: () => void;
  onStepBackward?: () => void;
}

const Controls: React.FC<ControlsProps> = ({
  isPlaying,
  disabled,
  animationSpeed,
  onPlayPause,
  onReset,
  onSpeedIncrease,
  onSpeedDecrease,
  onStepForward = () => {},
  onStepBackward = () => {},
}) => {
  // Convert animation speed to a display multiplier (1X, 2X, etc.)
  const getSpeedMultiplier = (speed: number): string => {
    if (speed <= 5) return '4X';
    if (speed <= 10) return '3X';
    if (speed <= 15) return '2X';
    return '1X';
  };

  const speedMultiplier = getSpeedMultiplier(animationSpeed);

  return (
    <div className="w-[170px] h-[108px] bg-white rounded-[14px] flex flex-col items-center justify-center p-2 shadow-md">
      {/* First row: Play/Pause, Speed controls */}
      <div className="flex gap-4 mb-3">
        <button
          onClick={onPlayPause}
          disabled={disabled}
          className={`w-[46px] h-[46px] rounded-[6px] flex items-center justify-center ${
            disabled ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#187CFF] hover:bg-blue-600'
          }`}
        >
          {isPlaying ? (
            <FaPause className="text-white text-lg" />
          ) : (
            <FaPlay className="text-white text-lg" />
          )}
        </button>
        
        <button
          onClick={onSpeedDecrease}
          disabled={disabled}
          className={`w-[46px] h-[46px] rounded-[6px] flex items-center justify-center ${
            disabled ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#187CFF] hover:bg-blue-600'
          }`}
        >
          <FaMinus className="text-white text-lg" />
        </button>
        
        <button
          onClick={onSpeedIncrease}
          disabled={disabled || animationSpeed <= 5}
          className={`w-[46px] h-[46px] rounded-[6px] flex items-center justify-center ${
            disabled || animationSpeed <= 5 ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#187CFF] hover:bg-blue-600'
          }`}
        >
          <FaPlus className="text-white text-lg" />
        </button>
      </div>
      
      {/* Second row: Back/Forward with speed indicator */}
      <div className="flex items-center gap-3">
        <button
          onClick={onStepBackward}
          disabled={disabled}
          className={`w-[46px] h-[46px] rounded-[6px] flex items-center justify-center ${
            disabled ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#187CFF] hover:bg-blue-600'
          }`}
        >
          <FaBackward className="text-white text-lg" />
        </button>
        
        <div className="w-12 text-center font-semibold text-gray-700">
          {speedMultiplier}
        </div>
        
        <button
          onClick={onStepForward}
          disabled={disabled}
          className={`w-[46px] h-[46px] rounded-[6px] flex items-center justify-center ${
            disabled ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#187CFF] hover:bg-blue-600'
          }`}
        >
          <FaForward className="text-white text-lg" />
        </button>
      </div>
    </div>
  );
};

export default Controls;