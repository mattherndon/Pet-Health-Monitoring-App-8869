import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiHome, FiHeart, FiActivity, FiUser, FiUsers } = FiIcons;

const Navigation = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: FiHome, label: 'Dashboard' },
    { path: '/health', icon: FiActivity, label: 'Health' },
    { path: '/heart-rate', icon: FiHeart, label: 'Heart Rate' },
    { path: '/user-profile', icon: FiUser, label: 'Profile' },
    { path: '/vet-profiles', icon: FiUsers, label: 'Vets' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-neutral-white border-t border-gray-200 px-2 py-2 z-50">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex flex-col items-center py-2 px-2 rounded-lg transition-colors duration-200"
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`p-2 rounded-full ${
                  isActive 
                    ? 'bg-primary text-neutral-white' 
                    : 'text-gray-600 hover:text-primary'
                }`}
              >
                <SafeIcon icon={item.icon} className="w-5 h-5" />
              </motion.div>
              <span className={`text-xs mt-1 ${
                isActive 
                  ? 'text-primary font-medium' 
                  : 'text-gray-600'
              }`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default Navigation;