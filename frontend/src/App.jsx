import { useState } from 'react'
import AppointmentForm from './components/AppointmentForm'
import QueueTracker from './components/QueueTracker'
import AdminPanel from './components/AdminPanel'
import MyBookings from './components/MyBookings'

function App() {
  const [activeTab, setActiveTab] = useState('book');

  return (
    <>
      <h1 className="title">Glint Appointments</h1>
      
      <div className="nav">
        <button 
          className={`btn ${activeTab === 'book' ? 'active' : ''}`}
          onClick={() => setActiveTab('book')}
        >
          Book Appointment
        </button>
        <button 
          className={`btn ${activeTab === 'my-bookings' ? 'active' : ''}`}
          onClick={() => setActiveTab('my-bookings')}
        >
          My Bookings
        </button>
        <button 
          className={`btn ${activeTab === 'queue' ? 'active' : ''}`}
          onClick={() => setActiveTab('queue')}
        >
          Live Queue
        </button>
        <button 
          className={`btn ${activeTab === 'admin' ? 'active' : ''}`}
          onClick={() => setActiveTab('admin')}
        >
          Admin Panel
        </button>
      </div>

      <div className="content">
        {activeTab === 'book' && (
          <div className="grid">
            <AppointmentForm />
            <QueueTracker />
          </div>
        )}
        {activeTab === 'my-bookings' && (
          <MyBookings />
        )}
        {activeTab === 'queue' && (
          <QueueTracker fullWidth />
        )}
        {activeTab === 'admin' && (
          <AdminPanel />
        )}
      </div>
    </>
  )
}

export default App
