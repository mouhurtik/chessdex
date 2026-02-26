import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';

const pageTitles: Record<string, string> = {
    '/analysis': 'Analysis Board',
    '/games': 'Games',
    '/database': 'Database',
    '/files': 'Files',
    '/settings': 'Settings',
};

const Layout: React.FC = () => {
    const location = useLocation();
    const pageTitle = pageTitles[location.pathname] || 'ChessDex';

    return (
        <div className="app-layout">
            <Sidebar />
            <div className="app-content">
                <header className="app-header">
                    <span className="logo">ChessDex</span>
                    <span className="page-title">{pageTitle}</span>
                </header>
                <main className="app-main">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
