import React from 'react';
import { Bell, Search, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // 1. useNavigate ko import kiya

export default function DashboardHeader({ title, breadcrumb }) {
  const navigate = useNavigate(); // 2. navigate function banaya

  return (
    <div className="topbar">
      <div className="topbar-title">
        <div className="breadcrumb">
          {breadcrumb && breadcrumb.map((crumb, i) => (
             <span key={i}>
               {crumb} {i < breadcrumb.length - 1 && <ChevronRight size={12} />}
             </span>
          ))}
        </div>
        <h1>{title}</h1>
      </div>

      <div className="topbar-actions">
        <div className="search">
          <Search size={16} style={{ color: 'var(--muted-foreground)' }} />
          <input type="text" placeholder="Search products, SKUs..." />
        </div>
        
        {/* 3. Button par onClick laga kar path set kar diya */}
        <button 
          className="icon-btn" 
          onClick={() => navigate('/dashboard/notifications')} 
        >
          <Bell size={20} />
          <span className="dot"></span>
        </button>

        <div className="account">
          <div className="avatar">AK</div>
          <div className="account-text" style={{ fontSize: '13px', lineHeight: '1.2', textAlign: 'left' }}>
            <div style={{ fontWeight: 600 }}>Ali Khan</div>
            <div style={{ color: 'var(--muted-foreground)', fontSize: '11px' }}>Seller admin</div>
          </div>
        </div>
      </div>
    </div>
  );
}