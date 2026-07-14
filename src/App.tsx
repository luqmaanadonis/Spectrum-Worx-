/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  Package, 
  Construction, 
  Menu, 
  X,
  AlertCircle,
  FileDown
} from 'lucide-react';
import { Employee, AttendanceLog, WorkActivity, StockItem, DistributionLog } from './types';
import { 
  INITIAL_EMPLOYEES, 
  INITIAL_ATTENDANCE_LOGS, 
  INITIAL_WORK_ACTIVITIES, 
  INITIAL_STOCK_ITEMS, 
  INITIAL_DISTRIBUTION_LOGS 
} from './data/mockData';
import Dashboard from './components/Dashboard';
import AttendanceManager from './components/AttendanceManager';
import ActivityMonitor from './components/ActivityMonitor';
import StockRoom from './components/StockRoom';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'attendance' | 'activities' | 'stockroom'>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Core Data States (loaded from localStorage or initialized with mock seed data)
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceLog[]>([]);
  const [activities, setActivities] = useState<WorkActivity[]>([]);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [distributionLogs, setDistributionLogs] = useState<DistributionLog[]>([]);

  // 1. Initial State Loading
  useEffect(() => {
    const cachedEmployees = localStorage.getItem('construction_employees');
    const cachedAttendance = localStorage.getItem('construction_attendance');
    const cachedActivities = localStorage.getItem('construction_activities');
    const cachedStock = localStorage.getItem('construction_stock');
    const cachedDistribution = localStorage.getItem('construction_distribution');

    if (cachedEmployees) setEmployees(JSON.parse(cachedEmployees));
    else {
      setEmployees(INITIAL_EMPLOYEES);
      localStorage.setItem('construction_employees', JSON.stringify(INITIAL_EMPLOYEES));
    }

    if (cachedAttendance) setAttendanceLogs(JSON.parse(cachedAttendance));
    else {
      setAttendanceLogs(INITIAL_ATTENDANCE_LOGS);
      localStorage.setItem('construction_attendance', JSON.stringify(INITIAL_ATTENDANCE_LOGS));
    }

    if (cachedActivities) setActivities(JSON.parse(cachedActivities));
    else {
      setActivities(INITIAL_WORK_ACTIVITIES);
      localStorage.setItem('construction_activities', JSON.stringify(INITIAL_WORK_ACTIVITIES));
    }

    if (cachedStock) setStockItems(JSON.parse(cachedStock));
    else {
      setStockItems(INITIAL_STOCK_ITEMS);
      localStorage.setItem('construction_stock', JSON.stringify(INITIAL_STOCK_ITEMS));
    }

    if (cachedDistribution) setDistributionLogs(JSON.parse(cachedDistribution));
    else {
      setDistributionLogs(INITIAL_DISTRIBUTION_LOGS);
      localStorage.setItem('construction_distribution', JSON.stringify(INITIAL_DISTRIBUTION_LOGS));
    }
  }, []);

  // 2. LocalStorage Syncing
  const syncEmployees = (newEmps: Employee[]) => {
    setEmployees(newEmps);
    localStorage.setItem('construction_employees', JSON.stringify(newEmps));
  };

  const syncAttendance = (newLogs: AttendanceLog[]) => {
    setAttendanceLogs(newLogs);
    localStorage.setItem('construction_attendance', JSON.stringify(newLogs));
  };

  const syncActivities = (newActs: WorkActivity[]) => {
    setActivities(newActs);
    localStorage.setItem('construction_activities', JSON.stringify(newActs));
  };

  const syncStock = (newStock: StockItem[]) => {
    setStockItems(newStock);
    localStorage.setItem('construction_stock', JSON.stringify(newStock));
  };

  const syncDistribution = (newLogs: DistributionLog[]) => {
    setDistributionLogs(newLogs);
    localStorage.setItem('construction_distribution', JSON.stringify(newLogs));
  };

  // --- ATTENDANCE ACTIONS ---

  const handleSignIn = (employeeId: string, notes?: string) => {
    const updatedEmployees = employees.map(emp => {
      if (emp.id === employeeId) {
        return {
          ...emp,
          status: 'present' as const,
          checkInTime: new Date().toISOString(),
          checkOutTime: null,
        };
      }
      return emp;
    });

    const emp = employees.find(e => e.id === employeeId);
    if (!emp) return;

    const newLog: AttendanceLog = {
      id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
      employeeId,
      employeeName: emp.name,
      role: emp.role,
      type: 'sign_in',
      timestamp: new Date().toISOString(),
      notes: notes || 'Clocked in for shift'
    };

    syncEmployees(updatedEmployees);
    syncAttendance([newLog, ...attendanceLogs]);
  };

  const handleSignOut = (employeeId: string, notes?: string) => {
    const emp = employees.find(e => e.id === employeeId);
    if (!emp) return;

    // Calculate hours worked in this session
    let sessionHours = 8.0; // Fallback default
    if (emp.checkInTime) {
      const checkIn = new Date(emp.checkInTime);
      const checkOut = new Date();
      const diffMs = checkOut.getTime() - checkIn.getTime();
      const diffHrs = diffMs / (1000 * 60 * 60);
      // For quick validation in sandbox environment: if difference is less than 1 min, reward with at least 0.5 hours for testing
      sessionHours = diffHrs > 0.01 ? Number(diffHrs.toFixed(2)) : 0.5;
    }

    const updatedEmployees = employees.map(e => {
      if (e.id === employeeId) {
        return {
          ...e,
          status: 'checked_out' as const,
          checkOutTime: new Date().toISOString(),
          totalHoursToday: e.totalHoursToday + sessionHours,
          weeklyHours: e.weeklyHours + sessionHours,
        };
      }
      return e;
    });

    const newLog: AttendanceLog = {
      id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
      employeeId,
      employeeName: emp.name,
      role: emp.role,
      type: 'sign_out',
      timestamp: new Date().toISOString(),
      notes: notes || `Shift finished. Logged ${sessionHours.toFixed(1)} hrs.`
    };

    syncEmployees(updatedEmployees);
    syncAttendance([newLog, ...attendanceLogs]);
  };

  const handleAddEmployee = (newWorker: Omit<Employee, 'status' | 'checkInTime' | 'checkOutTime' | 'totalHoursToday' | 'weeklyHours'>) => {
    const fullWorker: Employee = {
      ...newWorker,
      status: 'absent',
      checkInTime: null,
      checkOutTime: null,
      totalHoursToday: 0,
      weeklyHours: 0
    };
    syncEmployees([...employees, fullWorker]);
  };

  // --- ACTIVITY MONITOR ACTIONS ---

  const handleAddActivity = (newAct: Omit<WorkActivity, 'id' | 'timestamp'>) => {
    const fullActivity: WorkActivity = {
      ...newAct,
      id: `ACT-${Math.floor(100 + Math.random() * 900)}`,
      timestamp: new Date().toISOString()
    };
    syncActivities([fullActivity, ...activities]);
  };

  const handleUpdateActivityProgress = (activityId: string, progress: number) => {
    const updated = activities.map(act => {
      if (act.id === activityId) {
        const isCompleted = progress === 100;
        return {
          ...act,
          progress,
          status: isCompleted ? ('Completed' as const) : act.status
        };
      }
      return act;
    });
    syncActivities(updated);
  };

  const handleUpdateActivityStatus = (activityId: string, status: WorkActivity['status'], blockageReason?: string) => {
    const updated = activities.map(act => {
      if (act.id === activityId) {
        return {
          ...act,
          status,
          progress: status === 'Completed' ? 100 : act.progress,
          blockageReason: status === 'Blocked' ? blockageReason : undefined
        };
      }
      return act;
    });
    syncActivities(updated);
  };

  // --- VIRTUAL STOCKROOM ACTIONS ---

  const handleDistributeStock = (itemId: string, recipientId: string, quantity: number, purpose: string): boolean => {
    const item = stockItems.find(i => i.id === itemId);
    const recipient = employees.find(e => e.id === recipientId);

    if (!item || !recipient || item.quantity < quantity) {
      return false;
    }

    // Deduct stock quantity
    const updatedStock = stockItems.map(st => {
      if (st.id === itemId) {
        return {
          ...st,
          quantity: st.quantity - quantity
        };
      }
      return st;
    });

    // Create distribution log
    const newLog: DistributionLog = {
      id: `DST-${Math.floor(1000 + Math.random() * 9000)}`,
      itemId,
      itemName: item.name,
      recipientId,
      recipientName: recipient.name,
      quantity,
      purpose,
      timestamp: new Date().toISOString()
    };

    syncStock(updatedStock);
    syncDistribution([newLog, ...distributionLogs]);
    return true;
  };

  const handleReceiveStock = (itemId: string, quantity: number) => {
    const updatedStock = stockItems.map(st => {
      if (st.id === itemId) {
        return {
          ...st,
          quantity: st.quantity + quantity,
          lastRestocked: new Date().toISOString()
        };
      }
      return st;
    });
    syncStock(updatedStock);
  };

  // Reset demo databases helper
  const handleResetDemoData = () => {
    if (confirm("Are you sure you want to reset all site operations data to default seed levels?")) {
      syncEmployees(INITIAL_EMPLOYEES);
      syncAttendance(INITIAL_ATTENDANCE_LOGS);
      syncActivities(INITIAL_WORK_ACTIVITIES);
      syncStock(INITIAL_STOCK_ITEMS);
      syncDistribution(INITIAL_DISTRIBUTION_LOGS);
      setActiveTab('dashboard');
    }
  };

  // Export current daily site report
  const handleExportData = () => {
    const siteData = {
      reportDate: new Date().toLocaleDateString(),
      employees,
      attendanceLogs,
      activities,
      stockItems,
      distributionLogs
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(siteData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `sector_4_site_report_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      
      {/* Upper Navigation Header bar */}
      <header className="bg-slate-900 text-white border-b border-slate-800 shadow-sm sticky top-0 z-40" id="app-header">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-tr from-sky-400 to-indigo-500 rounded-xl">
              <Construction className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-sans font-medium text-sm md:text-base tracking-tight block">Construction performance manager</span>
              <span className="text-[10px] font-mono text-sky-400 block -mt-0.5">Commercial Operations • Sector 4</span>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 text-xs" id="desktop-nav-tabs">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 rounded-xl font-medium transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'dashboard' ? 'bg-slate-800 text-sky-400 font-semibold' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Overview Dashboard
            </button>
            <button 
              onClick={() => setActiveTab('attendance')}
              className={`px-4 py-2 rounded-xl font-medium transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'attendance' ? 'bg-slate-800 text-sky-400 font-semibold' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Users className="w-4 h-4" />
              Daily Attendance
            </button>
            <button 
              onClick={() => setActiveTab('activities')}
              className={`px-4 py-2 rounded-xl font-medium transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'activities' ? 'bg-slate-800 text-sky-400 font-semibold' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              Activity Monitor
            </button>
            <button 
              onClick={() => setActiveTab('stockroom')}
              className={`px-4 py-2 rounded-xl font-medium transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'stockroom' ? 'bg-slate-800 text-sky-400 font-semibold' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Package className="w-4 h-4" />
              Virtual Stock Room
            </button>
          </nav>

          {/* Utilities Buttons */}
          <div className="hidden md:flex items-center gap-2" id="header-actions">
            <button 
              onClick={handleExportData}
              className="p-2 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 hover:text-white transition rounded-xl"
              title="Export Full Site Status"
            >
              <FileDown className="w-4.5 h-4.5" />
            </button>
            <button 
              onClick={handleResetDemoData}
              className="px-3 py-1.5 border border-slate-700 hover:border-slate-500 hover:bg-slate-800 text-slate-300 hover:text-white text-[10px] font-medium font-mono rounded-lg transition"
              title="Reset Database To Seed Levels"
            >
              RESET DATA
            </button>
          </div>

          {/* Mobile Menu Icon */}
          <div className="md:hidden flex items-center gap-2">
            <button 
              onClick={handleExportData}
              className="p-2 bg-slate-800 text-slate-300 rounded-lg"
              title="Export Site report"
            >
              <FileDown className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 hover:bg-slate-800 rounded-lg text-slate-300 transition cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 text-white border-b border-slate-800 px-4 py-3 space-y-1.5 text-xs animate-in slide-in-from-top duration-150" id="mobile-navigation-drawer">
          <button 
            onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-4 py-2.5 rounded-lg font-medium transition flex items-center gap-2 ${
              activeTab === 'dashboard' ? 'bg-slate-800 text-sky-400 font-semibold' : 'text-slate-300'
            }`}
          >
            <LayoutDashboard className="w-4.5 h-4.5" />
            Overview Dashboard
          </button>
          <button 
            onClick={() => { setActiveTab('attendance'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-4 py-2.5 rounded-lg font-medium transition flex items-center gap-2 ${
              activeTab === 'attendance' ? 'bg-slate-800 text-sky-400 font-semibold' : 'text-slate-300'
            }`}
          >
            <Users className="w-4.5 h-4.5" />
            Daily Attendance Roster
          </button>
          <button 
            onClick={() => { setActiveTab('activities'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-4 py-2.5 rounded-lg font-medium transition flex items-center gap-2 ${
              activeTab === 'activities' ? 'bg-slate-800 text-sky-400 font-semibold' : 'text-slate-300'
            }`}
          >
            <Briefcase className="w-4.5 h-4.5" />
            Daily Activity Monitor
          </button>
          <button 
            onClick={() => { setActiveTab('stockroom'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-4 py-2.5 rounded-lg font-medium transition flex items-center gap-2 ${
              activeTab === 'stockroom' ? 'bg-slate-800 text-sky-400 font-semibold' : 'text-slate-300'
            }`}
          >
            <Package className="w-4.5 h-4.5" />
            Virtual Stock Room
          </button>
          <div className="pt-2 border-t border-slate-800 flex justify-between gap-2">
            <button 
              onClick={() => { handleResetDemoData(); setMobileMenuOpen(false); }}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[10px] font-medium rounded-lg text-center"
            >
              RESET SEED DATA
            </button>
          </div>
        </div>
      )}

      {/* Main Workspace Frame */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 py-6" id="app-workspace">
        {activeTab === 'dashboard' && (
          <Dashboard 
            employees={employees}
            activities={activities}
            stockItems={stockItems}
            attendanceLogs={attendanceLogs}
            onReorderItem={handleReceiveStock}
          />
        )}

        {activeTab === 'attendance' && (
          <AttendanceManager 
            employees={employees}
            attendanceLogs={attendanceLogs}
            onSignIn={handleSignIn}
            onSignOut={handleSignOut}
            onAddEmployee={handleAddEmployee}
          />
        )}

        {activeTab === 'activities' && (
          <ActivityMonitor 
            activities={activities}
            onAddActivity={handleAddActivity}
            onUpdateActivityProgress={handleUpdateActivityProgress}
            onUpdateActivityStatus={handleUpdateActivityStatus}
          />
        )}

        {activeTab === 'stockroom' && (
          <StockRoom 
            stockItems={stockItems}
            distributionLogs={distributionLogs}
            employees={employees}
            onDistributeStock={handleDistributeStock}
            onReceiveStock={handleReceiveStock}
          />
        )}
      </main>

      {/* Footer Status Indicators */}
      <footer className="bg-white border-t border-slate-100 py-4 font-mono text-[10px] text-slate-400 text-center" id="app-footer">
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col sm:flex-row justify-between items-center gap-2">
          <div>© 2026 Sector 4 Commercial Operations Control. All rights reserved.</div>
          <div className="flex gap-4 items-center">
            <span className="flex items-center gap-1 text-emerald-600 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Local Database Synced
            </span>
            <span>Version 1.2.0</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
