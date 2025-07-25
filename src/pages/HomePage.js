import React from "react";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();

  // Main container style
  const containerStyle = {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "40px 20px",
    fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
    color: "#2d3748",
  };

  // Header styles
  const headerStyle = {
    textAlign: "center",
    marginBottom: "60px",
  };

  const headingStyle = {
    fontSize: "36px",
    fontWeight: "600",
    marginBottom: "16px",
    color: "#1a365d",
  };

  const subHeadingStyle = {
    fontSize: "18px",
    color: "#4a5568",
    maxWidth: "700px",
    margin: "0 auto",
    lineHeight: "1.6",
  };

  // Cards container
  const cardsContainerStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "30px",
    justifyContent: "center",
  };

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <h1 style={headingStyle}>Admin Dashboard</h1>
        <p style={subHeadingStyle}>
          Manage your groups and numbers efficiently with our comprehensive
          dashboard tools. Access all features with just one click.
        </p>
      </header>
    </div>
  );
};

export default HomePage;
