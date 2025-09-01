import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ProfileProvider } from "./contexts/ProfileContext";
import ProtectedRoute from "./components/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import { LayoutGroup } from "framer-motion"; // Import LayoutGroup
import MainAppLayout from "./components/MainAppLayout";

// Import screens
import Login from "./screens/login";
import Signup from "./screens/signup";
import Home from "./screens/Home";
import Log from "./screens/Log";
import Insights from "./screens/Insights";
import Share from "./screens/Share";
import Settings from "./screens/Settings";
import Question1 from "./screens/question1";
import Question2 from "./screens/question2";
import Question3 from "./screens/question3";
import Question4 from "./screens/question4";
import Profile from "./screens/Profile";

function AppContent() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black-950 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lavender-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <LayoutGroup> {/* Wrap Routes with LayoutGroup */}
        <Routes>
          {/* Public routes that don't use MainAppLayout */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/question1" element={<Question1 />} />
          <Route path="/question2" element={<Question2 />} />
          <Route path="/question3" element={<Question3 />} />
          <Route path="/question4" element={<Question4 />} />

          {/* Main layout route - all nested routes will render inside MainAppLayout's Outlet */}
          <Route element={<MainAppLayout />}>
            {/* Protected routes wrapped with ErrorBoundary */}
            <Route
              path="/home"
              element={
                <ProtectedRoute>
                  <ErrorBoundary>
                    <Home />
                  </ErrorBoundary>
                </ProtectedRoute>
              }
            />
            <Route
              path="/log"
              element={
                <ProtectedRoute>
                  <ErrorBoundary>
                    <Log />
                  </ErrorBoundary>
                </ProtectedRoute>
              }
            />
            <Route
              path="/insights"
              element={
                <ProtectedRoute>
                  <ErrorBoundary>
                    <Insights />
                  </ErrorBoundary>
                </ProtectedRoute>
              }
            />
            <Route
              path="/share"
              element={
                <ProtectedRoute>
                  <ErrorBoundary>
                    <Share />
                  </ErrorBoundary>
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <ErrorBoundary>
                    <Settings />
                  </ErrorBoundary>
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ErrorBoundary>
                    <Profile />
                  </ErrorBoundary>
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Default redirect */}
          <Route path="/" element={<Login />} />
        </Routes>
      </LayoutGroup>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <ProfileProvider>
        <AppContent />
      </ProfileProvider>
    </AuthProvider>
  );
}

export default App;