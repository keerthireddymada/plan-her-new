import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Question3 = () => {
  const navigate = useNavigate();
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");

  const handleNext = () => {
    const pageData = {
      height: parseInt(height),
      weight: parseFloat(weight),
    };

    // Get any data you saved from previous pages
    const existingData =
      JSON.parse(localStorage.getItem("questionnaireData")) || {};

    // Add this page's data to it
    const updatedData = { ...existingData, ...pageData };

    // Save the combined data back to local storage
    localStorage.setItem("questionnaireData", JSON.stringify(updatedData));

    navigate("/question4");
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
            Physical Information
          </h1>
        </div>

        <h2 className="text-xl font-semibold mb-6 text-center">
          How tall are you and how much do you weigh?
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Height (cm)</label>
            <input
              type="number"
              placeholder="165"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-black-800 text-white focus:outline-none focus:ring-2 focus:ring-lavender-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Weight (kg)</label>
            <input
              type="number"
              step="0.1"
              placeholder="60.5"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-black-800 text-white focus:outline-none focus:ring-2 focus:ring-lavender-400"
              required
            />
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleNext}
            disabled={!height || !weight}
            className={`w-full font-semibold py-3 rounded-xl transition-all ${
              !height || !weight
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

export default Question3;
