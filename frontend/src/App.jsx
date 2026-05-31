import React from 'react';
import io from 'socket.io-client';
import Dashboard from './components/Dashboard';

// Connect to Flask backend
const socket = io('http://localhost:5000');

function App() {
  return (
    <div className="min-h-screen bg-[#0b0c10] text-[#c5c6c7]">
      <Dashboard socket={socket} />
    </div>
  );
}

export default App;
