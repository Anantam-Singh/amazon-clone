import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("buyer");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const { signup, socialLogin } = useAuth();

  useEffect(() => {
    const handleMessage = async (e) => {
      if (e.origin !== window.location.origin) return;
      if (e.data && e.data.type === "social-login-callback") {
        const { name: socialName, email: socialEmail, provider, providerId, role: socialRole } = e.data;
        setError("");
        setSuccess(false);

        const res = await socialLogin(socialName, socialEmail, provider, providerId, socialRole);
        if (res.success) {
          setSuccess(true);
          setTimeout(() => {
            navigate(socialRole === "seller" ? "/seller" : "/");
          }, 1500);
        } else {
          setError(res.message);
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [socialLogin, navigate]);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const res = await signup(name, email, password, role);

    if (res.success) {
      setSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } else {
      setError(res.message);
    }
  };

  const openSocialAuth = (provider) => {
    const width = 500;
    const height = 650;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    window.open(
      `/oauth-mock?provider=${provider}&role=${role}`,
      "socialAuthPopup",
      `width=${width},height=${height},top=${top},left=${left}`
    );
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <Link to="/" className="auth-logo">
            amaze<span> on</span>
          </Link>
        </div>

        <h2>Create Account</h2>

        {success && (
          <div className="auth-success-banner">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            >
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span>Account created! Redirecting to Sign in...</span>
          </div>
        )}

        <form onSubmit={handleSignup} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Your name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-input"
              placeholder="First and last name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email or mobile number</label>
            <input
              type="text"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              placeholder="e.g. name@domain.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              placeholder="At least 6 characters"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Re-enter password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="role">Select account type</label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="form-input"
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "var(--border-radius-sm)",
                border: "1px solid var(--border-color)",
                backgroundColor: "#ffffff",
                color: "var(--text-main)",
                fontWeight: "500",
              }}
            >
              <option value="buyer">Buyer (Standard Customer)</option>
              <option value="seller">Seller (Manage Listings)</option>
            </select>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button type="submit" className="btn-primary auth-btn">
            Create your Amaze on account
          </button>

          <div style={{ display: "flex", alignItems: "center", margin: "20px 0" }}>
            <hr style={{ flex: 1, border: "0", borderTop: "1px solid var(--border-color)" }} />
            <span style={{ padding: "0 10px", fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase" }}>or sign up with</span>
            <hr style={{ flex: 1, border: "0", borderTop: "1px solid var(--border-color)" }} />
          </div>

          <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
            <button
              type="button"
              onClick={() => { window.location.href = `http://localhost:5000/api/auth/google?role=${role}`; }}
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                padding: "10px",
                border: "1px solid #cbd5e1",
                borderRadius: "var(--border-radius-sm)",
                backgroundColor: "#ffffff",
                color: "#0f172a",
                fontWeight: "500",
                fontSize: "0.85rem",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
              </svg>
              Google
            </button>
            <button
              type="button"
              onClick={() => openSocialAuth("twitter")}
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                padding: "10px",
                border: "1px solid #1e293b",
                borderRadius: "var(--border-radius-sm)",
                backgroundColor: "#090d16",
                color: "#ffffff",
                fontWeight: "500",
                fontSize: "0.85rem",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#ffffff">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              X
            </button>
          </div>
        </form>

        <p className="auth-notice">
          By creating an account, you agree to Amaze on's Conditions of Use and Privacy Notice.
        </p>

        <div className="auth-divider">Already have an account?</div>

        <Link to="/login" className="auth-switch-btn">
          <button className="btn-secondary">
            Sign in
          </button>
        </Link>
      </div>
    </div>
  );
}

export default Signup;