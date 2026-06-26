import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * OAuthCallback.jsx
 *
 * This page is what Google redirects to after a successful login.
 * The backend extracts the user data and JWT, then redirects here
 * with token + user info in URL search params.
 *
 * Route: /oauth-callback
 */
export default function OAuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loginWithUserData } = useAuth();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const token = searchParams.get("token");
    const id = searchParams.get("id");
    const name = searchParams.get("name");
    const email = searchParams.get("email");
    const role = searchParams.get("role");
    const error = searchParams.get("error");

    if (error) {
      navigate("/login?error=" + error);
      return;
    }

    if (!token || !id) {
      navigate("/login?error=missing_token");
      return;
    }

    // Store user in AuthContext and localStorage (same as normal login)
    const userData = { _id: id, name, email, role, token };
    loginWithUserData(userData, token);

    // Redirect based on role
    if (role === "seller") {
      navigate("/seller");
    } else {
      navigate("/");
    }
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 50%, #16213e 100%)",
        fontFamily: "'Inter', sans-serif",
        color: "#fff",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            width: 56,
            height: 56,
            border: "4px solid rgba(255,255,255,0.1)",
            borderTop: "4px solid #ff6b35",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
            margin: "0 auto 20px",
          }}
        />
        <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 16 }}>Signing you in with Google…</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}
