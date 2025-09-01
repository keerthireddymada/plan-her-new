import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Question1 = () => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(1);

  const handleAnswer = (answer) => {
    if (currentQuestion === 1) {
      // Save period regularity
      const existingData =
        JSON.parse(localStorage.getItem("questionnaireData")) || {};
      const updatedData = {
        ...existingData,
        periodRegularity: answer === "Yes" ? "regular" : "irregular",
      };
      localStorage.setItem("questionnaireData", JSON.stringify(updatedData));
      setCurrentQuestion(2);
    } else {
      // Save period description
      const existingData =
        JSON.parse(localStorage.getItem("questionnaireData")) || {};
      const updatedData = {
        ...existingData,
        periodDescription: answer.toLowerCase(),
      };
      localStorage.setItem("questionnaireData", JSON.stringify(updatedData));
      navigate("/question2");
    }
  };

  return (
    <motion.div
      className="auth-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="auth-box">
        {/* Logo / Title */}
        <div className="auth-title-section">
          <img src="/logo.png" alt="PlanHer Logo" className="auth-logo" />
          <h1 className="auth-title">
            {currentQuestion === 1 ? "Cycle Regularity" : "Period Description"}
          </h1>
        </div>

        {currentQuestion === 1 ? (
          <>
            <h2 className="auth-subtitle">Are your periods regular?</h2>
            <p className="auth-description">
              Understanding your cycle helps us personalize your experience.
            </p>
            <div className="form-container">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => handleAnswer("Yes")}
                className="btn-primary"
              >
                Yes
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => handleAnswer("No")}
                className="btn-secondary"
              >
                No
              </motion.button>
            </div>
          </>
        ) : (
          <>
            <h2 className="auth-subtitle">How do you describe your periods?</h2>
            <p className="auth-description">
              This helps us understand your cycle better.
            </p>
            <div className="form-container">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => handleAnswer("Usual")}
                className="btn-primary"
              >
                Usual
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => handleAnswer("Unusual")}
                className="btn-secondary"
              >
                Unusual
              </motion.button>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default Question1;
