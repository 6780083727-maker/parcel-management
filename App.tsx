import React, { useState } from 'react';
import { HashRouter as Router } from 'react-router-dom'; // Using HashRouter as permitted
import { User } from './types';
import { db } from './services/db';
import { 
  LayoutDashboard, Box, FilePlus, ClipboardCheck, History, LogOut, Menu, User as UserIcon, BarChart3, Users
} from 'lucide-react';

import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import RequisitionForm from './pages/RequisitionForm';
import Approvals from './pages/Approvals';
import Personnel from './pages/Personnel';

// Simple Router Component since we are in a single file setup mostly
const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<string>('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  // Login State
  const [loginUsername, setLoginUsername] = useState('');
  const [loginError, setLoginError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const foundUser = db.login(loginUsername);
    if (foundUser) {
      setUser(foundUser);
      setLoginError('');
      setCurrentPage(foundUser.role === 'STAFF' ? 'my-requests' : 'dashboard');
    } else {
      setLoginError('ไม่พบชื่อผู้ใช้งานนี้ (ลอง admin, staff, หรือ director)');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setLoginUsername('');
    setCurrentPage('dashboard');
  };

  // Simplified "My Requests" page inline for brevity
  const MyRequestsPage = () => {
    const reqs = db.getRequisitions().filter(r => r.requesterId === user?.id);
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-800">ประวัติการเบิกของฉัน</h1>
        <div className="grid gap-4">
          {reqs.length === 0 ? <p className="text-gray-500">ไม่มีประวัติการขอเบิก</p> : reqs.map(r => (
            <div key={r.id} className="bg-white p-4 rounded shadow">
              <div className="flex justify-between">
                <span className="font-bold">{r.id}</span>
                <span className={`px-2 rounded text-xs ${r.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>{r.status}</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">{r.reason}</p>
              <p className="text-xs text-gray-400 mt-2">{r.requestDate}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
        <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
          <div className="text-center mb-8">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Box className="text-blue-900" size={32} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">โรงเรียนวัดสังเวช</h1>
            <p className="text-gray-500">ระบบบริหารจัดการพัสดุ</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Username</label>
              <input 
                type="text" 
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ex: admin, staff, director"
                value={loginUsername}
                onChange={e => setLoginUsername(e.target.value)}
              />
            </div>
            {loginError && <p className="text-red-500 text-sm">{loginError}</p>}
            <button 
              type="submit" 
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-900 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              เข้าสู่ระบบ
            </button>
          </form>
          <div className="mt-6 text-xs text-gray-400 text-center">
            <p>Demo Accounts:</p>
            <p>admin (เจ้าหน้าที่) | staff (ครู) | director (ผู้บริหาร)</p>
          </div>
        </div>
      </div>
    );
  }

  const renderPage = () => {
    switch(currentPage) {
      case 'dashboard': return <Dashboard />;
      case 'inventory': return <Inventory user={user} />;
      case 'requisition': return <RequisitionForm user={user} onSuccess={() => setCurrentPage('my-requests')} />;
      case 'approvals': return <Approvals />;
      case 'personnel': return <Personnel />;
      case 'my-requests': return <MyRequestsPage />;
      default: return <Dashboard />;
    }
  };

  const NavItem = ({ id, label, icon: Icon, roles }: any) => {
    if (roles && !roles.includes(user.role)) return null;
    return (
      <button 
        onClick={() => { setCurrentPage(id); setSidebarOpen(false); }}
        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${currentPage === id ? 'bg-blue-800 text-white' : 'text-blue-100 hover:bg-blue-800 hover:text-white'}`}
      >
        <Icon size={20} />
        <span>{label}</span>
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row font-sans">
      {/* Mobile Header */}
      <div className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center shadow-md z-20">
        <span className="font-bold">ระบบพัสดุ รร.วัดสังเวช</span>
        <button onClick={() => setSidebarOpen(!isSidebarOpen)}><Menu /></button>
      </div>

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:relative md:translate-x-0 transition duration-200 ease-in-out
        w-64 bg-slate-900 text-white shadow-xl z-30 flex flex-col
      `}>
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Box /> ระบบพัสดุ
          </h2>
          <p className="text-xs text-slate-400 mt-1">โรงเรียนวัดสังเวช</p>
        </div>
        
        <nav className="flex-1 py-4">
          <NavItem id="dashboard" label="ภาพรวม (Dashboard)" icon={LayoutDashboard} roles={['ADMIN', 'VIEWER']} />
          <NavItem id="inventory" label="รายการพัสดุ" icon={Box} roles={['ADMIN', 'STAFF']} />
          <NavItem id="personnel" label="จัดการบุคลากร" icon={Users} roles={['ADMIN']} />
          <NavItem id="requisition" label="ขอเบิกพัสดุ" icon={FilePlus} roles={['STAFF']} />
          <NavItem id="my-requests" label="ติดตามสถานะ" icon={History} roles={['STAFF']} />
          <NavItem id="approvals" label="อนุมัติคำขอ" icon={ClipboardCheck} roles={['ADMIN']} />
          {/* Placeholder for Reports */}
          <NavItem id="reports" label="รายงาน (Reports)" icon={BarChart3} roles={['ADMIN', 'VIEWER']} />
        </nav>

        <div className="p-4 border-t border-slate-700 bg-slate-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-slate-600 p-2 rounded-full"><UserIcon size={16} /></div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{user.fullname}</p>
              <p className="text-xs text-slate-400 truncate">{user.position}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2 rounded text-sm transition"
          >
            <LogOut size={16} /> ออกจากระบบ
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        {currentPage === 'reports' ? (
          <div className="text-center py-20 bg-white rounded shadow">
             <BarChart3 className="mx-auto text-gray-400 mb-4" size={48} />
             <h2 className="text-xl text-gray-600">หน้ารายงานอยู่ระหว่างการพัฒนา</h2>
             <p className="text-gray-400">สามารถ Export Excel/PDF ได้ในเวอร์ชันถัดไป</p>
          </div>
        ) : (
          renderPage()
        )}
      </main>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black opacity-50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default App;