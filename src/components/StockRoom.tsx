/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Package, 
  ArrowUpRight, 
  ArrowDownLeft, 
  History, 
  AlertTriangle, 
  CheckCircle, 
  PlusCircle, 
  UserCheck, 
  Layers, 
  DollarSign, 
  TrendingDown,
  Search,
  ChevronDown
} from 'lucide-react';
import { StockItem, DistributionLog, Employee } from '../types';

interface StockRoomProps {
  stockItems: StockItem[];
  distributionLogs: DistributionLog[];
  employees: Employee[];
  onDistributeStock: (itemId: string, recipientId: string, quantity: number, purpose: string) => boolean;
  onReceiveStock: (itemId: string, quantity: number) => void;
}

const CATEGORIES = [
  'Structural',
  'Electrical',
  'Plumbing',
  'Safety',
  'Consumables',
  'Tools',
  'HVAC'
];

export default function StockRoom({
  stockItems,
  distributionLogs,
  employees,
  onDistributeStock,
  onReceiveStock
}: StockRoomProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [alertFilter, setAlertFilter] = useState('All');

  // Disbursement (Distribute) Form State
  const [showDistributeModal, setShowDistributeModal] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [distQuantity, setDistQuantity] = useState(1);
  const [distPurpose, setDistPurpose] = useState('');
  const [distError, setDistError] = useState<string | null>(null);

  // Restock Form State
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [receiveItemId, setReceiveItemId] = useState('');
  const [receiveQuantity, setReceiveQuantity] = useState(10);

  // Computed Values
  const totalValuation = stockItems.reduce((acc, item) => acc + (item.quantity * item.unitCost), 0);
  const lowStockCount = stockItems.filter(item => item.quantity <= item.reorderLevel).length;

  // Filtered Stock Room Items
  const filteredItems = stockItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.supplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
    const matchesAlert = alertFilter === 'All' || 
                         (alertFilter === 'low' && item.quantity <= item.reorderLevel) ||
                         (alertFilter === 'healthy' && item.quantity > item.reorderLevel);
    return matchesSearch && matchesCategory && matchesAlert;
  });

  // Handle Distribute Submission
  const handleDistributeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDistError(null);

    if (!selectedItemId) {
      setDistError('Please select a stock item.');
      return;
    }
    if (!selectedEmployeeId) {
      setDistError('Please select a recipient employee.');
      return;
    }
    if (distQuantity <= 0) {
      setDistError('Please enter a quantity greater than 0.');
      return;
    }

    const item = stockItems.find(i => i.id === selectedItemId);
    if (!item) {
      setDistError('Selected stock item not found.');
      return;
    }

    if (item.quantity < distQuantity) {
      setDistError(`Insufficient stock! Only ${item.quantity} ${item.unit} available in inventory.`);
      return;
    }

    // Attempt distribution
    const success = onDistributeStock(selectedItemId, selectedEmployeeId, distQuantity, distPurpose || 'General site usage');
    if (success) {
      // Clear and close
      setSelectedItemId('');
      setSelectedEmployeeId('');
      setDistQuantity(1);
      setDistPurpose('');
      setShowDistributeModal(false);
    } else {
      setDistError('Failed to distribute. Please check input parameters.');
    }
  };

  // Handle Restock Submission
  const handleReceiveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiveItemId) return;

    onReceiveStock(receiveItemId, receiveQuantity);
    
    setReceiveItemId('');
    setReceiveQuantity(10);
    setShowReceiveModal(false);
  };

  return (
    <div className="space-y-6">
      {/* StockRoom Header Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-xs" id="stockroom-header-bar">
        <div>
          <h2 className="text-slate-900 font-medium text-lg">Virtual Stock Room Management</h2>
          <p className="text-xs text-slate-400">Track raw materials, audit disbursements, and log supplier resupplies</p>
        </div>
        <div className="flex gap-2 self-stretch md:self-auto justify-stretch">
          <button 
            onClick={() => {
              if (stockItems.length > 0) {
                setSelectedItemId(stockItems[0].id);
              }
              if (employees.length > 0) {
                setSelectedEmployeeId(employees[0].id);
              }
              setShowDistributeModal(true);
            }}
            className="flex-1 md:flex-none px-4 py-2 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white text-xs font-medium rounded-xl flex items-center gap-1.5 shadow-sm transition cursor-pointer justify-center"
            id="btn-trigger-distribute-stock"
          >
            <ArrowUpRight className="w-4 h-4" />
            Distribute Materials
          </button>
          <button 
            onClick={() => {
              if (stockItems.length > 0) {
                setReceiveItemId(stockItems[0].id);
              }
              setShowReceiveModal(true);
            }}
            className="flex-1 md:flex-none px-4 py-2 border border-slate-200 hover:bg-slate-50 active:scale-95 text-slate-700 text-xs font-medium rounded-xl flex items-center gap-1.5 shadow-xs transition cursor-pointer justify-center"
            id="btn-trigger-receive-stock"
          >
            <ArrowDownLeft className="w-4 h-4" />
            Receive Delivery
          </button>
        </div>
      </div>

      {/* Stockroom Metric cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="stockroom-metric-cards">
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-3">
          <div className="p-3 bg-white text-slate-700 rounded-lg shadow-2xs border border-slate-100"><Layers className="w-5 h-5" /></div>
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Total Catalog Items</div>
            <div className="text-lg font-semibold text-slate-800">{stockItems.length} lines</div>
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-3">
          <div className="p-3 bg-white text-emerald-600 rounded-lg shadow-2xs border border-slate-100"><DollarSign className="w-5 h-5" /></div>
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Inventory Valuation</div>
            <div className="text-lg font-semibold text-slate-800">${totalValuation.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-3">
          <div className="p-3 bg-white text-amber-500 rounded-lg shadow-2xs border border-slate-100"><AlertTriangle className="w-5 h-5" /></div>
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Low Stock Reorders</div>
            <div className={`text-lg font-semibold ${lowStockCount > 0 ? 'text-amber-500' : 'text-slate-800'}`}>
              {lowStockCount} items low
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="stockroom-layout">
        {/* Inventory list: Left/Center (Span 2) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
            {/* Table Search & Filter Bar */}
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex flex-col md:flex-row gap-3" id="stockroom-search-filters">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Search materials, catalog SKU, supplier..." 
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
                  value={alertFilter}
                  onChange={(e) => setAlertFilter(e.target.value)}
                  className="px-3 py-2 border border-slate-200 focus:outline-hidden focus:border-sky-500 rounded-xl text-xs bg-white text-slate-700"
                >
                  <option value="All">All Levels</option>
                  <option value="low">Low Stock Alerts</option>
                  <option value="healthy">Healthy Stock</option>
                </select>
              </div>
            </div>

            {/* Inventory table */}
            <div className="overflow-x-auto" id="inventory-table-container">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-500 font-sans font-medium text-[11px] uppercase tracking-wider bg-slate-50/50">
                    <th className="py-3 px-4">Material Description</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Available Qty</th>
                    <th className="py-3 px-4">Safe Stock Level</th>
                    <th className="py-3 px-4">Unit Cost</th>
                    <th className="py-3 px-4 text-center">Quick Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-xs">
                  {filteredItems.length > 0 ? (
                    filteredItems.map(item => {
                      const isLow = item.quantity <= item.reorderLevel;
                      return (
                        <tr key={item.id} className={`hover:bg-slate-50/50 transition ${isLow ? 'bg-amber-50/10' : ''}`}>
                          <td className="py-3.5 px-4">
                            <div>
                              <div className="font-semibold text-slate-900">{item.name}</div>
                              <div className="text-[10px] text-slate-400 mt-0.5 font-mono">{item.id} • Supplier: {item.supplier}</div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 font-medium">{item.category}</td>
                          <td className="py-3.5 px-4">
                            <span className={`font-mono font-bold text-sm ${isLow ? 'text-amber-600' : 'text-slate-800'}`}>
                              {item.quantity}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium ml-1">{item.unit}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-medium text-slate-600">{item.reorderLevel} {item.unit}</span>
                              {isLow && (
                                <span className="px-2 py-0.5 bg-amber-100 text-amber-800 font-bold rounded-md text-[9px] uppercase tracking-wide flex items-center gap-0.5">
                                  <AlertTriangle className="w-2.5 h-2.5" />
                                  Low
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-mono font-medium text-slate-600">${item.unitCost.toFixed(2)}</td>
                          <td className="py-3.5 px-4 text-center">
                            <button 
                              onClick={() => {
                                onReceiveStock(item.id, Math.max(25, item.reorderLevel * 2));
                              }}
                              className="p-1 px-2.5 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 active:scale-95 text-slate-700 text-[10px] font-semibold rounded-lg transition-all cursor-pointer"
                              title="Instantly restock double safety quantities"
                            >
                              Quick Restock
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-slate-400 font-sans">
                        <Package className="w-12 h-12 text-slate-200 mx-auto mb-2" />
                        No materials found matching chosen filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Audit Log list: Right (Span 1) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between" id="stockroom-distribution-timeline">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-slate-500" />
                <h3 className="text-slate-900 font-medium text-sm">Material Distribution Audit</h3>
              </div>
              <span className="px-2 py-0.5 bg-slate-100 rounded-full font-mono text-[10px] text-slate-500">Audit Feed</span>
            </div>

            <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1" id="distribution-logs-list">
              {distributionLogs.length > 0 ? (
                distributionLogs.map((log, idx) => (
                  <div key={log.id} className="flex gap-3 text-xs relative">
                    {idx < distributionLogs.length - 1 && (
                      <span className="absolute left-[13px] top-6 bottom-0 w-[1.5px] bg-slate-100"></span>
                    )}

                    <span className="w-7 h-7 rounded-full bg-slate-50 text-slate-600 flex items-center justify-center shrink-0 border border-slate-100">
                      <UserCheck className="w-3.5 h-3.5" />
                    </span>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-semibold text-slate-800 truncate">{log.recipientName}</span>
                        <span className="text-[10px] font-mono text-slate-400 whitespace-nowrap shrink-0">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-600 mt-0.5">
                        Distributed <span className="font-bold font-mono text-slate-950">{log.quantity}</span> of{' '}
                        <span className="font-medium text-slate-800">{log.itemName}</span>
                      </div>
                      <div className="mt-1 text-[10px] text-slate-400 bg-slate-50 p-1.5 rounded-lg border border-slate-100/30">
                        Purpose: {log.purpose}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-slate-400">
                  <History className="w-8 h-8 text-slate-100 mx-auto mb-2" />
                  No material distributions logged yet.
                </div>
              )}
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 text-[11px] text-slate-400 flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
            Audit trail logs cannot be manually modified.
          </div>
        </div>
      </div>

      {/* Distribute Modal */}
      {showDistributeModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 backdrop-blur-xs" id="modal-distribute-stock">
          <div className="bg-white w-full max-w-md rounded-2xl border border-slate-100 shadow-xl overflow-hidden animate-in fade-in-50 zoom-in-95 duration-200">
            <div className="p-4 bg-slate-950 text-white border-b border-slate-800 flex justify-between items-center">
              <h3 className="font-sans font-medium text-sm flex items-center gap-2">
                <ArrowUpRight className="w-5 h-5 text-sky-400" />
                Disburse Material Stock
              </h3>
              <button 
                onClick={() => {
                  setDistError(null);
                  setShowDistributeModal(false);
                }}
                className="text-slate-400 hover:text-white transition cursor-pointer text-base"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleDistributeSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-slate-700 text-xs font-semibold mb-1">Select Stock Item *</label>
                <select 
                  value={selectedItemId}
                  onChange={(e) => {
                    setSelectedItemId(e.target.value);
                    setDistError(null);
                  }}
                  className="w-full px-3 py-2 border border-slate-200 focus:outline-hidden focus:border-sky-500 rounded-xl text-xs bg-white text-slate-700"
                >
                  <option value="">-- Choose Stock Item --</option>
                  {stockItems.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.name} (Qty: {item.quantity} {item.unit} available)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 text-xs font-semibold mb-1">Recipient Worker *</label>
                <select 
                  value={selectedEmployeeId}
                  onChange={(e) => {
                    setSelectedEmployeeId(e.target.value);
                    setDistError(null);
                  }}
                  className="w-full px-3 py-2 border border-slate-200 focus:outline-hidden focus:border-sky-500 rounded-xl text-xs bg-white text-slate-700"
                >
                  <option value="">-- Select Recipient Worker --</option>
                  {employees.filter(e => e.status === 'present').map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.role})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 mt-1">Note: Only workers marked 'On Site' can receive distributions.</p>
              </div>

              <div>
                <label className="block text-slate-700 text-xs font-semibold mb-1">Disbursement Quantity *</label>
                <input 
                  type="number" 
                  min={1}
                  required
                  value={distQuantity}
                  onChange={(e) => {
                    setDistQuantity(parseInt(e.target.value) || 1);
                    setDistError(null);
                  }}
                  className="w-full px-3 py-2 border border-slate-200 focus:outline-hidden focus:border-sky-500 rounded-xl text-xs bg-white text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-700 text-xs font-semibold mb-1">Specific Work Location / Purpose</label>
                <input 
                  type="text" 
                  placeholder="e.g. Ground Floor corridor wiring layouts"
                  value={distPurpose}
                  onChange={(e) => setDistPurpose(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 focus:outline-hidden focus:border-sky-500 rounded-xl text-xs bg-white text-slate-800"
                />
              </div>

              {distError && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-medium flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                  {distError}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => {
                    setDistError(null);
                    setShowDistributeModal(false);
                  }}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-medium rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-xl transition cursor-pointer shadow-sm"
                >
                  Approve disbursement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Receive Restock Modal */}
      {showReceiveModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 backdrop-blur-xs" id="modal-receive-stock">
          <div className="bg-white w-full max-w-md rounded-2xl border border-slate-100 shadow-xl overflow-hidden animate-in fade-in-50 zoom-in-95 duration-200">
            <div className="p-4 bg-slate-950 text-white border-b border-slate-800 flex justify-between items-center">
              <h3 className="font-sans font-medium text-sm flex items-center gap-2">
                <ArrowDownLeft className="w-5 h-5 text-sky-400" />
                Log Delivery Resupply
              </h3>
              <button 
                onClick={() => setShowReceiveModal(false)}
                className="text-slate-400 hover:text-white transition cursor-pointer text-base"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleReceiveSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-slate-700 text-xs font-semibold mb-1">Select Material Item *</label>
                <select 
                  value={receiveItemId}
                  onChange={(e) => setReceiveItemId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 focus:outline-hidden focus:border-sky-500 rounded-xl text-xs bg-white text-slate-700"
                >
                  {stockItems.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.name} (Current: {item.quantity} {item.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 text-xs font-semibold mb-1">Delivery Resupply Quantity *</label>
                <input 
                  type="number" 
                  min={1}
                  required
                  value={receiveQuantity}
                  onChange={(e) => setReceiveQuantity(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-slate-200 focus:outline-hidden focus:border-sky-500 rounded-xl text-xs bg-white text-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setShowReceiveModal(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-medium rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-xl transition cursor-pointer shadow-sm"
                >
                  Acknowledge Resupply
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
