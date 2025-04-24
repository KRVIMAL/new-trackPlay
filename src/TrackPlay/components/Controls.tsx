import React from 'react';
import { FaPlay, FaPause, FaStepBackward, FaStepForward, FaPlus, FaMinus } from 'react-icons/fa';
import { BiReset } from 'react-icons/bi';

interface ControlsProps {
  isPlaying: boolean;
  disabled: boolean;
  animationSpeed: number;
  onPlayPause: () => void;
  onReset: () => void;
  onSpeedIncrease: () => void;
  onSpeedDecrease: () => void;
}

const Controls: React.FC<ControlsProps> = ({
  isPlaying,
  disabled,
  animationSpeed,
  onPlayPause,
  onReset,
  onSpeedIncrease,
  onSpeedDecrease
}) => {
  const getSpeedLabel = () => {
    // Lower ms = faster speed
    if (animationSpeed <= 5) return "Very Fast";
    if (animationSpeed <= 10) return "Fast";
    if (animationSpeed <= 20) return "Normal";
    if (animationSpeed <= 30) return "Slow";
    return "Very Slow";
  };

  return (
    <div className="flex items-center justify-center gap-4 p-4 bg-white border-t border-gray-200">
      {/* Step Back Button */}
      <button
        disabled={disabled}
        className={`w-10 h-10 rounded-full flex items-center justify-center ${
          disabled ? 'bg-gray-200 text-gray-400' : 'bg-blue-100 text-blue-500 hover:bg-blue-200'
        }`}
      >
        <FaStepBackward />
      </button>
      
      {/* Play/Pause Button */}
      <button
        onClick={onPlayPause}
        disabled={disabled}
        className={`w-12 h-12 rounded-full flex items-center justify-center ${
          disabled 
            ? 'bg-gray-200 text-gray-400' 
            : isPlaying 
              ? 'bg-orange-500 text-white hover:bg-orange-600' 
              : 'bg-green-500 text-white hover:bg-green-600'
        }`}
      >
        {isPlaying ? <FaPause /> : <FaPlay />}
      </button>
      
      {/* Step Forward Button */}
      <button
        disabled={disabled}
        className={`w-10 h-10 rounded-full flex items-center justify-center ${
          disabled ? 'bg-gray-200 text-gray-400' : 'bg-blue-100 text-blue-500 hover:bg-blue-200'
        }`}
      >
        <FaStepForward />
      </button>
      
      {/* Reset Button */}
      <button
        onClick={onReset}
        disabled={disabled}
        className={`w-10 h-10 rounded-full flex items-center justify-center ${
          disabled ? 'bg-gray-200 text-gray-400' : 'bg-red-100 text-red-500 hover:bg-red-200'
        }`}
      >
        <BiReset />
      </button>
      
      {/* Speed Controls */}
      <div className="flex items-center gap-2 ml-6 bg-gray-100 px-3 py-2 rounded">
        <button
          onClick={onSpeedDecrease}
          disabled={disabled}
          className={`p-1 rounded ${
            disabled ? 'text-gray-400' : 'text-blue-500 hover:bg-blue-100'
          }`}
        >
          <FaMinus />
        </button>
        
        <div className="min-w-[80px] text-center font-medium text-sm">
          {getSpeedLabel()}
        </div>
        
        <button
          onClick={onSpeedIncrease}
          disabled={disabled || animationSpeed <= 5}
          className={`p-1 rounded ${
            disabled || animationSpeed <= 5 ? 'text-gray-400' : 'text-blue-500 hover:bg-blue-100'
          }`}
        >
          <FaPlus />
        </button>
      </div>
    </div>
  );
};

export default Controls;