import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [activeTab, setActiveTab] = useState("buyer");
  const [error, setError]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [success, setSuccess]     = useState(false);

  const navigate = useNavigate();
  const [searchParams]  = useSearchParams();
  const nextPath        = searchParams.get("next") || null;

  const { login, socialLogin, logout, isAuthenticated, user } = useAuth();

  /* ── If already logged in, go to correct home ─────────────── */
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(user.role === "seller" ? "/seller" : "/", { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  /* ── X/Twitter & Google mock popup listener ────────────────────────── */
  useEffect(() => {
    const handleMessage = async (e) => {
      if (e.origin !== window.location.origin) return;
      if (!e.data || e.data.type !== "social-login-callback") return;
      if (!["twitter", "google"].includes(e.data.provider)) return;

      const { name, email: oauthEmail, provider, providerId, role } = e.data;
      setError("");

      const res = await socialLogin(name, oauthEmail, provider, providerId, role);
      if (res.success) {
        if (activeTab === "seller" && role !== "seller") {
          setError("That account is registered as a Buyer. Use the Buyer tab.");
          logout(); return;
        }
        if (activeTab === "buyer" && res.role === "seller") {
          setError("That account is a Seller account. Use the Seller tab.");
          logout(); return;
        }
        setSuccess(true);
        setTimeout(() => navigate(nextPath || (role === "seller" ? "/seller" : "/")), 1200);
      } else {
        setError(res.message);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [socialLogin, navigate, activeTab, logout, nextPath]);

  /* ── Email / Password login ────────────────────────────────── */
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please fill in both email and password.");
      return;
    }

    setLoading(true);
    const res = await login(email.trim(), password);
    setLoading(false);

    if (!res.success) { setError(res.message); return; }

    if (activeTab === "seller" && res.role !== "seller") {
      setError("This email belongs to a Buyer account. Use the Buyer tab.");
      logout(); return;
    }
    if (activeTab === "buyer" && res.role !== "buyer") {
      setError("This email belongs to a Seller account. Use the Seller tab.");
      logout(); return;
    }

    setSuccess(true);
    setTimeout(() => navigate(nextPath || (res.role === "seller" ? "/seller" : "/")), 1200);
  };

  /* ── Google OAuth ──────────────────────────────────────────── */
  const openGoogleAuth = () => {
    window.location.href = `http://localhost:5000/api/auth/google?role=${activeTab}`;
  };

  /* ── Social mock popup ────────────────────────────────── */
  const openSocialAuth = (provider) => {
    const w = 500, h = 650;
    window.open(
      `/oauth-mock?provider=${provider}&role=${activeTab}`,
      "socialAuthPopup",
      `width=${w},height=${h},top=${window.screen.height/2-h/2},left=${window.screen.width/2-w/2}`
    );
  };


  /* ── Render ────────────────────────────────────────────────── */
  return (
    <div className="auth-page-wrapper">
      <div className="auth-card">

        {/* Logo */}
        <div className="auth-header">
          <Link to="/" className="auth-logo">amaze<span> on</span></Link>
        </div>

        {/* Buyer / Seller tab switcher */}
        <div className="auth-tab-bar">
          {["buyer", "seller"].map(tab => (
            <button
              key={tab}
              type="button"
              className={`auth-tab-btn ${activeTab === tab ? "active" : ""}`}
              onClick={() => { setActiveTab(tab); setError(""); }}
            >
              {tab === "buyer" ? "🛍️ Buyer Login" : "🏪 Seller Login"}
            </button>
          ))}
        </div>

        <h2 className="auth-heading">
          Sign in as {activeTab === "seller" ? "Seller" : "Buyer"}
        </h2>

        {/* Success banner */}
        {success && (
          <div className="auth-success-banner">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>Signed in! Redirecting…</span>
          </div>
        )}

        {/* Login form */}
        <form onSubmit={handleLogin} className="auth-form" noValidate>
          <div className="form-group">
            <label htmlFor="login-email">Email address</label>
            <input
              type="email"
              id="login-email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="form-input"
              placeholder="name@example.com"
              autoComplete="email"
              disabled={loading || success}
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Password</label>
            <input
              type="password"
              id="login-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="form-input"
              placeholder="At least 6 characters"
              autoComplete="current-password"
              disabled={loading || success}
            />
          </div>

          {error && <div className="auth-error" role="alert">{error}</div>}

          <button
            type="submit"
            className="btn-primary auth-btn"
            disabled={loading || success}
          >
            {loading ? "Signing in…" : "Continue"}
          </button>

          {/* Divider */}
          <div className="auth-divider">or sign in with</div>

          {/* Social buttons */}
          <div className="auth-social-row">
            <button type="button" onClick={openGoogleAuth} className="auth-social-btn" disabled={loading || success}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
              Google
            </button>

            <button type="button" onClick={() => openSocialAuth("twitter")} className="auth-social-btn auth-social-btn--dark" disabled={loading || success}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="#fff">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              X (Twitter)
            </button>
          </div>
        </form>

        <p className="auth-notice">
          By continuing, you agree to Amaze on's Conditions of Use and Privacy Notice.
        </p>

        <div className="auth-divider">New to Amaze on?</div>

        <Link to={`/signup${nextPath ? `?next=${encodeURIComponent(nextPath)}` : ""}`} className="auth-switch-btn">
          <button type="button" className="btn-secondary" style={{ width: "100%" }}>
            Create your Amaze on account
          </button>
        </Link>
      </div>
    </div>
  );
}

export default Login;