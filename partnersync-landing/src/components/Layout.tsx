import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import ExitIntent from './ExitIntent';

const Layout: React.FC = () => {
    return (
        <div className="layout">
            <Navbar />
            <main className="main-content">
                <Outlet />
            </main>
            <Footer />
            <ExitIntent />
        </div>
    );
};

export default Layout;

