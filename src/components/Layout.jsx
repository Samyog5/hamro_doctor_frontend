import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = ({ userData, onLogout }) => {
  return (
    <div className="flex min-h-screen bg-slate-50 font-['Poppins']">
      <Sidebar userData={userData} onLogout={onLogout} />
      <Outlet />
    </div>
  );
};

export default Layout;
