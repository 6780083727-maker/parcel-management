import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { Item, CATEGORIES, User } from '../types';
import { Search, Plus, Edit2, Trash2, Save, X } from 'lucide-react';

interface Props {
  user: User;
}

const Inventory: React.FC<Props> = ({ user }) => {
  const [items, setItems] = useState<Item[]>([]);
  const [filter, setFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<Item>>({});

  const canEdit = user.role === 'ADMIN';

  useEffect(() => {
    setItems(db.getItems());
  }, []);

  const handleSave = () => {
    if (!editingItem.code || !editingItem.name) return alert('กรุณากรอกข้อมูลสำคัญ');
    
    const newItem: Item = {
      id: editingItem.id || `i${Date.now()}`,
      code: editingItem.code!,
      name: editingItem.name!,
      category: editingItem.category || 'อื่นๆ',
      unit: editingItem.unit || 'ชิ้น',
      quantity: Number(editingItem.quantity) || 0,
      minQuantity: Number(editingItem.minQuantity) || 0,
      location: editingItem.location || '-',
      lastUpdated: new Date().toISOString()
    };
    
    db.saveItem(newItem);
    setItems(db.getItems());
    setIsModalOpen(false);
    setEditingItem({});
  };

  const handleDelete = (id: string) => {
    if (confirm('คุณแน่ใจหรือไม่ที่จะลบรายการนี้?')) {
      db.deleteItem(id);
      setItems(db.getItems());
    }
  };

  const filteredItems = items.filter(i => {
    const matchesSearch = i.name.includes(filter) || i.code.includes(filter);
    const matchesCategory = categoryFilter === 'All' || i.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-800">คลังพัสดุ (Inventory)</h1>
        {canEdit && (
          <button 
            onClick={() => { setEditingItem({}); setIsModalOpen(true); }}
            className="flex items-center gap-2 bg-blue-900 text-white px-4 py-2 rounded hover:bg-blue-800 transition"
          >
            <Plus size={18} /> เพิ่มพัสดุใหม่
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded shadow">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="ค้นหารหัส หรือ ชื่อพัสดุ..." 
            className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filter}
            onChange={e => setFilter(e.target.value)}
          />
        </div>
        <select 
          className="border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
        >
          <option value="All">ทุกหมวดหมู่</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">รหัส</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ชื่อรายการ</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">หมวดหมู่</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">คงเหลือ</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">สถานที่เก็บ</th>
              {canEdit && <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">จัดการ</th>}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredItems.map(item => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.code}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.category}</td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.quantity <= item.minQuantity ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                    {item.quantity} {item.unit}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.location}</td>
                {canEdit && (
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <button onClick={() => { setEditingItem(item); setIsModalOpen(true); }} className="text-indigo-600 hover:text-indigo-900 mr-3"><Edit2 size={18} /></button>
                    <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-900"><Trash2 size={18} /></button>
                  </td>
                )}
              </tr>
            ))}
            {filteredItems.length === 0 && (
              <tr><td colSpan={6} className="text-center py-8 text-gray-400">ไม่พบข้อมูลพัสดุ</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-800">{editingItem.id ? 'แก้ไขพัสดุ' : 'เพิ่มพัสดุใหม่'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700"><X size={24}/></button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">รหัสพัสดุ</label>
                <input type="text" className="mt-1 block w-full border rounded-md p-2" value={editingItem.code || ''} onChange={e => setEditingItem({...editingItem, code: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">ชื่อพัสดุ</label>
                <input type="text" className="mt-1 block w-full border rounded-md p-2" value={editingItem.name || ''} onChange={e => setEditingItem({...editingItem, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">หมวดหมู่</label>
                <select className="mt-1 block w-full border rounded-md p-2" value={editingItem.category || ''} onChange={e => setEditingItem({...editingItem, category: e.target.value})}>
                  <option value="">เลือกหมวดหมู่</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">หน่วยนับ</label>
                <input type="text" className="mt-1 block w-full border rounded-md p-2" value={editingItem.unit || ''} onChange={e => setEditingItem({...editingItem, unit: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">จำนวนคงเหลือ</label>
                <input type="number" className="mt-1 block w-full border rounded-md p-2" value={editingItem.quantity || ''} onChange={e => setEditingItem({...editingItem, quantity: Number(e.target.value)})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">จำนวนขั้นต่ำแจ้งเตือน</label>
                <input type="number" className="mt-1 block w-full border rounded-md p-2" value={editingItem.minQuantity || ''} onChange={e => setEditingItem({...editingItem, minQuantity: Number(e.target.value)})} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">สถานที่จัดเก็บ</label>
                <input type="text" className="mt-1 block w-full border rounded-md p-2" value={editingItem.location || ''} onChange={e => setEditingItem({...editingItem, location: e.target.value})} />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50">ยกเลิก</button>
              <button onClick={handleSave} className="px-4 py-2 bg-blue-900 text-white rounded-md hover:bg-blue-800 flex items-center gap-2">
                <Save size={18} /> บันทึกข้อมูล
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;