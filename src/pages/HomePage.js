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

  // Card styles
  const cardStyle = {
    background: "#ffffff",
    borderRadius: "12px",
    padding: "30px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
    transition: "all 0.3s ease",
    border: "1px solid #e2e8f0",
    textAlign: "center",
    cursor: "pointer",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  };

  const cardHoverStyle = {
    transform: "translateY(-5px)",
    boxShadow: "0 10px 15px rgba(0, 0, 0, 0.1)",
    borderColor: "#cbd5e0",
  };

  const cardTitleStyle = {
    fontSize: "20px",
    fontWeight: "600",
    marginBottom: "16px",
    color: "#2d3748",
  };

  const cardDescriptionStyle = {
    fontSize: "15px",
    color: "#4a5568",
    marginBottom: "24px",
    lineHeight: "1.5",
  };

  const iconStyle = {
    fontSize: "48px",
    marginBottom: "20px",
    color: "#4299e1",
  };

  const buttonStyle = {
    padding: "12px 24px",
    fontSize: "16px",
    fontWeight: "500",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    transition: "all 0.2s ease",
    alignSelf: "center",
    width: "120px",
  };

  const [hovered, setHovered] = React.useState("");

  const handleNavigate = (path) => {
    navigate(path);
  };

  // Dashboard cards data
  const dashboardCards = [
    {
      id: "groupFetch",
      title: "Group Fetch",
      description:
        "Retrieve and manage group information with advanced filtering options.",
      buttonText: "Access",
      buttonColor: "#4299e1",
      icon: "👥",
    },
    {
      id: "addNumbers",
      title: "Add Numbers",
      description:
        "Easily add new numbers to existing groups with bulk import support.",
      buttonText: "Add Now",
      buttonColor: "#48bb78",
      icon: "➕",
    },
    {
      id: "sendMessages",
      title: "Send Messages",
      description:
        "Send messages to entire groups with personalized templates and scheduling.",
      buttonText: "Send",
      buttonColor: "#9f7aea",
      icon: "✉️",
    },
  ];

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <h1 style={headingStyle}>Admin Dashboard</h1>
        <p style={subHeadingStyle}>
          Manage your groups and numbers efficiently with our comprehensive
          dashboard tools. Access all features with just one click.
        </p>
      </header>

      <div style={cardsContainerStyle}>
        {dashboardCards.map((card) => (
          <div
            key={card.id}
            style={{
              ...cardStyle,
              ...(hovered === card.id ? cardHoverStyle : {}),
            }}
            onMouseEnter={() => setHovered(card.id)}
            onMouseLeave={() => setHovered("")}
            onClick={() =>
              handleNavigate(
                `/${
                  card.id === "groupFetch"
                    ? "BlockWiseGroupFetch"
                    : card.id === "addNumbers"
                    ? "BlockWiseNumberAdd"
                    : "SendGroupMessages" // New route for messages
                }`
              )
            }
          >
            <div>
              <div style={iconStyle}>{card.icon}</div>
              <h3 style={cardTitleStyle}>{card.title}</h3>
              <p style={cardDescriptionStyle}>{card.description}</p>
            </div>
            <button
              style={{
                ...buttonStyle,
                backgroundColor: card.buttonColor,
                color: "#ffffff",
                ":hover": {
                  backgroundColor: `${card.buttonColor}dd`,
                },
              }}
            >
              {card.buttonText}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomePage;
