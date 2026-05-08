import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { calculateSpeed } from '../utils/haversine';

export function useISS() {
  const [position, setPosition] = useState(null);
  const [trajectory, setTrajectory] = useState([]);
  const [speedHistory, setSpeedHistory] = useState([]);
  const [astronauts, setAstronauts] = useState({ count: 0, names: [] });
  const lastFetchTimeRef = useRef(null);
  
  const autoRefreshRef = useRef(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    autoRefreshRef.current = autoRefresh;
  }, [autoRefresh]);

  const prevPositionRef = useRef(null); // tracks last position for haversine

  const fetchISSData = async () => {
    try {
      const now = Date.now();
      const res = await axios.get(`https://api.wheretheiss.at/v1/satellites/25544?t=${Date.now()}`);

      const newPos = {
        lat: parseFloat(res.data.latitude),
        lng: parseFloat(res.data.longitude),
        timestamp: res.data.timestamp,
        localTime: new Date(now).toLocaleTimeString()
      };

      // Calculate speed using haversine formula between consecutive positions
      if (prevPositionRef.current && lastFetchTimeRef.current) {
        const timeDiff = (now - lastFetchTimeRef.current) / 1000; // seconds
        if (timeDiff > 0) {
          const speed = calculateSpeed(prevPositionRef.current, newPos, timeDiff);
          setSpeedHistory(prev => {
            const newHistory = [...prev, { time: newPos.localTime, speed }];
            return newHistory.length > 30 ? newHistory.slice(-30) : newHistory;
          });
        }
      } else {
        // First data point — seed chart with API velocity (already in km/h)
        const seedSpeed = res.data.velocity;
        setSpeedHistory([{ time: newPos.localTime, speed: seedSpeed }]);
      }

      // Update refs BEFORE setting state
      prevPositionRef.current = newPos;
      lastFetchTimeRef.current = now;

      setPosition(newPos);
      setTrajectory(prev => {
        const newTraj = [...prev, newPos];
        return newTraj.length > 15 ? newTraj.slice(-15) : newTraj;
      });

    } catch (error) {
      console.error("Error fetching ISS location:", error);
      if (error.response && error.response.status === 429) {
        setAutoRefresh(false);
        console.warn("Rate limit exceeded. Auto-refresh paused.");
      }
    }
  };

  const fetchAstronauts = async () => {
    try {
      const res = await axios.get('/api/open-notify/astros.json');
      const issAstros = res.data.people.filter(p => p.craft === 'ISS');
      setAstronauts({
        count: issAstros.length,
        names: issAstros.map(p => p.name)
      });
    } catch (error) {
      console.error("Error fetching astronauts:", error);
    }
  };

  useEffect(() => {
    fetchAstronauts();
    fetchISSData();

    const interval = setInterval(() => {
      if (autoRefreshRef.current) {
        fetchISSData();
      }
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const toggleAutoRefresh = () => {
    setAutoRefresh(prev => !prev);
  };

  const manualRefresh = () => {
    fetchISSData();
  };

  return {
    position,
    trajectory,
    speedHistory,
    astronauts,
    autoRefresh,
    toggleAutoRefresh,
    manualRefresh
  };
}
