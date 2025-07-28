import React from "react";
import { Modal } from "antd";
import { ExclamationCircleOutlined, CheckCircleOutlined, CloseCircleOutlined, InfoCircleOutlined } from "@ant-design/icons";

const ShowAlert = (title, message, type) => {
  let icon;
  switch (type) {
    case "success":
      icon = <CheckCircleOutlined style={{ color: "#52c41a" }} />;
      break;
    case "error":
      icon = <CloseCircleOutlined style={{ color: "#f5222d" }} />;
      break;
    case "info":
      icon = <InfoCircleOutlined style={{ color: "#1890ff" }} />;
      break;
    default:
      icon = <ExclamationCircleOutlined style={{ color: "#faad14" }} />;
  }

  Modal.info({
    title: title,
    icon: icon,
    // content: (
    //   <div>
    //     {messages.map((message, index) => (
    //       <p key={index}>{message}</p>
    //     ))}
    //   </div>
    // ),
    content: <div>{message}</div>,
    onOk() {
      console.log("Alert closed");
    },
  });
};

export default ShowAlert;
