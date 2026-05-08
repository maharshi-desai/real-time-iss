import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea } from 'recharts';

export default function ISSSpeedChart({ speedHistory }) {
  if (!speedHistory || speedHistory.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-background border rounded-xl">
        <span className="text-foreground/50 animate-pulse">Collecting speed data...</span>
      </div>
    );
  }

  // Calculate min and max for YAxis to make the chart dynamic like the reference
  const speeds = speedHistory.map(d => d.speed);
  const minSpeed = Math.floor(Math.min(...speeds) - 50);
  const maxSpeed = Math.ceil(Math.max(...speeds) + 50);

  return (
    <div className="h-full w-full relative">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={speedHistory} margin={{ top: 20, right: 10, left: -20, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="time" 
            tick={{ fill: 'hsl(var(--foreground))', fontSize: 10 }}
            tickLine={false}
            axisLine={{ stroke: 'hsl(var(--border))' }}
            angle={-45}
            textAnchor="end"
          />
          <YAxis 
            domain={[minSpeed, maxSpeed]}
            tick={{ fill: 'hsl(var(--foreground))', fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) => val.toLocaleString()}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--card))', 
              borderColor: 'hsl(var(--border))',
              color: 'hsl(var(--foreground))',
              borderRadius: '0.5rem',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
            }}
            formatter={(value) => [value.toFixed(2) + ' km/h', 'Speed']}
            labelStyle={{ color: 'hsl(var(--foreground))' }}
          />
          <Line 
            type="monotone" 
            dataKey="speed" 
            stroke="#ef4444" 
            strokeWidth={2}
            dot={{ r: 3, fill: '#ef4444', strokeWidth: 0 }}
            activeDot={{ r: 6 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
      
      {/* Legend replica from screenshot */}
      <div className="absolute top-0 right-0 flex items-center gap-2 px-3 py-1 bg-background border rounded-md text-xs text-foreground/80 font-medium">
        <div className="w-4 h-1 bg-red-500 rounded-full"></div>
        ISS Speed (km/h)
      </div>
    </div>
  );
}
