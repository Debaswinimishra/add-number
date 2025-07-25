import React, { useEffect, useState } from "react";
import {
  Button,
  Form,
  Input,
  Select,
  message,
  Modal,
  Spin,
  Pagination,
  Card,
  Row,
  Col,
} from "antd";
import { LoadingOutlined, UploadOutlined } from "@ant-design/icons";
import {
  checkMediaAvailability,
  deleteMedia,
  getAllMedias,
  saveMedia,
} from "../services/AppService";

const MediaUpload = () => {
  const [selectedFile, setSelectedFile] = useState({});
  const [description, setDescription] = useState("");
  const [headerType, setHeaderType] = useState("image");
  const [uploadLoading, setUploadLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [imageData, setImageData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isResetButtonDisabled, setIsResetButtonDisabled] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const userType = localStorage.getItem("role");
  const organizationType = localStorage.getItem("organizationType");
  const email = "tz@thinkzone.in";
  const name = "ThinkZone ";

  const fetchData = async () => {
    setLoading(true);
    try {
      const { resData } = await getAllMedias(headerType);
      setImageData(resData);
    } catch (err) {
      console.error("Error fetching media:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleHeaderChange = async (value) => {
    setHeaderType(value);
    setImageData([]);
    setLoading(true);
    try {
      const { resData } = await getAllMedias(value);
      setImageData(resData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const reset_button_on_click = () => {
    setDescription("");
    setSelectedFile({});
    document.getElementById("fileInput").value = "";
  };

  const file_on_change = (event) => {
    const file = event.target.files[0];
    const fileType = file.type;
    const fileExtension = file.name.split(".").pop().toLowerCase();
    const allFileNames = imageData?.map((item) =>
      item?.mediaName.replace(/\.[^/.]+$/, "").replace(/\s/g, "")
    );

    const exists = allFileNames.includes(
      file.name.replace(/\.[^/.]+$/, "").replace(/\s/g, "")
    );

    if (exists) {
      message.error("This media file already exists");
    } else if (
      fileType.startsWith("image/") &&
      !["png", "jpeg", "jpg"].includes(fileExtension)
    ) {
      message.error("Only JPEG/PNG images allowed!");
    } else {
      setSelectedFile(file);
    }
  };

  const send_button_on_click = async () => {
    if (!selectedFile?.name) {
      message.error("Please choose a file.");
      return;
    }

    setUploadLoading(true);
    setIsResetButtonDisabled(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("mediaName", selectedFile.name.replace(/\s/g, ""));
      formData.append("mediaType", headerType);
      formData.append("mediaDescription", description);
      formData.append("mediaId", new Date().getTime());
      formData.append("consumerType", "students");
      formData.append("name", "groupAutomationName");
      formData.append("email", "groupautomation@gmail.com");
      formData.append(
        "appType",
        organizationType === "thinkzone" ? "whatsapp" : "whatsapp_osepa"
      );

      const response = await saveMedia(headerType, formData);

      if (response === 202) {
        message.success("Save initiated. Please refresh after a while.");
        reset_button_on_click();
        fetchData();
      } else {
        message.error("Something went wrong!");
      }
    } catch (err) {
      if (err.response?.status === 413) {
        message.error("This file is too large to upload.");
      } else {
        message.error("Upload failed.");
      }
    } finally {
      setUploadLoading(false);
      setIsResetButtonDisabled(false);
    }
  };

  const deleteMediaOnClick = async (item) => {
    setDeleteLoading(true);
    try {
      const { mediaName, mediaUrl } = item;
      const res = await checkMediaAvailability(mediaName);
      const confirm = await Modal.confirm({
        title: "Confirm Delete",
        content: res.data
          ? `This media is used in template ${mediaName}. Still want to delete?`
          : "Do you want to delete it?",
        okText: "Yes",
        cancelText: "No",
        onOk() {
          const mediaBody = {
            mediaUrl,
            userCred: {
              email: "tzcontent023@gmail.com",
              name: "Thinkzone Content",
            },
            consumerType: "students",
          };
          deleteMedia(mediaBody).then((response) => {
            if (response.status === 200) {
              message.success("Successfully deleted");
              fetchData();
            }
          });
        },
        onCancel() {},
      });
    } catch (err) {
      message.error("Error deleting media");
    } finally {
      setDeleteLoading(false);
    }
  };

  const renderTableRows = () => {
    const start = (currentPage - 1) * pageSize;
    const slicedData = imageData?.slice(start, start + pageSize);

    return slicedData.map((item, index) => (
      <tr key={index}>
        <td>{index + 1}</td>
        <td>
          {headerType === "image" ? (
            <img src={item.mediaUrl} alt="media" width="120" />
          ) : (
            <video src={item.mediaUrl} width="150" height="100" controls />
          )}
        </td>
        <td style={{ fontSize: "12px" }}>{item.mediaName}</td>
        <td style={{ wordBreak: "break-word", fontSize: "12px" }}>
          <a href={item.mediaUrl} target="_blank" rel="noreferrer">
            {item.mediaUrl}
          </a>
        </td>
        {userType !== "user" && (
          <td>
            <Button
              danger
              size="small"
              onClick={() => deleteMediaOnClick(item)}
            >
              Delete
            </Button>
          </td>
        )}
      </tr>
    ));
  };

  return (
    <div style={{ padding: "24px" }}>
      <Card title="Upload Media" bordered={false}>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item label="Header Type">
              <Select
                defaultValue="image"
                onChange={handleHeaderChange}
                options={[{ value: "image", label: "Image" }]}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Choose File">
              <input
                id="fileInput"
                type="file"
                accept={headerType === "image" ? "image/jpeg" : "video/mp4"}
                onChange={file_on_change}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Actions">
              <Button
                type="primary"
                onClick={send_button_on_click}
                loading={uploadLoading}
              >
                Upload
              </Button>
              <Button
                style={{ marginLeft: "12px" }}
                onClick={reset_button_on_click}
                disabled={isResetButtonDisabled}
              >
                Reset
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Card>

      <Card
        title={`Uploaded ${headerType}s (${imageData.length})`}
        style={{ marginTop: 24 }}
      >
        {loading ? (
          <div style={{ textAlign: "center" }}>
            <Spin size="large" indicator={<LoadingOutlined spin />} />
          </div>
        ) : imageData.length === 0 ? (
          <h3>No data found</h3>
        ) : (
          <>
            <table
              className="responsive-table"
              style={{ width: "100%", borderCollapse: "collapse" }}
            >
              <thead>
                <tr>
                  <th>Sl. No</th>
                  <th>{headerType}</th>
                  <th>Name</th>
                  <th>URL</th>
                  {userType !== "user" && <th>Action</th>}
                </tr>
              </thead>
              <tbody>{renderTableRows()}</tbody>
            </table>
            <div style={{ marginTop: 12, textAlign: "right" }}>
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={imageData.length}
                onChange={setCurrentPage}
                showSizeChanger
                onShowSizeChange={(cur, size) => {
                  setPageSize(size);
                  setCurrentPage(1);
                }}
              />
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default MediaUpload;
