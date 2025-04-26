import React from 'react';
import { FaGasPump, FaRulerHorizontal } from 'react-icons/fa';
import box_truck_isolated_on_background from "../../assets/images/box_truck_isolated_on_background 1.svg";

const HalfCircleSpeedometer = ({ speed, maxSpeed = 160 }:any) => {
  // Speed configuration
  const min = 0;
  const max = maxSpeed;
  const unit = 'km/h';
  
  // Segment colors
  const segments = [
    { value: 60, color: '#3b82f6' }, // blue
    { value: 120, color: '#22c55e' }, // green
    { value: 160, color: '#f97316' }, // orange
  ];
  
  // Ensure value is within bounds
  const boundedValue = Math.min(Math.max(speed, min), max);
  const percentage = ((boundedValue - min) / (max - min)) * 100;
  
  // Calculate angles for the needle
  const startAngle = 180;
  const endAngle = 0;
  const angleRange = startAngle - endAngle;
  const valueAngle = startAngle - (percentage / 100) * angleRange;
  const valueRadians = (valueAngle * Math.PI) / 180;
  
  // Calculate needle coordinates
  const needleLength = 80;
  const centerX = 100;
  const centerY = 100;
  
  // All speed marks to display with labels
  const speedMarks = [0, 20, 40, 60, 80, 100, 120, 140, 160];
  
  // Minor tick marks without labels
  const minorMarks = [10, 30, 50, 70, 90, 110, 130, 150];
  
  return (
    <div className="relative w-full flex flex-col items-center">
      <svg width="100%" height="140" viewBox="0 -20 200 160">
        {/* Background half circle */}
        <path
          d="M 20,100 A 80,80 0 0,1 180,100"
          fill="none"
          stroke="black"
          strokeWidth="20"
        />
        
        {/* Gauge segments */}
        <path
          d="M 20,100 A 80,80 0 0,1 100,20"
          fill="none"
          stroke={segments[0].color}
          strokeWidth="20"
        />
        <path
          d="M 100,20 A 80,80 0 0,1 180,100"
          fill="none"
          stroke={segments[2].color}
          strokeWidth="20"
        />
        
        {/* Major tick marks with speed labels */}
        {speedMarks.map((tickSpeed, index) => {
          // Calculate position on the arc
          const angle = Math.PI * (1 - tickSpeed / max);
          const tickX = 100 + 90 * Math.cos(angle);
          const tickY = 100 - 90 * Math.sin(angle);
          const lineEndX = 100 + 70 * Math.cos(angle);
          const lineEndY = 100 - 70 * Math.sin(angle);
          
          // Calculate label position
          const labelX = 100 + 110 * Math.cos(angle);
          const labelY = 100 - 110 * Math.sin(angle);
          
          // Determine text anchor based on position
          let textAnchor = "middle";
          if (tickSpeed <= 20) textAnchor = "start";
          if (tickSpeed >= 140) textAnchor = "end";
          
          return (
            <React.Fragment key={`tick-${tickSpeed}`}>
              {/* Tick line */}
              <line
                x1={lineEndX}
                y1={lineEndY}
                x2={tickX}
                y2={tickY}
                stroke="white"
                strokeWidth="2"
              />
              
              {/* Speed label */}
              <text
                x={labelX}
                y={labelY}
                textAnchor={textAnchor}
                fill="white"
                fontSize="12"
                fontWeight="bold"
                dominantBaseline="middle"
              >
                {tickSpeed}
              </text>
            </React.Fragment>
          );
        })}
        
        {/* Minor tick marks */}
        {minorMarks.map((tickSpeed) => {
          const angle = Math.PI * (1 - tickSpeed / max);
          const tickX = 100 + 85 * Math.cos(angle);
          const tickY = 100 - 85 * Math.sin(angle);
          const lineEndX = 100 + 75 * Math.cos(angle);
          const lineEndY = 100 - 75 * Math.sin(angle);
          
          return (
            <line
              key={`minor-${tickSpeed}`}
              x1={lineEndX}
              y1={lineEndY}
              x2={tickX}
              y2={tickY}
              stroke="white"
              strokeWidth="1"
            />
          );
        })}
        
        {/* Needle */}
        <line
          x1={100}
          y1={100}
          x2={100 + needleLength * Math.cos(valueRadians)}
          y2={100 - needleLength * Math.sin(valueRadians)}
          stroke="red"
          strokeWidth="2"
          strokeLinecap="round"
        />
        
        {/* Needle center */}
        <circle
          cx={100}
          cy={100}
          r={5}
          fill="red"
        />
        
        {/* Speed value display */}
        <text
          x={100}
          y={75}
          textAnchor="middle"
          fill="white"
          fontSize="24"
          fontWeight="bold"
        >
          {Math.round(boundedValue)}
        </text>
        
        {/* Unit display */}
        <text
          x={100}
          y={90}
          textAnchor="middle"
          fill="white"
          fontSize="14"
        >
          {unit}
        </text>
      </svg>
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
        <HalfCircleSpeedometer speed={currentSpeed} maxSpeed={maxSpeed} />
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