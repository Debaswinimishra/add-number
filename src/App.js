import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import districtJson from "../src/DistrictData.json";
// import {
//   save_image,
//   update_image,
//   get_image,
//   delete_image,
// } from "./DashboardSlider.thunk";
import { find_group } from "./AppService";

const App = () => {
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
      fetch("syncallgroups")
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

      // Standardize UDISE code field name
      const standardizedData = jsonData.map((row) => {
        // Check for various possible UDISE code field names
        const udiseCode =
          row.udise_code ||
          row.udice_code ||
          row.UDISE_CODE ||
          row.UDICE_CODE ||
          row["Udise Code"] ||
          row["Udice Code"] ||
          row["UDISE CODE"] ||
          row["UDICE CODE"];

        return {
          ...row,
          udise_code: udiseCode, // Standardize to udise_code
        };
      });

      setPreviewData(standardizedData);

      const udiseCodes = standardizedData
        .map((row) => row.udise_code)
        .filter(Boolean);

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
  console.log("REACT_APP_BASE_URL--------------->", REACT_APP_BASE_URL);

  return (
    <div style={styles.container}>
      <div style={styles.headerContainer}>
        <h1 style={styles.header}>Block-Wise Group Fetch</h1>
        <div style={styles.headerActions}>
          <button style={styles.primaryButton} onClick={handleSyncClick}>
            Sync Groups
          </button>
          <button
            style={styles.refreshButton}
            onClick={() => window.location.reload()}
          >
            Refresh 🔄
          </button>
        </div>
      </div>

      <div style={styles.controlsContainer}>
        <div style={styles.filtersContainer}>
          <div style={styles.filterItem}>
            <label style={styles.filterLabel}>District:</label>
            <select
              style={styles.filterSelect}
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

          <div style={styles.filterItem}>
            <label style={styles.filterLabel}>Block:</label>
            <select
              style={styles.filterSelect}
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

        <div style={styles.topButtons}>
          <input
            type="file"
            accept=".xls,.xlsx"
            onChange={(e) => {
              setExcelFile(e.target.files[0]);
              handleExcelUpload(e.target.files[0]);
            }}
            style={{ fontSize: "14px" }}
          />
          <button
            style={styles.primaryButton}
            onClick={handleExcelSubmit}
            disabled={
              !excelFile || !selectedDistrict || !selectedBlock || loading
            }
          >
            {loading ? "Uploading..." : "Submit Excel"}
          </button>
        </div>

        {previewData.length > 0 && (
          <div style={{ marginTop: "20px" }}>
            <h3
              style={{ fontSize: "16px", fontWeight: "500", color: "#2d3748" }}
            >
              Excel Preview ({previewData.length} rows):
            </h3>
            <div style={styles.previewContainer}>
              <div style={styles.previewScrollContainer}>
                <table style={styles.previewTable}>
                  <thead>
                    <tr>
                      {Object.keys(previewData[0]).map((key) => (
                        <th key={key} style={styles.previewTableHeader}>
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((row, idx) => (
                      <tr key={idx}>
                        {Object.values(row).map((value, i) => (
                          <td key={i} style={styles.previewTableCell}>
                            {String(value)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {showSyncModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3 style={styles.modalTitle}>Enter Password</h3>
            <input
              type="password"
              style={styles.input}
              placeholder="Enter password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handlePasswordSubmit()}
            />
            {passwordError && (
              <p style={styles.passwordError}>{passwordError}</p>
            )}
            <div style={styles.modalButtons}>
              <button
                style={styles.modalButton}
                onClick={handlePasswordSubmit}
                disabled={loading}
              >
                {loading ? "Processing..." : "Submit"}
              </button>
              <button
                style={{ ...styles.modalButton, ...styles.cancelButton }}
                onClick={() => setShowSyncModal(false)}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;

const styles = {
  container: {
    fontFamily: "'Segoe UI', 'Roboto', sans-serif",
    padding: "20px",
    backgroundColor: "#f5f7fa",
    minHeight: "100vh",
    maxWidth: "1000px",
    margin: "0 auto",
  },
  headerContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
    paddingBottom: "16px",
    borderBottom: "1px solid #e0e6ed",
  },
  header: {
    fontSize: "28px",
    fontWeight: "600",
    color: "#2d3748",
    margin: "0",
  },
  headerActions: {
    display: "flex",
    gap: "12px",
  },
  refreshButton: {
    padding: "8px 16px",
    border: "1px solid #e2e8f0",
    backgroundColor: "#ffffff",
    color: "#4a5568",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "500",
  },
  controlsContainer: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
    marginBottom: "24px",
  },
  topButtons: {
    display: "flex",
    gap: "12px",
    marginTop: "20px",
    alignItems: "center",
  },
  primaryButton: {
    padding: "10px 20px",
    border: "none",
    backgroundColor: "#4c6ef5",
    color: "white",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "500",
    fontSize: "15px",
  },
  filtersContainer: {
    display: "flex",
    gap: "20px",
    flexWrap: "wrap",
  },
  filterItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  filterLabel: {
    fontWeight: "500",
    color: "#4a5568",
    fontSize: "15px",
  },
  filterSelect: {
    padding: "9px 12px",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    backgroundColor: "#fff",
    fontSize: "14px",
    minWidth: "150px",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modal: {
    backgroundColor: "#fff",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
    minWidth: "350px",
    maxWidth: "90%",
  },
  modalTitle: {
    marginTop: "0",
    marginBottom: "20px",
    color: "#1e293b",
  },
  input: {
    width: "100%",
    padding: "12px",
    marginBottom: "20px",
    fontSize: "15px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    boxSizing: "border-box",
  },
  modalButtons: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
  },
  modalButton: {
    padding: "10px 20px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    backgroundColor: "#4c6ef5",
    color: "white",
    fontWeight: "500",
  },
  cancelButton: {
    backgroundColor: "#94a3b8",
  },
  passwordError: {
    color: "#dc2626",
    marginTop: "-15px",
    marginBottom: "15px",
    fontSize: "14px",
  },
  // New improved preview styles
  previewContainer: {
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    overflow: "hidden",
    marginTop: "10px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  previewScrollContainer: {
    maxHeight: "400px",
    overflow: "auto",
    position: "relative",
  },
  previewTable: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "14px",
  },
  previewTableHeader: {
    padding: "10px",
    textAlign: "left",
    backgroundColor: "#f1f5f9",
    position: "sticky",
    top: 0,
    borderBottom: "1px solid #e2e8f0",
    fontWeight: "500",
    color: "#334155",
  },
  previewTableCell: {
    padding: "8px 10px",
    borderBottom: "1px solid #e2e8f0",
    whiteSpace: "nowrap",
    color: "#475569",
  },
  previewTableRow: {
    "&:hover": {
      backgroundColor: "#f8fafc",
    },
  },
  udiseListContainer: {
    maxHeight: "200px",
    overflowY: "auto",
    marginTop: "10px",
    padding: "10px",
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
  },
  udiseListItem: {
    fontSize: "14px",
    color: "#475569",
    padding: "4px 0",
    "&:hover": {
      color: "#1e40af",
    },
  },
  previewTitle: {
    fontSize: "16px",
    fontWeight: "500",
    color: "#2d3748",
    marginBottom: "8px",
  },
};
