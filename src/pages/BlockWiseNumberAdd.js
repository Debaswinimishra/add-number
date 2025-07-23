import React, { useState, useEffect } from "react";
import districtJson from "../components/DistrictData.json";
import { useNavigate } from "react-router-dom";
import { add_number_to_group } from "../services/AppService";

const BlockWiseGroupFetch = () => {
  const navigate = useNavigate();
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedBlock, setSelectedBlock] = useState("");
  const [allBlocks, setAllBlocks] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [numberInput, setNumberInput] = useState("");
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    const blocks = districtJson.filter(
      (item) => item.district === selectedDistrict
    );
    setAllBlocks(blocks);
    setSelectedBlock("");
  }, [selectedDistrict]);

  const validateNumber = (number) => {
    if (!number) return "Mobile number is required";
    if (!/^\d+$/.test(number)) return "Only digits are allowed";
    if (number.length !== 10) return "Must be exactly 10 digits";
    if (!/^[6-9]\d{9}$/.test(number)) return "Must start with 6-9";
    return "";
  };

  const handleAddNumber = async () => {
    const error = validateNumber(numberInput);
    if (error) {
      setValidationError(error);
      return;
    }

    try {
      const payload = {
        district: selectedDistrict.toLowerCase(),
        block: selectedBlock.toLowerCase(),
        number: parseInt("91" + numberInput),
      };

      const res = await add_number_to_group(payload);

      if (res?.status) {
        alert(
          `✅ +91${numberInput} added successfully to ${selectedDistrict} / ${selectedBlock}`
        );
      } else {
        alert(`❌ Failed to add number. `);
      }

      setNumberInput("");
      setValidationError("");
      setShowAddModal(false);
    } catch (error) {
      console.error("Error adding number:", error);
      alert("❌ An error occurred while adding the number.");
    }
  };

  const handleNumberChange = (e) => {
    const value = e.target.value;
    if (value.length <= 10) {
      setNumberInput(value);
      setValidationError(validateNumber(value));
    }
  };

  const handleGoBack = () => {
    navigate(-1); // Go back to previous page
  };

  return (
    <div style={styles.container}>
      <div style={styles.headerContainer}>
        <button
          onClick={handleGoBack}
          style={styles.backButton}
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
        <div>
          <h1 style={styles.header}>Block-wise Mobile Number Add</h1>
          <p style={styles.subHeader}>
            Select district and block to add a number
          </p>
        </div>
      </div>

      <div style={styles.filtersContainer}>
        <div style={styles.filterItem}>
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            style={styles.select}
            aria-label="Select district"
          >
            <option value="">Select District</option>
            {[...new Set(districtJson.map((item) => item.district))].map(
              (d, i) => (
                <option key={i} value={d}>
                  {d}
                </option>
              )
            )}
          </select>
        </div>

        <div style={styles.filterItem}>
          <select
            value={selectedBlock}
            onChange={(e) => setSelectedBlock(e.target.value)}
            style={styles.select}
            disabled={!selectedDistrict}
            aria-label="Select block"
          >
            <option value="">Select Block</option>
            {allBlocks.map((b, i) => (
              <option key={i} value={b.block}>
                {b.block}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        style={{
          ...styles.button,
          ...styles.primaryButton,
          opacity: selectedDistrict && selectedBlock ? 1 : 0.7,
          cursor: selectedDistrict && selectedBlock ? "pointer" : "not-allowed",
        }}
        onClick={() => {
          if (selectedDistrict && selectedBlock) {
            setShowAddModal(true);
          } else {
            alert("Please select both District and Block first");
          }
        }}
        aria-label="Add mobile number"
      >
        Add Number
      </button>

      {/* Modal */}
      {showAddModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3 style={styles.modalHeader}>Add Mobile Number</h3>
            <p style={styles.modalSubHeader}>
              For {selectedDistrict} / {selectedBlock}
            </p>

            <div style={styles.inputContainer}>
              <label style={styles.inputLabel}>Mobile Number</label>
              <div style={styles.inputGroup}>
                <span style={styles.prefix}>+91</span>
                <input
                  type="tel"
                  value={numberInput}
                  onChange={handleNumberChange}
                  style={{
                    ...styles.input,
                    borderColor: validationError ? "#ef4444" : "#d1d5db",
                  }}
                  placeholder="9876543210"
                  maxLength={10}
                  autoFocus
                  aria-label="10-digit mobile number"
                />
              </div>
              {validationError && (
                <p style={styles.errorText}>
                  <svg
                    style={styles.errorIcon}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {validationError}
                </p>
              )}
              <p style={styles.helperText}>
                Enter 10-digit mobile number starting with 6, 7, 8, or 9
              </p>
            </div>

            <div style={styles.modalActions}>
              <button
                style={{ ...styles.button, ...styles.secondaryButton }}
                onClick={() => {
                  setShowAddModal(false);
                  setValidationError("");
                }}
              >
                Cancel
              </button>
              <button
                style={{
                  ...styles.button,
                  ...styles.primaryButton,
                  opacity: !validationError && numberInput ? 1 : 0.7,
                  cursor:
                    !validationError && numberInput ? "pointer" : "not-allowed",
                }}
                onClick={handleAddNumber}
                disabled={!!validationError || !numberInput}
              >
                Save Number
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlockWiseGroupFetch;

const styles = {
  container: {
    padding: "24px",
    fontFamily: "'Inter', sans-serif",
    maxWidth: "600px",
    margin: "0 auto",
    backgroundColor: "#f9fafb",
    borderRadius: "12px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  headerContainer: {
    display: "flex",
    alignItems: "flex-start",
    gap: "16px",
    marginBottom: "24px",
  },
  backButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "8px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#4f46e5",
    transition: "background-color 0.2s",
    marginTop: "30px",
  },
  header: {
    fontSize: "28px",
    marginBottom: "8px",
    color: "#111827",
    fontWeight: "600",
  },
  subHeader: {
    fontSize: "14px",
    color: "#6b7280",
  },
  filtersContainer: {
    display: "flex",
    gap: "20px",
    marginBottom: "32px",
    flexWrap: "wrap",
  },
  filterItem: {
    display: "flex",
    flexDirection: "column",
    flex: "1 1 200px",
  },
  label: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#374151",
    marginBottom: "8px",
  },
  select: {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    backgroundColor: "#fff",
    fontSize: "14px",
    color: "#111827",
    transition: "border-color 0.2s",
    outline: "none",
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
  },
  button: {
    padding: "12px 20px",
    borderRadius: "8px",
    border: "none",
    fontWeight: "600",
    fontSize: "14px",
    cursor: "pointer",
    transition: "all 0.2s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
  primaryButton: {
    backgroundColor: "#4f46e5",
    color: "#fff",
    "&:hover": {
      backgroundColor: "#4338ca",
    },
  },
  secondaryButton: {
    backgroundColor: "#e5e7eb",
    color: "#374151",
    "&:hover": {
      backgroundColor: "#d1d5db",
    },
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
    zIndex: 999,
    backdropFilter: "blur(2px)",
  },
  modal: {
    backgroundColor: "#fff",
    padding: "32px",
    borderRadius: "12px",
    width: "100%",
    maxWidth: "400px",
    boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
  },
  modalHeader: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#111827",
    marginBottom: "4px",
  },
  modalSubHeader: {
    fontSize: "14px",
    color: "#6b7280",
    marginBottom: "24px",
  },
  inputContainer: {
    marginBottom: "24px",
  },
  inputLabel: {
    display: "block",
    fontSize: "14px",
    fontWeight: "500",
    color: "#374151",
    marginBottom: "8px",
  },
  inputGroup: {
    display: "flex",
    alignItems: "center",
    marginBottom: "4px",
  },
  prefix: {
    padding: "12px",
    backgroundColor: "#f3f4f6",
    border: "1px solid #d1d5db",
    borderRight: "none",
    borderTopLeftRadius: "8px",
    borderBottomLeftRadius: "8px",
    color: "#4b5563",
    fontSize: "14px",
  },
  input: {
    flex: 1,
    padding: "12px",
    border: "1px solid #d1d5db",
    borderTopRightRadius: "8px",
    borderBottomRightRadius: "8px",
    outline: "none",
    fontSize: "14px",
    color: "#111827",
    transition: "border-color 0.2s",
  },
  helperText: {
    fontSize: "12px",
    color: "#6b7280",
    marginTop: "4px",
  },
  errorText: {
    color: "#ef4444",
    fontSize: "13px",
    marginTop: "8px",
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  errorIcon: {
    width: "16px",
    height: "16px",
    color: "#ef4444",
  },
  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    marginTop: "16px",
  },
};
