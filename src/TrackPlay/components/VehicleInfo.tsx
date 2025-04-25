import React from 'react';
import { FaGasPump, FaRulerHorizontal } from 'react-icons/fa';
import box_truck_isolated_on_background from "../../assets/images/box_truck_isolated_on_background 1.svg"

// Custom speedometer component
const Speedometer = ({ value, maxValue }:any) => {
  const percentage = (value / maxValue) * 100;
  return (
    <div className="relative h-40 w-full">
      {/* Speedometer arc background */}
      <div className="absolute w-full h-40 flex items-center justify-center">
        <div className="w-64 h-32 overflow-hidden relative">
          <div className="w-64 h-64 rounded-full border-16 border-gray-700 absolute bottom-0"></div>
          <div 
            className="w-64 h-64 rounded-full border-16 border-gradient-to-r from-blue-500 via-yellow-500 to-red-500 absolute bottom-0 transition-transform duration-500"
            style={{ clipPath: `polygon(50% 50%, 0 50%, 0 0, ${50 + percentage/2}% 0, 50% 50%)` }}
          ></div>
          
          {/* Needle */}
          <div 
            className="absolute bottom-0 left-1/2 w-1 h-28 bg-red-500 origin-bottom transition-transform duration-500"
            style={{ transform: `translateX(-50%) rotate(${-90 + (percentage * 1.8)}deg)` }}
          >
            <div className="w-3 h-3 rounded-full bg-red-500 absolute -left-1 -top-1"></div>
          </div>
          
          {/* Center point */}
          <div className="absolute bottom-0 left-1/2 w-4 h-4 bg-white rounded-full transform -translate-x-1/2"></div>
        </div>
      </div>
      
      {/* Speed display */}
      <div className="absolute bottom-0 left-0 right-0 text-center">
        <div className="text-4xl font-bold">{value}</div>
        <div className="text-xs text-gray-400">km/h</div>
      </div>
      
      {/* Markings */}
      <div className="absolute bottom-2 left-0 right-0 flex justify-between px-8 text-xs text-gray-500">
        <div>0</div>
        <div>40</div>
        <div>80</div>
        <div>120</div>
        <div>160</div>
      </div>
    </div>
  );
};

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
  currentSpeed = 0,
  maxSpeed = 160,
  deviceId = '7639817643372',
  startFuel = 71,
  endFuel = 19,
  fuelUsed = 52,
  mileage = 8.68
}) => {
  const vehImg = box_truck_isolated_on_background;
  
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
          src={vehImg} 
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
        <Speedometer value={currentSpeed} maxValue={maxSpeed} />
      </div>
      
      {/* Device Information */}
      <div className="grid grid-cols-3 gap-2 px-4">
        <div className="bg-gray-900 p-3 rounded">
          <div className="text-xs text-gray-400 mb-1">Ignition</div>
          <div className="text-sm font-medium">On</div>
        </div>
        <div className="bg-gray-900 p-3 rounded">
          <div className="text-xs text-gray-400 mb-1">IMEI</div>
          <div className="text-sm font-medium truncate">{deviceId}</div>
        </div>
        <div className="bg-gray-900 p-3 rounded">
          <div className="text-xs text-gray-400 mb-1">GST</div>
          <div className="text-sm font-medium">7656709987</div>
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