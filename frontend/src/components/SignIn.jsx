import React, { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../supabaseClient";

const SignIn = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleContinueWithGoogle = async () => {
    setError("");
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
      // No manual redirect here — Supabase will send to Google login
    } catch (err) {
      console.error(err);
      setError("Sign in failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: "2rem 0" }}>
      <div className="card" style={{ maxWidth: 480, margin: "0 auto" }}>
        <h2 className="card-title" style={{ marginBottom: 8 }}>Sign In</h2>
        <p className="card-subtitle" style={{ marginBottom: 24 }}>
          Welcome back. Please sign in to continue.
        </p>

        {error && (
          <div
            className="card"
            style={{
              background: "var(--surfaceHover)",
              borderColor: "var(--error)",
              marginBottom: 16,
            }}
          >
            <span style={{ color: "var(--error)" }}>{error}</span>
          </div>
        )}

        <div>
          <button
            type="button"
            className="btn btn-primary w-full"
            onClick={handleContinueWithGoogle}
            disabled={loading}
          >
            {loading ? "Redirecting..." : "Continue with Google"}
          </button>
        </div>

        <div style={{ marginTop: 16, textAlign: "center" }}>
          <span>Don't have an account? </span>
          <Link to="/register" className="gradient-text">
            Click here to register.
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignIn;