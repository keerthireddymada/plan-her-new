import React, { createContext, useContext, useState } from 'react';

const ProfileContext = createContext();

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};

export const ProfileProvider = ({ children }) => {
  const [profileData, setProfileData] = useState({
    height_cm: null,
    weight_kg: null,
    cycle_length: null,
    luteal_length: null,
    menses_length: null,
    unusual_bleeding: false,
    number_of_peak: 2,
  });

  const updateProfileData = (updates) => {
    setProfileData(prev => ({ ...prev, ...updates }));
  };

  const clearProfileData = () => {
    setProfileData({
      height_cm: null,
      weight_kg: null,
      cycle_length: null,
      luteal_length: null,
      menses_length: null,
      unusual_bleeding: false,
      number_of_peak: 2,
    });
  };

  const value = {
    profileData,
    updateProfileData,
    clearProfileData,
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
};
