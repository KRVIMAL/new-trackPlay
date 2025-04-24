import React, { useState } from 'react';

interface HeaderProps {
  selectedImei: string;
  startDate: string;
  endDate: string;
  onImeiChange: (imei: string) => void;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onShowRoute: () => void;
  onShowDrivingReport: () => void;
  imeiList: { value: string; label: string }[];
}

const Header: React.FC<HeaderProps> = ({
  selectedImei,
  startDate,
  endDate,
  onImeiChange,
  onStartDateChange,
  onEndDateChange,
  onShowRoute,
  onShowDrivingReport,
  imeiList
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showImeiDropdown, setShowImeiDropdown] = useState<boolean>(false);

  const handleImeiSelect = (imei: string) => {
    onImeiChange(imei);
    setShowImeiDropdown(false);
  };

  const filteredImeiList = imeiList.filter(imei => 
    imei.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
    imei.value.includes(searchQuery)
  );

  const formatDateForInput = (dateString: string) => {
    return dateString.replace('Z', '');
  };

  return (
    <div className="flex justify-between items-center py-3 px-8 bg-white">
      {/* Account Dropdown (static) */}
      <div 
        className="w-[190px] h-[38px] bg-[#F1F1F1] rounded-[10px] px-3 flex items-center"
      >
        <span className="text-gray-600">Account</span>
        <span className="ml-auto">▼</span>
      </div>

      {/* Device/IMEI Dropdown */}
      <div className="relative">
        <div 
          className="w-[190px] h-[38px] bg-[#F1F1F1] rounded-[10px] px-3 flex items-center cursor-pointer"
          onClick={() => setShowImeiDropdown(!showImeiDropdown)}
        >
          <span className="text-gray-600">
            {selectedImei ? ` ${selectedImei}` : 'Select Device'}
          </span>
          <span className="ml-auto">▼</span>
        </div>

        {showImeiDropdown && (
          <div className="absolute top-full left-0 right-0 border border-gray-300 rounded-b bg-white max-h-48 overflow-y-auto z-20 shadow-lg mt-1">
            <input
              type="text"
              placeholder="Search IMEI..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="w-full p-2 border-0 border-b border-gray-200 outline-none"
            />
            
            {filteredImeiList.length === 0 ? (
              <div className="p-2 text-gray-500 text-center">
                No IMEI found
              </div>
            ) : (
              filteredImeiList.map((imei) => (
                <div 
                  key={imei.value}
                  className={`p-2 cursor-pointer border-b border-gray-100 hover:bg-gray-50 ${selectedImei === imei.value ? 'bg-blue-50' : ''}`}
                  onClick={() => handleImeiSelect(imei.value)}
                >
                  {imei.label}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Start Date */}
      <div className="w-[270px] h-[38px] bg-[#F1F1F1] rounded-[10px] px-3 flex items-center">
        <input
          type="datetime-local"
          value={formatDateForInput(startDate)}
          onChange={(e) => onStartDateChange(e.target.value)}
          className="bg-transparent border-0 outline-none text-gray-600 w-full"
          placeholder="Start Date"
        />
        {!startDate && (
          <span className="absolute text-gray-500 pointer-events-none left-3">Start Date</span>
        )}
      </div>

      {/* End Date */}
      <div className="relative w-[270px] h-[38px] bg-[#F1F1F1] rounded-[10px] px-3 flex items-center">
        <input
          type="datetime-local"
          value={formatDateForInput(endDate)}
          onChange={(e) => onEndDateChange(e.target.value)}
          className="bg-transparent border-0 outline-none text-gray-600 w-full"
          placeholder="End Date"
        />
        {!endDate && (
          <span className="absolute text-gray-500 pointer-events-none left-3">End Date</span>
        )}
      </div>

      {/* Action Buttons */}
      <button
        onClick={onShowRoute}
        className="w-[150px] h-[38px] bg-[#187CFF] text-white rounded-[10px] hover:bg-blue-600 transition-colors"
      >
        Show Route
      </button>
      
      <button
        onClick={onShowDrivingReport}
        className="w-[228px] h-[38px] bg-[#187CFF] text-white rounded-[10px] hover:bg-blue-600 transition-colors"
      >
        Show Driving Report
      </button>
    </div>
  );
};

export default Header;