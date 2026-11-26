import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header'; 
import Footer from './Footer';

const AppLayout = () => {
  return (
    <div className="min-h-screen flex flex-col relative">
      <Header />
      {/* pt-20 hata diya gaya hai taake Hero background full top se shuru ho */}
      <main className="flex-grow">
        <Outlet /> 
      </main>
      <Footer />
    </div>
  );
};

export default AppLayout;