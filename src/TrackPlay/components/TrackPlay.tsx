import React, { useEffect, useRef, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Header from "./Header";
import MapDisplay from "./MapDisplay";
import VehicleInfo from "./VehicleInfo";
import Controls from "./Controls";
import Graph from "./Graph";

// Constants
const GOOGLE_MAPS_API_KEY: string =import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";
const TRACK_PLAY_BASE_URL = import.meta.env.VITE_TRACK_PLAY_BASE_URL;
const TRIP_API_URL = import.meta.env.VITE_TRIP_API_URL;

// Toggle between API and local JSON file data
// Set to true to use local JSON file data, false to use API data
const USE_LOCAL_JSON = true;

// Sample IMEI list for dropdown
const SAMPLE_IMEI_LIST = [
  { value: "937066763492", label: "937066763492" },
  { value: "700070635325", label: "700070635325" },
  { value: "700070635326", label: "700070635326" },
  { value: "800070635323", label: "800070635323" },
  { value: "900070635323", label: "900070635323" },
  { value: "700080635323", label: "700080635323" },
  { value: "700090635323", label: "700090635323" },
  { value: "688056026976", label: "688056026976" }, // Added from JSON sample
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
  speed?: number; // Added speed as optional field
}

interface TrackDataResponse {
  success: boolean;
  count: number;
  data: TrackDataPoint[];
}

// Raw JSON data interface to match the structure in trackData.json
interface RawJsonDataPoint {
  _id: {
    $oid: string;
  };
  latitude: number;
  longitude: number;
  imei: string;
  altitude: number;
  bearing: number;
  dateTime: string;
  speed: number;
  statusBitDefinition?: any;
  alarmFlagBit?: any;
  deviceType?: string;
  headerIdentifier?: string;
  packetType?: string;
  serialNo?: string;
  messageProperty?: string;
  "Additional Data"?: any[];
}

const TrackPlay: React.FC = () => {
  // Route params
  const params = useParams();
  const tripId = params.tripId;

  // Map and animation state
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [polyline, setPolyline] = useState<google.maps.Polyline | null>(null);
  const [startMarker, setStartMarker] = useState<google.maps.Marker | null>(
    null
  );
  const [endMarker, setEndMarker] = useState<google.maps.Marker | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const animationRef = useRef<number | null>(null);
  const countRef = useRef<number>(0);
  const [animationSpeed, setAnimationSpeed] = useState<number>(20);

  // Data and UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trackData, setTrackData] = useState<TrackDataPoint[]>([]);
  const [selectedImei, setSelectedImei] = useState<string>("688056026976"); // Changed default to match JSON data
  const [startDate, setStartDate] = useState<string>("2025-03-12T11:39:00Z"); // Changed to match JSON data
  const [endDate, setEndDate] = useState<string>("2025-03-12T11:41:00Z"); // Changed to match JSON data
  const [tripDataLoaded, setTripDataLoaded] = useState<boolean>(false);

  // Current track data point for vehicle info display
  const [currentPoint, setCurrentPoint] = useState<TrackDataPoint | null>(null);

  // Make callbacks stable with useCallback to prevent infinite loops
  const handleMapReady = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
  }, []);

  const handlePolylineCreated = useCallback(
    (polylineInstance: google.maps.Polyline) => {
      setPolyline(polylineInstance);
    },
    []
  );

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
    const month = String(localDate.getMonth() + 1).padStart(2, "0");
    const day = String(localDate.getDate()).padStart(2, "0");
    const hours = String(localDate.getHours()).padStart(2, "0");
    const minutes = String(localDate.getMinutes()).padStart(2, "0");
    const seconds = String(localDate.getSeconds()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  };

  // Format date for display
  const formatDateForDisplay = (dateString: string): string => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    };

    const formattedDate = date.toLocaleDateString("en-US", options);
    const dayOfWeek = date.toLocaleDateString("en-US", { weekday: "short" });

    return `${formattedDate.split(",")[0]} ${date.getFullYear()} (${dayOfWeek}) | ${formattedDate
      .split(",")[1]
      .trim()}`;
  };

  // Transform raw JSON data to match API response structure
  const transformJsonData = (
    jsonData: RawJsonDataPoint[]
  ): TrackDataResponse => {
    return {
      success: true,
      count: jsonData.length,
      data: jsonData.map((item) => ({
        _id: item._id.$oid || String(item._id),
        latitude: item.latitude,
        longitude: item.longitude,
        imei: item.imei,
        altitude: item.altitude,
        bearing: item.bearing,
        dateTime: item.dateTime,
        speed: item.speed || 0,
      })),
    };
  };

  // Fetch data from local JSON file
  const fetchLocalJsonData = async () => {
    if (!selectedImei) {
      setError("Please select an IMEI");
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
      // Initialize with hardcoded data as fallback
      let jsonData = [
        {
          _id: {
            $oid: "dd65f2b8b35370cf6f923df1",
          },
          bearing: 0,
          dateTime: "2025-03-12T11:40:23Z",
          longitude: 77.193361,
          speed: 59,
          imei: "688056026976",
          latitude: 28.543625,
          altitude: 0,
        },
        {
          _id: {
            $oid: "90383474e5d882e77b002b5d",
          },
          bearing: 0,
          dateTime: "2025-03-12T11:41:23Z",
          longitude: 77.207,
          speed: 9,
          imei: "688056026976",
          latitude: 28.540184,
          altitude: 0,
        },
        {
          _id: {
            $oid: "753db44e465552d583844b62",
          },
          bearing: 0,
          dateTime: "2025-03-12T11:42:23Z",
          longitude: 77.1972,
          speed: 14,
          imei: "688056026976",
          latitude: 28.547096,
          altitude: 0,
        },
      ];

      // Attempt to fetch from file instead of using hardcoded data
      try {
        const response = await fetch("/trackdata.json");

        if (!response.ok) {
          throw new Error(
            `Failed to fetch JSON file: ${response.status} ${response.statusText}`
          );
        }

        const rawData = await response.json();
        console.log(`Successfully loaded data from JSON file`);

        // Handle both formats - direct array or nested inside getDistanceTrackPlay
        if (rawData.data && rawData.data.getDistanceTrackPlay) {
          // Format: { "data": { "getDistanceTrackPlay": [...] } }
          console.log("Found data in getDistanceTrackPlay format");

          // Convert string values to numbers
          jsonData = rawData.data.getDistanceTrackPlay.map((point: any) => ({
            _id: Math.random().toString(36).substring(2, 15), // Generate a random ID
            latitude: parseFloat(point.latitude),
            longitude: parseFloat(point.longitude),
            imei: point.imei,
            altitude: 0, // Default value as it's not in the provided data
            bearing: parseInt(point.bearing, 10) || 0,
            dateTime: new Date().toISOString(), // Use current time as the data doesn't have date
            speed: parseInt(point.speed, 10) || 0,
          }));
        } else if (Array.isArray(rawData)) {
          // Format: direct array with _id objects
          console.log("Found data in array format with MongoDB style IDs");
          jsonData = rawData;
        } else {
          console.warn("Unknown data format, falling back to hardcoded data");
        }
      } catch (fetchError) {
        console.warn("Falling back to hardcoded data:", fetchError);
        // Use the hardcoded jsonData defined above
      }

      console.log(`Processing ${jsonData.length} track data points`);

      // Filter data by IMEI and date range if provided
      const startDateTime = new Date(startDate).getTime();
      const endDateTime = new Date(endDate).getTime();

      const filteredData = jsonData.filter((item) => {
        if (!item || !item.dateTime || !item.imei) {
          console.warn("Skipping invalid data point:", item);
          return false;
        }

        const itemDateTime = new Date(item.dateTime).getTime();
        return (
          item.imei === selectedImei &&
          itemDateTime >= startDateTime &&
          itemDateTime <= endDateTime
        );
      });

      console.log(
        `Filtered to ${filteredData.length} points for IMEI ${selectedImei}`
      );

      if (filteredData.length === 0) {
        setError("No track data available for the selected criteria");
        setLoading(false);
        return;
      }

      // Transform to match API response structure
      const transformedData = {
        success: true,
        count: filteredData.length,
        data: filteredData.map((item) => ({
          _id:
            item._id && item._id.$oid
              ? item._id.$oid
              : String(item._id || Math.random().toString(36).substring(2, 15)),
          latitude:
            typeof item.latitude === "string"
              ? parseFloat(item.latitude)
              : item.latitude,
          longitude:
            typeof item.longitude === "string"
              ? parseFloat(item.longitude)
              : item.longitude,
          imei: item.imei,
          altitude: item.altitude || 0,
          bearing:
            typeof item.bearing === "string"
              ? parseInt(item.bearing, 10)
              : item.bearing || 0,
          dateTime: item.dateTime,
          speed:
            typeof item.speed === "string"
              ? parseInt(item.speed, 10)
              : item.speed || 0,
        })),
      };

      setTrackData(transformedData.data);
      setCurrentPoint(transformedData.data[0]);
    } catch (err) {
      setError(
        `Failed to process data: ${err instanceof Error ? err.message : "Unknown error"}`
      );
      console.error("Error processing data:", err);
    } finally {
      setLoading(false);
    }
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
          const startDateISO = convertTimestampToISOString(
            tripDetails.tripExpectedStartDate
          );
          const endDateISO = convertTimestampToISOString(
            tripDetails.tripExpectedEndDate
          );

          setSelectedImei(imei);
          setStartDate(startDateISO);
          setEndDate(endDateISO);
          setTripDataLoaded(true);
        } else {
          setError("Failed to fetch trip data");
        }
      } catch (err) {
        setError(
          `Error fetching trip data: ${err instanceof Error ? err.message : "Unknown error"}`
        );
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
      if (USE_LOCAL_JSON) {
        fetchLocalJsonData();
      } else {
        fetchTrackData();
      }
      setTripDataLoaded(false); // Reset to prevent multiple calls
    }
  }, [tripDataLoaded, tripId]);

  // Fetch track data from API function
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
        `${TRACK_PLAY_BASE_URL}/trackdata`,
        {
          params: {
            startDate: istStartDate,
            endDate: istEndDate,
            imei: selectedImei,
          },
          headers: {
            "Content-Type": "application/json",
          },
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
          icons[0].offset = countRef.current / 2 + "%";
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
      setAnimationSpeed((prev) => prev - 5);
    }
  };

  const handleSpeedDecrease = () => {
    setAnimationSpeed((prev) => prev + 5);
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
          title: "Start Point",
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
          title: "End Point",
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
  }, [animationSpeed, isPlaying, polyline]);

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
    if (!currentPoint)
      return {
        dateTime: formatDateForDisplay(new Date().toISOString()),
        speed: 0,
        deviceId: selectedImei,
      };

    return {
      dateTime: formatDateForDisplay(currentPoint.dateTime),
      speed:
        currentPoint.speed !== undefined
          ? currentPoint.speed
          : Math.round(Math.random() * 100), // Use actual speed if available
      deviceId: currentPoint.imei,
    };
  };

  const vehicleInfo = getVehicleInfo();

  // Handle "Show Route" button click
  const handleShowRoute = () => {
    if (USE_LOCAL_JSON) {
      fetchLocalJsonData();
    } else {
      fetchTrackData();
    }
  };

  // Step forward/backward in the track animation
  const handleStepForward = () => {
    if (!trackData.length || !polyline) return;

    // Move forward 10 seconds equivalent
    const stepSize = 10;
    const newPosition = Math.min(countRef.current + stepSize, 200);
    countRef.current = newPosition;

    // Apply to polyline
    if (polyline && polyline.get) {
      const icons = polyline.get("icons");
      if (icons && icons[0]) {
        icons[0].offset = countRef.current / 2 + "%";
        polyline.set("icons", icons);

        // Update current point
        if (trackData.length > 0) {
          const pointIndex = Math.min(
            Math.floor((countRef.current / 200) * trackData.length),
            trackData.length - 1
          );
          setCurrentPoint(trackData[pointIndex]);
        }
      }
    }
  };
  const handleStepBackward = () => {
    if (!trackData.length || !polyline) return;

    // Move backward 10 seconds equivalent
    const stepSize = 10;
    const newPosition = Math.max(countRef.current - stepSize, 0);
    countRef.current = newPosition;

    // Apply to polyline
    if (polyline && polyline.get) {
      const icons = polyline.get("icons");
      if (icons && icons[0]) {
        icons[0].offset = countRef.current / 2 + "%";
        polyline.set("icons", icons);

        // Update current point
        if (trackData.length > 0) {
          const pointIndex = Math.min(
            Math.floor((countRef.current / 200) * trackData.length),
            trackData.length - 1
          );
          setCurrentPoint(trackData[pointIndex]);
        }
      }
    }
  };

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
        onShowRoute={handleShowRoute}
        onShowDrivingReport={() =>
          console.log("Show driving report - will be implemented later")
        }
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
      <div className="flex flex-col md:flex-row gap-4 px-4 py-4">
        {/* Playback Controls */}
        <Controls
          isPlaying={isPlaying}
          disabled={!polyline || loading}
          animationSpeed={animationSpeed}
          onPlayPause={handlePlayPause}
          onReset={handleReset}
          onSpeedIncrease={handleSpeedIncrease}
          onSpeedDecrease={handleSpeedDecrease}
          onStepForward={handleStepForward}
          onStepBackward={handleStepBackward}
        />

        {/* Graph (placeholder) */}
        <Graph />
      </div>
    </div>
  );
};

export default TrackPlay;
