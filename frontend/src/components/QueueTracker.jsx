import { useEffect, useState } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export default function QueueTracker({ fullWidth }) {
  const [queueData, setQueueData] = useState({ currentQueueNumber: '-', timeSlot: '-', status: 'LOADING' });

  const fetchQueue = async () => {
    try {
      const base = API_BASE.endsWith('/api') ? API_BASE : `${API_BASE}/api`;
      const res = await fetch(`${base}/appointments/queue/live`);
      if (res.ok) {
        setQueueData(await res.json());
      }
    } catch (e) {
      console.error('Error fetching live queue');
    }
  };

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 5000); // Polling every 5 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-panel queue-display" style={{ width: fullWidth ? '100%' : 'auto', maxWidth: fullWidth ? '600px' : 'auto', margin: fullWidth ? '0 auto' : '0' }}>
      <h2>Live Queue Tracking</h2>
      <p style={{ color: 'var(--text-muted)' }}>Currently Serving</p>
      
      <div className="queue-number">
        {queueData.currentQueueNumber || 0}
      </div>
      
      <div>
        <span style={{ marginRight: '10px' }}>Slot: <strong>{queueData.timeSlot}</strong></span>
        <span style={{ 
          background: queueData.status === 'SERVING' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.1)',
          padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem'
        }}>
          {queueData.status}
        </span>
      </div>
      
      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '20px' }}>Auto-updates every 5s</p>
    </div>
  );
}
