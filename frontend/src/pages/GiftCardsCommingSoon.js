import React from "react";
import { useNavigate } from "react-router-dom";

const GiftCardsComingSoon = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: "70vh",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      textAlign: "center",
      padding: "20px"
    }}>
      <h1 style={{ fontSize: "32px", fontWeight: "700", marginBottom: "20px" }}>
        🎁 Gift Cards are Coming Soon!
      </h1>

      <button
        onClick={() => navigate('/')}
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          borderRadius: "8px",
          border: "none",
          background: "#333",
          color: "white",
          cursor: "pointer"
        }}
      >
        ⬅ Back to Home
      </button>
    </div>
  );
};

export default GiftCardsComingSoon;