import React from "react";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();

  const cardStyle = {
    display: "inline-block",
    width: "260px",
    height: "180px",
    margin: "20px",
    borderRadius: "16px",
    boxShadow: "0 8px 16px rgba(0, 0, 0, 0.15)",
    textAlign: "center",
    padding: "30px 20px",
    backgroundColor: "#ffffff",
    fontFamily: "Segoe UI, sans-serif",
  };

  const cardHoverStyle = {
    transform: "translateY(-5px)",
    boxShadow: "0 12px 20px rgba(0, 0, 0, 0.25)",
  };

  const containerStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
    marginTop: "80px",
    gap: "40px",
  };

  const headingStyle = {
    fontSize: "28px",
    fontWeight: "600",
    marginBottom: "40px",
    fontFamily: "Segoe UI, sans-serif",
    color: "#333",
  };

  const buttonStyle = {
    marginTop: "20px",
    padding: "10px 20px",
    fontSize: "16px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    transition: "background-color 0.3s",
  };

  const [hovered, setHovered] = React.useState("");

  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h2 style={headingStyle}>Welcome to Dashboard</h2>
      <div style={containerStyle}>
        <div
          style={{
            ...cardStyle,
            ...(hovered === "groupFetch" ? cardHoverStyle : {}),
          }}
          onMouseEnter={() => setHovered("groupFetch")}
          onMouseLeave={() => setHovered("")}
        >
          <h3 style={{ fontSize: "20px", color: "#007BFF" }}>Group Fetch</h3>
          <button
            style={{
              ...buttonStyle,
              backgroundColor: "#007BFF",
              color: "#fff",
            }}
            onClick={() => handleNavigate("/BlockWiseGroupFetch")}
          >
            Go
          </button>
        </div>

        <div
          style={{
            ...cardStyle,
            ...(hovered === "addNumbers" ? cardHoverStyle : {}),
          }}
          onMouseEnter={() => setHovered("addNumbers")}
          onMouseLeave={() => setHovered("")}
        >
          <h3 style={{ fontSize: "20px", color: "#28a745" }}>
            Add Numbers to Group
          </h3>
          <button
            style={{
              ...buttonStyle,
              backgroundColor: "#28a745",
              color: "#fff",
            }}
            onClick={() => handleNavigate("/BlockWiseNumberAdd")}
          >
            Go
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
