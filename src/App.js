import React, { useState } from "react";
import * as XLSX from "xlsx";
import districtJson from "../src/DistrictData.json";

const districtBlockData = {
  Khordha: ["Bhubaneswar", "Jatni", "Balianta"],
  Cuttack: ["Cuttack Sadar", "Banki", "Nischintakoili"],
  Ganjam: ["Chhatrapur", "Berhampur", "Digapahandi"],
  Puri: ["Puri Sadar", "Brahmagiri", "Krushnaprasad"],
};

const App = () => {
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedBlock, setSelectedBlock] = useState("");
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);
  const [excelFile, setExcelFile] = useState(null);

  const handleSyncClick = () => {
    setShowSyncModal(true);
    setPasswordInput("");
    setPasswordError("");
  };

  const handlePasswordSubmit = () => {
    if (passwordInput === "ThinkZone@2025") {
      setLoading(true);
      fetch("http://localhost:4000/api/syncallgroups")
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

  const handleExcelSubmit = () => {
    if (!excelFile) return alert("Please select an Excel file.");
    if (!selectedDistrict || !selectedBlock)
      return alert("Please select District and Block.");

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });

      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet);

      const udiseCodes = jsonData
        .map(
          (row) =>
            row.udice_code ||
            row.UDICE_CODE ||
            row["Udice Code"] ||
            row["UDICE CODE"]
        )
        .filter(Boolean);

      if (udiseCodes.length === 0) {
        alert("No UDISE codes found in the Excel file.");
        return;
      }

      const payload = {
        district: selectedDistrict,
        block: selectedBlock,
        udice_codes: udiseCodes,
      };

      setLoading(true);
      fetch("http://localhost:4000/api/uploadexcel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })
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

    reader.readAsArrayBuffer(excelFile);
  };
  console.log("districtJson========>", districtJson);

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
              }}
            >
              <option value="">Select District</option>
              {districtJson.map((district) => (
                <option key={district} value={district.district}>
                  {district.district}
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
              {districtJson.map((block) => (
                <option key={block} value={block.block}>
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
            onChange={(e) => setExcelFile(e.target.files[0])}
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
      </div>

      {/* Sync Modal */}
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
};
