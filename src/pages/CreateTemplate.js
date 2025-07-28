import React, { useState, useEffect, useRef } from "react";
import { Button, Input, Select, Modal, Spin, Table } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusCircleOutlined,
  SearchOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import EmojiPicker from "emoji-picker-react";
import ShowAlert from "../components/ShowAlert";
import ShowConfirm from "../components/ShowConfirm";
import {
  getAllMessageTemplates,
  createMessageTemplate,
  updateMessageTemplate,
  deleteMessageTemplate,
} from "../services/AppService";
import axios from "axios";

const { TextArea } = Input;
const { Option } = Select;

const MessageTemplatesPage = () => {
  // State for listing templates
  const [messageTemplates, setMessageTemplates] = useState([]);
  const [filteredTemplates, setFilteredTemplates] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);
  const [visibleData, setVisibleData] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const tableRef = useRef(null);

  // State for modal
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [modalFlag, setModalFlag] = useState("save");
  const [modalParams, setModalParams] = useState({});

  // State for template form
  const [_id, set_id] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState("Select Type");
  const [mediaurl, setMediaurl] = useState("");
  const [showMediaurl, setShowMediaurl] = useState(false);
  const [texts, setTexts] = useState([""]);
  const [mediaOptions, setMediaOptions] = useState([]);
  const [showPickerIndex, setShowPickerIndex] = useState(null);

  const MAX_CHARACTERS_FOR_BODY = 1000;

  // Fetch templates on mount
  useEffect(() => {
    getMessageTemplates();
  }, []);

  // Update visible data when filtered templates change
  useEffect(() => {
    setVisibleData(filteredTemplates.slice(0, 10));
    setHasMore(filteredTemplates.length > 10);
  }, [filteredTemplates]);

  // Fetch media data when type is media
  useEffect(() => {
    if (type === "media") {
      fetchMediaData();
    }
  }, [type]);

  const getMessageTemplates = async () => {
    setLoading(true);
    try {
      const data = await getAllMessageTemplates();
      setMessageTemplates(data || []);
      setFilteredTemplates(data || []);
    } catch (error) {
      console.error("Error:", error);
      ShowAlert("Error", "Failed to fetch templates", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchMediaData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `https://thinkzone.info/meta/getAllMediaByType/image/students/whatsapp_osepa`
      );
      if (response.data && response.data.data) {
        setMediaOptions(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching media:", error);
      ShowAlert("Error", "Failed to fetch media", "error");
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  };

  const handleSearch = (event) => {
    const value = event.target.value.toLowerCase();
    setSearchText(value);
    const filtered = messageTemplates.filter((template) =>
      template.name.toLowerCase().includes(value)
    );
    setFilteredTemplates(filtered);
  };

  const loadMoreData = () => {
    if (!hasMore) return;
    const newLength = visibleData.length + 10;
    setVisibleData(filteredTemplates.slice(0, newLength));
    setHasMore(newLength < filteredTemplates.length);
  };

  const handleScroll = () => {
    if (!tableRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = tableRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 10) {
      loadMoreData();
    }
  };

  // Modal functions
  const openModal = (flag, params = {}) => {
    setModalFlag(flag);
    if (flag === "save") {
      resetForm();
    } else {
      setModalParams(params);
      set_id(params._id || "");
      setName(params.name || "");
      setType(params.type || "Select Type");
      setMediaurl(params.mediaurl || "");
      setShowMediaurl(params.type !== "text");
      setTexts(
        Array.isArray(params.text)
          ? params.text
          : typeof params.text === "string"
          ? [params.text]
          : [""]
      );
    }
    setIsOpenModal(true);
  };

  const closeModal = async (result) => {
    if (result) await getMessageTemplates();
    setIsOpenModal(false);
  };

  // Template form functions
  const type_select_on_change = (value) => {
    setType(value);
    setShowMediaurl(value !== "text");
  };

  const addTextbox = () => {
    if (texts.includes("")) {
      ShowAlert("Alert", "Please first fill the existing textbox.", "info");
    } else {
      setTexts([...texts, ""]);
    }
  };

  const updateTextbox = (index, value) => {
    const updated = [...texts];
    updated[index] = value;
    setTexts(updated);
  };

  const removeTextbox = (index) => {
    const updated = texts.filter((_, i) => i !== index);
    setTexts(updated.length ? updated : [""]);
  };

  const handleEmojiClick = (emojiData, index) => {
    const updated = [...texts];
    updated[index] += emojiData.emoji;
    setTexts(updated);
    setShowPickerIndex(null);
  };

  const handleTextChange = (value, index) => {
    updateTextbox(index, value);
  };

  const applyFormatting = (format, index) => {
    const textarea = document.querySelectorAll("textarea")[index];
    const startPos = textarea.selectionStart;
    const endPos = textarea.selectionEnd;

    if (startPos === endPos) return;

    const selectedText = texts[index].substring(startPos, endPos).trim();
    const formatSymbols = {
      bold: "*",
      italic: "_",
      strike: "~",
      monospace: "```",
    };

    const formatted =
      texts[index].substring(0, startPos) +
      formatSymbols[format] +
      selectedText +
      formatSymbols[format] +
      " " +
      texts[index].substring(endPos);

    const updated = [...texts];
    updated[index] = formatted;
    setTexts(updated);
  };

  const saveTemplate = async () => {
    if (!name) {
      ShowAlert("Alert", "Please enter name", "error");
    } else if (type !== "text" && !mediaurl) {
      ShowAlert("Alert", "Please select media", "error");
    } else if (type === "text" && texts.join("").trim() === "") {
      ShowAlert("Alert", "Please enter at least one message", "error");
    } else {
      modalFlag === "save" ? createTemplate() : updateTemplate();
    }
  };

  const createTemplate = async () => {
    const templateData = {
      id: new Date().getTime(),
      name,
      type: type === "text" ? "text" : "media",
      text: texts.map((t) => t.replace(/\n/g, " ")),
      mediaurl,
    };

    const response = await createMessageTemplate(templateData);
    if (response) {
      ShowAlert("Success", "Template created successfully", "success");
      closeModal(true);
    } else {
      ShowAlert("Failed", "Template creation failed", "error");
    }
  };

  const updateTemplate = async () => {
    const templateData = {
      _id,
      name,
      type: type === "text" ? "text" : "media",
      text: texts.map((t) => t.replace(/\n/g, " ")),
      mediaurl,
    };

    const response = await updateMessageTemplate(templateData);
    if (response) {
      ShowAlert("Success", "Template updated successfully", "success");
      closeModal(true);
    } else {
      ShowAlert("Failed", "Template update failed", "error");
    }
  };

  const deleteTemplate = async (template) => {
    const confirm = await ShowConfirm(
      "Confirmation",
      "Are you sure you want to remove it permanently?"
    );
    if (confirm) {
      const _id = template._id;
      const response = await deleteMessageTemplate({ _id });
      if (response) {
        await getMessageTemplates();
        ShowAlert("Success", "Template deleted successfully", "success");
      } else {
        ShowAlert("Failed", "Template delete failed", "error");
      }
    }
  };

  const resetForm = () => {
    set_id("");
    setName("");
    setType("text");
    setMediaurl("");
    setShowMediaurl(false);
    setTexts([""]);
  };

  const columns = [
    {
      title: "S.No.",
      dataIndex: "index",
      key: "index",
      render: (text, record, index) => index + 1,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
    },
    {
      title: "Text",
      dataIndex: "text",
      key: "text",
      render: (text) =>
        text ? (
          <div style={{}}>
            {text?.map((item, id) => {
              return (
                <div
                  style={{
                    marginBottom: "8px",
                    width: "160px",
                    overflowX: "auto",
                  }}
                >
                  {item}
                </div>
              );
            })}
          </div>
        ) : (
          "N/A"
        ),
    },
    {
      title: "Media URL",
      dataIndex: "mediaurl",
      key: "mediaurl",
      render: (url) => (url ? url : "N/A"),
    },
    {
      title: "Actions",
      key: "actions",
      render: (text, record) => (
        <div style={{ display: "flex", gap: "10px" }}>
          <Button
            type="primary"
            onClick={() => openModal("update", record)}
            icon={<EditOutlined />}
          />
          <Button
            type="primary"
            danger
            onClick={() => deleteTemplate(record)}
            icon={<DeleteOutlined />}
          />
        </div>
      ),
    },
  ];

  return (
    <div
      style={{
        padding: "20px",
        margin: "20px auto",
        maxWidth: "1200px",
        border: "1px solid black",
        borderRadius: "8px",
        backgroundColor: "#fff",
        boxShadow: "10px 32px 18px rgba(0, 0, 0, 0.1)",
      }}
    >
      <div
        style={{
          fontSize: "30px",
          fontWeight: "bold",
          color: "#0060ca",
          marginBottom: "20px",
          textAlign: "center",
          textTransform: "uppercase",
        }}
      >
        Message Templates
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <div style={{ fontSize: "16px", fontWeight: "bold" }}>
          {filteredTemplates.length} message template(s) found.
        </div>
        <Button
          type="primary"
          onClick={() => openModal("save", {})}
          icon={<PlusCircleOutlined />}
          style={{ fontSize: "16px" }}
        >
          Create
        </Button>
      </div>

      <div
        style={{
          display: "flex",
          marginBottom: "10px",
        }}
      >
        <Input
          placeholder="Search by template name"
          value={searchText}
          onChange={handleSearch}
          prefix={<SearchOutlined />}
          style={{ width: "300px" }}
        />
      </div>

      <div
        ref={tableRef}
        onScroll={handleScroll}
        style={{
          height: "400px",
          overflowY: "auto",
          border: "1px solid #f0f0f0",
          borderRadius: "8px",
        }}
      >
        <Table
          columns={columns.map((col) => ({
            ...col,
            ellipsis: true,
          }))}
          dataSource={visibleData.map((template, index) => ({
            key: index,
            ...template,
          }))}
          rowKey="key"
          style={{
            border: "1px solid #f0f0f0",
            borderRadius: "8px",
          }}
          loading={loading}
          pagination={false}
        />
      </div>

      {/* Modal for create/update */}
      <Modal
        title={modalFlag === "save" ? "Create Template" : "Update Template"}
        open={isOpenModal}
        onCancel={() => closeModal(null)}
        footer={[
          <Button key="reset" onClick={resetForm}>
            Reset
          </Button>,
          <Button key="save" type="primary" onClick={saveTemplate}>
            Save
          </Button>,
        ]}
      >
        <div
          style={{
            padding: "15px",
            border: "1px solid #dcdfe6",
            borderRadius: "8px",
            backgroundColor: "#f9f9f9",
            marginBottom: "20px",
          }}
        >
          <strong style={{ color: "red" }}>Instruction:</strong> Accepted file
          types: <b>.mp3, .mp4, .docx, .txt, .pdf, .png, .jpg, .jpeg</b> within{" "}
          <b>15 MB</b>.
        </div>

        <div style={{ display: "flex", padding: 10 }}>
          <div style={{ width: 50 }}>Title</div>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ width: 250 }}
          />
        </div>

        <div style={{ display: "flex", padding: 10 }}>
          <div style={{ width: 50 }}>Type</div>
          <Select
            value={type}
            onChange={type_select_on_change}
            placeholder="Select type"
            style={{ width: 250 }}
          >
            <Option value="text">Text</Option>
            <Option value="media">Media</Option>
          </Select>
        </div>

        {showMediaurl && (
          <div style={{ display: "flex", padding: 10 }}>
            <div style={{ width: 50 }}>Media</div>
            <Select
              showSearch
              value={mediaurl}
              onChange={setMediaurl}
              placeholder="Select media"
              style={{ width: 250 }}
              optionLabelProp="label"
              filterOption={(input, option) =>
                option?.label?.toLowerCase().includes(input.toLowerCase())
              }
            >
              {loading ? (
                <div>
                  <Spin size="medium" />
                </div>
              ) : (
                mediaOptions.map((media) => (
                  <Option
                    key={media.mediaId}
                    value={media.mediaUrl}
                    label={media.mediaName}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 10 }}
                    >
                      {media.mediaType === "image" ? (
                        <img
                          src={media.mediaUrl}
                          alt={media.mediaName}
                          style={{
                            width: 30,
                            height: 30,
                            objectFit: "cover",
                            borderRadius: 4,
                          }}
                        />
                      ) : media.mediaType === "video" ? (
                        <video
                          src={media.mediaUrl}
                          style={{
                            width: 30,
                            height: 30,
                            objectFit: "cover",
                            borderRadius: 4,
                          }}
                          muted
                          loop
                          autoPlay
                        />
                      ) : null}
                      {media.mediaName}
                    </div>
                  </Option>
                ))
              )}
            </Select>
          </div>
        )}

        {mediaurl && type === "media" ? (
          <div style={{ display: "flex", justifyContent: "center" }}>
            <img
              src={mediaurl}
              alt="mediaImage"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                borderRadius: 4,
                padding: 10,
              }}
            />
          </div>
        ) : null}

        <div style={{}}>
          {texts.map((t, index) => (
            <div
              key={index}
              style={{
                marginTop: 15,
                padding: 10,
                border: "1px solid #ddd",
                borderRadius: 8,
                background: "#fafafa",
              }}
            >
              <TextArea
                value={t}
                onChange={(e) => handleTextChange(e.target.value, index)}
                placeholder="Enter message text"
                style={{ height: 80, resize: "none" }}
                maxLength={MAX_CHARACTERS_FOR_BODY}
              />
              <div
                style={{
                  marginTop: 5,
                  display: "flex",
                  gap: 10,
                  alignItems: "center",
                }}
              >
                <span
                  onClick={() =>
                    setShowPickerIndex(showPickerIndex === index ? null : index)
                  }
                  style={{ cursor: "pointer" }}
                >
                  😊
                </span>
                {showPickerIndex === index && (
                  <div style={{ position: "absolute", zIndex: 10 }}>
                    <EmojiPicker
                      onEmojiClick={(emojiData) =>
                        handleEmojiClick(emojiData, index)
                      }
                    />
                  </div>
                )}
                <Button onClick={() => applyFormatting("bold", index)}>
                  B
                </Button>
                <Button onClick={() => applyFormatting("italic", index)}>
                  I
                </Button>
                <Button onClick={() => applyFormatting("strike", index)}>
                  S
                </Button>
                {texts.length > 1 && (
                  <Button danger onClick={() => removeTextbox(index)}>
                    Remove
                  </Button>
                )}
              </div>
              <div>
                Characters: {texts[index].length}/{MAX_CHARACTERS_FOR_BODY}
              </div>
            </div>
          ))}
          <Button onClick={addTextbox}>Add Textbox</Button>
        </div>
      </Modal>
    </div>
  );
};

export default MessageTemplatesPage;
