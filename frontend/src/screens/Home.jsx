import React from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Heart,
  Brain,
  Utensils,
  Sun,
  Moon,
  Check,
  X,
  AlertCircle,
  LogOut,
} from "lucide-react";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { predictionsAPI, periodAPI } from "../services/api";
import Navigation from "../components/Navigation";

const Home = () => {
  const currentDate = new Date();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Data from backend
  const [cycleDay, setCycleDay] = useState(null);
  const [cyclePhase, setCyclePhase] = useState("");
  const [moodForecast, setMoodForecast] = useState("Energetic");
  const [energyLevel, setEnergyLevel] = useState(85);
  const [nextPeriod, setNextPeriod] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Period confirmation state
  const [showPeriodConfirmation, setShowPeriodConfirmation] = useState(false);
  const [periodConfirmed, setPeriodConfirmed] = useState(false);
  const [correctPeriodDate, setCorrectPeriodDate] = useState("");
  const [confirmingPeriod, setConfirmingPeriod] = useState(false);

  // Fetch prediction data from backend
  useEffect(() => {
    async function getPrediction() {
      try {
        setLoading(true);
        setError(null);

        const response = await predictionsAPI.getCurrentPrediction();
        const data = response.data;

        setCycleDay(data.day_of_cycle);
        setCyclePhase(data.cycle_phase);
        setNextPeriod(data.next_period_in_days);

        // Map predicted energy level to display values
        if (data.predicted_energy_level === "low") {
          setMoodForecast("Restful");
          setEnergyLevel(25);
        } else if (data.predicted_energy_level === "medium") {
          setMoodForecast("Normal");
          setEnergyLevel(60);
        } else if (data.predicted_energy_level === "high") {
          setMoodForecast("Active");
          setEnergyLevel(90);
        }

        // Check if we should show period confirmation
        if (data.next_period_in_days <= 3 && data.next_period_in_days >= 0) {
          setShowPeriodConfirmation(true);
        }
      } catch (error) {
        console.error("Error fetching prediction:", error);
        setError("Could not load prediction data");
        setCyclePhase("Error");
        setMoodForecast("Could not load");
      } finally {
        setLoading(false);
      }
    }

    getPrediction();
  }, []);

  const handlePeriodConfirmation = async (isCorrect) => {
    setConfirmingPeriod(true);

    try {
      if (isCorrect) {
        // Period prediction was correct - use the new confirm-period endpoint
        const today = new Date().toISOString().split("T")[0];
        await predictionsAPI.confirmPeriod(today);
        setPeriodConfirmed(true);
      } else {
        // Period prediction was wrong - ask for correct date
        setShowPeriodConfirmation(false);
        // The user will manually enter the correct date
      }
    } catch (error) {
      console.error("Error confirming period:", error);
      alert("Failed to confirm period. Please try again.");
    } finally {
      setConfirmingPeriod(false);
    }
  };

  const handleCorrectPeriodDate = async () => {
    if (!correctPeriodDate) {
      alert("Please enter the correct period start date");
      return;
    }

    setConfirmingPeriod(true);

    try {
      // Use the new confirm-period endpoint with the correct date
      await predictionsAPI.confirmPeriod(correctPeriodDate);

      setPeriodConfirmed(true);
      setShowPeriodConfirmation(false);

      // Refresh prediction data
      window.location.reload();
    } catch (error) {
      console.error("Error updating period date:", error);
      alert("Failed to update period date. Please try again.");
    } finally {
      setConfirmingPeriod(false);
    }
  };

  const selfCareReminders = [
    { icon: Sun, text: "Morning meditation", time: "8:00 AM" },
    { icon: Heart, text: "Light exercise", time: "6:00 PM" },
    { icon: Moon, text: "Wind down routine", time: "9:30 PM" },
  ];

  const foodRecommendations = [
    "Iron-rich foods (spinach, lentils)",
    "Omega-3 sources (salmon, walnuts)",
    "Complex carbs (quinoa, sweet potato)",
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black-950 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lavender-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your cycle data...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="pb-20 px-6 pt-12 bg-black-950 min-h-screen"
    >
      {/* Top Navigation */}

      {/* Header with Profile Icon */}
      <div className="mb-8">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-white mb-2"
        >
          Good morning, {user?.name || "User"}
        </motion.h1>
        <p className="text-black-400">{format(currentDate, "EEEE, MMMM d")}</p>
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-900 border border-red-700 rounded-xl text-red-200 text-sm"
        >
          {error}
        </motion.div>
      )}

      {/* Period Confirmation Dialog */}
      {showPeriodConfirmation && !periodConfirmed && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 p-6 bg-lavender-600 rounded-2xl text-white shadow-glow"
        >
          <div className="flex items-center mb-4">
            <AlertCircle size={24} className="mr-3" />
            <h3 className="text-lg font-semibold">Period Confirmation</h3>
          </div>

          <p className="mb-4 text-lavender-100">
            We predicted your period would start in {nextPeriod} days. Did your
            period start today?
          </p>

          <div className="flex space-x-3 mb-4">
            <button
              onClick={() => handlePeriodConfirmation(true)}
              disabled={confirmingPeriod}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold flex items-center justify-center ${
                confirmingPeriod
                  ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                  : "bg-green-600 text-white hover:bg-green-700"
              }`}
            >
              <Check size={16} className="mr-2" />
              Yes, it started
            </button>
            <button
              onClick={() => handlePeriodConfirmation(false)}
              disabled={confirmingPeriod}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold flex items-center justify-center ${
                confirmingPeriod
                  ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                  : "bg-red-600 text-white hover:bg-gray-700"
              }`}
            >
              <X size={16} className="mr-2" />
              No, it didn't
            </button>
          </div>

          {/* Correct Date Input */}
          {!showPeriodConfirmation && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-3"
            >
              <p className="text-sm text-lavender-200">
                When did your period actually start?
              </p>
              <input
                type="date"
                value={correctPeriodDate}
                onChange={(e) => setCorrectPeriodDate(e.target.value)}
                className="w-full px-3 py-2 bg-black-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-lavender-400"
              />
              <button
                onClick={handleCorrectPeriodDate}
                disabled={confirmingPeriod || !correctPeriodDate}
                className={`w-full py-2 px-4 rounded-lg font-semibold ${
                  confirmingPeriod || !correctPeriodDate
                    ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                    : "bg-lavender-400 text-black hover:bg-lavender-300"
                }`}
              >
                {confirmingPeriod ? "Updating..." : "Update & Retrain Model"}
              </button>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Period Confirmed Message */}
      {periodConfirmed && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-green-900 border border-green-700 rounded-xl text-green-200 text-sm"
        >
          ✅ Period confirmed! Your model will learn from this data for better
          predictions.
        </motion.div>
      )}

      {/* Cycle Overview */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-lavender-600 rounded-2xl p-6 mb-6 text-white shadow-glow"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Calendar size={24} className="mr-3" />
            <span className="text-lg font-semibold">
              Cycle Day {cycleDay || "--"}
            </span>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-90">Next period in</p>
            <p className="text-xl font-bold">
              {nextPeriod !== null ? `${nextPeriod} days` : "--"}
            </p>
          </div>
        </div>

        <div className="bg-black-900 rounded-xl p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-lavender-200">
              {cyclePhase || "Loading..."}
            </span>
            <span className="text-sm text-lavender-200">{moodForecast}</span>
          </div>
          <div className="w-full bg-black-800 rounded-full h-2">
            <div
              className="bg-lavender-400 h-2 rounded-full transition-all duration-300"
              style={{ width: `${energyLevel}%` }}
            ></div>
          </div>
        </div>
      </motion.div>

      {/* Self-Care Reminders */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-6"
      >
        <h2 className="text-xl font-bold text-white mb-4">
          Self-Care Reminders
        </h2>
        <div className="space-y-3">
          {selfCareReminders.map((reminder, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="bg-black-900 rounded-xl p-4 flex items-center justify-between"
            >
              <div className="flex items-center">
                <reminder.icon size={20} className="text-lavender-400 mr-3" />
                <span className="text-white">{reminder.text}</span>
              </div>
              <span className="text-gray-400 text-sm">{reminder.time}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Food Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-6"
      >
        <h2 className="text-xl font-bold text-white mb-4">
          Food Recommendations
        </h2>
        <div className="bg-black-900 rounded-xl p-4">
          <div className="flex items-center mb-3">
            <Utensils size={20} className="text-lavender-400 mr-3" />
            <span className="text-white font-semibold">Today's Focus</span>
          </div>
          <ul className="space-y-2">
            {foodRecommendations.map((food, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="text-gray-300 text-sm flex items-start"
              >
                <span className="text-lavender-400 mr-2">•</span>
                {food}
              </motion.li>
            ))}
          </ul>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/log")}
            className="bg-lavender-600 text-white p-4 rounded-xl flex items-center justify-center space-x-2"
          >
            <Brain size={20} />
            <span>Log Mood</span>
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/log")}
            className="bg-black-900 text-white p-4 rounded-xl flex items-center justify-center space-x-2 border border-gray-700"
          >
            <Calendar size={20} />
            <span>Track Period</span>
          </motion.button>
        </div>

        {/* Logout Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={logout}
          className="w-full bg-red-600 text-white p-3 rounded-xl flex items-center justify-center space-x-2 hover:bg-gray-700 transition-colors"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default Home;
