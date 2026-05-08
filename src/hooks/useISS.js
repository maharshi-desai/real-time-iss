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

  const fetchISSData = async () => {
    try {
      const now = Date.now();
      const res = await axios.get('https://api.wheretheiss.at/v1/satellites/25544');
      const newPos = {
        lat: parseFloat(res.data.latitude),
        lng: parseFloat(res.data.longitude),
        timestamp: res.data.timestamp,
        localTime: new Date(now).toLocaleTimeString()
      };

      setPosition(prevPos => {
        if (prevPos && lastFetchTimeRef.current) {
          // Calculate time difference in seconds
          const timeDiff = (now - lastFetchTimeRef.current) / 1000;
          if (timeDiff > 0) {
            const speed = calculateSpeed(prevPos, newPos, timeDiff);
            
            setSpeedHistory(prev => {
              const newHistory = [...prev, { time: newPos.localTime, speed: speed }];
              if (newHistory.length > 30) return newHistory.slice(newHistory.length - 30);
              return newHistory;
            });
          }
        }
        return newPos;
      });

      setTrajectory(prev => {
        const newTraj = [...prev, newPos];
        if (newTraj.length > 15) return newTraj.slice(newTraj.length - 15);
        return newTraj;
      });

      lastFetchTimeRef.current = now;

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
