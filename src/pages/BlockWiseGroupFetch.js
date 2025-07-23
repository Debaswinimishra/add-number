import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import districtJson from "../components/DistrictData.json";
import { find_group, sync_group } from "../services/AppService";
import { useNavigate } from "react-router-dom";

const BlockWiseGroupFetch = () => {
  const navigate = useNavigate();
  const REACT_APP_BASE_URL = process.env.REACT_APP_BASE_URL;
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedBlock, setSelectedBlock] = useState("");
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);
  const [excelFile, setExcelFile] = useState(null);
  const [allBlocks, setAllBlocks] = useState([]);
  const [udiseCodesList, setUdiseCodesList] = useState([]);
  const [previewData, setPreviewData] = useState([]);

  const handleSyncClick = () => {
    setShowSyncModal(true);
    setPasswordInput("");
    setPasswordError("");
  };

  const handlePasswordSubmit = () => {
    if (passwordInput === "ThinkZone@2025") {
      setLoading(true);
      sync_group
        .then((response) => {
          if (!response.ok) throw new Error("API request failed");
          return response.json();
        })
        .then((data) => {
          alert("Password correct! Sync started.\n" + JSON.stringify(data));
          setShowSyncModal(false);
        })
        .catch((error) => {
          alert("Sync failed: " + error.message);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setPasswordError("Incorrect password");
    }
  };

  const handleExcelUpload = (file) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });

      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet);

      // Extract UDISE codes regardless of column name
      const standardizedData = jsonData
        .map((row) => {
          // Find the UDISE code by checking common column names
          const udiseCode = Object.entries(row).find(
            ([key]) =>
              key.toLowerCase().includes("udise") ||
              key.toLowerCase().includes("udice")
          )?.[1];

          return { udise_code: udiseCode };
        })
        .filter((item) => item.udise_code); // Filter out empty values

      setPreviewData(standardizedData);
      const udiseCodes = standardizedData.map((row) => row.udise_code);
      setUdiseCodesList(udiseCodes);
    };

    reader.readAsArrayBuffer(file);
  };

  const handleExcelSubmit = () => {
    if (!excelFile) return alert("Please select an Excel file.");
    if (!selectedDistrict || !selectedBlock)
      return alert("Please select District and Block.");

    if (udiseCodesList.length === 0) {
      alert("No UDISE codes found in the Excel file.");
      return;
    }

    const payload = {
      district: selectedDistrict.toLowerCase(),
      block: selectedBlock.toLowerCase(),
      udisecodes: udiseCodesList,
    };

    setLoading(true);
    find_group(payload)
      .then((res) => {
        if (!res.ok) throw new Error("Upload failed");
        return res.json();
      })
      .then(() => {
        alert("UDISE codes submitted successfully.");
        setExcelFile(null);
      })
      .catch((err) => {
        alert("Error: " + err.message);
      })
      .finally(() => setLoading(false));
  };

  const districtsList = districtJson.map((item) => item.district);
  const uniqueDistricts = [...new Set(districtsList)];

  useEffect(() => {
    const myBlocks = districtJson.filter(
      (item) => item.district === selectedDistrict
    );
    setAllBlocks(myBlocks);
  }, [selectedDistrict]);

  const handleGoBack = () => {
    navigate(-1); // Go back to previous page
  };

  return (
    <div className="block-wise-container">
      <div className="header-container">
        <button
          onClick={handleGoBack}
          // style={styles.backButton}
          aria-label="Go back"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </button>
        <div className="title-wrapper">
          <h1 className="main-title">Block-Wise Group Fetch</h1>
          <p className="subtitle">
            Manage and synchronize school groups by block
          </p>
        </div>
        <div className="header-actions">
          <button className="sync-button" onClick={handleSyncClick}>
            Sync Groups
          </button>
          <button
            className="refresh-button"
            onClick={() => window.location.reload()}
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="content-card">
        <div className="filters-container">
          <div className="filter-group">
            <label className="filter-label">District</label>
            <select
              className="filter-select"
              value={selectedDistrict}
              onChange={(e) => {
                setSelectedDistrict(e.target.value);
                setSelectedBlock("");
                setUdiseCodesList([]);
              }}
            >
              <option value="">Select District</option>
              {uniqueDistricts.map((district, id) => (
                <option key={id} value={district}>
                  {district}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Block</label>
            <select
              className="filter-select"
              value={selectedBlock}
              onChange={(e) => setSelectedBlock(e.target.value)}
              disabled={!selectedDistrict}
            >
              <option value="">Select Block</option>
              {allBlocks.map((block, id) => (
                <option key={id} value={block.block}>
                  {block.block}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="file-upload-section">
          <div className="file-input-wrapper">
            <input
              type="file"
              accept=".xls,.xlsx"
              onChange={(e) => {
                setExcelFile(e.target.files[0]);
                handleExcelUpload(e.target.files[0]);
              }}
              id="file-upload"
              className="file-input"
            />
            <label htmlFor="file-upload" className="file-input-label">
              Choose Excel File
            </label>
            <span className="file-name">
              {excelFile ? excelFile.name : "No file selected"}
            </span>
          </div>
          <button
            className="submit-button"
            onClick={handleExcelSubmit}
            disabled={
              !excelFile || !selectedDistrict || !selectedBlock || loading
            }
          >
            {loading ? "Uploading..." : "Submit Excel"}
          </button>
        </div>

        {previewData.length > 0 && (
          <div className="preview-section">
            <div className="preview-header">
              <h3>UDISE Codes Preview ({previewData.length} schools)</h3>
            </div>
            <div className="table-container">
              <table className="preview-table">
                <thead>
                  <tr>
                    <th>UDISE Code</th>
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((row, idx) => (
                    <tr key={idx}>
                      <td>{row.udise_code}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {showSyncModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Enter Password</h3>
              <button
                className="modal-close"
                onClick={() => setShowSyncModal(false)}
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              <input
                type="password"
                className="password-input"
                placeholder="Enter password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handlePasswordSubmit()}
              />
              {passwordError && (
                <p className="error-message">{passwordError}</p>
              )}
            </div>
            <div className="modal-footer">
              <button
                className="modal-button secondary"
                onClick={() => setShowSyncModal(false)}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className="modal-button primary"
                onClick={handlePasswordSubmit}
                disabled={loading}
              >
                {loading ? "Processing..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .block-wise-container {
          font-family: 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .header-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          position: relative;
        }

        .back-button {
          position: absolute;
          left: 0;
          background: none;
          border: none;
          font-size: 16px;
          color: #4f46e5;
          cursor: pointer;
          padding: 8px 12px;
          border-radius: 4px;
        }

        .back-button:hover {
          background-color: #f1f5f9;
        }

        .title-wrapper {
          text-align: center;
          flex-grow: 1;
        }

        .main-title {
          font-size: 24px;
          color: #1e293b;
          margin: 0;
        }

        .subtitle {
          font-size: 14px;
          color: #64748b;
          margin-top: 5px;
        }

        .header-actions {
          display: flex;
          gap: 10px;
        }

        .sync-button, .refresh-button {
          padding: 8px 16px;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          border: 1px solid #e2e8f0;
        }

        .sync-button {
          background-color: #4f46e5;
          color: white;
          border: none;
        }

        .sync-button:hover {
          background-color: #4338ca;
        }

        .refresh-button {
          background-color: white;
          color: #4f46e5;
        }

        .refresh-button:hover {
          background-color: #f8fafc;
        }

        .content-card {
          background: white;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .filters-container {
          display: flex;
          gap: 20px;
          margin-bottom: 20px;
        }

        .filter-group {
          flex: 1;
        }

        .filter-label {
          display: block;
          margin-bottom: 8px;
          font-size: 14px;
          color: #64748b;
        }

        .filter-select {
          width: 100%;
          padding: 10px;
          border-radius: 6px;
          border: 1px solid #e2e8f0;
          font-size: 14px;
        }

        .file-upload-section {
          display: flex;
          gap: 15px;
          align-items: center;
          margin-bottom: 20px;
        }

        .file-input-wrapper {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .file-input {
          display: none;
        }

        .file-input-label {
          padding: 10px 15px;
          background-color: #f1f5f9;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          white-space: nowrap;
        }

        .file-input-label:hover {
          background-color: #e2e8f0;
        }

        .file-name {
          font-size: 14px;
          color: #64748b;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .submit-button {
          padding: 10px 20px;
          background-color: #4f46e5;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
        }

        .submit-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .submit-button:hover:not(:disabled) {
          background-color: #4338ca;
        }

        .preview-section {
          margin-top: 30px;
        }

        .preview-header {
          margin-bottom: 15px;
        }

        .preview-header h3 {
          font-size: 16px;
          color: #1e293b;
          margin: 0;
        }

        .table-container {
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          overflow: hidden;
          max-height: 400px;
          overflow-y: auto;
        }

        .preview-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
        }

        .preview-table th {
          background-color: #f8fafc;
          padding: 12px;
          text-align: left;
          font-weight: 500;
          color: #475569;
          position: sticky;
          top: 0;
        }

        .preview-table td {
          padding: 12px;
          border-top: 1px solid #f1f5f9;
          color: #475569;
        }

        .preview-table tr:hover td {
          background-color: #f9fafb;
        }

        /* Modal styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0,0,0,0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .modal {
          background-color: white;
          border-radius: 8px;
          width: 100%;
          max-width: 400px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }

        .modal-header {
          padding: 16px;
          border-bottom: 1px solid #f1f5f9;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-header h3 {
          margin: 0;
          font-size: 18px;
        }

        .modal-close {
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
          color: #94a3b8;
        }

        .modal-body {
          padding: 16px;
        }

        .password-input {
          width: 100%;
          padding: 10px;
          border-radius: 6px;
          border: 1px solid #e2e8f0;
          font-size: 14px;
          margin-bottom: 10px;
        }

        .error-message {
          color: #dc2626;
          font-size: 13px;
          margin-top: 5px;
        }

        .modal-footer {
          padding: 16px;
          border-top: 1px solid #f1f5f9;
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }

        .modal-button {
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 14px;
          cursor: pointer;
        }

        .modal-button.primary {
          background-color: #4f46e5;
          color: white;
          border: none;
        }

        .modal-button.primary:hover {
          background-color: #4338ca;
        }

        .modal-button.secondary {
          background-color: white;
          color: #64748b;
          border: 1px solid #e2e8f0;
        }

        .modal-button.secondary:hover {
          background-color: #f8fafc;
        }
      `}</style>
    </div>
  );
};

export default BlockWiseGroupFetch;
