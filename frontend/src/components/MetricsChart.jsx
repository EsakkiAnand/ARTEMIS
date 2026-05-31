import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const MetricsChart = ({ data }) => {
  return (
    <div className="glass-panel p-4 h-64 flex flex-col">
      <h3 className="mb-2 font-semibold text-[#66fcf1]">RL Agent Performance (Cumulative Reward)</h3>
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2833" />
            <XAxis dataKey="step" stroke="#45a29e" fontSize={12} tickFormatter={(tick) => `Step ${tick}`} />
            <YAxis stroke="#45a29e" fontSize={12} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0b0c10', borderColor: '#45a29e', color: '#c5c6c7' }}
              itemStyle={{ color: '#66fcf1' }}
            />
            <Line 
              type="monotone" 
              dataKey="reward" 
              stroke="#66fcf1" 
              strokeWidth={2} 
              dot={{ r: 3, fill: '#66fcf1' }} 
              activeDot={{ r: 5 }} 
              isAnimationActive={false} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MetricsChart;
