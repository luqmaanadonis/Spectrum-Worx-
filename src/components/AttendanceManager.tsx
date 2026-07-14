/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Users, 
  LogIn, 
  LogOut, 
  UserPlus, 
  Search, 
  Phone, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import { Employee, AttendanceLog } from '../types';

interface AttendanceManagerProps {
  employees: Employee[];
  attendanceLogs: AttendanceLog[];
  onSignIn: (employeeId: string, notes?: string) => void;
  onSignOut: (employeeId: string, notes?: string) => void;
  onAddEmployee: (employee: Omit<Employee, 'status' | 'checkInTime' | 'checkOutTime' | 'totalHoursToday' | 'weeklyHours'>) => void;
}

const ROLES = [
  'Site Supervisor',
  'Safety Officer',
  'Site Engineer',
  'Electrical Lead',
  'Senior Mason',
  'Welding Technician',
  'Carpenter Journeyman',
  'Drywall Specialist',
  'HVAC Specialist',
  'Plumber Apprentice',
  'General Laborer',
  'Other'
];

export default function AttendanceManager({
  employees,
  attendanceLogs,
  onSignIn,
  onSignOut,
  onAddEmployee
}: AttendanceManagerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Add Worker Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newWorkerName, setNewWorkerName] = useState('');
  const [newWorkerRole, setNewWorkerRole] = useState(ROLES[10]); // default General Laborer
  const [newWorkerPhone, setNewWorkerPhone] = useState('');

  // Quick notes for individual sign-in/out
  const [notesState, setNotesState] = useState<{ [empId: string]: string }>({});

  const handleNotesChange = (empId: string, value: string) => {
    setNotesState(prev => ({ ...prev, [empId]: value }));
  };

  // Handle Form Submission
  const handleSubmitWorker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkerName.trim()) return;

    onAddEmployee({
      id: `EMP-${Math.floor(100 + Math.random() * 900)}`,
      name: newWorkerName,
      role: newWorkerRole,
      phone: newWorkerPhone || '+1 (555) 012-3456',
    });

    // Reset Form
    setNewWorkerName('');
    setNewWorkerRole(ROLES[10]);
    setNewWorkerPhone('');
    setShowAddModal(false);
  };

  // Filtering Logic
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          emp.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          emp.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'All' || emp.role === roleFilter;
    const matchesStatus = statusFilter === 'All' || 
                          (statusFilter === 'present' && emp.status === 'present') ||
                          (statusFilter === 'checked_out' && emp.status === 'checked_out') ||
                          (statusFilter === 'absent' && emp.status === 'absent');
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Upper header action bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-xs" id="attendance-header-bar">
        <div>
          <h2 className="text-slate-900 font-medium text-lg">Daily Attendance & Clocking</h2>
          <p className="text-xs text-slate-400">Manage real-time check-ins, sign-outs, and tracking logs</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white text-xs font-medium rounded-xl flex items-center gap-1.5 shadow-sm transition cursor-pointer self-stretch md:self-auto justify-center"
          id="btn-trigger-add-worker"
        >
          <UserPlus className="w-4 h-4" />
          Onboard New Worker
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="attendance-main-layout">
        {/* Roster: Left/Center (Span 2) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
            {/* Search and Filters */}
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex flex-col md:flex-row gap-3" id="attendance-search-filters">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Search by name, role, ID..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 focus:outline-hidden focus:border-sky-500 rounded-xl text-xs bg-white text-slate-800"
                />
              </div>
              <div className="flex gap-2">
                <select 
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-3 py-2 border border-slate-200 focus:outline-hidden focus:border-sky-500 rounded-xl text-xs bg-white text-slate-700"
                >
                  <option value="All">All Trades</option>
                  {ROLES.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-slate-200 focus:outline-hidden focus:border-sky-500 rounded-xl text-xs bg-white text-slate-700"
                >
                  <option value="All">All Statuses</option>
                  <option value="present">Present (On Site)</option>
                  <option value="checked_out">Checked Out</option>
                  <option value="absent">Absent</option>
                </select>
              </div>
            </div>

            {/* Workers Roster Table */}
            <div className="overflow-x-auto" id="workers-roster-table-container">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-500 font-sans font-medium text-[11px] uppercase tracking-wider bg-slate-50/50">
                    <th className="py-3 px-4">Worker</th>
                    <th className="py-3 px-4">Trade Role</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Hours Today</th>
                    <th className="py-3 px-4 text-center">Clocking Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-xs">
                  {filteredEmployees.length > 0 ? (
                    filteredEmployees.map(emp => (
                      <tr key={emp.id} className="hover:bg-slate-50/50 transition">
                        <td className="py-3.5 px-4">
                          <div>
                            <div className="font-semibold text-slate-900">{emp.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">{emp.id}</div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 font-medium">{emp.role}</td>
                        <td className="py-3.5 px-4">
                          {emp.status === 'present' ? (
                            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-semibold rounded-lg flex items-center gap-1 w-fit border border-emerald-100/50">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                              On Site
                            </span>
                          ) : emp.status === 'checked_out' ? (
                            <span className="px-2.5 py-1 bg-sky-50 text-sky-700 font-semibold rounded-lg flex items-center gap-1 w-fit border border-sky-100/50">
                              <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
                              Checked Out
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 bg-slate-50 text-slate-400 font-medium rounded-lg flex items-center gap-1 w-fit border border-slate-100/50">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                              Absent
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-600">
                          <div>
                            <span className="font-semibold text-slate-800">{emp.totalHoursToday.toFixed(1)}h</span>
                            <div className="text-[10px] text-slate-400 mt-0.5">Week: {emp.weeklyHours.toFixed(1)}h</div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col gap-1.5 max-w-[200px] mx-auto">
                            {emp.status !== 'present' ? (
                              <div className="flex gap-1">
                                <input 
                                  type="text" 
                                  placeholder="Sign-in task/note..."
                                  value={notesState[emp.id] || ''}
                                  onChange={(e) => handleNotesChange(emp.id, e.target.value)}
                                  className="px-2 py-1 border border-slate-200 focus:outline-hidden focus:border-sky-500 rounded-lg text-[10px] flex-1 bg-white text-slate-700"
                                />
                                <button 
                                  onClick={() => {
                                    onSignIn(emp.id, notesState[emp.id]);
                                    handleNotesChange(emp.id, '');
                                  }}
                                  className="p-1 px-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-medium rounded-lg shadow-xs flex items-center gap-0.5 transition shrink-0 cursor-pointer text-[10px]"
                                  title="Sign In"
                                >
                                  <LogIn className="w-3.5 h-3.5" />
                                  Clock In
                                </button>
                              </div>
                            ) : (
                              <div className="flex gap-1">
                                <input 
                                  type="text" 
                                  placeholder="Sign-out work summary..."
                                  value={notesState[emp.id] || ''}
                                  onChange={(e) => handleNotesChange(emp.id, e.target.value)}
                                  className="px-2 py-1 border border-slate-200 focus:outline-hidden focus:border-sky-500 rounded-lg text-[10px] flex-1 bg-white text-slate-700"
                                />
                                <button 
                                  onClick={() => {
                                    onSignOut(emp.id, notesState[emp.id]);
                                    handleNotesChange(emp.id, '');
                                  }}
                                  className="p-1 px-2.5 bg-rose-500 hover:bg-rose-600 active:scale-95 text-white font-medium rounded-lg shadow-xs flex items-center gap-0.5 transition shrink-0 cursor-pointer text-[10px]"
                                  title="Sign Out"
                                >
                                  <LogOut className="w-3.5 h-3.5" />
                                  Clock Out
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center py-10 text-slate-400 font-sans">
                        <Users className="w-12 h-12 text-slate-200 mx-auto mb-2" />
                        No workers found matching selected search or filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Timeline Log: Right (Span 1) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between" id="attendance-timeline-panel">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-slate-500" />
                <h3 className="text-slate-900 font-medium text-sm">Today's Clocking Logs</h3>
              </div>
              <span className="px-2 py-0.5 bg-slate-100 rounded-full font-mono text-[10px] text-slate-500">Live feed</span>
            </div>

            <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1" id="attendance-timeline-list">
              {attendanceLogs.length > 0 ? (
                attendanceLogs.map((log, idx) => (
                  <div key={log.id} className="flex gap-3 text-xs relative">
                    {/* Visual Line */}
                    {idx < attendanceLogs.length - 1 && (
                      <span className="absolute left-[13px] top-6 bottom-0 w-[1.5px] bg-slate-100"></span>
                    )}
                    
                    {/* Log Type Circle */}
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                      log.type === 'sign_in' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'
                    }`}>
                      {log.type === 'sign_in' ? <LogIn className="w-3.5 h-3.5" /> : <LogOut className="w-3.5 h-3.5" />}
                    </span>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-semibold text-slate-800 truncate">{log.employeeName}</span>
                        <span className="text-[10px] font-mono text-slate-400 whitespace-nowrap shrink-0">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">{log.role}</div>
                      {log.notes && (
                        <p className="mt-1 text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100/50 italic leading-relaxed">
                          "{log.notes}"
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-slate-400">
                  <Clock className="w-8 h-8 text-slate-100 mx-auto mb-2" />
                  No check-ins or sign-outs logged yet for today.
                </div>
              )}
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 text-[11px] text-slate-400 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 text-slate-300" />
            Sign-outs automatically compute daily hours.
          </div>
        </div>
      </div>

      {/* Onboard New Worker Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 backdrop-blur-xs" id="modal-onboard-worker">
          <div className="bg-white w-full max-w-md rounded-2xl border border-slate-100 shadow-xl overflow-hidden animate-in fade-in-50 zoom-in-95 duration-200">
            <div className="p-5 bg-slate-950 text-white border-b border-slate-800 flex justify-between items-center">
              <h3 className="font-sans font-medium text-sm flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-sky-400" />
                Onboard Site Worker
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white transition cursor-pointer text-base"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmitWorker} className="p-5 space-y-4">
              <div>
                <label className="block text-slate-700 text-xs font-semibold mb-1">Full Name *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. John Doe"
                  value={newWorkerName}
                  onChange={(e) => setNewWorkerName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 focus:outline-hidden focus:border-sky-500 rounded-xl text-xs bg-white text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-700 text-xs font-semibold mb-1">Trade & Role *</label>
                <select 
                  value={newWorkerRole}
                  onChange={(e) => setNewWorkerRole(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 focus:outline-hidden focus:border-sky-500 rounded-xl text-xs bg-white text-slate-700"
                >
                  {ROLES.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 text-xs font-semibold mb-1">Phone Number</label>
                <input 
                  type="tel" 
                  placeholder="e.g. +1 (555) 012-3456"
                  value={newWorkerPhone}
                  onChange={(e) => setNewWorkerPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 focus:outline-hidden focus:border-sky-500 rounded-xl text-xs bg-white text-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-medium rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-xl transition cursor-pointer shadow-sm"
                >
                  Confirm Onboard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
