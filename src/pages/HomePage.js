import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState("");

  const dashboardCards = [
    {
      id: "BlockWiseGroupFetch",
      title: "Group Management",
      description: "Udisecode groups and manage your contacts efficiently",
      buttonText: "Manage Groups",
      buttonColor: "#6366f1",
      icon: "👥",
      bgGradient: "linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)",
    },
    {
      id: "BlockWiseNumberAdd",
      title: "Number Management",
      description:
        "Add and edit numbers across your groups & View and organize all your contact groups in one place",
      buttonText: "Manage Numbers",
      buttonColor: "#10b981",
      icon: "📱",
      bgGradient: "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)",
    },
  ];

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.heading}>Admin Dashboard</h1>
        <p style={styles.subHeading}>
          Simple tools to organize your contacts efficiently
        </p>
      </header>

     

      <footer style={styles.footer}>
        © {new Date().getFullYear()} Contact Admin
      </footer>
    </div>
  );
};

const styles = {
  container: {
    width: "100%",
    height: "100vh",
    margin: "0 auto",
    padding: "1rem",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    boxSizing: "border-box",
  },
  header: {
    textAlign: "center",
    marginBottom: "2rem",
    padding: "0 1rem",
    maxWidth: "800px",
  },
  heading: {
    fontSize: "clamp(2rem, 5vw, 3rem)",
    fontWeight: "700",
    marginBottom: "0.5rem",
    color: "#111827",
    lineHeight: "1.2",
    background: "linear-gradient(90deg, #4f46e5, #10b981)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  subHeading: {
    fontSize: "clamp(1rem, 2vw, 1.25rem)",
    color: "#6b7280",
    lineHeight: "1.5",
  },
  cardsContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(300px, 100%), 1fr))",
    gap: "1.5rem",
    width: "100%",
    maxWidth: "800px",
    padding: "0 1rem",
    margin: "0 auto 2rem",
  },
  card: {
    background: "#ffffff",
    borderRadius: "1rem",
    padding: "1.5rem",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
    border: "1px solid #e5e7eb",
    textAlign: "center",
    cursor: "pointer",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    minHeight: "280px",
  },
  cardHover: {
    transform: "translateY(-5px)",
    boxShadow: "0 8px 20px rgba(0, 0, 0, 0.1)",
  },
  cardTitle: {
    fontSize: "1.25rem",
    fontWeight: "600",
    margin: "1rem 0",
    color: "#111827",
  },
  cardDescription: {
    fontSize: "0.9rem",
    color: "#4b5563",
    marginBottom: "1.5rem",
    lineHeight: "1.5",
  },
  iconContainer: {
    width: "70px",
    height: "70px",
    margin: "0 auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "1rem",
    fontSize: "2rem",
  },
  button: {
    padding: "0.75rem 1.25rem",
    fontSize: "0.9rem",
    fontWeight: "500",
    borderRadius: "0.5rem",
    border: "none",
    cursor: "pointer",
    transition: "all 0.2s ease",
    width: "100%",
    maxWidth: "200px",
    margin: "0 auto",
    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
  },
  buttonHover: {
    transform: "translateY(-2px)",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.15)",
  },
  footer: {
    textAlign: "center",
    padding: "1rem 0",
    color: "#9ca3af",
    fontSize: "0.875rem",
    marginTop: "auto",
  },
};

export default HomePage;
