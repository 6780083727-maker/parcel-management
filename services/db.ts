import { Item, Requisition, User, Role, RequisitionStatus } from '../types';

// Initial Mock Data
const MOCK_USERS: User[] = [
  { id: 'u1', username: 'admin', fullname: 'สมชาย ใจดี (Admin)', position: 'เจ้าหน้าที่พัสดุ', department: 'สำนักงาน', role: 'ADMIN' },
  { id: 'u2', username: 'staff', fullname: 'ครูสมศรี รักเรียน', position: 'ครูชำนาญการ', department: 'กลุ่มสาระภาษาไทย', role: 'STAFF' },
  { id: 'u3', username: 'director', fullname: 'ผอ. วิสัยทัศน์ กว้างไกล', position: 'ผู้อำนวยการ', department: 'ผู้บริหาร', role: 'VIEWER' },
];

const MOCK_ITEMS: Item[] = [
  { id: 'i1', code: 'OFF-001', name: 'กระดาษ A4 Double A (80g)', category: 'วัสดุสำนักงาน', unit: 'รีม', quantity: 45, minQuantity: 10, location: 'ตู้ 1 ชั้น 2', lastUpdated: '2023-10-01' },
  { id: 'i2', code: 'OFF-002', name: 'ปากกาไวท์บอร์ด (น้ำเงิน)', category: 'วัสดุสำนักงาน', unit: 'ด้าม', quantity: 120, minQuantity: 20, location: 'ตู้ 1 ชั้น 1', lastUpdated: '2023-10-05' },
  { id: 'i3', code: 'COM-001', name: 'เมาส์ไร้สาย Logitech', category: 'อุปกรณ์คอมพิวเตอร์', unit: 'อัน', quantity: 5, minQuantity: 5, location: 'ห้อง Server', lastUpdated: '2023-09-20' },
  { id: 'i4', code: 'CL-001', name: 'น้ำยาถูพื้น 3.5 ลิตร', category: 'วัสดุงานบ้านงานครัว', unit: 'แกลลอน', quantity: 8, minQuantity: 5, location: 'ห้องแม่บ้าน', lastUpdated: '2023-10-10' },
  { id: 'i5', code: 'EDU-001', name: 'กระดาษสี หน้าเดียว', category: 'สื่อการสอน', unit: 'ห่อ', quantity: 50, minQuantity: 15, location: 'ตู้ 2 ชั้น 3', lastUpdated: '2023-10-02' },
];

const MOCK_REQUISITIONS: Requisition[] = [
  {
    id: 'R-2566-001',
    requesterId: 'u2',
    requesterName: 'ครูสมศรี รักเรียน',
    department: 'กลุ่มสาระภาษาไทย',
    requestDate: '2023-10-15',
    reason: 'ใช้ประกอบการเรียนการสอน ม.1',
    status: 'APPROVED',
    items: [{ itemId: 'i2', itemName: 'ปากกาไวท์บอร์ด (น้ำเงิน)', requestQty: 5 }],
    approveDate: '2023-10-16'
  },
  {
    id: 'R-2566-002',
    requesterId: 'u2',
    requesterName: 'ครูสมศรี รักเรียน',
    department: 'กลุ่มสาระภาษาไทย',
    requestDate: '2023-10-20',
    reason: 'จัดบอร์ดนิทรรศการวันภาษาไทย',
    status: 'PENDING',
    items: [
      { itemId: 'i1', itemName: 'กระดาษ A4 Double A (80g)', requestQty: 2 },
      { itemId: 'i5', itemName: 'กระดาษสี หน้าเดียว', requestQty: 10 }
    ]
  }
];

// Helper to load/save
const load = <T,>(key: string, defaultData: T): T => {
  const stored = localStorage.getItem(key);
  if (!stored) return defaultData;
  try {
    return JSON.parse(stored);
  } catch {
    return defaultData;
  }
};

const save = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Service Class
class DBService {
  getUsers(): User[] {
    return load('ws_users', MOCK_USERS);
  }

  saveUser(user: User) {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.id === user.id);
    if (idx >= 0) {
      users[idx] = user;
    } else {
      users.push(user);
    }
    save('ws_users', users);
  }

  deleteUser(id: string) {
    const users = this.getUsers().filter(u => u.id !== id);
    save('ws_users', users);
  }

  getItems(): Item[] {
    return load('ws_items', MOCK_ITEMS);
  }

  saveItem(item: Item) {
    const items = this.getItems();
    const idx = items.findIndex(i => i.id === item.id);
    if (idx >= 0) {
      items[idx] = { ...item, lastUpdated: new Date().toISOString().split('T')[0] };
    } else {
      items.push({ ...item, lastUpdated: new Date().toISOString().split('T')[0] });
    }
    save('ws_items', items);
  }

  deleteItem(id: string) {
    const items = this.getItems().filter(i => i.id !== id);
    save('ws_items', items);
  }

  getRequisitions(): Requisition[] {
    return load('ws_requisitions', MOCK_REQUISITIONS);
  }

  createRequisition(req: Omit<Requisition, 'id' | 'requestDate' | 'status'>) {
    const all = this.getRequisitions();
    const newReq: Requisition = {
      ...req,
      id: `R-2566-${(all.length + 1).toString().padStart(3, '0')}`,
      requestDate: new Date().toISOString().split('T')[0],
      status: 'PENDING'
    };
    all.unshift(newReq);
    save('ws_requisitions', all);
  }

  updateRequisitionStatus(id: string, status: RequisitionStatus, note?: string) {
    const reqs = this.getRequisitions();
    const items = this.getItems();
    const idx = reqs.findIndex(r => r.id === id);
    
    if (idx >= 0) {
      const req = reqs[idx];
      
      // If approving, deduct stock
      if (status === 'APPROVED' && req.status !== 'APPROVED') {
        let stockIssue = false;
        // Check stock first
        req.items.forEach(reqItem => {
          const invItem = items.find(i => i.id === reqItem.itemId);
          if (!invItem || invItem.quantity < reqItem.requestQty) {
            stockIssue = true;
          }
        });

        if (stockIssue) {
          throw new Error("สต็อกสินค้าไม่เพียงพอ ไม่สามารถอนุมัติได้");
        }

        // Deduct
        req.items.forEach(reqItem => {
          const itemIdx = items.findIndex(i => i.id === reqItem.itemId);
          if (itemIdx >= 0) {
            items[itemIdx].quantity -= reqItem.requestQty;
          }
        });
        save('ws_items', items);
      }

      reqs[idx] = { 
        ...req, 
        status, 
        approverNote: note,
        approveDate: status === 'APPROVED' ? new Date().toISOString().split('T')[0] : undefined
      };
      save('ws_requisitions', reqs);
    }
  }

  login(username: string): User | null {
    const users = this.getUsers();
    return users.find(u => u.username === username) || null;
  }
}

export const db = new DBService();