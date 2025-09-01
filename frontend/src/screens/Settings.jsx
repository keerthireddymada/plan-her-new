import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Bell, Lock, Palette, HelpCircle, Info, LogOut, 
  ChevronRight, Edit 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { profileAPI } from '../services/api';

// ✅ FIX: import Navigation
import Navigation from '../components/Navigation';

const Settings = () => {
  const [notifications, setNotifications] = useState(true);
  const [theme, setTheme] = useState('dark');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Load profile data on component mount
  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      const response = await profileAPI.getProfile();
      setProfileData(response.data);
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  };

  const handleEditProfile = () => setIsEditingProfile(true);

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      await profileAPI.updateProfile(profileData);
      setIsEditingProfile(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingProfile(false);
    loadProfileData();
  };

  const handleProfileFieldChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const settingsSections = [
    {
      title: 'Account',
      items: [
        { icon: User, label: 'Profile Information', action: 'edit_profile' },
        { icon: Bell, label: 'Notifications', action: 'toggle', state: notifications, setState: setNotifications },
        { icon: Lock, label: 'Privacy & Security', action: 'navigate' },
      ]
    },
    {
      title: 'Preferences',
      items: [
        { icon: Palette, label: 'Theme', action: 'select', state: theme, setState: setTheme, options: ['light', 'dark', 'auto'] },
      ]
    },
    {
      title: 'Support',
      items: [
        { icon: HelpCircle, label: 'Help Center', action: 'navigate' },
        { icon: Info, label: 'About PlanHer', action: 'navigate' },
      ]
    },
    {
      title: 'Account Actions',
      items: [
        { icon: LogOut, label: 'Sign Out', action: 'logout', dangerous: true },
      ]
    }
  ];

  const handleAction = async (item) => {
    if (item.action === 'toggle') {
      item.setState(!item.state);
    } else if (item.action === 'logout') {
      await logout();
      navigate('/login');
    } else if (item.action === 'edit_profile') {
      handleEditProfile();
    } else {
      console.log('Navigate to:', item.label);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="pb-20 px-6 pt-12 bg-black-950 min-h-screen"
    >
      {/* Header */}
      <div className="mb-8">
        <motion.h1 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-white mb-2"
        >
          Settings
        </motion.h1>
        <p className="text-black-400">Customize your PlanHer experience</p>
      </div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-lavender-600 rounded-2xl p-6 mb-8 text-white shadow-glow"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="w-16 h-16 bg-black-900 rounded-full flex items-center justify-center text-2xl mr-4">
              👤
            </div>
            <div>
              <h3 className="text-xl font-semibold">{user?.name || 'User'}</h3>
              <p className="text-lavender-100">{user?.email || 'user@example.com'}</p>
              <p className="text-sm text-lavender-200 mt-1">
                Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Recently'}
              </p>
            </div>
          </div>
          {!isEditingProfile && (
            <button
              onClick={handleEditProfile}
              className="p-2 bg-black-900 rounded-lg hover:bg-black-800 transition-colors"
            >
              <Edit size={20} className="text-lavender-400" />
            </button>
          )}
        </div>

        {/* Profile Editing Form */}
        {isEditingProfile && profileData && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-black-900 rounded-xl p-4 mt-4"
          >
            <h4 className="text-lg font-semibold mb-4">Edit Profile</h4>
            
            {error && (
              <div className="mb-4 p-3 bg-red-900 border border-red-700 rounded-lg text-red-200 text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm mb-1">Height (cm)</label>
                <input
                  type="number"
                  value={profileData.height_cm || ''}
                  onChange={(e) => handleProfileFieldChange('height_cm', parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-black-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-lavender-400"
                  min="100"
                  max="250"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Weight (kg)</label>
                <input
                  type="number"
                  value={profileData.weight_kg || ''}
                  onChange={(e) => handleProfileFieldChange('weight_kg', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 bg-black-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-lavender-400"
                  min="30"
                  max="200"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Cycle Length (days)</label>
                <input
                  type="number"
                  value={profileData.cycle_length || ''}
                  onChange={(e) => handleProfileFieldChange('cycle_length', parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-black-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-lavender-400"
                  min="20"
                  max="40"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Luteal Length (days)</label>
                <input
                  type="number"
                  value={profileData.luteal_length || ''}
                  onChange={(e) => handleProfileFieldChange('luteal_length', parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-black-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-lavender-400"
                  min="10"
                  max="20"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Period Duration (days)</label>
                <input
                  type="number"
                  value={profileData.menses_length || ''}
                  onChange={(e) => handleProfileFieldChange('menses_length', parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-black-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-lavender-400"
                  min="2"
                  max="10"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Unusual Bleeding</label>
                <select
                  value={profileData.unusual_bleeding ? 'true' : 'false'}
                  onChange={(e) => handleProfileFieldChange('unusual_bleeding', e.target.value === 'true')}
                  className="w-full px-3 py-2 bg-black-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-lavender-400"
                >
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </select>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleSaveProfile}
                disabled={loading}
                className={`flex-1 py-2 px-4 rounded-lg font-semibold ${
                  loading 
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                    : 'bg-lavender-400 text-black hover:bg-lavender-300'
                }`}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={handleCancelEdit}
                disabled={loading}
                className="flex-1 py-2 px-4 rounded-lg font-semibold bg-black-800 text-white hover:bg-black-700"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Settings Sections */}
      <div className="space-y-6">
        {settingsSections.map((section, sectionIndex) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + sectionIndex * 0.1 }}
            className="bg-black-900 rounded-2xl overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-black-800">
              <h3 className="text-lg font-semibold text-white">{section.title}</h3>
            </div>
            <div className="divide-y divide-black-800">
              {section.items.map((item, itemIndex) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + sectionIndex * 0.1 + itemIndex * 0.05 }}
                  className={`px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-black-800 transition-colors ${
                    item.dangerous ? 'hover:bg-gray-900' : ''
                  }`}
                  onClick={() => handleAction(item)}
                >
                  <div className="flex items-center">
                    <item.icon 
                      size={20} 
                      className={`mr-3 ${item.dangerous ? 'text-gray-400' : 'text-lavender-400'}`} 
                    />
                    <span className={`${item.dangerous ? 'text-gray-400' : 'text-white'}`}>
                      {item.label}
                    </span>
                  </div>
                  
                  {item.action === 'toggle' && (
                    <div className="flex items-center">
                      <div 
                        className={`w-12 h-6 rounded-full transition-colors ${
                          item.state ? 'bg-lavender-400' : 'bg-black-700'
                        }`}
                      >
                        <div 
                          className={`w-5 h-5 bg-white rounded-full transition-transform ${
                            item.state ? 'transform translate-x-6' : 'transform translate-x-1'
                          }`}
                        />
                      </div>
                    </div>
                  )}
                  
                  {item.action === 'select' && (
                    <div className="flex items-center">
                      <span className="text-gray-400 mr-2 capitalize">{item.state}</span>
                      <ChevronRight size={16} className="text-gray-400" />
                    </div>
                  )}
                  
                  {item.action === 'navigate' && (
                    <ChevronRight size={16} className="text-gray-400" />
                  )}
                  
                  {item.action === 'logout' && (
                    <ChevronRight size={16} className="text-gray-400" />
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      </motion.div>
  );
};

export default Settings;
