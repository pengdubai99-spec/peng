"use client";

import React, { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import { motion } from 'framer-motion';
import { TrendingUp, Zap, Activity, ShieldCheck } from 'lucide-react';

interface AnalyticsChartsProps {
  vehicles: Record<string, any>;
  history: any[]; // Array of location updates
  lang: string;
}

export default function AnalyticsCharts({ vehicles, history, lang }: AnalyticsChartsProps) {
  // 1. Line Chart Data: Average Fleet Speed over time (last 20 updates)
  const speedData = useMemo(() => {
    // Group history by timestamp (simplified)
    const timeGroups: Record<string, { totalSpeed: number; count: number }> = {};
    
    history.slice(-50).forEach(h => {
      const time = h.timestamp.split(':').slice(0, 2).join(':'); // Minute precision
      if (!timeGroups[time]) timeGroups[time] = { totalSpeed: 0, count: 0 };
      timeGroups[time].totalSpeed += h.speed || 0;
      timeGroups[time].count += 1;
    });

    return Object.entries(timeGroups).map(([time, data]) => ({
      time,
      speed: Math.round(data.totalSpeed / data.count),
    })).slice(-15);
  }, [history]);

  // 2. Bar Chart Data: Vehicle Utilization (Active vs Idle - fake for demo)
  const activeCount = Object.keys(vehicles).length;
  const utilizationData = [
    { name: 'Active', value: activeCount, color: '#6366f1' },
    { name: 'Standby', value: Math.max(2, 5 - activeCount), color: '#10b981' },
    { name: 'Maintenance', value: 1, color: '#f59e0b' },
  ];

  // 3. AI Safety Score Data (based on fatigue alerts)
  const safetyData = [
    { name: 'Safe', value: 85 },
    { name: 'Warning', value: 10 },
    { name: 'Critical', value: 5 },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0c0c1e] border border-white/10 p-3 rounded-xl shadow-2xl backdrop-blur-xl">
          <p className="text-[10px] font-black text-slate-500 uppercase mb-1">{label}</p>
          <p className="text-sm font-bold text-white">{payload[0].value} km/h</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 1. Real-time Fleet Speed Area Chart */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="lg:col-span-2 glass-card p-6 rounded-3xl border border-white/[0.03] overflow-hidden relative"
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
             <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
               <TrendingUp className="w-4 h-4 text-indigo-400" />
             </div>
             <div>
               <h3 className="text-xs font-black uppercase tracking-widest text-white">Average Fleet Speed</h3>
               <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Real-time velocity monitoring (Dubai)</p>
             </div>
          </div>
          <div className="text-right">
             <span className="text-2xl font-black text-white">{speedData[speedData.length-1]?.speed || 0}</span>
             <span className="text-[10px] font-bold text-slate-500 ml-1">KM/H</span>
          </div>
        </div>

        <div className="h-[240px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={speedData}>
              <defs>
                <linearGradient id="colorSpeed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
              <XAxis 
                dataKey="time" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#4b5563', fontSize: 10, fontWeight: 'bold' }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#4b5563', fontSize: 10, fontWeight: 'bold' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="speed" 
                stroke="#6366f1" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorSpeed)" 
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* 2. Fleet Utilization Bar Chart */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-6 rounded-3xl border border-white/[0.03]"
      >
        <div className="flex items-center gap-3 mb-8">
           <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
             <Zap className="w-4 h-4 text-emerald-400" />
           </div>
           <div>
             <h3 className="text-xs font-black uppercase tracking-widest text-white">Utilization</h3>
             <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Current fleet status</p>
           </div>
        </div>

        <div className="h-[200px] w-full mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={utilizationData} layout="vertical">
              <XAxis type="number" hide />
              <YAxis 
                dataKey="name" 
                type="category" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }}
                width={80}
              />
              <Tooltip 
                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                contentStyle={{ backgroundColor: '#0c0c1e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
              />
              <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={20}>
                {utilizationData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-3">
          {utilizationData.map((d, i) => (
            <div key={i} className="flex justify-between items-center text-[10px] font-bold">
               <span className="text-slate-500 flex items-center gap-1.5 uppercase">
                 <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: d.color }} />
                 {d.name}
               </span>
               <span className="text-white">{d.value} Units</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* 3. Safety Insight (Fake Metrics for Impact) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-6 rounded-3xl border border-white/[0.03] flex flex-col justify-between"
      >
        <div className="flex items-center gap-3 mb-4">
           <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
             <ShieldCheck className="w-4 h-4 text-indigo-400" />
           </div>
           <div>
             <h3 className="text-xs font-black uppercase tracking-widest text-white">Safety Score</h3>
             <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">AI Vision Confidence</p>
           </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center py-6">
           <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90">
                 <circle cx="64" cy="64" r="58" stroke="rgba(255,255,255,0.03)" strokeWidth="12" fill="none" />
                 <motion.circle 
                    cx="64" cy="64" r="58" 
                    stroke="#6366f1" 
                    strokeWidth="12" 
                    fill="none" 
                    strokeLinecap="round"
                    initial={{ strokeDasharray: "0 365" }}
                    animate={{ strokeDasharray: "340 365" }}
                    transition={{ duration: 2 }}
                 />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                 <span className="text-3xl font-black text-white">96</span>
                 <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mt-1">EXCELLENT</span>
              </div>
           </div>
        </div>

        <div className="p-3 bg-white/[0.02] border border-white/[0.05] rounded-2xl">
           <div className="flex items-center gap-2 mb-2">
              <Activity className="w-3 h-3 text-emerald-400" />
              <span className="text-[10px] font-black text-white uppercase tracking-widest">DRIVING VIBE</span>
           </div>
           <p className="text-[9px] text-slate-500 leading-relaxed font-medium capitalize">
             Most drivers are focused. AI detected slight fatigue in DXB-4412 near Marina Mall.
           </p>
        </div>
      </motion.div>
    </div>
  );
}
