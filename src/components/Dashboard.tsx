/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { 
  Users, 
  Briefcase, 
  AlertTriangle, 
  Clock, 
  Package, 
  CheckCircle2, 
  Sparkles, 
  TrendingUp, 
  CloudSun,
  FileText,
  RefreshCw,
  Construction
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Employee, WorkActivity, StockItem, AttendanceLog, SiteSummaryStats } from '../types';

interface DashboardProps {
  employees: Employee[];
  activities: WorkActivity[];
  stockItems: StockItem[];
  attendanceLogs: AttendanceLog[];
  onReorderItem: (itemId: string, quantity: number) => void;
}

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1'];

export default function Dashboard({ 
  employees, 
  activities, 
  stockItems, 
  attendanceLogs,
  onReorderItem 
}: DashboardProps) {
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  // Compute Metrics
  const presentCount = employees.filter(e => e.status === 'present').length;
  const activeTasks = activities.filter(a => a.status === 'In Progress').length;
  const blockedTasks = activities.filter(a => a.status === 'Blocked').length;
  const completedTasks = activities.filter(a => a.status === 'Completed').length;
  const lowStockItems = stockItems.filter(item => item.quantity <= item.reorderLevel);
  const lowStockCount = lowStockItems.length;

  // Calculate total hours worked today
  const totalHoursWorkedToday = employees.reduce((acc, emp) => {
    return acc + (emp.status === 'present' ? emp.totalHoursToday : emp.totalHoursToday);
  }, 0);

  // Chart Data 1: Trade/Role attendance breakdown
  const tradeDistribution = employees.reduce((acc: { [key: string]: number }, emp) => {
    if (emp.status === 'present') {
      acc[emp.role] = (acc[emp.role] || 0) + 1;
    }
    return acc;
  }, {});

  const tradeChartData = Object.keys(tradeDistribution).map(role => ({
    name: role,
    count: tradeDistribution[role],
  }));

  // Chart Data 2: Activity status breakdown
  const activityStatusDistribution = activities.reduce((acc: { [key: string]: number }, act) => {
    acc[act.status] = (acc[act.status] || 0) + 1;
    return acc;
  }, { 'Planned': 0, 'In Progress': 0, 'Blocked': 0, 'Completed': 0 });

  const activityChartData = Object.keys(activityStatusDistribution).map(status => ({
    name: status,
    value: activityStatusDistribution[status],
  }));

  // Trigger Gemini AI report generation
  const generateAiReport = async () => {
    setIsGeneratingReport(true);
    setAiError(null);
    try {
      const response = await fetch('/api/analyze-site', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employees,
          activities,
          stockItems,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate report.');
      }
      setAiReport(data.analysis);
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || 'Error communicating with server.');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 text-white p-6 rounded-2xl shadow-sm relative overflow-hidden border border-slate-800" id="dashboard-welcome-banner">
        <div className="absolute right-0 top-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2 text-sky-400 font-mono text-xs tracking-wider uppercase">
            <Construction className="w-4 h-4 animate-pulse" />
            Live Site Operations Control
          </div>
          <h1 className="text-2xl md:text-3xl font-sans font-medium tracking-tight">Commercial Build Sector 4</h1>
          <p className="text-slate-400 mt-1 text-sm">Site Director Portal | Sector Performance Monitoring System</p>
        </div>
        <div className="flex items-center gap-3 bg-slate-800/80 px-4 py-2.5 rounded-xl border border-slate-700/50 backdrop-blur-sm self-stretch md:self-auto text-sm" id="dashboard-weather-widget">
          <CloudSun className="w-5 h-5 text-amber-400 shrink-0" />
          <div className="font-mono">
            <div className="text-slate-200">Temp: 74°F / Light Rain</div>
            <div className="text-xs text-slate-400">Wind: 8mph | Wind Chill: 72°F</div>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4" id="dashboard-metrics-grid">
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex flex-col justify-between" id="metric-present">
          <div className="flex justify-between items-start">
            <div className="text-slate-500 font-sans text-xs font-medium uppercase tracking-wider">Present On Site</div>
            <div className="p-2 bg-sky-50 text-sky-600 rounded-lg"><Users className="w-5 h-5" /></div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-semibold text-slate-900">{presentCount}</div>
            <div className="text-xs text-sky-600 mt-1 font-medium flex items-center gap-1">
              Active Workers
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex flex-col justify-between" id="metric-active-tasks">
          <div className="flex justify-between items-start">
            <div className="text-slate-500 font-sans text-xs font-medium uppercase tracking-wider">Active Tasks</div>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><Briefcase className="w-5 h-5" /></div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-semibold text-slate-900">{activeTasks}</div>
            <div className="text-xs text-emerald-600 mt-1 font-medium">In Progress Progressing</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex flex-col justify-between" id="metric-blocked-tasks">
          <div className="flex justify-between items-start">
            <div className="text-slate-500 font-sans text-xs font-medium uppercase tracking-wider">Blocked Issues</div>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg"><AlertTriangle className="w-5 h-5" /></div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-semibold text-rose-600">{blockedTasks}</div>
            <div className="text-xs text-rose-600 mt-1 font-medium">Requires Resolution</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex flex-col justify-between" id="metric-low-stock">
          <div className="flex justify-between items-start">
            <div className="text-slate-500 font-sans text-xs font-medium uppercase tracking-wider">Reorder Alerts</div>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Package className="w-5 h-5" /></div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-semibold text-amber-500">{lowStockCount}</div>
            <div className="text-xs text-amber-600 mt-1 font-medium">Below Safe Levels</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex flex-col justify-between col-span-2 lg:col-span-1" id="metric-hours-worked">
          <div className="flex justify-between items-start">
            <div className="text-slate-500 font-sans text-xs font-medium uppercase tracking-wider">Hours Tracked</div>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Clock className="w-5 h-5" /></div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-semibold text-slate-900">{totalHoursWorkedToday.toFixed(1)} hrs</div>
            <div className="text-xs text-purple-600 mt-1 font-medium">Today's Manpower Hours</div>
          </div>
        </div>
      </div>

      {/* Main Analysis and Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="dashboard-charts-reports-grid">
        {/* Charts: Left/Middle (Span 2) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs" id="dashboard-chart-workforce">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
              <TrendingUp className="w-5 h-5 text-sky-500" />
              <div>
                <h3 className="text-slate-900 font-medium text-base">Workforce Trade Attendance</h3>
                <p className="text-xs text-slate-400">Total active trades present and participating today</p>
              </div>
            </div>
            
            <div className="h-[260px] w-full" id="chart-workforce-container">
              {tradeChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={tradeChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none' }}
                      labelStyle={{ color: '#94a3b8', fontFamily: 'monospace', fontSize: '11px' }}
                      itemStyle={{ color: '#38bdf8' }}
                    />
                    <Bar dataKey="count" fill="#0ea5e9" radius={[6, 6, 0, 0]} maxBarSize={45}>
                      {tradeChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm py-8">
                  <Users className="w-12 h-12 text-slate-200 mb-2" />
                  No workers currently signed in today.
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pie Chart: Activity Status */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between" id="dashboard-chart-activities">
              <div>
                <h3 className="text-slate-900 font-medium text-base mb-1">Site Activity Allocation</h3>
                <p className="text-xs text-slate-400 mb-4">Task division across various operational phases</p>
                <div className="h-[180px] w-full relative flex items-center justify-center" id="chart-activities-container">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={activityChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={75}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {activityChartData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={
                              entry.name === 'Completed' ? '#10b981' :
                              entry.name === 'In Progress' ? '#0ea5e9' :
                              entry.name === 'Blocked' ? '#ef4444' : '#64748b'
                            } 
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none' }}
                        itemStyle={{ color: '#fff' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Custom Legends with numbers */}
              <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-100 text-xs" id="activity-chart-legends">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0"></span>
                  <span className="text-slate-600 font-medium">Completed ({completedTasks})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-sky-500 shrink-0"></span>
                  <span className="text-slate-600 font-medium">In Progress ({activeTasks})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500 shrink-0"></span>
                  <span className="text-slate-600 font-medium">Blocked ({blockedTasks})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-slate-400 shrink-0"></span>
                  <span className="text-slate-600 font-medium">Planned ({activities.filter(a => a.status === 'Planned').length})</span>
                </div>
              </div>
            </div>

            {/* Critical Low Stocks panel */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between" id="dashboard-critical-stocks">
              <div>
                <h3 className="text-slate-900 font-medium text-base mb-1">Stockroom Reorders Required</h3>
                <p className="text-xs text-slate-400 mb-4">Stock room materials that have dropped below minimum reorder thresholds</p>
                
                <div className="space-y-3 max-h-[200px] overflow-y-auto pr-1" id="low-stocks-list">
                  {lowStockItems.length > 0 ? (
                    lowStockItems.map(item => (
                      <div key={item.id} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                        <div className="truncate max-w-[150px]">
                          <div className="font-medium text-slate-800 truncate">{item.name}</div>
                          <div className="text-[10px] font-mono text-slate-400">Current: {item.quantity} {item.unit} (Min: {item.reorderLevel})</div>
                        </div>
                        <button 
                          onClick={() => onReorderItem(item.id, Math.max(25, item.reorderLevel * 2))}
                          className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-medium rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-1 text-[11px]"
                        >
                          <RefreshCw className="w-3 h-3" />
                          Reorder
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-400 text-xs py-8 text-center flex flex-col items-center">
                      <CheckCircle2 className="w-8 h-8 text-emerald-100 mb-2" />
                      All materials are above minimum reorder thresholds.
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-400">
                <span>Stock Room Safety Factor</span>
                <span className={`font-semibold ${lowStockCount > 3 ? 'text-red-500' : 'text-emerald-600'}`}>
                  {lowStockCount > 3 ? 'Caution - Low Supplies' : 'Healthy Supply Levels'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Gemini AI Site Assistant: Right (Span 1) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between" id="dashboard-ai-assistant">
          <div className="space-y-4 flex-1 flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-tr from-sky-400 to-indigo-500 rounded-xl text-white">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-slate-900 font-semibold text-sm">Gemini Site Director</h3>
                  <p className="text-[10px] text-slate-400 font-mono">MODEL: gemini-3.5-flash</p>
                </div>
              </div>
              {aiReport && (
                <button 
                  onClick={generateAiReport} 
                  disabled={isGeneratingReport}
                  className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-700 transition"
                  title="Regenerate Report"
                >
                  <RefreshCw className={`w-4 h-4 ${isGeneratingReport ? 'animate-spin' : ''}`} />
                </button>
              )}
            </div>

            {/* AI Output Content */}
            <div className="flex-1 overflow-y-auto text-xs min-h-[300px] max-h-[500px]" id="ai-report-view-container">
              {isGeneratingReport ? (
                <div className="h-full flex flex-col items-center justify-center space-y-4 py-16 text-slate-500">
                  <div className="relative">
                    <div className="w-12 h-12 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin"></div>
                    <Sparkles className="w-5 h-5 text-indigo-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-slate-700">Analyzing site parameters...</p>
                    <p className="text-[10px] text-slate-400 mt-1">Evaluating attendance, blockages, and inventory reorders</p>
                  </div>
                </div>
              ) : aiReport ? (
                <div className="prose prose-slate prose-xs max-w-none text-slate-600 space-y-3 pr-1" id="ai-report-markdown-body">
                  <ReactMarkdown>{aiReport}</ReactMarkdown>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center py-16 space-y-3">
                  <FileText className="w-12 h-12 text-slate-100" />
                  <div>
                    <p className="font-medium text-slate-600">No report generated yet</p>
                    <p className="text-[11px] mt-1 px-4 leading-relaxed">
                      Click the button below to generate a Gemini site performance report, blockage resolution advice, and safety recommendations based on your live site data.
                    </p>
                  </div>
                </div>
              )}

              {aiError && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 mt-4 text-[11px]" id="ai-report-error">
                  <div className="font-medium flex items-center gap-1 mb-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Report Generation Failed
                  </div>
                  {aiError}
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100">
            {!aiReport ? (
              <button 
                onClick={generateAiReport}
                disabled={isGeneratingReport}
                className="w-full py-2.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 disabled:opacity-50 text-white font-medium rounded-xl shadow-md active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2 text-xs"
                id="dashboard-btn-generate-ai-report"
              >
                <Sparkles className="w-4 h-4" />
                Generate Live Site Report
              </button>
            ) : (
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(aiReport);
                  alert('Report copied to clipboard!');
                }}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-all flex items-center justify-center gap-2 text-xs"
                id="dashboard-btn-copy-report"
              >
                <FileText className="w-4 h-4" />
                Copy Report Markdown
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
