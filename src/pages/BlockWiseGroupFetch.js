import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import districtJson from "../components/DistrictData.json";
import {
  find_group,
  sync_group,
  get_groups_by_udise,
} from "../services/AppService";
import { useNavigate } from "react-router-dom";

const BlockWiseGroupFetch = () => {
  const navigate = useNavigate();
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
  const [groupCount, setGroupCount] = useState(0);
  const [fetchingCount, setFetchingCount] = useState(false);
  const [activeStep, setActiveStep] = useState(1); // 1: Location, 2: Upload, 3: Review

  // Fetch group count when district and block are selected
  useEffect(() => {
    const fetchGroupCount = async () => {
      if (selectedDistrict && selectedBlock) {
        setFetchingCount(true);
        try {
          const response = await get_groups_by_udise({
            district: selectedDistrict.toLowerCase(),
            block: selectedBlock.toLowerCase(),
          });
          setGroupCount(response?.data?.count || 0);
        } catch (error) {
          console.error("Error fetching group count:", error);
          setGroupCount(0);
        } finally {
          setFetchingCount(false);
        }
      } else {
        setGroupCount(0);
      }
    };

    fetchGroupCount();
  }, [selectedDistrict, selectedBlock]);

  const handleSyncClick = () => {
    setShowSyncModal(true);
    setPasswordInput("");
    setPasswordError("");
  };

  const handlePasswordSubmit = () => {
    if (passwordInput === "ThinkZone@2025") {
      setLoading(true);
      sync_group()
        .then((response) => {
          if (!response.ok) throw new Error("API request failed");
          return response.json();
        })
        .then((data) => {
          alert("Sync started successfully!");
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

      const standardizedData = jsonData
        .map((row) => {
          const udiseCode = Object.entries(row).find(
            ([key]) =>
              key.toLowerCase().includes("udise") ||
              key.toLowerCase().includes("udice")
          )?.[1];

          return { udise_code: udiseCode };
        })
        .filter((item) => item.udise_code);

      setPreviewData(standardizedData);
      setUdiseCodesList(standardizedData.map((row) => row.udise_code));
      if (activeStep === 2) setActiveStep(3);
    };

    reader.readAsArrayBuffer(file);
  };

  const handleExcelSubmit = () => {
    if (!excelFile) return alert("Please select an Excel file.");
    if (!selectedDistrict || !selectedBlock)
      return alert("Please select District and Block.");
    if (udiseCodesList.length === 0)
      return alert("No valid UDISE codes found in the file.");

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
        alert("UDISE codes submitted successfully!");
        resetForm();
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

  const resetForm = () => {
    setSelectedDistrict("");
    setSelectedBlock("");
    setExcelFile(null);
    setPreviewData([]);
    setUdiseCodesList([]);
    setActiveStep(1);
  };

  const handleNextStep = () => {
    if (activeStep === 1 && (!selectedDistrict || !selectedBlock)) {
      alert("Please select both District and Block");
      return;
    }
    if (activeStep === 2 && !excelFile) {
      alert("Please upload an Excel file");
      return;
    }
    setActiveStep(activeStep + 1);
  };

  const handlePrevStep = () => setActiveStep(activeStep - 1);

  return (
    <div className="block-wise-container">
      <div className="header-container">
        <div className="title-wrapper">
          <h1>Blockwise Data Upload</h1>
          <p>Upload data organized by district and block.</p>
        </div>
        <div className="header-actions">
          <button className="sync-button" onClick={handleSyncClick}>
            Sync Groups
          </button>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="progress-steps">
        <div className={`step ${activeStep >= 1 ? "active" : ""}`}>
          <div className="step-number">1</div>
          <div className="step-title">Select Location</div>
        </div>
        <div className={`step ${activeStep >= 2 ? "active" : ""}`}>
          <div className="step-number">2</div>
          <div className="step-title">Upload File</div>
        </div>
        <div className={`step ${activeStep >= 3 ? "active" : ""}`}>
          <div className="step-number">3</div>
          <div className="step-title">Review & Submit</div>
        </div>
      </div>

      <div className="content-card">
        {activeStep === 1 && (
          <div className="step-content">
            <h2>Select District & Block</h2>

            <div className="filters-container">
              <div className="filter-group">
                <label>District</label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => {
                    setSelectedDistrict(e.target.value);
                    setSelectedBlock("");
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
                <label>Block</label>
                <select
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
          </div>
        )}

        {/* Step 2: File Upload */}
        {activeStep === 2 && (
          <div className="step-content">
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
                />
                <label htmlFor="file-upload" className="file-input-label">
                  Choose Excel File
                </label>
                <span className="file-name">
                  {excelFile ? excelFile.name : "No file selected"}
                </span>
              </div>

              <div className="file-requirements">
                <h4>File Requirements:</h4>
                <ul>
                  <li>Excel format (.xlsx)</li>
                  <li>File should contain Udise_Code in any column</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Review & Submit */}
        {activeStep === 3 && (
          <div className="step-content">
            <h2>Review & Submit</h2>

            {previewData.length > 0 ? (
              <div className="preview-section">
                <div className="preview-header">
                  <h3>
                    Found {previewData.length} udise in {selectedBlock},{" "}
                    {selectedDistrict}
                  </h3>
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
            ) : (
              <div className="no-data-message">
                No UDISE codes found in the file. Please check your file and try
                again.
              </div>
            )}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="step-navigation">
          {activeStep > 1 && (
            <button
              className="nav-button prev-button"
              onClick={handlePrevStep}
              disabled={loading}
            >
              Previous
            </button>
          )}

          {activeStep < 3 ? (
            <button
              className="nav-button next-button"
              onClick={handleNextStep}
              disabled={
                (activeStep === 1 && (!selectedDistrict || !selectedBlock)) ||
                (activeStep === 2 && !excelFile) ||
                loading
              }
            >
              Next
            </button>
          ) : (
            <button
              className="nav-button submit-button"
              onClick={handleExcelSubmit}
              disabled={loading || previewData.length === 0}
            >
              {loading ? "Submitting..." : "Submit Data"}
            </button>
          )}
        </div>
      </div>

      {/* Sync Modal */}
      {showSyncModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Sync School Groups</h3>
              <button
                className="modal-close"
                onClick={() => setShowSyncModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>
                Enter admin password to synchronize all school groups with the
                latest data.
              </p>
              <input
                type="password"
                placeholder="Enter password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handlePasswordSubmit()}
              />
              {passwordError && <p className="error">{passwordError}</p>}
            </div>
            <div className="modal-footer">
              <button
                onClick={() => setShowSyncModal(false)}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handlePasswordSubmit}
                disabled={loading}
                className="primary"
              >
                {loading ? "Syncing..." : "Confirm Sync"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .block-wise-container {
          font-family: "Inter", sans-serif;
          max-width: 1000px;
          margin: 0 auto;
          padding: 20px;
          color: #333;
        }

        .header-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          gap: 20px;
        }

        .back-button {
          background: none;
          border: none;
          color: #4f46e5;
          font-weight: 500;
          cursor: pointer;
          padding: 8px 12px;
          border-radius: 6px;
        }

        .back-button:hover {
          background: #f3f4f6;
        }

        .title-wrapper {
          flex: 1;
        }

        h1 {
          margin: 0;
          font-size: 24px;
          color: #111827;
        }

        p {
          margin: 5px 0 0;
          color: #6b7280;
          font-size: 14px;
        }

        .header-actions {
          display: flex;
          gap: 10px;
        }

        .sync-button {
          background: #4f46e5;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
        }

        .sync-button:hover {
          background: #4338ca;
        }

        /* Progress Steps */
        .progress-steps {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
          position: relative;
        }

        .progress-steps::before {
          content: "";
          position: absolute;
          top: 15px;
          left: 0;
          right: 0;
          height: 2px;
          background: #e5e7eb;
          z-index: 0;
        }

        .step {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          z-index: 1;
        }

        .step-number {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: #e5e7eb;
          color: #6b7280;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .step.active .step-number {
          background: #4f46e5;
          color: white;
        }

        .step-title {
          font-size: 14px;
          color: #9ca3af;
          font-weight: 500;
        }

        .step.active .step-title {
          color: #4f46e5;
        }

        /* Content Card */
        .content-card {
          background: white;
          border-radius: 12px;
          padding: 30px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          border: 1px solid #e5e7eb;
        }

        .step-content {
          margin-bottom: 30px;
        }

        h2 {
          margin: 0 0 10px;
          font-size: 20px;
          color: #111827;
        }

        /* Filters */
        .filters-container {
          display: flex;
          gap: 20px;
          margin: 20px 0;
        }

        .filter-group {
          flex: 1;
        }

        label {
          display: block;
          margin-bottom: 8px;
          font-size: 14px;
          font-weight: 500;
        }

        select {
          width: 100%;
          padding: 10px;
          border-radius: 6px;
          border: 1px solid #d1d5db;
          font-size: 14px;
        }

        select:focus {
          outline: none;
          border-color: #4f46e5;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
        }

        /* Info Box */
        .info-box {
          background: #f9fafb;
          border-radius: 8px;
          padding: 16px;
          margin-top: 20px;
          border-left: 4px solid #4f46e5;
        }

        .info-box p {
          margin: 5px 0;
          color: #4b5563;
        }

        .info-box p strong {
          color: #111827;
        }

        /* File Upload */
        .file-upload-section {
          margin: 20px 0;
        }

        .file-input-wrapper {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 15px;
        }

        #file-upload {
          display: none;
        }

        .file-input-label {
          padding: 10px 16px;
          background: #f9fafb;
          border: 1px dashed #d1d5db;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
        }

        .file-input-label:hover {
          background: #f3f4f6;
        }

        .file-name {
          font-size: 14px;
          color: #6b7280;
        }

        .file-requirements {
          background: #f9fafb;
          border-radius: 6px;
          padding: 15px;
          font-size: 14px;
        }

        .file-requirements h4 {
          margin: 0 0 10px;
          font-size: 14px;
        }

        .file-requirements ul {
          margin: 0;
          padding-left: 20px;
        }

        /* Preview Section */
        .preview-section {
          margin: 20px 0;
        }

        .preview-header h3 {
          margin: 0 0 15px;
          font-size: 16px;
        }

        .table-container {
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          overflow: hidden;
          max-height: 300px;
          overflow-y: auto;
        }

        .preview-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
        }

        .preview-table th {
          background: #f3f4f6;
          padding: 12px;
          text-align: left;
          font-weight: 500;
          position: sticky;
          top: 0;
        }

        .preview-table td {
          padding: 12px;
          border-top: 1px solid #f3f4f6;
        }

        .more-items {
          color: #9ca3af;
          font-style: italic;
        }

        .no-data-message {
          background: #fef2f2;
          color: #b91c1c;
          padding: 15px;
          border-radius: 6px;
          margin: 20px 0;
        }

        /* Navigation Buttons */
        .step-navigation {
          display: flex;
          justify-content: space-between;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
        }

        .nav-button {
          padding: 10px 20px;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          font-size: 14px;
        }

        .prev-button {
          background: white;
          border: 1px solid #d1d5db;
          color: #4b5563;
        }

        .prev-button:hover {
          background: #f9fafb;
        }

        .next-button,
        .submit-button {
          background: #4f46e5;
          color: white;
          border: none;
          margin-left: auto;
        }

        .next-button:hover:not(:disabled),
        .submit-button:hover:not(:disabled) {
          background: #4338ca;
        }

        .nav-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        /* Modal */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal {
          background: white;
          border-radius: 8px;
          width: 100%;
          max-width: 400px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }

        .modal-header {
          padding: 16px;
          border-bottom: 1px solid #e5e7eb;
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
          font-size: 24px;
          cursor: pointer;
          color: #9ca3af;
        }

        .modal-body {
          padding: 16px;
        }

        .modal-body p {
          margin: 0 0 15px;
        }

        .modal-body input {
          width: 100%;
          padding: 10px;
          border-radius: 6px;
          border: 1px solid #d1d5db;
          font-size: 14px;
        }

        .error {
          color: #dc2626;
          font-size: 13px;
          margin: 8px 0 0;
        }

        .modal-footer {
          padding: 16px;
          border-top: 1px solid #e5e7eb;
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }

        .modal-footer button {
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 14px;
          cursor: pointer;
          border: 1px solid #d1d5db;
          background: white;
        }

        .modal-footer button.primary {
          background: #4f46e5;
          color: white;
          border: none;
        }

        .modal-footer button.primary:hover {
          background: #4338ca;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .header-container {
            flex-direction: column;
            align-items: flex-start;
          }

          .filters-container {
            flex-direction: column;
          }

          .progress-steps {
            flex-wrap: wrap;
            gap: 15px;
          }

          .step {
            flex: 1;
            min-width: 100px;
          }

          .content-card {
            padding: 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default BlockWiseGroupFetch;
