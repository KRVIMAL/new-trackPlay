import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Scatter } from 'recharts';

interface GraphProps {
  data?: any[];
}

const Graph: React.FC<GraphProps> = ({ data = [] }) => {
  // If no data is provided, use sample data
  const sampleData = [
    { time: 'Mon 16', speed: 0, ignition: 1, moving: 0, events: [] },
    { time: 'Mon 16 08:00', speed: 20, ignition: 1, moving: 1, events: [] },
    { time: 'Mon 16 10:00', speed: 65, ignition: 1, moving: 1, events: ['yellowOrange'] },
    { time: 'Mon 16 12:00', speed: 45, ignition: 1, moving: 1, events: [] },
    { time: 'Mon 16 14:00', speed: 0, ignition: 1, moving: 0, events: [] },
    { time: 'Mon 16 16:00', speed: 70, ignition: 1, moving: 1, events: ['orangeRed'] },
    { time: 'Mon 16 18:00', speed: 55, ignition: 1, moving: 1, events: [] },
    { time: 'Mon 16 20:00', speed: 0, ignition: 0, moving: 0, events: [] },
    { time: 'Tue 17', speed: 0, ignition: 0, moving: 0, events: [] },
    { time: 'Tue 17 08:00', speed: 40, ignition: 1, moving: 1, events: ['yellowOrange'] },
    { time: 'Tue 17 10:00', speed: 60, ignition: 1, moving: 1, events: [] },
    { time: 'Tue 17 12:00', speed: 0, ignition: 1, moving: 0, events: [] },
    { time: 'Tue 17 14:00', speed: 50, ignition: 1, moving: 1, events: ['orangeRed'] },
    { time: 'Tue 17 16:00', speed: 30, ignition: 1, moving: 1, events: [] },
    { time: 'Tue 17 18:00', speed: 0, ignition: 0, moving: 0, events: [] },
    { time: 'Wed 18', speed: 0, ignition: 0, moving: 0, events: [] },
    { time: 'Wed 18 09:00', speed: 35, ignition: 1, moving: 1, events: ['orangeRed'] },
    { time: 'Wed 18 12:00', speed: 0, ignition: 1, moving: 0, events: [] },
    { time: 'Wed 18 15:00', speed: 0, ignition: 0, moving: 0, events: [] },
    { time: 'Wed 18 18:00', speed: 80, ignition: 1, moving: 1, events: ['yellowOrange', 'orangeRed'] },
    { time: 'Thu 19', speed: 0, ignition: 0, moving: 0, events: [] },
  ];

  const chartData = data.length > 0 ? data : sampleData;

  // Create separate arrays for event markers
  const yellowOrangeEvents:any = [];
  const orangeRedEvents:any = [];
  
  chartData.forEach((item, index) => {
    if (item.events && item.events.includes('yellowOrange')) {
      yellowOrangeEvents.push({ time: item.time, speed: item.speed, value: item.speed });
    }
    if (item.events && item.events.includes('orangeRed')) {
      orangeRedEvents.push({ time: item.time, speed: item.speed, value: item.speed });
    }
  });

  return (
    <div className="w-full h-[108px] bg-white rounded-[14px] p-2 shadow-md overflow-hidden">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
        >
          <XAxis 
            dataKey="time" 
            tick={{ fontSize: 10 }}
            interval="preserveStartEnd"
            tickFormatter={(value:any) => {
              // Only show day names (Mon, Tue, etc.)
              if (value.includes(" ")) {
                return value.split(" ")[0];
              }
              return value;
            }}
          />
          <YAxis hide />
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <Tooltip />
          <Legend />
          
          {/* Ignition Status - Blue */}
          <Line 
            type="stepAfter" 
            dataKey="ignition" 
            stroke="#4285F4" 
            name="Ignition" 
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
          
          {/* Moving Status - Green */}
          <Line 
            type="stepAfter" 
            dataKey="moving" 
            stroke="#34A853" 
            name="Moving" 
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
          
          {/* Speed - Red */}
          <Line 
            type="monotone" 
            dataKey="speed" 
            stroke="#EA4335" 
            name="Speed" 
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
          
          {/* Event Markers - Yellow Orange */}
          <Scatter 
            name="Events" 
            data={yellowOrangeEvents} 
            fill="#FBBC05" 
            line={false} 
            shape="circle"
            isAnimationActive={false}
          />
          
          {/* Event Markers - Orange Red */}
          <Scatter 
            name="Events" 
            data={orangeRedEvents} 
            fill="#FF6D01" 
            line={false} 
            shape="circle"
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Graph;