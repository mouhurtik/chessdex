import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout: React.FC = () => {
    return (
        <div className="app-layout">
            <Sidebar />
            <div className="app-content">
                <header className="app-header">
                    <span className="logo">ChessDex</span>
                    <span className="page-title">Analysis Board</span>
                </header>
                <main className="app-main">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
