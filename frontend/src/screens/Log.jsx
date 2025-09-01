import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Calendar,
  Smile,
  Zap,
  AlertCircle,
  Heart,
  Check,
} from "lucide-react";
import { moodAPI, periodAPI, predictionsAPI } from "../services/api";
import Navigation from "../components/Navigation";
import { toast } from 'react-toastify';

const Log = () => {
  const [selectedMood, setSelectedMood] = useState("");
  const [energyLevel, setEnergyLevel] = useState("");
  const [symptom, setSymptom] = useState("");
  const [notes, setNotes] = useState("");
  const [isPeriodStarted, setIsPeriodStarted] = useState(false);
  const [periodStartDate, setPeriodStartDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState(null); // ← ADD ERROR STATE

  const moods = [
    { value: "Happy", label: "😊 Happy" },
    { value: "Calm", label: "😌 Calm" },
    { value: "Anxious", label: "😰 Anxious" },
    { value: "Sad", label: "😢 Sad" },
    { value: "Irritated", label: "😤 Irritated" },
  ];

  const commonSymptoms = [
    "Bleeding",
    "Spotting",
    "Cramps",
    "Headache",
    "Bloating",
    "Fatigue",
    "Breast tenderness",
    "Back pain",
    "Nausea",
    "Acne",
  ];

  const handleSymptomSelect = (selectedSymptom) => {
    setSymptom((prev) => (prev === selectedSymptom ? "" : selectedSymptom));
  };

  const handleSaveLog = async () => {
    if (!energyLevel) {
      alert("Please select your energy level");
      return;
    }

    setSaving(true);
    setSaveSuccess(false);
    setError(null); // ← RESET ERROR

    try {
      // Save mood data - try different data formats
      const energyLevelMap = {
        "Low": 1,
        "Medium": 2,
        "High": 3,
      };

      const moodData = {
        date: new Date().toISOString().split("T")[0],
        energy_level: energyLevelMap[energyLevel], // Map string to integer
        mood: selectedMood || null,
        symptoms: symptom || null, // Send as string or null
        notes: notes || null,
      };

      console.log("Sending mood data:", moodData); // ← DEBUG LOG
      
      await moodAPI.createMood(moodData);
      toast.success("Mood logged successfully!");

      // Save period data if period started (with error handling)
      if (isPeriodStarted && periodStartDate) {
        try {
          await periodAPI.createPeriod({
            start_date: periodStartDate,
            end_date: null,
          });
          toast.success("Period logged successfully!");
        } catch (periodError) {
          console.warn("Period save failed, but mood was saved:", periodError);
          toast.error("Failed to log period. Mood was saved.");
          // Continue even if period save fails
        }
      }

      // Trigger model retraining after new data is logged
      try {
        await predictionsAPI.retrainModel();
        toast.info("ML model retraining triggered.");
      } catch (retrainError) {
        console.error("Failed to trigger model retraining:", retrainError);
        toast.warn("Failed to trigger model retraining. Model will update later.");
      }

      setSaveSuccess(true);

      // Clear form after successful save
      setTimeout(() => {
        setSelectedMood("");
        setEnergyLevel("");
        setSymptom("");
        setNotes("");
        setIsPeriodStarted(false);
        setPeriodStartDate("");
        setSaveSuccess(false);
      }, 2000);

    } catch (error) {
      console.error("Error saving log:", error);
      setError("Failed to save log. Please try again.");
      
      // Show more detailed error message
      if (error.response?.data) {
        console.error("Backend error details:", error.response.data);
        setError(`Save failed: ${JSON.stringify(error.response.data)}`);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePeriod = () => {
    setIsPeriodStarted((prev) => !prev);
    if (!isPeriodStarted) {
      setPeriodStartDate(new Date().toISOString().split("T")[0]);
    } else {
      setPeriodStartDate("");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="pb-20 px-6 pt-12 bg-black-950 min-h-screen text-white"
    >
      <div className="container mx-auto">
        <div className="mb-8">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold text-white mb-2"
          >
            Daily Log
          </motion.h1>
          <p className="text-black-400">How are you feeling today?</p>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-900 border border-red-700 rounded-xl text-red-200 text-sm"
          >
            ⚠️ {error}
          </motion.div>
        )}

        {saveSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-green-900 border border-green-700 rounded-xl text-green-200 text-sm flex items-center"
          >
            <Check size={16} className="mr-2" />
            Log saved successfully!
          </motion.div>
        )}

        {/* Energy Level */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-3">Energy Level</h2>
          <div className="flex justify-around space-x-2">
            {[ "Low", "Medium", "High" ].map((level) => (
              <motion.button
                key={level}
                whileTap={{ scale: 0.95 }}
                className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
                  energyLevel === level
                    ? "bg-lavender-600 text-white"
                    : "bg-black-800 text-gray-300 hover:bg-black-700"
                }`}
                onClick={() => setEnergyLevel(level)}
              >
                {level}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Mood Selection */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-3">Mood</h2>
          <div className="grid grid-cols-2 gap-3">
            {moods.map((mood) => (
              <motion.button
                key={mood.value}
                whileTap={{ scale: 0.95 }}
                className={`py-3 rounded-xl font-medium transition-colors ${
                  selectedMood === mood.value
                    ? "bg-lavender-600 text-white"
                    : "bg-black-800 text-gray-300 hover:bg-black-700"
                }`}
                onClick={() => setSelectedMood(mood.value)}
              >
                {mood.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Symptom Selection */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-3">Symptoms</h2>
          <div className="grid grid-cols-2 gap-3">
            {commonSymptoms.map((symptomOption) => (
              <motion.button
                key={symptomOption}
                whileTap={{ scale: 0.95 }}
                className={`py-3 rounded-xl font-medium transition-colors ${
                  symptom === symptomOption
                    ? "bg-lavender-600 text-white"
                    : "bg-black-800 text-gray-300 hover:bg-black-700"
                }`}
                onClick={() => handleSymptomSelect(symptomOption)}
              >
                {symptomOption}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-3">Notes</h2>
          <textarea
            className="w-full px-4 py-3 rounded-xl bg-black-800 text-white focus:outline-none focus:ring-2 focus:ring-lavender-400 resize-none h-24"
            placeholder="Add any additional notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          ></textarea>
        </div>

        {/* Period Tracking */}
        <div className="mb-6 flex items-center justify-between bg-black-800 p-4 rounded-xl">
          <h2 className="text-xl font-semibold text-white">Period Started?</h2>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              value=""
              className="sr-only peer"
              checked={isPeriodStarted}
              onChange={handleTogglePeriod}
            />
            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-lavender-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-lavender-600"></div>
          </label>
        </div>

        {isPeriodStarted && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6"
          >
            <h2 className="text-xl font-semibold text-white mb-3">Period Start Date</h2>
            <input
              type="date"
              className="w-full px-4 py-3 rounded-xl bg-black-800 text-white focus:outline-none focus:ring-2 focus:ring-lavender-400"
              value={periodStartDate}
              onChange={(e) => setPeriodStartDate(e.target.value)}
            />
          </motion.div>
        )}

        {/* Save Button */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          className={`w-full py-3 rounded-xl font-bold text-lg transition-colors ${
            saving
              ? "bg-gray-600 text-gray-400 cursor-not-allowed"
              : "bg-pink-500 text-white hover:bg-lavender-600"
          }`}
          onClick={handleSaveLog}
          disabled={saving}
        >
          {saving ? (
            <span className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
              Saving...
            </span>
          ) : (
            "Save Log"
          )}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default Log;