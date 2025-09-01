// src/screens/Onboarding3.jsx
import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

function Onboarding3() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-between bg-black-950 text-white px-6 py-10">
      {/* Top image */}
      <motion.img
        src="/onboarding3.png" // export from Figma and save here
        alt="Connect with People"
        className="w-72 h-72 object-contain"
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      />

      {/* Text */}
      <div className="text-center space-y-3">
        <h1 className="text-2xl font-bold text-lavender-400">
          Connect with People
        </h1>
        <p className="text-gray-400">
          Share how you feel with your loved ones.
        </p>
      </div>

      {/* Bottom section */}
      <div className="w-full flex flex-col items-center space-y-4">
        {/* Pagination Dots */}
        <div className="flex space-x-2">
          <span className="w-3 h-3 rounded-full bg-gray-600"></span>
          <span className="w-3 h-3 rounded-full bg-gray-600"></span>
          <span className="w-3 h-3 rounded-full bg-purple-400"></span>
        </div>

        {/* Get Started Button */}
        <motion.button
          onClick={() => {
            localStorage.setItem('hasVisited', 'true');
            navigate("/login");
          }}
          className="w-full py-3 rounded-xl bg-purple-400 text-black font-semibold"
          whileTap={{ scale: 0.95 }}
        >
          Get Started
        </motion.button>
      </div>
    </div>
  );
}

export default Onboarding3;
