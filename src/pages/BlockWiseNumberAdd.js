import React, { useState, useEffect } from "react";
import districtJson from "../components/DistrictData.json";
import { useNavigate } from "react-router-dom";
import { add_number_to_group, get_status } from "../services/AppService";

const BlockWiseGroupFetch = () => {
  const navigate = useNavigate();
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedBlock, setSelectedBlock] = useState("");
  const [filterDistrict, setFilterDistrict] = useState("");
  const [filterBlock, setFilterBlock] = useState("");
  const [allBlocks, setAllBlocks] = useState([]);
  const [filterBlocks, setFilterBlocks] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [numberInput, setNumberInput] = useState("");
  const [validationError, setValidationError] = useState("");
  const [tableData, setTableData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchAllData = () => {
    setIsLoading(true);
    const params = {
      district: filterDistrict.toLowerCase(),
      block: filterBlock.toLowerCase(),
    };

    get_status(params)
      .then((res) => {
        console.log("response----------->", res);
        if (res?.data?.data) {
          setTableData(res.data.data);
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchAllData();
    // const intervalId = setInterval(fetchAllData, 30000);

    // return () => {
    //   clearInterval(intervalId);
    // };
  }, [filterDistrict, filterBlock]);

  useEffect(() => {
    const blocks = districtJson.filter(
      (item) => item.district === selectedDistrict
    );
    setAllBlocks(blocks);
    setSelectedBlock("");
  }, [selectedDistrict]);

  useEffect(() => {
    const blocks = districtJson.filter(
      (item) => item.district === filterDistrict
    );
    setFilterBlocks(blocks);
    setFilterBlock("");
  }, [filterDistrict]);

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
      fetchAllData(); // Refresh data after adding
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
    navigate(-1);
  };

  // const handleResetFilters = () => {
  //   setFilterDistrict("");
  //   setFilterBlock("");
  //   setStatusFilter("all");
  // };

  const filteredData = tableData.filter((item) => {
    const statusMatch =
      statusFilter === "all" || item.child_status === statusFilter;
    const districtMatch =
      !filterDistrict ||
      item.district.toLowerCase() === filterDistrict.toLowerCase();
    const blockMatch =
      !filterBlock || item.block.toLowerCase() === filterBlock.toLowerCase();

    return statusMatch && districtMatch && blockMatch;
  });

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
          <p style={styles.subHeader}>Add mobile numbers to specific blocks</p>
        </div>
      </div>

      <div style={styles.controlsContainer}>
        <div style={styles.leftControls}>
          <button
            style={{
              ...styles.button,
              ...styles.primaryButton,
            }}
            onClick={() => setShowAddModal(true)}
            aria-label="Add mobile number"
          >
            Add Number
          </button>
        </div>
        <div style={styles.rightControls}>
          <div style={styles.filterItem}>
            <select
              value={filterDistrict}
              onChange={(e) => setFilterDistrict(e.target.value)}
              style={styles.select}
              aria-label="Filter by district"
            >
              <option value="">All Districts</option>
              {[...new Set(districtJson.map((item) => item.district))].map(
                (d, i) => (
                  <option key={`district-${i}`} value={d}>
                    {d}
                  </option>
                )
              )}
            </select>
          </div>
          <div style={styles.filterItem}>
            <select
              value={filterBlock}
              onChange={(e) => setFilterBlock(e.target.value)}
              style={styles.select}
              disabled={!filterDistrict}
              aria-label="Filter by block"
            >
              <option value="">All Blocks</option>
              {filterBlocks.map((b, i) => (
                <option key={`block-${i}`} value={b.block}>
                  {b.block}
                </option>
              ))}
            </select>
          </div>
          <div style={styles.filterItem}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={styles.select}
              aria-label="Filter by status"
            >
              <option value="all">All Status</option>
              <option value="added">Added</option>
              <option value="previously added">Previously Added</option>
              <option value="not added">Not Added</option>
            </select>
          </div>
          {/* <button
            style={{
              ...styles.button,
              ...styles.secondaryButton,
              padding: "8px 12px",
            }}
            onClick={handleResetFilters}
          >
            Reset
          </button> */}
          <svg
            style={styles.refreshIcon}
            viewBox="0 0 20 20"
            fill="currentColor"
            onClick={() => fetchAllData()}
          >
            <path
              fillRule="evenodd"
              d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>

      <div style={styles.dataCountContainer}>
        Total Records: {filteredData.length}
      </div>

      <div style={styles.tableContainer}>
        {isLoading ? (
          <div style={styles.loadingContainer}>
            <div style={styles.spinner}></div>
            <p>Loading data...</p>
          </div>
        ) : filteredData.length > 0 ? (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead style={styles.tableHeader}>
                <tr>
                  <th style={styles.th}>Sl. No.</th>
                  <th style={styles.th}>Mobile no. added</th>
                  <th style={styles.th}>District</th>
                  <th style={styles.th}>Block</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Group</th>
                  <th style={styles.th}>Reason for not added in group</th>
                </tr>
              </thead>
              <tbody style={styles.tableBody}>
                {filteredData.map((item, index) => (
                  <tr key={index} style={styles.tr}>
                    <td style={styles.td}>{index + 1}</td>
                    <td style={styles.td}>{item.child_number}</td>
                    <td style={styles.td}>{item.district}</td>
                    <td style={styles.td}>{item.block}</td>
                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.statusBadge,
                          backgroundColor:
                            item.child_status === "added"
                              ? "#d1fae5"
                              : item.child_status === "previously added"
                              ? "#e0e7ff"
                              : "#fee2e2",
                          color:
                            item.child_status === "added"
                              ? "#065f46"
                              : item.child_status === "previously added"
                              ? "#3730a3"
                              : "#b91c1c",
                        }}
                      >
                        {item.child_status}
                      </span>
                    </td>
                    <td style={styles.td}>{item.groupname}</td>
                    <td style={styles.td}>{item.child_remark}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={styles.noDataContainer}>
            <p>No data available</p>
          </div>
        )}
      </div>

      {showAddModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3 style={styles.modalHeader}>Add Mobile Number</h3>
            <p style={styles.modalSubHeader}>
              Select district and block to add a number
            </p>

            <div style={styles.filtersContainer}>
              <div style={styles.filterItem}>
                <label style={styles.inputLabel}>District</label>
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
                <label style={styles.inputLabel}>Block</label>
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
                  disabled={!selectedDistrict || !selectedBlock}
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
                  setSelectedDistrict("");
                  setSelectedBlock("");
                  setNumberInput("");
                }}
              >
                Cancel
              </button>
              <button
                style={{
                  ...styles.button,
                  ...styles.primaryButton,
                  opacity:
                    !validationError &&
                    numberInput &&
                    selectedDistrict &&
                    selectedBlock
                      ? 1
                      : 0.7,
                  cursor:
                    !validationError &&
                    numberInput &&
                    selectedDistrict &&
                    selectedBlock
                      ? "pointer"
                      : "not-allowed",
                }}
                onClick={handleAddNumber}
                disabled={
                  !!validationError ||
                  !numberInput ||
                  !selectedDistrict ||
                  !selectedBlock
                }
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
    maxWidth: "1200px",
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
  controlsContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
    flexWrap: "wrap",
    gap: "16px",
  },
  leftControls: {
    display: "flex",
    gap: "16px",
    alignItems: "right",
  },
  rightControls: {
    display: "flex",
    gap: "16px",
    alignItems: "center",
  },
  refreshInfo: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
    color: "#6b7280",
  },
  refreshIcon: {
    width: "16px",
    height: "16px",
    color: "#6b7280",
  },
  dataCountContainer: {
    backgroundColor: "#f3f4f6",
    padding: "8px 16px",
    borderRadius: "6px",
    marginBottom: "16px",
    fontSize: "14px",
    fontWeight: "500",
    color: "#374151",
  },
  tableContainer: {
    backgroundColor: "#fff",
    borderRadius: "8px",
    overflow: "hidden",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  tableWrapper: {
    maxHeight: "500px",
    overflowY: "auto",
    position: "relative",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "14px",
  },
  tableHeader: {
    position: "sticky",
    top: 0,
    zIndex: 10,
  },
  tableBody: {
    overflowY: "auto",
  },
  th: {
    padding: "12px 16px",
    textAlign: "left",
    backgroundColor: "#f3f4f6",
    color: "#374151",
    fontWeight: "600",
    borderBottom: "1px solid #e5e7eb",
    position: "sticky",
    top: 0,
  },
  tr: {
    borderBottom: "1px solid #e5e7eb",
    "&:hover": {
      backgroundColor: "#f9fafb",
    },
  },
  td: {
    padding: "12px 16px",
    color: "#374151",
    verticalAlign: "middle",
  },
  statusBadge: {
    padding: "4px 8px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "500",
    display: "inline-block",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px",
    gap: "16px",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "4px solid #f3f4f6",
    borderTop: "4px solid #4f46e5",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  noDataContainer: {
    padding: "40px",
    textAlign: "center",
    color: "#6b7280",
  },
  filtersContainer: {
    display: "flex",
    gap: "20px",
    marginBottom: "24px",
    flexWrap: "wrap",
  },
  filterItem: {
    display: "flex",
    flexDirection: "column",
    flex: "1 1 200px",
  },
  inputLabel: {
    display: "block",
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
