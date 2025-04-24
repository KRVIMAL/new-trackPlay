import React from 'react';
import { FaGasPump, FaRulerHorizontal } from 'react-icons/fa';

interface VehicleInfoProps {
  dateTime?: string;
  vehicleName?: string;
  currentSpeed?: number;
  maxSpeed?: number;
  deviceId?: string;
  startFuel?: number;
  endFuel?: number;
  fuelUsed?: number;
  mileage?: number;
}

const VehicleInfo: React.FC<VehicleInfoProps> = ({
  dateTime = '14 Apr 2025 (Mon) | 21:12:20',
  vehicleName = 'Vehicle model name',
  currentSpeed = 64,
  maxSpeed = 160,
  deviceId = '7639817643372',
  startFuel = 71,
  endFuel = 19,
  fuelUsed = 52,
  mileage = 8.68
}) => {
  // Calculate speed gauge percentage
  const speedPercentage = (currentSpeed / maxSpeed) * 100;
  
  return (
    <div className="bg-black text-white flex flex-col h-full w-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="text-lg font-medium mb-1">Track and play</div>
        <div className="text-sm text-gray-400">{dateTime}</div>
      </div>
      
      {/* Vehicle Image */}
      <div className="flex justify-center items-center p-6">
        <img 
          src="/api/placeholder/240/160" 
          alt="Vehicle" 
          className="max-w-full"
        />
      </div>
      
      {/* Vehicle Name */}
      <div className="text-center mb-4">
        <div className="text-gray-300">{vehicleName}</div>
      </div>
      
      {/* Speedometer */}
      <div className="px-4 mb-6">
        <div className="relative">
          {/* Speedometer Arc */}
          <div className="h-32 flex flex-col justify-center items-center">
            {/* Speedometer visualization */}
            <div className="relative w-full h-16">
              {/* Background arc */}
              <div className="absolute h-16 w-full bg-gradient-to-r from-blue-500 via-yellow-500 to-red-500 opacity-30 rounded-t-full"></div>
              
              {/* Current speed indicator */}
              <div 
                className="absolute h-16 rounded-t-full bg-gradient-to-r from-blue-500 via-yellow-500 to-red-500" 
                style={{ width: `${speedPercentage}%` }}
              ></div>
              
              {/* Speed markings */}
              <div className="absolute w-full bottom-0 flex justify-between px-2 text-xs">
                <div>0</div>
                <div>20</div>
                <div>40</div>
                <div>60</div>
                <div>80</div>
                <div>100</div>
                <div>120</div>
                <div>140</div>
                <div>160</div>
              </div>
            </div>
            
            {/* Current speed display */}
            <div className="text-4xl font-bold mt-2">{currentSpeed}%</div>
            <div className="text-xs text-gray-400">km/h</div>
          </div>
        </div>
      </div>
      
      {/* Device Information */}
      <div className="grid grid-cols-2 gap-2 px-4">
        <div className="bg-gray-900 p-3 rounded">
          <div className="text-xs text-gray-400 mb-1">Device ID</div>
          <div className="text-sm font-medium">{deviceId}</div>
        </div>
        <div className="bg-gray-900 p-3 rounded">
          <div className="text-xs text-gray-400 mb-1">Vehicle ID</div>
          <div className="text-sm font-medium">{deviceId}</div>
        </div>
      </div>
      
      {/* Fuel and Mileage Information */}
      <div className="grid grid-cols-2 gap-2 px-4 mt-4">
        <div className="bg-gray-900 p-3 rounded">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center mr-2">
              <FaGasPump className="text-gray-400" />
            </div>
            <div>
              <div className="text-xs text-gray-400">Start Fuel</div>
              <div className="text-sm font-medium">{startFuel}%</div>
            </div>
          </div>
        </div>
        <div className="bg-gray-900 p-3 rounded">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center mr-2">
              <FaGasPump className="text-gray-400" />
            </div>
            <div>
              <div className="text-xs text-gray-400">End Fuel</div>
              <div className="text-sm font-medium">{endFuel}%</div>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-900 p-3 rounded">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center mr-2">
              <FaGasPump className="text-gray-400" />
            </div>
            <div>
              <div className="text-xs text-gray-400">Fuel Used</div>
              <div className="text-sm font-medium">{fuelUsed} Ltr</div>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-900 p-3 rounded">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center mr-2">
              <FaRulerHorizontal className="text-gray-400" />
            </div>
            <div>
              <div className="text-xs text-gray-400">Mileage</div>
              <div className="text-sm font-medium">{mileage} km/l</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex-grow"></div>
    </div>
  );
};

export default VehicleInfo;