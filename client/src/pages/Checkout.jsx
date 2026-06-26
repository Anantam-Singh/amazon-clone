import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useCart } from "../context/CartContext";
import { API_BASE_URL } from "../config";

function Checkout() {
  const {
    cartItems,
    cartSubtotal,
    coupon,
    cartDiscount,
    cartGrandTotal,
    clearCart,
    addOrder,
  } = useCart();
  const navigate = useNavigate();

  // Form Delivery States
  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [zip, setZip] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [error, setError] = useState("");

  // Card Payment States
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardType, setCardType] = useState("default"); // visa, mastercard, default

  // Payment Processing Loader States
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentPhase, setPaymentPhase] = useState("");
  
  // Checkout Success Modal State
  const [isOrdered, setIsOrdered] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");

  const shippingFee = cartSubtotal >= 499 ? 0 : 40;
  const taxFee = Math.round(cartGrandTotal * 0.05); // 5% GST based on discounted value
  const checkoutTotal = cartGrandTotal + shippingFee + taxFee;

  // Handle formatted card number input
  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, ""); // digits only
    if (value.length > 16) value = value.slice(0, 16);

    // Detect card brand
    if (value.startsWith("4")) {
      setCardType("visa");
    } else if (value.startsWith("5")) {
      setCardType("mastercard");
    } else {
      setCardType("default");
    }

    // Add space formatting every 4 digits
    const formatted = value.match(/.{1,4}/g)?.join(" ") || "";
    setCardNumber(formatted);
  };

  // Handle formatted expiry MM/YY input
  const handleCardExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, ""); // digits only
    if (value.length > 4) value = value.slice(0, 4);

    if (value.length > 2) {
      value = `${value.slice(0, 2)}/${value.slice(2)}`;
    }
    setCardExpiry(value);
  };

  // Handle formatted CVV input
  const handleCardCvvChange = (e) => {
    let value = e.target.value.replace(/\D/g, ""); // digits only
    if (value.length > 3) value = value.slice(0, 3);
    setCardCvv(value);
  };

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    setError("");

    if (!fullName || !address || !city || !stateName || !zip) {
      setError("Please complete your delivery address details.");
      return;
    }

    if (paymentMethod === "card") {
      if (!cardName) {
        setError("Please enter the cardholder's name.");
        return;
      }
      if (cardNumber.length < 19) {
        setError("Card number must be 16 digits long.");
        return;
      }
      if (cardExpiry.length < 5) {
        setError("Please provide a valid card expiry date (MM/YY).");
        return;
      }
      const [m] = cardExpiry.split("/");
      if (Number(m) < 1 || Number(m) > 12) {
        setError("Invalid card expiration month.");
        return;
      }
      if (cardCvv.length < 3) {
        setError("Please enter a valid 3-digit CVV.");
        return;
      }
    }

    // Generate a random order ID with AUR prefix (Aura brand)
    const randomId = `AUR-${Math.floor(100000 + Math.random() * 900000)}-${Math.floor(1000 + Math.random() * 9000)}`;
    
    // Create new order object
    const newOrder = {
      orderId: randomId,
      date: new Date().toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      items: cartItems.map((item) => ({
        id: item.id,
        title: item.title,
        price: item.price,
        image: item.image,
        description: item.description,
        quantity: item.quantity,
      })),
      cartSubtotal,
      cartDiscount,
      couponCode: coupon.code,
      grandTotal: checkoutTotal,
      shippingDetails: {
        fullName,
        address,
        city,
        stateName,
        zip,
      },
      paymentMethod:
        paymentMethod === "cod"
          ? "Cash on Delivery"
          : paymentMethod === "upi"
          ? "UPI Payment"
          : `Credit Card (${cardType === "visa" ? "VISA" : cardType === "mastercard" ? "Mastercard" : "Card"})`,
    };

    if (paymentMethod === "card") {
      // Simulate securing banking gateway loading animations
      setPaymentLoading(true);
      setPaymentPhase("Securing connection with bank payment gateway...");

      setTimeout(() => {
        setPaymentPhase("Verifying 3D-Secure credentials and card status...");
      }, 1000);

      setTimeout(() => {
        setPaymentPhase("Authorizing payment and generating invoice...");
      }, 2200);

      setTimeout(async () => {
        setPaymentLoading(false);
        try {
          await axios.post(`${API_BASE_URL}/api/products/purchase`, {
            items: cartItems.map(i => ({ id: i.id, quantity: i.quantity }))
          });
        } catch (err) {
          console.error("Failed to update stock", err);
        }
        addOrder(newOrder);
        setOrderNumber(randomId);
        setIsOrdered(true);
      }, 3400);
    } else {
      // Instant processing for COD / UPI mock
      axios.post(`${API_BASE_URL}/api/products/purchase`, {
        items: cartItems.map(i => ({ id: i.id, quantity: i.quantity }))
      }).catch(err => console.error("Failed to update stock", err))
        .finally(() => {
          addOrder(newOrder);
          setOrderNumber(randomId);
          setIsOrdered(true);
        });
    }
  };

  const handleModalClose = () => {
    setIsOrdered(false);
    clearCart();
    navigate("/orders");
  };

  if (cartItems.length === 0 && !isOrdered) {
    return (
      <div className="error-container">
        <h1>Your Cart is Empty</h1>
        <p>Add items to your cart before proceeding to checkout.</p>
        <Link to="/" className="back-link">Go back to storefront</Link>
      </div>
    );
  }

  return (
    <div className="checkout-page-wrapper">
      <div className="checkout-header">
        <h1>Secure Checkout</h1>
        <div className="checkout-lock-badge">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            className="checkout-lock-icon"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          <span>Secure transaction SSL</span>
        </div>
      </div>

      <div className="checkout-layout">
        {/* Left Column: Form Details */}
        <div className="checkout-left-col">
          {/* Step 1: Shipping Address */}
          <div className="checkout-step-card">
            <div className="step-header">
              <div className="step-number">1</div>
              <h2>Select a delivery address</h2>
            </div>
            <div className="step-body">
              <form className="address-form">
                <div className="form-group span-2">
                  <label htmlFor="checkout-name">Full name</label>
                  <input
                    type="text"
                    id="checkout-name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="form-input"
                    placeholder="Recipient's first and last name"
                  />
                </div>

                <div className="form-group span-2">
                  <label htmlFor="checkout-address">Street Address</label>
                  <input
                    type="text"
                    id="checkout-address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="form-input"
                    placeholder="Flat, House no., Building, Apartment details"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="checkout-city">Town/City</label>
                  <input
                    type="text"
                    id="checkout-city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="checkout-state">State</label>
                  <input
                    type="text"
                    id="checkout-state"
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="checkout-zip">PIN Code</label>
                  <input
                    type="text"
                    id="checkout-zip"
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    className="form-input"
                    placeholder="6-digit ZIP code"
                  />
                </div>
              </form>
            </div>
          </div>

          {/* Step 2: Payment Method */}
          <div className="checkout-step-card">
            <div className="step-header">
              <div className="step-number">2</div>
              <h2>Select a payment method</h2>
            </div>
            <div className="step-body">
              <div className="payment-selector">
                <div
                  className={`payment-option-card ${paymentMethod === "cod" ? "selected" : ""}`}
                  onClick={() => setPaymentMethod("cod")}
                >
                  <input
                    type="radio"
                    id="pay-cod"
                    name="payment"
                    checked={paymentMethod === "cod"}
                    onChange={() => setPaymentMethod("cod")}
                  />
                  <div className="payment-option-info">
                    <label htmlFor="pay-cod"><h3>Cash on Delivery (COD)</h3></label>
                    <p>Pay with cash or card upon product arrival.</p>
                  </div>
                </div>

                <div
                  className={`payment-option-card ${paymentMethod === "upi" ? "selected" : ""}`}
                  onClick={() => setPaymentMethod("upi")}
                >
                  <input
                    type="radio"
                    id="pay-upi"
                    name="payment"
                    checked={paymentMethod === "upi"}
                    onChange={() => setPaymentMethod("upi")}
                  />
                  <div className="payment-option-info">
                    <label htmlFor="pay-upi"><h3>UPI Payment (GPay, PhonePe, Paytm)</h3></label>
                    <p>Scan a secure QR code or enter your UPI ID at delivery.</p>
                  </div>
                </div>

                <div
                  className={`payment-option-card ${paymentMethod === "card" ? "selected" : ""}`}
                  onClick={() => setPaymentMethod("card")}
                >
                  <input
                    type="radio"
                    id="pay-card"
                    name="payment"
                    checked={paymentMethod === "card"}
                    onChange={() => setPaymentMethod("card")}
                  />
                  <div className="payment-option-info">
                    <label htmlFor="pay-card"><h3>Credit or Debit Card</h3></label>
                    <p>Secure payment via Mastercard, Visa, RuPay, or Maestro.</p>
                  </div>
                </div>

                {/* Interactive Card Form Panel */}
                {paymentMethod === "card" && (
                  <div className="interactive-card-payment-form">
                    <div className="card-graphics-preview">
                      <div className={`credit-card-preview-art ${cardType}`}>
                        <div className="card-preview-chip"></div>
                        <div className="card-preview-brand-logo">
                          {cardType === "visa" && <span className="logo-visa">VISA</span>}
                          {cardType === "mastercard" && <span className="logo-mastercard">mastercard</span>}
                          {cardType === "default" && <span className="logo-generic">CARD</span>}
                        </div>
                        <div className="card-preview-number">
                          {cardNumber || "•••• •••• •••• ••••"}
                        </div>
                        <div className="card-preview-footer">
                          <div className="card-preview-holder">
                            <span className="cap">CARDHOLDER</span>
                            <span className="val">{cardName.toUpperCase() || "NAME SURNAME"}</span>
                          </div>
                          <div className="card-preview-expiry">
                            <span className="cap">EXPIRES</span>
                            <span className="val">{cardExpiry || "MM/YY"}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="card-form-inputs">
                      <div className="form-group span-2">
                        <label htmlFor="card-holder-input">Cardholder Name</label>
                        <input
                          type="text"
                          id="card-holder-input"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          className="form-input"
                          placeholder="Name as it appears on card"
                        />
                      </div>
                      <div className="form-group span-2">
                        <label htmlFor="card-number-input">Card Number</label>
                        <input
                          type="text"
                          id="card-number-input"
                          value={cardNumber}
                          onChange={handleCardNumberChange}
                          className="form-input"
                          placeholder="4000 1234 5678 9010"
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="card-expiry-input">Expiration Date</label>
                        <input
                          type="text"
                          id="card-expiry-input"
                          value={cardExpiry}
                          onChange={handleCardExpiryChange}
                          className="form-input"
                          placeholder="MM/YY"
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="card-cvv-input">CVV</label>
                        <input
                          type="password"
                          id="card-cvv-input"
                          value={cardCvv}
                          onChange={handleCardCvvChange}
                          className="form-input"
                          placeholder="•••"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Step 3: Review Items */}
          <div className="checkout-step-card">
            <div className="step-header">
              <div className="step-number">3</div>
              <h2>Review items</h2>
            </div>
            <div className="step-body">
              <div className="review-items-list">
                {cartItems.map((item) => (
                  <div key={item.id} className="review-item">
                    <img src={item.image} alt={item.title} />
                    <div className="review-item-info">
                      <h4>{item.title}</h4>
                      <p className="review-item-qty">Qty: {item.quantity}</p>
                      <p className="review-item-price">
                        ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Checkout Summary Sidebar */}
        <div className="checkout-right-col">
          <div className="checkout-summary-card">
            <h3>Order Summary</h3>
            <div className="summary-row">
              <span>Items Subtotal:</span>
              <span>₹{cartSubtotal.toLocaleString("en-IN")}</span>
            </div>
            {coupon.code && (
              <div className="summary-row" style={{ color: "var(--brand-accent)" }}>
                <span>Coupon Discount ({coupon.code}):</span>
                <span>-₹{cartDiscount.toLocaleString("en-IN")}</span>
              </div>
            )}
            <div className="summary-row">
              <span>Shipping & Delivery:</span>
              <span>{shippingFee === 0 ? "FREE" : `₹${shippingFee}`}</span>
            </div>
            <div className="summary-row">
              <span>Estimated Tax (5% GST):</span>
              <span>₹{taxFee.toLocaleString("en-IN")}</span>
            </div>

            <div className="summary-row divider total">
              <span>Order Total:</span>
              <span>₹{checkoutTotal.toLocaleString("en-IN")}</span>
            </div>

            {error && <div className="auth-error" style={{ marginTop: "12px" }}>{error}</div>}

            <button onClick={handlePlaceOrder} className="btn-primary place-order-button">
              Place your order
            </button>

            <p className="payment-notice">
              By placing your order, you agree to Amaze on's privacy policies and conditions of trade.
            </p>
          </div>
        </div>
      </div>

      {/* Simulated Banking Processing Modal Overlay */}
      {paymentLoading && (
        <div className="checkout-success-overlay banking-processing-overlay">
          <div className="success-modal-card payment-loading-card">
            <div className="payment-processing-spinner">
              <div className="spinner-circle"></div>
              <div className="lock-icon-inside">🔒</div>
            </div>
            <h2>Authorizing Transaction...</h2>
            <p>{paymentPhase}</p>
            <span className="secure-badge">PCI-DSS Compliant Secure Gateway</span>
          </div>
        </div>
      )}

      {/* Success Modal Lightbox Overlay */}
      {isOrdered && (
        <div className="checkout-success-overlay">
          <div className="success-modal-card">
            <div className="success-animation-container">
              <div className="success-ring">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  className="success-checkmark"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
            </div>
            <h2>Order Complete!</h2>
            <p>
              Thank you for shopping at Amaze on, <strong>{fullName}</strong>. We've successfully received your order and are dispatching it shortly.
            </p>
            <div className="order-number-badge">
              Order ID: {orderNumber}
            </div>
            <button onClick={handleModalClose} className="btn-primary success-modal-btn">
              View Your Orders
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Checkout;