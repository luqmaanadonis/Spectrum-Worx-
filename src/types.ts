/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Employee {
  id: string;
  name: string;
  role: string;
  status: 'present' | 'absent' | 'checked_out';
  phone: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  totalHoursToday: number;
  weeklyHours: number;
}

export interface AttendanceLog {
  id: string;
  employeeId: string;
  employeeName: string;
  role: string;
  type: 'sign_in' | 'sign_out';
  timestamp: string;
  notes?: string;
}

export interface WorkActivity {
  id: string;
  title: string;
  location: string;
  category: 'Structural' | 'Electrical' | 'Plumbing' | 'Finishing' | 'Excavation' | 'HVAC' | 'Masonry' | 'Other';
  progress: number; // 0 to 100
  status: 'Planned' | 'In Progress' | 'Blocked' | 'Completed';
  assignedTrade: string;
  workersCount: number;
  notes: string;
  blockageReason?: string;
  timestamp: string;
}

export interface StockItem {
  id: string;
  name: string;
  category: 'Structural' | 'Electrical' | 'Plumbing' | 'Safety' | 'Consumables' | 'Tools' | 'HVAC';
  quantity: number;
  unit: string;
  reorderLevel: number;
  unitCost: number;
  supplier: string;
  lastRestocked: string;
}

export interface DistributionLog {
  id: string;
  itemId: string;
  itemName: string;
  recipientId: string;
  recipientName: string;
  quantity: number;
  purpose: string;
  timestamp: string;
}

export interface SiteSummaryStats {
  presentCount: number;
  activeTasks: number;
  blockedTasks: number;
  completedTasks: number;
  lowStockCount: number;
  totalHoursWorkedToday: number;
}
