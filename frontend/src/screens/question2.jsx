import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Question2 = () => {
  const navigate = useNavigate();
  const [lastPeriod, setLastPeriod] = useState("");
  const [periodEndDate, setPeriodEndDate] = useState("");
  const [cycleLength, setCycleLength] = useState("");

  const handleNext = () => {
    const pageData = {
      lastPeriod: lastPeriod,
      periodEndDate: periodEndDate,
      cycleLength: parseInt(cycleLength),
    };

    // Get any data you saved from previous pages
    const existingData =
      JSON.parse(localStorage.getItem("questionnaireData")) || {};

    // Add this page's data to it
    const updatedData = { ...existingData, ...pageData };

    // Save the combined data back to local storage
    localStorage.setItem("questionnaireData", JSON.stringify(updatedData));

    navigate("/question3");
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
            Period Information
          </h1>
        </div>

        <h2 className="text-xl font-semibold mb-6 text-center">
          When did your last period start?
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Start Date</label>
            <input
              type="date"
              value={lastPeriod}
              onChange={(e) => setLastPeriod(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-black-800 text-white focus:outline-none focus:ring-2 focus:ring-lavender-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1">End Date</label>
            <input
              type="date"
              value={periodEndDate}
              onChange={(e) => setPeriodEndDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-black-800 text-white focus:outline-none focus:ring-2 focus:ring-lavender-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Cycle Length (days)</label>
            <input
              type="number"
              value={cycleLength}
              onChange={(e) => setCycleLength(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-black-800 text-white focus:outline-none focus:ring-2 focus:ring-lavender-400"
              placeholder="e.g., 28"
              required
            />
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleNext}
            disabled={!lastPeriod || !periodEndDate || !cycleLength}
            className={`w-full font-semibold py-3 rounded-xl transition-all ${
              !lastPeriod || !periodEndDate || !cycleLength
                ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                : "bg-lavender-400 text-black hover:bg-lavender-300"
            }`}
          >
            Next
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default Question2;
