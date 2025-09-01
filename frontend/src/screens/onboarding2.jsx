// src/screens/Onboarding2.jsx
import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

function Onboarding2() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-between bg-black-950 text-white px-6 py-10">
      {/* Top image */}
      <motion.img
        src="/onboarding2.png" // export from Figma and save here
        alt="Plan Works"
        className="w-72 h-72 object-contain"
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      />

      {/* Text */}
      <div className="text-center space-y-3">
        <h1 className="text-2xl font-bold text-lavender-400">
          Plan Your Works
        </h1>
        <p className="text-gray-400">
          Organize your schedule around your cycle.
        </p>
      </div>

      {/* Bottom section */}
      <div className="w-full flex flex-col items-center space-y-4">
        {/* Pagination Dots */}
        <div className="flex space-x-2">
          <span className="w-3 h-3 rounded-full bg-gray-600"></span>
          <span className="w-3 h-3 rounded-full bg-purple-400"></span>
          <span className="w-3 h-3 rounded-full bg-gray-600"></span>
        </div>

        {/* Next Button */}
        <motion.button
          onClick={() => navigate("/onboarding3")}
          className="w-full py-3 rounded-xl bg-purple-400 text-black font-semibold"
          whileTap={{ scale: 0.95 }}
        >
          Next
        </motion.button>
      </div>
    </div>
  );
}

export default Onboarding2;
