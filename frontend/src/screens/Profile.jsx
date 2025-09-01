import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Edit, Save, User, LogOut } from "lucide-react";
import { profileAPI } from "../services/api";
import Navigation from "../components/Navigation";

const Profile = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editData, setEditData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await profileAPI.getProfile();
      setProfileData(response.data);
      setEditData(response.data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async () => {
    setIsUpdating(true);
    try {
      await profileAPI.updateProfile(editData);
      setProfileData(editData);
      setIsEditing(false);
      // Show success message or redirect
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-black-950 text-white px-6 py-8 pb-24 font-serif"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/home")}
            className="mr-4 p-2 bg-black-900 rounded-xl text-white hover:bg-black-800 transition-colors"
          >
            <ArrowLeft size={20} />
          </motion.button>
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Profile</h1>
            <p className="text-gray-400 text-sm">
              Manage your account information
            </p>
          </div>
        </div>
      </div>

      {profileData ? (
        <div className="space-y-6">
          {/* Physical Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-black-900 p-6 rounded-2xl shadow-lg"
          >
            <h3 className="text-xl font-semibold text-white mb-4">
              Physical Information
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Height:</span>
                {isEditing ? (
                  <input
                    type="number"
                    value={editData.height_cm || ""}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        height_cm: parseInt(e.target.value),
                      })
                    }
                    className="w-24 px-3 py-2 rounded-xl bg-black-800 text-white focus:outline-none focus:ring-2 focus:ring-lavender-500"
                  />
                ) : (
                  <span className="text-white font-medium">
                    {profileData.height_cm} cm
                  </span>
                )}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Weight:</span>
                {isEditing ? (
                  <input
                    type="number"
                    step="0.1"
                    value={editData.weight_kg || ""}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        weight_kg: parseFloat(e.target.value),
                      })
                    }
                    className="w-24 px-3 py-2 rounded-xl bg-black-800 text-white focus:outline-none focus:ring-lavender-500"
                  />
                ) : (
                  <span className="text-white font-medium">
                    {profileData.weight_kg} kg
                  </span>
                )}
              </div>
            </div>
          </motion.div>

          {/* Cycle Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-black-900 p-6 rounded-2xl shadow-lg"
          >
            <h3 className="text-xl font-semibold text-white mb-4">
              Cycle Information
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Cycle Length:</span>
                {isEditing ? (
                  <input
                    type="number"
                    value={editData.cycle_length || ""}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        cycle_length: parseInt(e.target.value),
                      })
                    }
                    className="w-24 px-3 py-2 rounded-xl bg-black-800 text-white focus:outline-none focus:ring-2 focus:ring-lavender-500"
                  />
                ) : (
                  <span className="text-white font-medium">
                    {profileData.cycle_length} days
                  </span>
                )}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Period Regularity:</span>
                <span className="text-white font-medium capitalize">
                  {profileData.period_regularity}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Period Description:</span>
                <span className="text-white font-medium capitalize">
                  {profileData.period_description}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Last Period Start:</span>
                <span className="text-white font-medium">
                  {profileData.last_period_start}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Last Period End:</span>
                <span className="text-white font-medium">
                  {profileData.last_period_end}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Medical Conditions */}
          {profileData.medical_conditions && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-black-900 p-6 rounded-2xl shadow-lg"
            >
              <h3 className="text-xl font-semibold text-white mb-4">
                Medical Conditions
              </h3>
              {isEditing ? (
                <textarea
                  value={editData.medical_conditions || ""}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      medical_conditions: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-black-800 text-white focus:outline-none focus:ring-2 focus:ring-lavender-500 resize-none"
                  rows={3}
                />
              ) : (
                <p className="text-white font-medium">
                  {profileData.medical_conditions}
                </p>
              )}
            </motion.div>
          )}

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col space-y-3 pt-4"
          >
            {isEditing ? (
              <>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleProfileUpdate}
                  disabled={isUpdating}
                  className={
                    isUpdating
                      ? "w-full font-semibold py-3 rounded-xl bg-gray-600 text-gray-400 cursor-not-allowed"
                      : "w-full font-semibold py-3 rounded-xl bg-lavender-400 text-black hover:bg-lavender-300 transition-all"
                  }
                >
                  {isUpdating ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </div>
                  ) : (
                    <>
                      <Save size={16} className="inline mr-2" />
                      Save Changes
                    </>
                  )}
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setIsEditing(false);
                    setEditData(profileData);
                  }}
                  className="w-full font-semibold py-3 rounded-xl bg-black-800 text-white hover:bg-black-800 transition-all"
                >
                  Cancel
                </motion.button>
              </>
            ) : (
              <>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsEditing(true)}
                  className="w-full font-semibold py-3 rounded-xl bg-lavender-400 text-black hover:bg-lavender-300 transition-all"
                >
                  <Edit size={16} className="inline mr-2" />
                  Edit Profile
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/home")}
                  className="w-full font-semibold py-3 rounded-xl bg-black-800 text-white hover:bg-black-700 transition-all"
                >
                  Back to Home
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={logout}
                  className="w-full font-semibold py-3 rounded-xl bg-red-600 text-white hover:bg-gray-700 transition-all"
                >
                  <LogOut size={16} className="inline mr-2" />
                  Logout
                </motion.button>
              </>
            )}
          </motion.div>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-400">No profile data found</p>
        </div>
      )}

      {/* Navigation */}
      <Navigation />
    </motion.div>
  );
};

export default Profile;
