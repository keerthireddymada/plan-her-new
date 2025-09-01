import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { profileAPI } from "../services/api";

const Question4 = () => {
  const navigate = useNavigate();
  const [conditions, setConditions] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFinish = async () => {
    setIsSubmitting(true);

    try {
      // Get all data from localStorage
      const questionnaireData =
        JSON.parse(localStorage.getItem("questionnaireData")) || {};

      // Prepare profile data
      const profileData = {
        height_cm: questionnaireData.height,
        weight_kg: questionnaireData.weight,
        cycle_length: questionnaireData.cycleLength,
        period_regularity: questionnaireData.periodRegularity || "regular",
        period_description: questionnaireData.periodDescription || "usual",
        medical_conditions: conditions,
        last_period_start: questionnaireData.lastPeriod,
        last_period_end: questionnaireData.periodEndDate,
        luteal_length: 14, // Default value
        menses_length: 5, // Default value
        unusual_bleeding: questionnaireData.periodDescription === "unusual",
        number_of_peak: 1, // Default value
      };

      // Create profile
      await profileAPI.createProfile(profileData);

      // Clear localStorage
      localStorage.removeItem("questionnaireData");

      // Navigate to home
      navigate("/home");
    } catch (error) {
      console.error("Error creating profile:", error);
      alert("Failed to create profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center bg-black-950 text-white px-6 font-serif"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="w-full max-w-sm bg-black-900 p-8 rounded-2xl shadow-lg">
        {/* Logo / Title */}
        <div className="text-center mb-8">
          <img
            src="/logo.png"
            alt="PlanHer Logo"
            className="w-16 h-16 mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold text-lavender-400 mb-2">
            Medical Information
          </h1>
        </div>

        <h2 className="text-xl font-semibold mb-6 text-center">
          Do you suffer from any medical conditions?
          <br />
          If yes, please mention them.
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-1">
              Medical Conditions (Optional)
            </label>
            <textarea
              placeholder="Mention all health conditions"
              value={conditions}
              onChange={(e) => setConditions(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-black-800 text-white focus:outline-none focus:ring-2 focus:ring-lavender-400 resize-none"
              rows={4}
            />
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleFinish}
            disabled={isSubmitting}
            className={`w-full font-semibold py-3 rounded-xl transition-all ${
              isSubmitting
                ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                : "bg-lavender-400 text-black hover:bg-lavender-300"
            }`}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
                Creating Profile...
              </div>
            ) : (
              "Finish Setup"
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default Question4;
