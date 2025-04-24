import React from 'react';

interface GraphProps {
  // Will be implemented later
}

const Graph: React.FC<GraphProps> = () => {
  return (
    <div className="h-32 p-4 bg-white border-t border-gray-200">
      <div className="flex items-end justify-around h-full">
        {/* Placeholder for graph bars */}
        <div className="w-8 bg-blue-500 h-1/2 rounded-t"></div>
        <div className="w-8 bg-blue-500 h-3/4 rounded-t"></div>
        <div className="w-8 bg-blue-500 h-full rounded-t"></div>
        <div className="w-8 bg-blue-500 h-2/3 rounded-t"></div>
        <div className="w-8 bg-blue-500 h-1/4 rounded-t"></div>
        <div className="w-8 bg-blue-500 h-1/3 rounded-t"></div>
      </div>
      
      <div className="mt-2 text-center text-sm text-gray-500">
        Graph functionality will be implemented later
      </div>
    </div>
  );
};

export default Graph;