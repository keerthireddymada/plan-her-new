import React from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { BarChart3, Share2, Settings, User } from "lucide-react";

const TopNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: BarChart3, label: "Insights", path: "/insights" },
    { icon: Share2, label: "Share", path: "/share" },
    { icon: Settings, label: "Settings", path: "/settings" },
    { icon: User, label: "Profile", path: "/profile" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="top-nav-container">
      <div className="top-nav-buttons">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <motion.button
              key={item.path}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.05 }}
              onClick={() => navigate(item.path)}
              className={`top-nav-button ${
                isActive(item.path)
                  ? "bg-lavender-600 text-white shadow-lg"
                  : "bg-black-900 text-white hover:bg-black-800 border border-black-700"
              }`}
              title={item.label}
            >
              <Icon size={20} />
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default TopNavigation;
