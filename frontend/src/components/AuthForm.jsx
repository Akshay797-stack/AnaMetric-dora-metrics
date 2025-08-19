import React, { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

const AuthForm = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState({
    text: "",
    type: "",
  });
  const [loading, setLoading] = useState(false);

  // Email/password login or register
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedbackMessage({ text: "", type: "" });

    const endpoint = isLogin ? "/api/users/login" : "/api/users/register";
    const body = { email, password };

    try {
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong!");
      }

      setFeedbackMessage({ text: data.message, type: "success" });

      if (isLogin) {
        const userData = {
          userId: data.user?._id || data.userId || data._id || data.id,
          email: data.user?.email || email,
          token: data.token || null,
        };
        onAuthSuccess(userData);
      }
    } catch (error) {
      console.error("Authentication failed:", error.message);
      setFeedbackMessage({ text: error.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Google OAuth sign-in
  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setFeedbackMessage({ text: "", type: "" });

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin, // must be allow-listed in Supabase
        },
      });

      if (error) throw error;

      // No further code runs here because this triggers a full page redirect.
      // After redirect, you can detect the logged-in session in your app root and call onAuthSuccess there.
    } catch (error) {
      console.error("Google sign-in failed:", error.message);
      setFeedbackMessage({ text: error.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="Auth-container">
      <h2 className="Auth-title">{isLogin ? "Login" : "Register"}</h2>
      <p className="Auth-description">
        {isLogin
          ? "Welcome back! Please login to continue."
          : "Join the Expense Tracker community!"}
      </p>

      {feedbackMessage.text && (
        <div className={`Auth-message Auth-message-${feedbackMessage.type}`}>
          {feedbackMessage.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="Auth-form">
        <div className="Auth-form-group">
          <label htmlFor="email" className="Auth-label">
            Email:
          </label>
          <input
            type="email"
            id="email"
            className="Auth-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="Auth-form-group">
          <label htmlFor="password" className="Auth-label">
            Password:
          </label>
          <input
            type="password"
            id="password"
            className="Auth-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="Auth-button" disabled={loading}>
          {loading ? "Loading..." : isLogin ? "Login" : "Register"}
        </button>
      </form>

      {/* Sign in with Google */}
      <div style={{ marginTop: "1rem", textAlign: "center" }}>
        <button
          onClick={handleGoogleSignIn}
          className="Auth-button"
          style={{
            backgroundColor: "#4285F4",
            color: "white",
            border: "none",
            padding: "0.5rem 1rem",
            cursor: "pointer",
          }}
        >
          Sign in with Google
        </button>
      </div>

      <div className="Auth-toggle">
        <p>
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <span
            className="Auth-toggle-link"
            onClick={() => {
              setIsLogin(!isLogin);
              setFeedbackMessage({ text: "", type: "" });
            }}
          >
            {isLogin ? " Register" : " Login"}
          </span>
        </p>
      </div>
    </div>
  );
};

export default AuthForm;