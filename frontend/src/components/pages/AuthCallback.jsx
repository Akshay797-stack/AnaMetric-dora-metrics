import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import { useAuth } from "../../contexts/AuthContext";

export default function AuthCallback() {
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const handleAuth = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session) {
        navigate("/signin", { replace: true });
        return;
      }

      // Save user in your AuthContext
      login(session.user);

      // Redirect to dashboard
      navigate("/dashboard", { replace: true });
    };

    handleAuth();
  }, [navigate, login]);

  return <p>Signing you in...</p>;
}