import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = ({ userData, onLogout }) => {
  return (
    <div className="app-shell">
      <Sidebar userData={userData} onLogout={onLogout} />
      <Outlet />
    </div>
  );
};

export default Layout;
