import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

function OAuthMock() {
  const [searchParams] = useSearchParams();
  const provider = searchParams.get("provider") || "google";
  const initialRole = searchParams.get("role") || "buyer";

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState(initialRole);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleAccountSelect = (selectedName, selectedEmail) => {
    setName(selectedName);
    setEmail(selectedEmail);
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setError("");

    const targetEmail = email.trim();
    const targetName = name.trim() || targetEmail.split("@")[0];

    if (!targetEmail) {
      setError("Email address is required.");
      return;
    }

    if (!targetEmail.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setSuccess(true);

      // Send social profile details back to the parent Amazeon window
      if (window.opener) {
        window.opener.postMessage(
          {
            type: "social-login-callback",
            success: true,
            provider,
            providerId: `mock_${provider}_${Math.random().toString(36).substr(2, 9)}`,
            email: targetEmail,
            name: targetName,
            role,
          },
          window.location.origin
        );
        setTimeout(() => {
          window.close();
        }, 1000);
      } else {
        setError("Parent window not found. Please log in from the main tab.");
      }
    }, 1500);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: provider === "google" ? "#f0f4f9" : "#15202b",
        fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          backgroundColor: provider === "google" ? "#ffffff" : "#192734",
          borderRadius: "16px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
          padding: "40px 32px",
          color: provider === "google" ? "#1f1f1f" : "#ffffff",
          textAlign: "center",
          transition: "all 0.3s ease",
        }}
      >
        {provider === "google" ? (
          /* Google Logo & Layout */
          <div>
            <div style={{ marginBottom: "20px", fontSize: "1.8rem", fontWeight: "bold" }}>
              <span style={{ color: "#4285F4" }}>G</span>
              <span style={{ color: "#EA4335" }}>o</span>
              <span style={{ color: "#FBBC05" }}>o</span>
              <span style={{ color: "#4285F4" }}>g</span>
              <span style={{ color: "#34A853" }}>l</span>
              <span style={{ color: "#EA4335" }}>e</span>
            </div>
            <h2 style={{ fontSize: "1.4rem", fontWeight: "500", marginBottom: "8px" }}>Sign in with Google</h2>
            <p style={{ fontSize: "0.9rem", color: "#5f6368", marginBottom: "30px" }}>to continue to amazeon.app</p>
          </div>
        ) : (
          /* X (Twitter) Logo & Layout */
          <div>
            <div style={{ marginBottom: "20px", display: "flex", justifyContent: "center" }}>
              <svg viewBox="0 0 24 24" aria-hidden="true" style={{ width: "40px", height: "40px", fill: "#ffffff" }}>
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
              </svg>
            </div>
            <h2 style={{ fontSize: "1.4rem", fontWeight: "700", marginBottom: "8px" }}>Sign in to X</h2>
            <p style={{ fontSize: "0.9rem", color: "#8899a6", marginBottom: "30px" }}>Authorize Amazeon access</p>
          </div>
        )}

        {success ? (
          <div style={{ padding: "40px 10px" }}>
            <div
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                backgroundColor: provider === "google" ? "#e6f4ea" : "#1b3a24",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px auto",
              }}
            >
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke={provider === "google" ? "#137333" : "#34d399"}
                strokeWidth="3"
              >
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <h3 style={{ fontSize: "1.2rem", fontWeight: "600", marginBottom: "8px" }}>Authorization Success!</h3>
            <p style={{ fontSize: "0.85rem", color: provider === "google" ? "#5f6368" : "#8899a6" }}>
              Returning to Amazeon and closing this window...
            </p>
          </div>
        ) : loading ? (
          <div style={{ padding: "50px 10px" }}>
            <div
              className="oauth-spinner"
              style={{
                width: "48px",
                height: "48px",
                border: "4px solid rgba(0,0,0,0.1)",
                borderTop: provider === "google" ? "4px solid #4285F4" : "4px solid #1d9bf0",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                margin: "0 auto 20px auto",
              }}
            ></div>
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
            <p style={{ fontSize: "0.95rem" }}>Authenticating you...</p>
          </div>
        ) : (
          <form onSubmit={handleLoginSubmit} style={{ textAlign: "left" }}>
            {provider === "google" && (
              <div style={{ marginBottom: "24px" }}>
                <p style={{ fontSize: "0.85rem", fontWeight: "600", color: "#5f6368", marginBottom: "10px" }}>
                  Select a Google account:
                </p>
                <div
                  onClick={() => handleAccountSelect("Anant Singh", "anant@gmail.com")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "12px",
                    border: "1px solid #dadce0",
                    borderRadius: "8px",
                    cursor: "pointer",
                    marginBottom: "8px",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8f9fa")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      backgroundColor: "#6366f1",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: "bold",
                      marginRight: "12px",
                      fontSize: "0.9rem",
                    }}
                  >
                    A
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "0.9rem", fontWeight: "600" }}>Anant Singh</div>
                    <div style={{ fontSize: "0.8rem", color: "#5f6368" }}>anant@gmail.com</div>
                  </div>
                </div>

                <div
                  onClick={() => handleAccountSelect("Seller Test", "seller@amazeon.com")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "12px",
                    border: "1px solid #dadce0",
                    borderRadius: "8px",
                    cursor: "pointer",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8f9fa")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      backgroundColor: "#10b981",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: "bold",
                      marginRight: "12px",
                      fontSize: "0.9rem",
                    }}
                  >
                    S
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "0.9rem", fontWeight: "600" }}>Seller Test</div>
                    <div style={{ fontSize: "0.8rem", color: "#5f6368" }}>seller@amazeon.com</div>
                  </div>
                </div>
              </div>
            )}

            <div style={{ marginBottom: "16px" }}>
              <label
                htmlFor="social-email"
                style={{
                  display: "block",
                  fontSize: "0.85rem",
                  fontWeight: "600",
                  marginBottom: "6px",
                  color: provider === "google" ? "#5f6368" : "#8899a6",
                }}
              >
                Or enter custom Email address
              </label>
              <input
                type="email"
                id="social-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: provider === "google" ? "1px solid #dadce0" : "1px solid #38444d",
                  borderRadius: "8px",
                  backgroundColor: provider === "google" ? "#ffffff" : "#15202b",
                  color: provider === "google" ? "#1f1f1f" : "#ffffff",
                  fontSize: "0.95rem",
                }}
                placeholder="name@domain.com"
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label
                htmlFor="social-name"
                style={{
                  display: "block",
                  fontSize: "0.85rem",
                  fontWeight: "600",
                  marginBottom: "6px",
                  color: provider === "google" ? "#5f6368" : "#8899a6",
                }}
              >
                Full Name
              </label>
              <input
                type="text"
                id="social-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: provider === "google" ? "1px solid #dadce0" : "1px solid #38444d",
                  borderRadius: "8px",
                  backgroundColor: provider === "google" ? "#ffffff" : "#15202b",
                  color: provider === "google" ? "#1f1f1f" : "#ffffff",
                  fontSize: "0.95rem",
                }}
                placeholder="e.g. John Doe"
              />
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label
                htmlFor="social-role"
                style={{
                  display: "block",
                  fontSize: "0.85rem",
                  fontWeight: "600",
                  marginBottom: "6px",
                  color: provider === "google" ? "#5f6368" : "#8899a6",
                }}
              >
                Account Role Type
              </label>
              <select
                id="social-role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: provider === "google" ? "1px solid #dadce0" : "1px solid #38444d",
                  borderRadius: "8px",
                  backgroundColor: provider === "google" ? "#ffffff" : "#15202b",
                  color: provider === "google" ? "#1f1f1f" : "#ffffff",
                  fontSize: "0.95rem",
                }}
              >
                <option value="buyer">Buyer (Standard Customer)</option>
                <option value="seller">Seller (Manage & List Products)</option>
              </select>
            </div>

            {error && (
              <p
                style={{
                  color: "#ef4444",
                  fontSize: "0.85rem",
                  marginBottom: "16px",
                  fontWeight: "600",
                  textAlign: "center",
                }}
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              style={{
                width: "100%",
                padding: "12px",
                border: "none",
                borderRadius: "8px",
                backgroundColor: provider === "google" ? "#1a73e8" : "#1d9bf0",
                color: "#ffffff",
                fontSize: "0.95rem",
                fontWeight: "bold",
                cursor: "pointer",
                transition: "opacity 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              Authorize & Log In
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default OAuthMock;
