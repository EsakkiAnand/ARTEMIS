import React, { useState } from 'react';
import { FaLock, FaUser } from 'react-icons/fa';

interface LoginProps {
  onLogin: (token: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);

      const response = await fetch('http://localhost:8000/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString()
      });

      if (!response.ok) {
        throw new Error('Invalid credentials');
      }

      const data = await response.json();
      onLogin(data.access_token);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center font-sans">
      <div className="panel w-96 p-8 relative overflow-hidden border-primary shadow-[0_0_20px_rgba(0,240,255,0.3)]">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary"></div>
        <h2 className="text-2xl font-bold text-center text-white tracking-widest mb-2">ARTEMIS</h2>
        <p className="text-center text-xs text-secondary tracking-[0.2em] mb-8">SECURE LOGIN</p>

        {error && <div className="bg-danger/20 text-danger border border-danger p-2 rounded mb-4 text-sm text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex items-center bg-black/50 border border-gray-700 rounded p-2 focus-within:border-primary transition-colors">
            <FaUser className="text-gray-500 mr-3 ml-1" />
            <input 
              type="text" 
              placeholder="Username" 
              className="bg-transparent text-white outline-none w-full"
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
          </div>
          
          <div className="flex items-center bg-black/50 border border-gray-700 rounded p-2 focus-within:border-primary transition-colors">
            <FaLock className="text-gray-500 mr-3 ml-1" />
            <input 
              type="password" 
              placeholder="Password" 
              className="bg-transparent text-white outline-none w-full"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit"
            className="w-full mt-4 py-2 bg-primary/20 text-primary border border-primary rounded font-bold hover:bg-primary/40 transition-all"
          >
            AUTHENTICATE
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
