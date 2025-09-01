import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Calendar, BarChart3, Share, User, Settings } from 'lucide-react';

const Navigation = () => {
  const location = useLocation();
  
  const navItems = [
    { path: '/home', icon: Home, label: 'Home' },
    { path: '/log', icon: Calendar, label: 'Log' },
    { path: '/insights', icon: BarChart3, label: 'Insights' },
    { path: '/share', icon: Share, label: 'Share' },
    // Removed: { path: '/profile', icon: User, label: 'Profile' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-sm bg-black-900 border-t border-black-800 px-4 py-2 z-50">
      <div className="flex justify-around items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className="relative flex flex-col items-center py-2 px-3 min-w-0"
            >
              <motion.div // Always render, control visibility
                layoutId="activeTab"
                className="absolute inset-0 bg-lavender-600 rounded-xl"
                initial={false}
                animate={{ opacity: isActive ? 1 : 0 }} // Control opacity based on isActive
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                style={{ pointerEvents: isActive ? 'auto' : 'none' }} // Prevent interaction when hidden
              />
              <motion.div
                className="relative z-10 flex flex-col items-center"
                whileTap={{ scale: 0.95 }}
              >
                <Icon
                  size={20}
                  className={`mb-1 transition-colors ${
                    isActive ? 'text-white' : 'text-white'
                  }`}
                />
                <span
                  className={`text-xs font-medium transition-colors ${
                    isActive ? 'text-white' : 'text-white'
                  }`}
                >
                  {item.label}
                </span>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default Navigation;