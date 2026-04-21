import { useEffect, useState } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export default function AdminPanel() {
  const [appointments, setAppointments] = useState([]);
  const [message, setMessage] = useState(null);

  const showMessage = (text, isSuccess = true) => {
    setMessage({ text, isSuccess });
    setTimeout(() => setMessage(null), 3500);
  };

  const getFullUrl = (path) => {
    const base = API_BASE.endsWith('/api') ? API_BASE : `${API_BASE}/api`;
    return `${base}${path}`;
  };

  const fetchAppointments = async () => {
    try {
      const res = await fetch(getFullUrl('/appointments'));
      if (res.ok) {
        setAppointments(await res.json());
      }
    } catch (e) {
      console.error('Error fetching appointments');
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const updateStatus = async (id, newStatus, customerName) => {
    try {
      await fetch(getFullUrl(`/appointments/${id}/status?status=${newStatus}`), {
        method: 'PUT'
      });
      fetchAppointments();
      if (newStatus === 'COMPLETED') {
        showMessage(`✅ Appointment completed — customer record for "${customerName}" has been removed.`);
      } else if (newStatus === 'CANCELLED') {
        showMessage(`🚫 Appointment for "${customerName}" has been cancelled.`);
      }
    } catch (e) {
      showMessage('Failed to update status.', false);
    }
  };

  const deleteAppointment = async (id, customerName) => {
    if (!window.confirm(`Delete the cancelled booking for "${customerName}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(getFullUrl(`/appointments/${id}`), { method: 'DELETE' });
      if (res.ok || res.status === 204) {
        showMessage(`🗑️ Cancelled booking for "${customerName}" has been removed.`);
        fetchAppointments();
      } else {
        showMessage('Failed to delete booking.', false);
      }
    } catch (e) {
      showMessage('Error deleting booking.', false);
    }
  };

  const statusStyle = (status) => {
    const map = {
      SCHEDULED:   { background: 'rgba(59, 130, 246, 0.2)',  color: '#93c5fd' },
      IN_PROGRESS: { background: 'rgba(16, 185, 129, 0.2)',  color: '#6ee7b7' },
      COMPLETED:   { background: 'rgba(139, 92, 246, 0.2)',  color: '#c4b5fd' },
      CANCELLED:   { background: 'rgba(239, 68, 68, 0.15)',  color: '#fca5a5' },
    };
    return map[status] || { background: 'rgba(255,255,255,0.1)', color: '#fff' };
  };

  return (
    <div className="glass-panel">
      <h2>Admin Dashboard</h2>

      {message && (
        <div style={{
          marginBottom: '16px',
          padding: '10px 16px',
          borderRadius: '8px',
          background: message.isSuccess ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
          color: message.isSuccess ? '#6ee7b7' : '#fca5a5',
          border: `1px solid ${message.isSuccess ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
          fontSize: '0.9rem'
        }}>
          {message.text}
        </div>
      )}

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ padding: '12px' }}>Q#</th>
              <th>Date</th>
              <th>Slot</th>
              <th>Customer</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map(app => (
              <tr key={app.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '12px', fontWeight: 'bold' }}>{app.queueNumber}</td>
                <td>{app.appointmentDate}</td>
                <td>{app.timeSlot}</td>
                <td>
                  <div>{app.customerName}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{app.customerEmail}</div>
                </td>
                <td>
                  <span style={{
                    ...statusStyle(app.status),
                    padding: '4px 10px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 500
                  }}>
                    {app.status}
                  </span>
                </td>
                <td style={{ display: 'flex', gap: '8px', padding: '12px 0', flexWrap: 'wrap' }}>
                  {app.status === 'SCHEDULED' && (
                    <button className="btn" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => updateStatus(app.id, 'IN_PROGRESS', app.customerName)}>Start</button>
                  )}
                  {app.status === 'IN_PROGRESS' && (
                    <button className="btn" style={{ padding: '6px 12px', fontSize: '0.8rem', background: '#10b981' }} onClick={() => updateStatus(app.id, 'COMPLETED', app.customerName)}>Complete</button>
                  )}
                  {app.status !== 'COMPLETED' && app.status !== 'CANCELLED' && (
                    <button className="btn" style={{ padding: '6px 12px', fontSize: '0.8rem', background: 'transparent', border: '1px solid #ef4444', color: '#ef4444' }} onClick={() => updateStatus(app.id, 'CANCELLED', app.customerName)}>Cancel</button>
                  )}
                  {app.status === 'CANCELLED' && (
                    <button className="btn" style={{ padding: '6px 12px', fontSize: '0.8rem', background: 'transparent', border: '1px solid #6b7280', color: '#9ca3af' }} onClick={() => deleteAppointment(app.id, app.customerName)}>Delete</button>
                  )}
                </td>
              </tr>
            ))}
            {appointments.length === 0 && (
              <tr>
                <td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>No appointments found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
