import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, Button, Drawer, Avatar, Badge } from "antd";
import {
  AppstoreOutlined,
  AuditOutlined,
  BookOutlined,
  BarChartOutlined,
  ContainerOutlined,
  FileOutlined,
  FileImageOutlined,
  MailOutlined,
  WhatsAppOutlined,
  LogoutOutlined,
  MenuOutlined,
  HomeOutlined,
  BellOutlined,
  UserOutlined,
  SettingOutlined,
} from "@ant-design/icons";

const TopNavMenu = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [current, setCurrent] = useState(location.pathname);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setCurrent(location.pathname);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    const handleScroll = () => setScrolled(window.scrollY > 10);

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [location.pathname]);

  const handleClick = (e) => {
    setCurrent(e.key);
    navigate(e.key);
    if (isMobile) setDrawerVisible(false);
  };

  // Styles
  const containerStyles = {
    display: "flex",
    padding: "0 30px",
    backgroundColor: scrolled ? "rgba(0, 21, 41, 0.95)" : "#001529",
    alignItems: "center",
    justifyContent: "space-between",
    position: "sticky",
    top: 0,
    zIndex: 1000,
    height: "79px",
    boxShadow: scrolled ? "0 4px 12px rgba(0, 0, 0, 0.1)" : "none",
    transition: "all 0.3s ease",
  };

  const logoContainerStyles = {
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
    gap: "12px",
  };

  const logoStyles = {
    height: "36px",
    borderRadius: "4px",
  };

  const titleStyles = {
    color: "#ffffff",
    fontSize: "18px",
    fontWeight: "600",
    margin: 0,
    background: "linear-gradient(90deg, #fff, #4caf50)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  };

  const menuStyles = {
    flex: 1,
    display: isMobile ? "none" : "flex",
    justifyContent: "center",
    background: "transparent",
    border: "none",
    lineHeight: "62px",
  };

  const itemStyles = {
    fontSize: "14px",
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.85)",
    transition: "all 0.3s ease",
    margin: "0 8px",
    "&:hover": {
      color: "#fff",
    },
  };

  const activeItemStyles = {
    color: "#fff",
    fontWeight: "600",
    borderBottom: "2px solid #4caf50",
  };

  const drawerButtonStyles = {
    backgroundColor: "transparent",
    border: "none",
    color: "#fff",
    fontSize: "18px",
    padding: "0 12px",
    height: "64px",
    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, 0.1)",
    },
  };

  const drawerStyles = {
    background: "#001529",
    color: "#ffffff",
    padding: 0,
  };

  const actionsContainerStyles = {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    marginLeft: "24px",
  };

  const actionButtonStyles = {
    color: "rgba(255, 255, 255, 0.85)",
    fontSize: "16px",
    "&:hover": {
      color: "#fff",
    },
  };

  const items = [
    {
      label: (
        <span style={itemStyles}>
          <HomeOutlined style={{ marginRight: "6px" }} />
          Home
        </span>
      ),
      key: "/",
    },
    {
      label: (
        <span style={itemStyles}>
          <AuditOutlined style={{ marginRight: "6px" }} />
          Groups
        </span>
      ),
      key: "/BlockWiseGroupFetch",
    },
    {
      label: (
        <span style={itemStyles}>
          <ContainerOutlined style={{ marginRight: "6px" }} />
          Add Numbers
        </span>
      ),
      key: "/BlockWiseNumberAdd",
    },
    {
      label: (
        <span style={itemStyles}>
          <AppstoreOutlined style={{ marginRight: "6px" }} />
          Templates
        </span>
      ),
      key: "/CreateTemplate",
    },
    {
      label: (
        <span style={itemStyles}>
          <MailOutlined style={{ marginRight: "6px" }} />
          Messages
        </span>
      ),
      key: "/SendMessage",
    },
    {
      label: (
        <span style={itemStyles}>
          <FileImageOutlined style={{ marginRight: "6px" }} />
          Media
        </span>
      ),
      key: "/MediaUpload",
    },
  ];

  return (
    <div style={containerStyles}>
      <div style={logoContainerStyles}>
        <h1 style={titleStyles}>Group Management</h1>
      </div>

      {!isMobile ? (
        <>
          <Menu
            items={items.map((item) => ({
              ...item,
              label: (
                <span
                  style={{
                    ...itemStyles,
                    ...(current === item.key ? activeItemStyles : {}),
                  }}
                >
                  {item.label}
                </span>
              ),
            }))}
            onClick={handleClick}
            mode="horizontal"
            theme="dark"
            selectedKeys={[current]}
            style={menuStyles}
          />
          {/* <div style={actionsContainerStyles}>
            <Badge count={5} style={{ backgroundColor: "#4caf50" }}>
              <Button
                type="text"
                icon={<BellOutlined />}
                style={actionButtonStyles}
              />
            </Badge>
            <Button
              type="text"
              icon={<SettingOutlined />}
              style={actionButtonStyles}
              onClick={() => navigate("/settings")}
            />
            <Avatar
              icon={<UserOutlined />}
              style={{
                backgroundColor: "#4caf50",
                cursor: "pointer",
              }}
              onClick={() => navigate("/profile")}
            />
          </div> */}
        </>
      ) : (
        <>
          <div style={{ flex: 1 }}></div>
          <Button
            icon={<MenuOutlined />}
            style={drawerButtonStyles}
            onClick={() => setDrawerVisible(true)}
          />
          <Drawer
            title={
              <div style={logoContainerStyles}>
                <Avatar
                  src="https://via.placeholder.com/36"
                  style={logoStyles}
                  shape="square"
                />
                <h1 style={{ ...titleStyles, fontSize: "16px" }}>Menu</h1>
              </div>
            }
            placement="right"
            onClose={() => setDrawerVisible(false)}
            open={drawerVisible}
            bodyStyle={drawerStyles}
            headerStyle={{
              background: "#001529",
              color: "#fff",
              padding: "16px 24px",
              borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            }}
            width="280px"
          >
            <Menu
              items={items.map((item) => ({
                ...item,
                label: (
                  <span
                    style={{
                      ...itemStyles,
                      ...(current === item.key ? activeItemStyles : {}),
                    }}
                  >
                    {item.label}
                  </span>
                ),
              }))}
              onClick={handleClick}
              mode="vertical"
              theme="dark"
              selectedKeys={[current]}
              style={{ borderRight: "none", padding: "8px 0" }}
            />
            <div
              style={{
                padding: "16px 24px",
                borderTop: "1px solid rgba(255, 255, 255, 0.1)",
                marginTop: "16px",
              }}
            >
              <Button
                type="text"
                block
                icon={<UserOutlined />}
                style={{
                  color: "rgba(255, 255, 255, 0.85)",
                  textAlign: "left",
                  height: "auto",
                  padding: "8px 0",
                }}
              >
                My Profile
              </Button>
              <Button
                type="text"
                block
                icon={<SettingOutlined />}
                style={{
                  color: "rgba(255, 255, 255, 0.85)",
                  textAlign: "left",
                  height: "auto",
                  padding: "8px 0",
                }}
              >
                Settings
              </Button>
              <Button
                type="text"
                block
                icon={<LogoutOutlined />}
                style={{
                  color: "rgba(255, 255, 255, 0.85)",
                  textAlign: "left",
                  height: "auto",
                  padding: "8px 0",
                }}
              >
                Logout
              </Button>
            </div>
          </Drawer>
        </>
      )}
    </div>
  );
};

export default TopNavMenu;
