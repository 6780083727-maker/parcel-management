export type Role = 'ADMIN' | 'STAFF' | 'VIEWER';

export interface User {
  id: string;
  username: string;
  fullname: string;
  position: string; // e.g., ครูชำนาญการ
  department: string; // e.g., กลุ่มสาระภาษาไทย
  role: Role;
}

export interface Item {
  id: string;
  code: string;
  name: string;
  category: string;
  unit: string;
  quantity: number;
  minQuantity: number;
  location: string;
  lastUpdated: string;
}

export type RequisitionStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';

export interface RequisitionItem {
  itemId: string;
  itemName: string;
  requestQty: number;
}

export interface Requisition {
  id: string;
  requesterId: string;
  requesterName: string;
  department: string;
  requestDate: string;
  reason: string;
  items: RequisitionItem[];
  status: RequisitionStatus;
  approverNote?: string;
  approveDate?: string;
}

export const CATEGORIES = [
  'วัสดุสำนักงาน',
  'สื่อการสอน',
  'อุปกรณ์คอมพิวเตอร์',
  'วัสดุงานบ้านงานครัว',
  'วัสดุกีฬา',
  'อื่นๆ'
];