// C:\Programming\AnaMetric\frontend\src\App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import Dashboard from "./components/Dashboard";
import Contact from "./components/Contact";
import Pricing from "./components/Pricing";
import Footer from "./components/Footer";
import SignIn from "./components/SignIn";
import Register from "./components/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthCallback from "./components/pages/AuthCallback"; // ✅ new import
import "./styles/design-system.css";
import AIInsights from "./components/AIInsights";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="app">
            <Navbar />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route path="/ai-insights" element={<AIInsights />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/signin" element={<SignIn />} />
                <Route path="/register" element={<Register />} />

                {/* ✅ Route for Supabase Google Auth redirect */}
                <Route path="/auth/callback" element={<AuthCallback />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;