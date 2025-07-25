import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, Tag, Button, Drawer } from "antd";
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
} from "@ant-design/icons";

const TopNavMenu = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [current, setCurrent] = useState(location.pathname);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [drawerVisible, setDrawerVisible] = useState(false);

  useEffect(() => {
    setCurrent(location.pathname);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleClick = (e) => {
    setCurrent(e.key);
    navigate(e.key);
    if (isMobile) setDrawerVisible(false);
  };

  const containerStyles = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgb(0, 21, 41)",
    padding: "10px 20px",
    borderBottom: "2px solid #4caf50",
    position: "sticky",
    top: 0,
    zIndex: 1000,
  };

  const logoContainerStyles = {
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
  };

  const logoStyles = {
    height: "40px",
    marginRight: "10px",
  };

  const titleStyles = {
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: "bold",
    margin: 0,
    paddingRight: "10px",
  };

  const menuStyles = {
    flex: 1,
    display: isMobile ? "none" : "flex",
    justifyContent: "flex-end",
    background: "transparent",
    border: "none",
  };

  const itemStyles = {
    fontSize: "16px",
    fontWeight: "500",
    color: "#ffffff",
    transition: "all 0.3s ease",
    margin: "0 10px",
  };

  const drawerButtonStyles = {
    backgroundColor: "#4caf50",
    borderColor: "#4caf50",
    color: "#ffffff",
  };

  const drawerStyles = {
    background: "#001529",
    color: "#ffffff",
    padding: 0,
  };

  const items = [
    {
      label: (
        <span style={itemStyles}>
          <HomeOutlined /> Home
        </span>
      ),
      key: "/",
    },
    {
      label: (
        <span style={itemStyles}>
          <AuditOutlined /> Groups
        </span>
      ),
      key: "/BlockWiseGroupFetch",
    },

    {
      label: (
        <span style={itemStyles}>
          <ContainerOutlined /> Add Numbers
        </span>
      ),
      key: "/BlockWiseNumberAdd",
    },
    {
      label: (
        <span style={itemStyles}>
          <AppstoreOutlined /> Templates
        </span>
      ),
      key: "/messagetemplate",
    },
    {
      label: (
        <span style={itemStyles}>
          <MailOutlined /> Messages
        </span>
      ),
      key: "/messages",
    },
    {
      label: (
        <span style={itemStyles}>
          <FileImageOutlined /> Media Upload
        </span>
      ),
      key: "/mediaUpload",
    },
  ];

  return (
    <div style={containerStyles}>
      <div style={logoContainerStyles}>
        {/* <img src={logo} alt="Logo" style={logoStyles} /> */}
        <h1 style={titleStyles}>
          Group Management Dashboard
          <sub>
            {/* <Tag color={tagColor}>
              <i>v{Version.version}</i>
            </Tag> */}
          </sub>
        </h1>
      </div>

      {!isMobile ? (
        <Menu
          items={items}
          onClick={handleClick}
          mode="horizontal"
          theme="dark"
          selectedKeys={[current]}
          style={menuStyles}
        />
      ) : (
        <>
          <Button
            icon={<MenuOutlined />}
            style={drawerButtonStyles}
            onClick={() => setDrawerVisible(true)}
          />
          <Drawer
            title={<span style={{ color: "#fff" }}>Menu</span>}
            placement="right"
            onClose={() => setDrawerVisible(false)}
            open={drawerVisible}
            bodyStyle={drawerStyles}
            headerStyle={{ background: "#001529", color: "#fff" }}
          >
            <Menu
              items={items}
              onClick={handleClick}
              mode="vertical"
              theme="dark"
              selectedKeys={[current]}
            />
          </Drawer>
        </>
      )}
    </div>
  );
};

export default TopNavMenu;
