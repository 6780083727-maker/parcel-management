import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { Requisition } from '../types';
import { Check, X, Clock, FileText } from 'lucide-react';

const Approvals: React.FC = () => {
  const [requisitions, setRequisitions] = useState<Requisition[]>([]);
  const [activeTab, setActiveTab] = useState<'PENDING' | 'HISTORY'>('PENDING');

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setRequisitions(db.getRequisitions());
  };

  const handleAction = (id: string, status: 'APPROVED' | 'REJECTED') => {
    const reason = prompt(status === 'APPROVED' ? 'หมายเหตุการอนุมัติ (ถ้ามี):' : 'ระบุสาเหตุที่ไม่อนุมัติ:');
    if (status === 'REJECTED' && !reason) return; // Require reason for rejection

    try {
      db.updateRequisitionStatus(id, status, reason || '');
      refreshData();
      alert(`ดำเนินการ${status === 'APPROVED' ? 'อนุมัติ' : 'ปฏิเสธ'}เรียบร้อย`);
    } catch (e: any) {
      alert(e.message);
    }
  };

  const displayReqs = requisitions.filter(r => 
    activeTab === 'PENDING' ? r.status === 'PENDING' : r.status !== 'PENDING'
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">จัดการคำขอเบิก (Approvals)</h1>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-6">
          <button 
            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'PENDING' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            onClick={() => setActiveTab('PENDING')}
          >
            รออนุมัติ ({requisitions.filter(r => r.status === 'PENDING').length})
          </button>
          <button 
            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'HISTORY' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            onClick={() => setActiveTab('HISTORY')}
          >
            ประวัติการอนุมัติ
          </button>
        </nav>
      </div>

      <div className="grid gap-4">
        {displayReqs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded shadow text-gray-500">
            ไม่มีรายการ{activeTab === 'PENDING' ? 'รออนุมัติ' : 'ในประวัติ'}
          </div>
        ) : (
          displayReqs.map(req => (
            <div key={req.id} className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-100 hover:border-blue-500 transition-colors">
              <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-lg text-slate-800">{req.id}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold
                      ${req.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                        req.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 
                        'bg-red-100 text-red-800'}`
                    }>
                      {req.status}
                    </span>
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <Clock size={14} /> {req.requestDate}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-2">
                    <span className="font-semibold">ผู้ขอเบิก:</span> {req.requesterName} | <span className="font-semibold">หน่วยงาน:</span> {req.department}
                  </div>
                  <div className="text-sm text-gray-600 mb-4 bg-gray-50 p-2 rounded">
                    <span className="font-semibold">เหตุผล:</span> {req.reason}
                  </div>

                  <div className="mt-2">
                    <p className="font-semibold text-sm mb-2 text-slate-700">รายการพัสดุ:</p>
                    <ul className="list-disc list-inside text-sm text-gray-600">
                      {req.items.map((item, idx) => (
                        <li key={idx}>{item.itemName} (จำนวน: {item.requestQty})</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {activeTab === 'PENDING' && (
                  <div className="flex flex-col gap-2 min-w-[120px]">
                    <button 
                      onClick={() => handleAction(req.id, 'APPROVED')}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center justify-center gap-2"
                    >
                      <Check size={18} /> อนุมัติ
                    </button>
                    <button 
                      onClick={() => handleAction(req.id, 'REJECTED')}
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 flex items-center justify-center gap-2"
                    >
                      <X size={18} /> ไม่อนุมัติ
                    </button>
                  </div>
                )}
                
                {activeTab === 'HISTORY' && req.approverNote && (
                  <div className="text-sm text-gray-500 italic border-l-2 border-gray-300 pl-3">
                    Note: {req.approverNote}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Approvals;