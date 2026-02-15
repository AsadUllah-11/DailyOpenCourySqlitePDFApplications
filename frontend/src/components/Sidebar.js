import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Table2,
  Upload, 
  BarChart3,
  Users,
  Video,
  Film,
  FileType  // ⭐ NEW ICON for PDF Applications
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
  const { user } = useAuth();

  const menuItems = [
    { 
      path: '/dashboard', 
      icon: LayoutDashboard, 
      label: 'Dashboard', 
      roles: ['ADMIN', 'STAFF'] 
    },
    { 
      path: '/applications', 
      icon: FileText, 
      label: 'Applications', 
      roles: ['ADMIN', 'STAFF'] 
    },
    // { 
    //   path: '/data-table', 
    //   icon: Table2, 
    //   label: 'Data Table', 
    //   roles: ['ADMIN', 'STAFF'] 
    // },
    { 
      path: '/staff-management', 
      icon: Users, 
      label: 'Staff Management', 
      roles: ['ADMIN'] 
    },
    { 
      path: '/video-feedback',
      icon: Video, 
      label: 'Video Feedback', 
      roles: ['ADMIN'] 
    },
    { 
      path: '/pdf-applications',  // ⭐ NEW: PDF Applications
      icon: FileType, 
      label: 'PDF Applications', 
      roles: ['ADMIN'] 
    },
    { 
      path: '/upload', 
      icon: Upload, 
      label: 'Upload Excel', 
      roles: ['ADMIN', 'STAFF'] 
    },
    { 
      path: '/analytics', 
      icon: BarChart3, 
      label: 'Analytics', 
      roles: ['ADMIN'] 
    },
    { 
      path: '/media',
      icon: Film, 
      label: 'Media', 
      roles: ['ADMIN', 'STAFF'] 
    },
  ];

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user?.role)
  );

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon;
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => 
                `sidebar-link ${isActive ? 'active' : ''}`
              }
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;