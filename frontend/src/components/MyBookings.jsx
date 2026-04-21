import { useState } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8082/api';

export default function MyBookings() {
  const [email, setEmail] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [message, setMessage] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  const getFullUrl = (path) => {
    const base = API_BASE.endsWith('/api') ? API_BASE : `${API_BASE}/api`;
    return `${base}${path}`;
  };

  const fetchAppointments = async (e) => {
    if (e) e.preventDefault();
    setMessage(null);
    try {
      const res = await fetch(getFullUrl(`/appointments/customer?email=${encodeURIComponent(email)}`));
      if (res.ok) {
        const data = await res.json();
        setAppointments(data);
        setHasSearched(true);
        if (data.length === 0) {
          setMessage('No appointments found for this email.');
        }
      } else {
        setMessage('Failed to fetch appointments.');
      }
    } catch (err) {
      setMessage('Error connecting to server.');
    }
  };

  const cancelAppointment = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    
    try {
      const res = await fetch(getFullUrl(`/appointments/${id}`), {
        method: 'DELETE'
      });
      if (res.ok || res.status === 204) {
        setMessage('Appointment cancelled successfully.');
        fetchAppointments();
      } else {
        setMessage('Failed to cancel appointment.');
      }
    } catch (err) {
      setMessage('Error cancelling appointment.');
    }
  };

  return (
    <div className="glass-panel">
      <h2>My Bookings</h2>
      
      <form onSubmit={fetchAppointments} style={{ marginBottom: '20px' }}>
        <div className="input-group">
          <label>Email Address</label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input 
              type="email" 
              required 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="Enter your email to find bookings" 
              style={{ flex: 1 }}
            />
            <button type="submit" className="btn">Search</button>
          </div>
        </div>
      </form>

      {message && <div style={{ marginBottom: '15px', color: message.includes('successfully') ? '#10b981' : '#ef4444' }}>{message}</div>}

      {hasSearched && appointments.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '12px' }}>Date</th>
                <th>Time Slot</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map(app => (
                <tr key={app.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '12px' }}>{app.appointmentDate}</td>
                  <td>{app.timeSlot}</td>
                  <td>
                    <span style={{
                      background: app.status === 'SCHEDULED' ? 'rgba(59, 130, 246, 0.2)' : 
                                 app.status === 'IN_PROGRESS' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                      padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem'
                    }}>
                      {app.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 0' }}>
                    {app.status !== 'COMPLETED' && app.status !== 'CANCELLED' && (
                      <button 
                        className="btn" 
                        style={{ padding: '6px 12px', fontSize: '0.8rem', background: 'transparent', border: '1px solid #ef4444', color: '#ef4444' }} 
                        onClick={() => cancelAppointment(app.id)}
                      >
                        Cancel Booking
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
