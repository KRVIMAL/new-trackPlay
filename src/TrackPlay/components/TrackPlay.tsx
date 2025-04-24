import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Header from "./Header";
import MapDisplay from "./MapDisplay";
import VehicleInfo from "./VehicleInfo";
import Controls from "./Controls";
import Graph from "./Graph";

// Constants
const GOOGLE_MAPS_API_KEY: string = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";
const BASE_URL = "https://api-dev.k8s.imztech.io/api/v1/track-play";
const TRIP_API_URL = "http://localhost:9099/trip";

// Sample IMEI list for dropdown
const SAMPLE_IMEI_LIST = [
  { value: "937066763492", label: "937066763492" },
  { value: "700070635325", label: "700070635325" },
  { value: "700070635326", label: "700070635326" },
  { value: "800070635323", label: "800070635323" },
  { value: "900070635323", label: "900070635323" },
  { value: "700080635323", label: "700080635323" },
  { value: "700090635323", label: "700090635323" },
];

// Interface definitions
interface TrackDataPoint {
  _id: string;
  latitude: number;
  longitude: number;
  imei: string;
  altitude: number;
  bearing: number;
  dateTime: string;
}

interface TrackDataResponse {
  success: boolean;
  count: number;
  data: TrackDataPoint[];
}

const TrackPlay: React.FC = () => {
  // Route params
  const params = useParams();
  const tripId = params.tripId;
  
  // Map and animation state
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [polyline, setPolyline] = useState<google.maps.Polyline | null>(null);
  const [startMarker, setStartMarker] = useState<google.maps.Marker | null>(null);
  const [endMarker, setEndMarker] = useState<google.maps.Marker | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const animationRef = useRef<number | null>(null);
  const countRef = useRef<number>(0);
  const [animationSpeed, setAnimationSpeed] = useState<number>(20);
  
  // Data and UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trackData, setTrackData] = useState<TrackDataPoint[]>([]);
  const [selectedImei, setSelectedImei] = useState<string>("937066763492");
  const [startDate, setStartDate] = useState<string>("2025-03-18T10:07:58Z");
  const [endDate, setEndDate] = useState<string>("2025-03-18T10:08:57Z");
  const [tripDataLoaded, setTripDataLoaded] = useState<boolean>(false);
  
  // Current track data point for vehicle info display
  const [currentPoint, setCurrentPoint] = useState<TrackDataPoint | null>(null);
  
  // Date conversion helpers
  const convertTimestampToISOString = (timestamp: number): string => {
    const date = new Date(timestamp);
    
    const istOffsetHours = 5;
    const istOffsetMinutes = 30;
    
    date.setUTCHours(date.getUTCHours() + istOffsetHours);
    date.setUTCMinutes(date.getUTCMinutes() + istOffsetMinutes);
    
    return date.toISOString().slice(0, -1);
  };

  const convertToIST = (localDateTimeStr: string): string => {
    if (!localDateTimeStr) return "";
    
    const localDate = new Date(localDateTimeStr);
    
    const year = localDate.getFullYear();
    const month = String(localDate.getMonth() + 1).padStart(2, '0');
    const day = String(localDate.getDate()).padStart(2, '0');
    const hours = String(localDate.getHours()).padStart(2, '0');
    const minutes = String(localDate.getMinutes()).padStart(2, '0');
    const seconds = String(localDate.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  };

  // Format date for display
  const formatDateForDisplay = (dateString: string): string => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    };
    
    const formattedDate = date.toLocaleDateString('en-US', options);
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'short' });
    
    return `${formattedDate.split(',')[0]} ${date.getFullYear()} (${dayOfWeek}) | ${
      formattedDate.split(',')[1].trim()
    }`;
  };

  // Fetch trip data on initial load if tripId is provided
  useEffect(() => {
    const fetchTripData = async () => {
      if (!tripId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response: any = await axios.get<any>(`${TRIP_API_URL}/${tripId}`);
        if (response.data.success && response.data.data) {
          const { vehicleDetails, tripDetails } = response.data.data;
          const imei = vehicleDetails.vehicleNumber.device.imei;
          const startDateISO = convertTimestampToISOString(tripDetails.tripExpectedStartDate);
          const endDateISO = convertTimestampToISOString(tripDetails.tripExpectedEndDate);
       
          setSelectedImei(imei);
          setStartDate(startDateISO);
          setEndDate(endDateISO);
          setTripDataLoaded(true);
        } else {
          setError("Failed to fetch trip data");
        }
      } catch (err) {
        setError(`Error fetching trip data: ${err instanceof Error ? err.message : 'Unknown error'}`);
        console.error("Error fetching trip data:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTripData();
  }, [tripId]);

  // Auto fetch track data after trip data is loaded
  useEffect(() => {
    if (tripDataLoaded && tripId) {
      fetchTrackData();
      setTripDataLoaded(false); // Reset to prevent multiple calls
    }
  }, [tripDataLoaded]);

  // Fetch track data function
  const fetchTrackData = async () => {
    if (!selectedImei || !startDate || !endDate) {
      setError("Please select IMEI, start date, and end date");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    // Clear existing markers and polyline
    if (startMarker) startMarker.setMap(null);
    if (endMarker) endMarker.setMap(null);
    if (polyline) polyline.setMap(null);
    
    // Reset animation
    handleReset();
    
    try {
      // Convert local times to UTC for API request
      const istStartDate = convertToIST(startDate);
      const istEndDate = convertToIST(endDate);
      
      const response = await axios.get<TrackDataResponse>(
        `${BASE_URL}/trackdata`,
        {
          params: {
            startDate: istStartDate,
            endDate: istEndDate,
            imei: selectedImei
          },
          headers: {
            "Content-Type": "application/json",
          }
        }
      );
      
      if (response.data.success && response.data.data.length > 0) {
        setTrackData(response.data.data);
        
        // Set current point to first point for initial display
        setCurrentPoint(response.data.data[0]);
      } else {
        setError("No track data available for the selected criteria");
      }
    } catch (err) {
      setError("Failed to fetch track data");
      console.error("Error fetching track data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Animation functions
  const animateSymbol = (line: google.maps.Polyline) => {
    animationRef.current = window.setInterval(() => {
      countRef.current = (countRef.current + 1) % 201;
      
      if (line && line.get) {
        const icons = line.get("icons");
        if (icons && icons[0]) {
          // Calculate offset from 0% to 100%
          icons[0].offset = (countRef.current / 2) + "%";
          line.set("icons", icons);
          
          // Update current point based on animation progress
          if (trackData.length > 0) {
            const pointIndex = Math.min(
              Math.floor((countRef.current / 200) * trackData.length),
              trackData.length - 1
            );
            setCurrentPoint(trackData[pointIndex]);
          }
  
          // Stop at 100%
          if (countRef.current === 200) {
            if (animationRef.current) {
              window.clearInterval(animationRef.current);
            }
            setIsPlaying(false);
          }
        }
      }
    }, animationSpeed);
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      if (animationRef.current) {
        window.clearInterval(animationRef.current);
      }
      setIsPlaying(false);
    } else {
      if (polyline) {
        setIsPlaying(true);
        animateSymbol(polyline);
      }
    }
  };

  const handleReset = () => {
    if (animationRef.current) {
      window.clearInterval(animationRef.current);
    }
    setIsPlaying(false);
    countRef.current = 0;
    
    // Reset to first point
    if (trackData.length > 0) {
      setCurrentPoint(trackData[0]);
    }
    
    if (polyline && polyline.get) {
      const icons = polyline.get("icons");
      if (icons && icons[0]) {
        icons[0].offset = "0%";
        polyline.set("icons", icons);
      }
    }
  };

  const handleSpeedIncrease = () => {
    if (animationSpeed > 5) {
      setAnimationSpeed(prev => prev - 5);
    }
  };

  const handleSpeedDecrease = () => {
    setAnimationSpeed(prev => prev + 5);
  };

  // Update polyline when map is available
  const handleMapReady = (mapInstance: google.maps.Map) => {
    setMap(mapInstance);
  };

  // Handle polyline creation
  const handlePolylineCreated = (polylineInstance: google.maps.Polyline) => {
    setPolyline(polylineInstance);
  };

  // Create start and end markers when track data is updated
  useEffect(() => {
    if (!map || trackData.length === 0) return;

    // Clean up previous markers
    if (startMarker) startMarker.setMap(null);
    if (endMarker) endMarker.setMap(null);

    try {
      const path = trackData.map((point) => ({
        lat: point.latitude,
        lng: point.longitude,
      }));

      // Create start marker (green)
      if (path.length > 0) {
        const startPoint = path[0];
        const newStartMarker = new google.maps.Marker({
          position: startPoint,
          map: map,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: "#4CAF50",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 2,
          },
          title: "Start Point"
        });
        setStartMarker(newStartMarker);
        
        // End marker (red)
        const endPoint = path[path.length - 1];
        const newEndMarker = new google.maps.Marker({
          position: endPoint,
          map: map,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: "#f44336",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 2,
          },
          title: "End Point"
        });
        setEndMarker(newEndMarker);
      }
    } catch (error) {
      console.error("Error creating markers:", error);
    }
  }, [map, trackData]);

  // Reset animation when speed changes while playing
  useEffect(() => {
    if (isPlaying && polyline) {
      if (animationRef.current) {
        window.clearInterval(animationRef.current);
      }
      animateSymbol(polyline);
    }
  }, [animationSpeed]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        window.clearInterval(animationRef.current);
      }
    };
  }, []);

  // Parse vehicle information for display
  const getVehicleInfo = () => {
    if (!currentPoint) return {
      dateTime: formatDateForDisplay(new Date().toISOString()),
      speed: 0,
      deviceId: selectedImei
    };

    return {
      dateTime: formatDateForDisplay(currentPoint.dateTime),
      speed: Math.round(Math.random() * 100), // Mocked speed value
      deviceId: currentPoint.imei
    };
  };

  const vehicleInfo = getVehicleInfo();

  return (
    <div className="flex flex-col h-full">
      {/* Header with filters and buttons */}
      <Header 
        selectedImei={selectedImei}
        startDate={startDate}
        endDate={endDate}
        onImeiChange={setSelectedImei}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onShowRoute={fetchTrackData}
        onShowDrivingReport={() => console.log("Show driving report - will be implemented later")}
        imeiList={SAMPLE_IMEI_LIST}
      />
      
      {/* Main content area */}
      <div className="flex flex-col md:flex-row gap-4 px-4 py-4 h-[724px]">
        {/* Left side - Map */}
        <div className="w-full md:w-[calc(100%-423px)] h-full relative rounded-[14px] overflow-hidden border border-gray-200 shadow-sm">
          <MapDisplay 
            apiKey={GOOGLE_MAPS_API_KEY}
            trackData={trackData}
            isLoading={loading}
            onMapReady={handleMapReady}
            onPolylineCreated={handlePolylineCreated}
            startMarker={startMarker}
            endMarker={endMarker}
            polyline={polyline}
          />
          
          {/* Error Messages */}
          {error && (
            <div className="absolute top-2.5 left-1/2 transform -translate-x-1/2 bg-red-100 text-red-800 p-2.5 px-5 rounded shadow-md z-10">
              {error}
            </div>
          )}
        </div>
        
        {/* Right side - Vehicle Info */}
        <div className="w-full md:w-[423px] h-full rounded-[14px] overflow-hidden border border-gray-200 shadow-sm">
          <VehicleInfo 
            dateTime={vehicleInfo.dateTime}
            vehicleName="Vehicle model name"
            currentSpeed={vehicleInfo.speed}
            maxSpeed={160}
            deviceId={vehicleInfo.deviceId}
            startFuel={71}
            endFuel={19}
            fuelUsed={52}
            mileage={8.68}
          />
        </div>
      </div>
      
      {/* Footer with controls and graph */}
      <div className="flex flex-col mt-auto">
        {/* Playback Controls */}
        <Controls 
          isPlaying={isPlaying}
          disabled={!polyline || loading}
          animationSpeed={animationSpeed}
          onPlayPause={handlePlayPause}
          onReset={handleReset}
          onSpeedIncrease={handleSpeedIncrease}
          onSpeedDecrease={handleSpeedDecrease}
        />
        
        {/* Graph (placeholder) */}
        <Graph />
      </div>
    </div>
  );
};

export default TrackPlay;
