// src/screens/Onboarding.jsx
import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

function Onboarding() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-between bg-black-950 text-white px-6 py-10">
      
      <motion.img
        src="/onboarding1.png" 
        alt="Track Period"
        className="w-72 h-72 object-contain"
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      />

      {/* Text section */}
      <div className="text-center space-y-3">
        <h1 className="text-2xl font-bold text-lavender-400">
          Track Your Period Cycle
        </h1>
        <p className="text-gray-400">
          Your cycle determines your body’s health
        </p>
      </div>

      {/* Bottom section */}
      <div className="w-full flex flex-col items-center space-y-4">
        {/* Pagination Dots */}
        <div className="flex space-x-2">
          <span className="w-3 h-3 rounded-full bg-purple-400"></span>
          <span className="w-3 h-3 rounded-full bg-gray-600"></span>
          <span className="w-3 h-3 rounded-full bg-gray-600"></span>
        </div>

        {/* Next Button */}
        <motion.button
          onClick={() => navigate("/onboarding2")} // navigate to next screen
          className="w-full py-3 rounded-xl bg-purple-400 text-black font-semibold"
          whileTap={{ scale: 0.95 }}
        >
          Next
        </motion.button>
      </div>
    </div>
  );
}

export default Onboarding;

