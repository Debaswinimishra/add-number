import React from "react";
import { Modal } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";

const ShowConfirm = (title, content) => {
  return new Promise((resolve) => {
    Modal.confirm({
      title: title,
      content: content,
      icon: <InfoCircleOutlined style={{ color: "#1890ff" }} />,
      onOk() {
        resolve(true);
      },
      onCancel() {
        resolve(false);
      },
    });
  });
};

export default ShowConfirm;
