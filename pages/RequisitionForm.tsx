import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { Item, User, RequisitionItem } from '../types';
import { Search, Plus, Trash2, Send } from 'lucide-react';

interface Props {
  user: User;
  onSuccess: () => void;
}

const RequisitionForm: React.FC<Props> = ({ user, onSuccess }) => {
  const [items, setItems] = useState<Item[]>([]);
  const [cart, setCart] = useState<RequisitionItem[]>([]);
  const [reason, setReason] = useState('');
  const [itemSearch, setItemSearch] = useState('');
  
  useEffect(() => {
    setItems(db.getItems());
  }, []);

  const addToCart = (item: Item) => {
    if (cart.find(c => c.itemId === item.id)) return;
    setCart([...cart, { itemId: item.id, itemName: item.name, requestQty: 1 }]);
  };

  const removeFromCart = (itemId: string) => {
    setCart(cart.filter(c => c.itemId !== itemId));
  };

  const updateQty = (itemId: string, qty: number) => {
    const item = items.find(i => i.id === itemId);
    if (item && qty > item.quantity) {
      alert(`ขออภัย มีของในสต็อกเพียง ${item.quantity} ${item.unit}`);
      return;
    }
    setCart(cart.map(c => c.itemId === itemId ? { ...c, requestQty: Math.max(1, qty) } : c));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return alert('กรุณาเลือกพัสดุอย่างน้อย 1 รายการ');
    if (!reason) return alert('กรุณาระบุเหตุผลการเบิก');

    db.createRequisition({
      requesterId: user.id,
      requesterName: user.fullname,
      department: user.department,
      reason,
      items: cart
    });

    alert('ส่งคำขอเบิกเรียบร้อยแล้ว');
    onSuccess();
  };

  const filteredItems = items.filter(i => 
    (i.name.includes(itemSearch) || i.code.includes(itemSearch)) && i.quantity > 0
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">ขอเบิกพัสดุ (New Requisition)</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Item Selection */}
        <div className="bg-white p-6 rounded shadow">
          <h2 className="font-semibold text-lg mb-4 text-blue-900">1. เลือกรายการพัสดุ</h2>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="ค้นหาพัสดุ..." 
              className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={itemSearch}
              onChange={e => setItemSearch(e.target.value)}
            />
          </div>
          <div className="h-96 overflow-y-auto border rounded-md divide-y">
            {filteredItems.map(item => (
              <div key={item.id} className="p-3 flex justify-between items-center hover:bg-gray-50">
                <div>
                  <p className="font-medium text-gray-800">{item.name}</p>
                  <p className="text-xs text-gray-500">{item.code} | คงเหลือ: {item.quantity} {item.unit}</p>
                </div>
                <button 
                  onClick={() => addToCart(item)}
                  disabled={cart.some(c => c.itemId === item.id)}
                  className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 disabled:opacity-50"
                >
                  <Plus size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Cart & Submit */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded shadow">
            <h2 className="font-semibold text-lg mb-4 text-blue-900">2. รายการเบิกจ่าย</h2>
            {cart.length === 0 ? (
              <p className="text-gray-400 text-center py-8">ยังไม่ได้เลือกรายการ</p>
            ) : (
              <div className="space-y-3">
                {cart.map(item => (
                  <div key={item.itemId} className="flex justify-between items-center border-b pb-2 last:border-0">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.itemName}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <input 
                        type="number" 
                        className="w-16 border rounded p-1 text-center"
                        value={item.requestQty}
                        onChange={e => updateQty(item.itemId, Number(e.target.value))}
                      />
                      <button onClick={() => removeFromCart(item.itemId)} className="text-red-500 hover:text-red-700">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow">
            <h2 className="font-semibold text-lg mb-4 text-blue-900">3. ข้อมูลผู้เบิก</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase">ชื่อ-สกุล</label>
                    <div className="text-sm font-medium mt-1">{user.fullname}</div>
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase">หน่วยงาน</label>
                    <div className="text-sm font-medium mt-1">{user.department}</div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">เหตุผลการเบิก <span className="text-red-500">*</span></label>
                <textarea 
                  required
                  rows={3}
                  className="mt-1 block w-full border rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="เช่น ใช้สำหรับการจัดกิจกรรมวันวิทยาศาสตร์"
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                ></textarea>
              </div>
              <button 
                type="submit" 
                className="w-full bg-blue-900 text-white py-3 rounded-md hover:bg-blue-800 font-semibold flex justify-center items-center gap-2"
              >
                <Send size={18} /> ยืนยันคำขอเบิก
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RequisitionForm;