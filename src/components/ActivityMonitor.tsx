/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Briefcase, 
  Plus, 
  MapPin, 
  Wrench, 
  AlertTriangle, 
  CheckCircle2, 
  PlayCircle, 
  Clock, 
  Construction,
  Users,
  Search,
  CheckCircle,
  HelpCircle,
  Filter
} from 'lucide-react';
import { WorkActivity } from '../types';

interface ActivityMonitorProps {
  activities: WorkActivity[];
  onAddActivity: (activity: Omit<WorkActivity, 'id' | 'timestamp'>) => void;
  onUpdateActivityProgress: (activityId: string, progress: number) => void;
  onUpdateActivityStatus: (activityId: string, status: WorkActivity['status'], blockageReason?: string) => void;
}

const CATEGORIES = [
  'Structural',
  'Electrical',
  'Plumbing',
  'Finishing',
  'Excavation',
  'HVAC',
  'Masonry',
  'Other'
];

export default function ActivityMonitor({
  activities,
  onAddActivity,
  onUpdateActivityProgress,
  onUpdateActivityStatus
}: ActivityMonitorProps) {
  const [showAddActivityModal, setShowAddActivityModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Form State
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState<WorkActivity['category']>('Structural');
  const [assignedTrade, setAssignedTrade] = useState('');
  const [workersCount, setWorkersCount] = useState(1);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<WorkActivity['status']>('Planned');
  const [notes, setNotes] = useState('');
  const [blockageReason, setBlockageReason] = useState('');

  // Editing Blockage modal or state
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [tempBlockageReason, setTempBlockageReason] = useState('');

  const handleSubmitActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !location.trim()) return;

    onAddActivity({
      title,
      location,
      category,
      progress,
      status,
      assignedTrade: assignedTrade || 'General Labor',
      workersCount,
      notes,
      blockageReason: status === 'Blocked' ? blockageReason : undefined
    });

    // Reset Form
    setTitle('');
    setLocation('');
    setCategory('Structural');
    setAssignedTrade('');
    setWorkersCount(1);
    setProgress(0);
    setStatus('Planned');
    setNotes('');
    setBlockageReason('');
    setShowAddActivityModal(false);
  };

  const openBlockageDialog = (actId: string) => {
    setEditingBlockId(actId);
    setTempBlockageReason('');
  };

  const handleConfirmBlockage = () => {
    if (!editingBlockId) return;
    onUpdateActivityStatus(editingBlockId, 'Blocked', tempBlockageReason || 'Unspecified blockage');
    setEditingBlockId(null);
    setTempBlockageReason('');
  };

  // Filtered Activities
  const filteredActivities = activities.filter(act => {
    const matchesSearch = act.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          act.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          act.assignedTrade.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || act.category === categoryFilter;
    const matchesStatus = statusFilter === 'All' || act.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Activity Monitor Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-xs" id="activity-header-bar">
        <div>
          <h2 className="text-slate-900 font-medium text-lg">Daily Work Activity Monitor</h2>
          <p className="text-xs text-slate-400">Log task progress, re-schedule operations, and resolve critical structural blockages</p>
        </div>
        <button 
          onClick={() => setShowAddActivityModal(true)}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white text-xs font-medium rounded-xl flex items-center gap-1.5 shadow-sm transition cursor-pointer self-stretch md:self-auto justify-center"
          id="btn-trigger-add-activity"
        >
          <Plus className="w-4 h-4" />
          Create New Site Task
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4" id="activity-mini-dashboard">
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-3">
          <div className="p-3 bg-white text-sky-600 rounded-lg shadow-2xs border border-slate-100"><PlayCircle className="w-5 h-5" /></div>
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">In Progress</div>
            <div className="text-lg font-semibold text-slate-800">{activities.filter(a => a.status === 'In Progress').length} tasks</div>
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-3">
          <div className="p-3 bg-white text-rose-500 rounded-lg shadow-2xs border border-slate-100"><AlertTriangle className="w-5 h-5" /></div>
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Blocked Issues</div>
            <div className="text-lg font-semibold text-rose-500">{activities.filter(a => a.status === 'Blocked').length} blocked</div>
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-3">
          <div className="p-3 bg-white text-emerald-600 rounded-lg shadow-2xs border border-slate-100"><CheckCircle2 className="w-5 h-5" /></div>
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Completed Logs</div>
            <div className="text-lg font-semibold text-slate-800">{activities.filter(a => a.status === 'Completed').length} done</div>
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-3">
          <div className="p-3 bg-white text-slate-500 rounded-lg shadow-2xs border border-slate-100"><Clock className="w-5 h-5" /></div>
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Total Registered</div>
            <div className="text-lg font-semibold text-slate-800">{activities.length} entries</div>
          </div>
        </div>
      </div>

      {/* Filters & Grid */}
      <div className="space-y-4">
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs flex flex-col md:flex-row gap-3" id="activity-search-filters">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search by task title, trade, location..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 focus:outline-hidden focus:border-sky-500 rounded-xl text-xs bg-white text-slate-800"
            />
          </div>
          <div className="flex gap-2">
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-slate-200 focus:outline-hidden focus:border-sky-500 rounded-xl text-xs bg-white text-slate-700"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-slate-200 focus:outline-hidden focus:border-sky-500 rounded-xl text-xs bg-white text-slate-700"
            >
              <option value="All">All Statuses</option>
              <option value="Planned">Planned</option>
              <option value="In Progress">In Progress</option>
              <option value="Blocked">Blocked</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Activity Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="activity-cards-grid">
          {filteredActivities.length > 0 ? (
            filteredActivities.map(act => (
              <div 
                key={act.id} 
                className={`bg-white rounded-2xl border p-5 flex flex-col justify-between transition-all hover:shadow-md ${
                  act.status === 'Blocked' ? 'border-red-200 bg-red-50/10' :
                  act.status === 'Completed' ? 'border-emerald-100 bg-emerald-50/10' : 'border-slate-100'
                }`}
              >
                {/* Upper Details */}
                <div>
                  <div className="flex justify-between items-start gap-2 mb-3">
                    <span className="px-2 py-0.5 bg-slate-100 rounded-md font-mono text-[9px] text-slate-500 uppercase tracking-wider">{act.category}</span>
                    <span className={`px-2 py-0.5 rounded-md font-semibold text-[10px] uppercase tracking-wide ${
                      act.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                      act.status === 'In Progress' ? 'bg-sky-100 text-sky-800 animate-pulse' :
                      act.status === 'Blocked' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {act.status}
                    </span>
                  </div>

                  <h3 className="text-slate-900 font-medium text-sm leading-snug line-clamp-1">{act.title}</h3>
                  
                  {/* Location & Trade */}
                  <div className="mt-3 space-y-1.5 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{act.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Wrench className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate font-medium">{act.assignedTrade} ({act.workersCount} assigned)</span>
                    </div>
                  </div>

                  <p className="mt-3 text-xs text-slate-600 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100/50 leading-relaxed text-left line-clamp-3">
                    {act.notes}
                  </p>

                  {/* Blockage Alert */}
                  {act.status === 'Blocked' && act.blockageReason && (
                    <div className="mt-3 p-2.5 bg-red-50 border border-red-100 rounded-xl text-red-700 text-[11px] leading-relaxed">
                      <div className="font-semibold flex items-center gap-1 text-red-800 mb-0.5">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Task Blocked Root Cause:
                      </div>
                      "{act.blockageReason}"
                    </div>
                  )}
                </div>

                {/* Progress bar and controls */}
                <div className="mt-5 pt-4 border-t border-slate-100 space-y-3">
                  <div>
                    <div className="flex justify-between items-center text-xs font-medium text-slate-600 mb-1">
                      <span>Completion Rate</span>
                      <span className="font-mono text-slate-900 font-semibold">{act.progress}%</span>
                    </div>
                    {/* Interactive Slider Progress */}
                    {act.status !== 'Completed' && act.status !== 'Blocked' ? (
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={act.progress}
                        onChange={(e) => onUpdateActivityProgress(act.id, parseInt(e.target.value))}
                        className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-sky-600"
                      />
                    ) : (
                      <div className="w-full bg-slate-100 rounded-full h-1.5">
                        <div 
                          className={`h-1.5 rounded-full ${act.status === 'Completed' ? 'bg-emerald-500' : 'bg-red-400'}`} 
                          style={{ width: `${act.progress}%` }}
                        ></div>
                      </div>
                    )}
                  </div>

                  {/* Change Status Buttons */}
                  <div className="flex gap-1.5 justify-end" id="activity-quick-actions">
                    {act.status !== 'In Progress' && act.status !== 'Completed' && (
                      <button 
                        onClick={() => onUpdateActivityStatus(act.id, 'In Progress')}
                        className="p-1 px-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-[10px] font-semibold rounded-lg transition-all cursor-pointer"
                      >
                        Start
                      </button>
                    )}
                    {act.status !== 'Blocked' && act.status !== 'Completed' && (
                      <button 
                        onClick={() => openBlockageDialog(act.id)}
                        className="p-1 px-2 border border-rose-200 hover:bg-rose-50 text-rose-700 text-[10px] font-semibold rounded-lg transition-all cursor-pointer"
                      >
                        Flag Blocked
                      </button>
                    )}
                    {act.status !== 'Completed' && (
                      <button 
                        onClick={() => onUpdateActivityStatus(act.id, 'Completed')}
                        className="p-1 px-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-semibold rounded-lg transition-all cursor-pointer shadow-xs"
                      >
                        Complete
                      </button>
                    )}
                    {act.status === 'Completed' && (
                      <button 
                        onClick={() => onUpdateActivityStatus(act.id, 'Planned')}
                        className="p-1 px-2 border border-slate-200 hover:bg-slate-50 text-slate-500 text-[10px] font-semibold rounded-lg transition-all cursor-pointer"
                      >
                        Reset Status
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-16 text-slate-400">
              <Construction className="w-12 h-12 text-slate-100 mx-auto mb-2" />
              No tasks found. Try adjusting filters or click 'Create New Site Task' to log work.
            </div>
          )}
        </div>
      </div>

      {/* Flag Blockage Modal */}
      {editingBlockId && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 backdrop-blur-xs" id="modal-flag-blockage">
          <div className="bg-white w-full max-w-md rounded-2xl border border-slate-100 shadow-xl overflow-hidden animate-in fade-in-50 zoom-in-95 duration-200">
            <div className="p-4 bg-red-950 text-white border-b border-red-900 flex justify-between items-center">
              <h3 className="font-sans font-medium text-sm flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400 animate-bounce" />
                Document Operational Blockage
              </h3>
              <button 
                onClick={() => setEditingBlockId(null)}
                className="text-red-300 hover:text-white transition cursor-pointer text-base"
              >
                ✕
              </button>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-slate-500 text-xs leading-relaxed">
                Provide detail regarding the site obstruction, delayed materials, weather event, or trade crew missing so that site directors can take action.
              </p>
              <div>
                <label className="block text-slate-700 text-xs font-semibold mb-1">Root Cause / Description of Obstruction *</label>
                <textarea 
                  required
                  rows={3}
                  placeholder="e.g., Vertical pipe riser cannot progress as heavy rigging scaffolds from concrete pouring still obstructs the plumbing shaft."
                  value={tempBlockageReason}
                  onChange={(e) => setTempBlockageReason(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 focus:outline-hidden focus:border-red-500 focus:ring-1 focus:ring-red-500 rounded-xl text-xs bg-white text-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setEditingBlockId(null)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-medium rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  onClick={handleConfirmBlockage}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-xl transition cursor-pointer shadow-sm"
                >
                  Flag Task as Blocked
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create New Activity Modal */}
      {showAddActivityModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 backdrop-blur-xs" id="modal-create-activity">
          <div className="bg-white w-full max-w-lg rounded-2xl border border-slate-100 shadow-xl overflow-hidden animate-in fade-in-50 zoom-in-95 duration-200">
            <div className="p-4 bg-slate-950 text-white border-b border-slate-800 flex justify-between items-center">
              <h3 className="font-sans font-medium text-sm flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-sky-400" />
                Initialize Daily Site Task
              </h3>
              <button 
                onClick={() => setShowAddActivityModal(false)}
                className="text-slate-400 hover:text-white transition cursor-pointer text-base"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmitActivity} className="p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-slate-700 text-xs font-semibold mb-1">Task Title *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Install Zone B primary drywalls"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 focus:outline-hidden focus:border-sky-500 rounded-xl text-xs bg-white text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 text-xs font-semibold mb-1">Specific Location *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. West Wing, Floor 1"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 focus:outline-hidden focus:border-sky-500 rounded-xl text-xs bg-white text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 text-xs font-semibold mb-1">Category Category *</label>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value as WorkActivity['category'])}
                    className="w-full px-3 py-2 border border-slate-200 focus:outline-hidden focus:border-sky-500 rounded-xl text-xs bg-white text-slate-700"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 text-xs font-semibold mb-1">Assigned Trade Crew *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Masons, Electricians"
                    value={assignedTrade}
                    onChange={(e) => setAssignedTrade(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 focus:outline-hidden focus:border-sky-500 rounded-xl text-xs bg-white text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 text-xs font-semibold mb-1">Crew Size (Number of Workers)</label>
                  <input 
                    type="number" 
                    min={1}
                    value={workersCount}
                    onChange={(e) => setWorkersCount(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-slate-200 focus:outline-hidden focus:border-sky-500 rounded-xl text-xs bg-white text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 text-xs font-semibold mb-1">Initial Completion %</label>
                  <input 
                    type="number" 
                    min={0}
                    max={100}
                    value={progress}
                    onChange={(e) => setProgress(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                    className="w-full px-3 py-2 border border-slate-200 focus:outline-hidden focus:border-sky-500 rounded-xl text-xs bg-white text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 text-xs font-semibold mb-1">Initial Status</label>
                  <select 
                    value={status}
                    onChange={(e) => setStatus(e.target.value as WorkActivity['status'])}
                    className="w-full px-3 py-2 border border-slate-200 focus:outline-hidden focus:border-sky-500 rounded-xl text-xs bg-white text-slate-700"
                  >
                    <option value="Planned">Planned</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Blocked">Blocked</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              {status === 'Blocked' && (
                <div className="animate-in slide-in-from-top-1">
                  <label className="block text-red-600 text-xs font-semibold mb-1">Root Cause for Blockage *</label>
                  <input 
                    type="text" 
                    required={status === 'Blocked'}
                    placeholder="Specify why this task is blocked..."
                    value={blockageReason}
                    onChange={(e) => setBlockageReason(e.target.value)}
                    className="w-full px-3 py-2 border border-red-200 focus:outline-hidden focus:border-red-500 rounded-xl text-xs bg-white text-slate-800"
                  />
                </div>
              )}

              <div>
                <label className="block text-slate-700 text-xs font-semibold mb-1">Log Notes & Descriptions</label>
                <textarea 
                  rows={2}
                  placeholder="Notes on milestones, critical alignments, materials required..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 focus:outline-hidden focus:border-sky-500 rounded-xl text-xs bg-white text-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setShowAddActivityModal(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-medium rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-xl transition cursor-pointer shadow-sm"
                >
                  Confirm Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
