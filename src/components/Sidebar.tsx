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
    <div className="sidebar w-[300px] min-h-screen py-4 bg-gradient-to-b from-[#312E81] to-[#4338CA]">
      <div>
        <h1 className="text-white text-2xl font-bold text-center mb-4">Budget Project</h1>
      </div>
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
            backgroundColor: activePage === item.id ? 'rgba(255, 255, 255, 0.5)' : 'transparent',
            color: activePage === item.id ? 'white' : 'white',
            fontFamily: 'Arial, sans-serif',
            fontSize: '14px',
            fontWeight: activePage === item.id ? 'bold' : 'normal',
            transition: 'all .3s ease'
          }}
        >
          {item.label}
        </div>
      ))}
    </div>
  );
};

export default Sidebar;