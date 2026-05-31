import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const ShapAnalysis = ({ data }) => {
  // Convert dict to array for recharts
  const chartData = data ? Object.keys(data).map(key => ({
    name: key.replace('_', ' ').toUpperCase(),
    value: data[key]
  })).sort((a, b) => b.value - a.value) : [];

  return (
    <div className="glass-panel p-4 h-64 flex flex-col">
      <h3 className="mb-2 font-semibold text-[#66fcf1]">SHAP Explainability (Feature Importance)</h3>
      <div className="flex-1 w-full min-h-0">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#c5c6c7', fontSize: 10 }} width={100} />
              <Tooltip 
                cursor={{ fill: 'transparent' }}
                contentStyle={{ backgroundColor: '#0b0c10', borderColor: '#45a29e', color: '#c5c6c7' }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? '#66fcf1' : '#45a29e'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center opacity-50 italic">
            Waiting for analysis...
          </div>
        )}
      </div>
    </div>
  );
};

export default ShapAnalysis;
