import React, { useMemo } from 'react';
import { db } from '../services/db';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { AlertCircle, Package, FileText, CheckCircle } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const Dashboard: React.FC = () => {
  const items = db.getItems();
  const requisitions = db.getRequisitions();

  const stats = useMemo(() => {
    const lowStock = items.filter(i => i.quantity <= i.minQuantity).length;
    const pending = requisitions.filter(r => r.status === 'PENDING').length;
    const approved = requisitions.filter(r => r.status === 'APPROVED').length;
    return { lowStock, pending, approved, totalItems: items.length };
  }, [items, requisitions]);

  const categoryData = useMemo(() => {
    const acc: Record<string, number> = {};
    items.forEach(i => {
      acc[i.category] = (acc[i.category] || 0) + i.quantity;
    });
    return Object.keys(acc).map(k => ({ name: k, value: acc[k] }));
  }, [items]);

  const reqStatusData = useMemo(() => {
    const acc: Record<string, number> = { 'รออนุมัติ': 0, 'อนุมัติแล้ว': 0, 'ไม่อนุมัติ': 0 };
    requisitions.forEach(r => {
      if (r.status === 'PENDING') acc['รออนุมัติ']++;
      else if (r.status === 'APPROVED') acc['อนุมัติแล้ว']++;
      else if (r.status === 'REJECTED') acc['ไม่อนุมัติ']++;
    });
    return Object.keys(acc).map(k => ({ name: k, value: acc[k] }));
  }, [requisitions]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">ภาพรวมระบบ (Dashboard)</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">พัสดุทั้งหมด</p>
            <p className="text-2xl font-bold">{stats.totalItems}</p>
          </div>
          <Package className="text-blue-500" size={32} />
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-red-500 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">พัสดุใกล้หมด</p>
            <p className="text-2xl font-bold text-red-600">{stats.lowStock}</p>
          </div>
          <AlertCircle className="text-red-500" size={32} />
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-yellow-500 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">คำขอรออนุมัติ</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          </div>
          <FileText className="text-yellow-500" size={32} />
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">อนุมัติเดือนนี้</p>
            <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
          </div>
          <CheckCircle className="text-green-500" size={32} />
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 text-slate-700">ปริมาณพัสดุคงคลังแยกตามหมวดหมู่</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{fontSize: 12}} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#1e3a8a" name="จำนวน" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 text-slate-700">สัดส่วนสถานะคำขอเบิก</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={reqStatusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label
                >
                  {reqStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Low Stock Alert List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="bg-red-50 px-6 py-4 border-b border-red-100 flex items-center gap-2">
          <AlertCircle size={20} className="text-red-600" />
          <h3 className="font-semibold text-red-800">รายการพัสดุที่ต้องจัดซื้อเพิ่ม (ต่ำกว่าเกณฑ์)</h3>
        </div>
        <div className="p-4">
           {items.filter(i => i.quantity <= i.minQuantity).length === 0 ? (
             <p className="text-gray-500 text-center py-4">ไม่มีรายการพัสดุใกล้หมด</p>
           ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">รหัส</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อพัสดุ</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">คงเหลือ</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ขั้นต่ำ</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {items.filter(i => i.quantity <= i.minQuantity).map(item => (
                    <tr key={item.id}>
                      <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{item.code}</td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-700">{item.name}</td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm text-red-600 font-bold">{item.quantity} {item.unit}</td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500">{item.minQuantity} {item.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;