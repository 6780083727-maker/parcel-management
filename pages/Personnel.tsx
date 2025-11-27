import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { User, Role } from '../types';
import { Search, Plus, Edit2, Trash2, Save, X, Users } from 'lucide-react';

const Personnel: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Partial<User>>({});
  const [filter, setFilter] = useState('');

  useEffect(() => {
    setUsers(db.getUsers());
  }, []);

  const handleSave = () => {
    if (!editingUser.username || !editingUser.fullname || !editingUser.role) {
      return alert('กรุณากรอกข้อมูลสำคัญ (Username, ชื่อ-สกุล, สิทธิ์)');
    }

    const newUser: User = {
      id: editingUser.id || `u${Date.now()}`,
      username: editingUser.username,
      fullname: editingUser.fullname,
      position: editingUser.position || '',
      department: editingUser.department || '',
      role: editingUser.role as Role
    };

    db.saveUser(newUser);
    setUsers(db.getUsers());
    setIsModalOpen(false);
    setEditingUser({});
  };

  const handleDelete = (id: string) => {
    if (confirm('คุณแน่ใจหรือไม่ที่จะลบผู้ใช้งานรายนี้?')) {
      db.deleteUser(id);
      setUsers(db.getUsers());
    }
  };

  const filteredUsers = users.filter(u =>
    u.fullname.includes(filter) ||
    u.username.includes(filter) ||
    u.department.includes(filter)
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Users className="text-blue-900"/> จัดการบุคลากร (Personnel)
        </h1>
        <button
          onClick={() => { setEditingUser({ role: 'STAFF' }); setIsModalOpen(true); }}
          className="flex items-center gap-2 bg-blue-900 text-white px-4 py-2 rounded hover:bg-blue-800 transition"
        >
          <Plus size={18} /> เพิ่มบุคลากร
        </button>
      </div>

      {/* Filter */}
       <div className="relative">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="ค้นหาชื่อ, username หรือสังกัด..."
            className="w-full md:w-1/3 pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filter}
            onChange={e => setFilter(e.target.value)}
          />
        </div>

      {/* Table */}
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ชื่อ-สกุล</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ตำแหน่ง</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">สังกัด/ฝ่าย</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">สิทธิ์ (Role)</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">จัดการ</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map(u => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{u.username}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{u.fullname}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.position}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.department}</td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold
                    ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                      u.role === 'VIEWER' ? 'bg-orange-100 text-orange-800' :
                      'bg-blue-100 text-blue-800'}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                   <button onClick={() => { setEditingUser(u); setIsModalOpen(true); }} className="text-indigo-600 hover:text-indigo-900 mr-3"><Edit2 size={18} /></button>
                   <button onClick={() => handleDelete(u.id)} className="text-red-600 hover:text-red-900"><Trash2 size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

       {/* Modal */}
       {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-800">{editingUser.id ? 'แก้ไขข้อมูลบุคลากร' : 'เพิ่มบุคลากรใหม่'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700"><X size={24}/></button>
            </div>

            <div className="space-y-4">
               <div>
                <label className="block text-sm font-medium text-gray-700">Username (สำหรับ Login)</label>
                <input type="text" className="mt-1 block w-full border rounded-md p-2" value={editingUser.username || ''} onChange={e => setEditingUser({...editingUser, username: e.target.value})} disabled={!!editingUser.id} />
              </div>
               <div>
                <label className="block text-sm font-medium text-gray-700">ชื่อ-นามสกุล</label>
                <input type="text" className="mt-1 block w-full border rounded-md p-2" value={editingUser.fullname || ''} onChange={e => setEditingUser({...editingUser, fullname: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">ตำแหน่ง</label>
                  <input type="text" className="mt-1 block w-full border rounded-md p-2" value={editingUser.position || ''} onChange={e => setEditingUser({...editingUser, position: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">สังกัด/ฝ่าย</label>
                  <input type="text" className="mt-1 block w-full border rounded-md p-2" value={editingUser.department || ''} onChange={e => setEditingUser({...editingUser, department: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">สิทธิ์การใช้งาน (Role)</label>
                <select className="mt-1 block w-full border rounded-md p-2" value={editingUser.role || 'STAFF'} onChange={e => setEditingUser({...editingUser, role: e.target.value as Role})}>
                  <option value="STAFF">STAFF (บุคลากรทั่วไป - ขอเบิกได้)</option>
                  <option value="ADMIN">ADMIN (เจ้าหน้าที่พัสดุ - จัดการทุกอย่าง)</option>
                  <option value="VIEWER">VIEWER (ผู้บริหาร - ดูรายงาน)</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50">ยกเลิก</button>
              <button onClick={handleSave} className="px-4 py-2 bg-blue-900 text-white rounded-md hover:bg-blue-800 flex items-center gap-2">
                <Save size={18} /> บันทึก
              </button>
            </div>
          </div>
        </div>
       )}
    </div>
  );
};

export default Personnel;