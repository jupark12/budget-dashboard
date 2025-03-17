// Sidebar component
import React from 'react';

// Interface for menu items
interface MenuItem {
  id: Page;
  label: string;
  icon?: string; // Optional icon name if you want to add icons
}

// Props for the sidebar component
interface SidebarProps {
  onPageChange: (page: Page) => void;
  activePage: Page;
}

const Sidebar: React.FC<SidebarProps> = ({ onPageChange, activePage }) => {
  // Menu items array - simplified to just dashboard and settings
  const menuItems: MenuItem[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'settings', label: 'Settings' },
  ];

  return (
    <div className="sidebar" style={{
      width: '300px',
      height: '100%',
      backgroundColor: '#f8fafc',
      padding: '30px 0',
    }}>
      {menuItems.map((item) => (
        <div
          key={item.id}
          className={`menu-item ${activePage === item.id ? 'active' : ''}`}
          onClick={() => onPageChange(item.id)}
          style={{
            padding: '12px 20px',
            margin: '5px 10px',
            borderRadius: '5px',
            cursor: 'pointer',
            backgroundColor: activePage === item.id ? '#4f46e5' : 'transparent',
            color: activePage === item.id ? 'white' : '#475569',
            fontFamily: 'Arial, sans-serif',
            fontSize: '14px',
            fontWeight: activePage === item.id ? 'bold' : 'normal',
            transition: 'all 0.2s ease'
          }}
        >
          {item.label}
        </div>
      ))}
    </div>
  );
};

export default Sidebar;