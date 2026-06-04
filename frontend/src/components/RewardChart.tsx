import React from 'react';
import { useArtemis } from '../services/ArtemisContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const RewardChart: React.FC = () => {
  const { performance } = useArtemis();

  return (
    <div className="panel flex-1 flex flex-col relative overflow-hidden h-[400px]">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-success to-primary"></div>
      <h2 className="text-xl font-mono text-success mb-4 border-b border-success/30 pb-2">Simulated Adaptive Learning Metrics</h2>
      
      <div className="flex-1 w-full h-full">
        {performance.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={performance}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="episode" stroke="#9ca3af" tick={{fill: '#9ca3af', fontSize: 12}} />
              <YAxis stroke="#9ca3af" tick={{fill: '#9ca3af', fontSize: 12}} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#111827', borderColor: '#00F0FF', color: '#fff' }}
                itemStyle={{ color: '#00F0FF' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }}/>
              <Line type="monotone" dataKey="reward" stroke="#00F0FF" strokeWidth={2} dot={false} activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="average_reward" stroke="#00E676" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500 font-mono italic">
            Waiting for performance data...
          </div>
        )}
      </div>
    </div>
  );
};

export default RewardChart;
