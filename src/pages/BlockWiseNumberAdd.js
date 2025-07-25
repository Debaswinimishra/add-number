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
  const [searchQuery, setSearchQuery] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const fetchAllData = () => {
    setIsLoading(true);
    setErrorMessage("");
    const params = {
      district: filterDistrict.toLowerCase(),
      block: filterBlock.toLowerCase(),
    };

    get_status(params)
      .then((res) => {
        if (res?.data?.data) {
          setTableData(res.data.data);
        } else {
          setErrorMessage("No data available for the selected filters");
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setErrorMessage("Failed to fetch data. Please try again.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchAllData();
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
        setSuccessMessage(
          `✅ +91${numberInput} added successfully to ${selectedDistrict} / ${selectedBlock}`
        );
        setTimeout(() => setSuccessMessage(""), 5000);
      } else {
        setErrorMessage(`Failed to add number. ${res?.message || ""}`);
        setTimeout(() => setErrorMessage(""), 5000);
      }

      setNumberInput("");
      setValidationError("");
      setShowAddModal(false);
      fetchAllData();
    } catch (error) {
      console.error("Error adding number:", error);
      setErrorMessage("An error occurred while adding the number.");
      setTimeout(() => setErrorMessage(""), 5000);
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

  const extractWhatsAppNumber = (id) => {
    if (!id) return "";
    return id.includes("@") ? id.split("@")[0] : id;
  };

  const convertToCSV = (data) => {
    const headers = [
      "Sl. No.",
      "Mobile no. added",
      "District",
      "Block",
      "Status",
      "Group",
      "Group admin no.",
      "Reason for not added in group",
    ];

    const rows = data.map((item, index) => [
      index + 1,
      item.child_number,
      item.district,
      item.block,
      item.child_status,
      item.groupname,
      extractWhatsAppNumber(item.parent_userid),
      item.child_remark || "",
    ]);

    return [headers, ...rows]
      .map((row) =>
        row
          .map((item) =>
            typeof item === "string" ? `"${item.replace(/"/g, '""')}"` : item
          )
          .join(",")
      )
      .join("\n");
  };

  const downloadCSV = (data) => {
    const csvContent = convertToCSV(data);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `blockwise_data_${new Date().toISOString().slice(0, 10)}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredData = tableData.filter((item) => {
    const statusMatch =
      statusFilter === "all" || item.child_status === statusFilter;
    const districtMatch =
      !filterDistrict ||
      item.district.toLowerCase() === filterDistrict.toLowerCase();
    const blockMatch =
      !filterBlock || item.block.toLowerCase() === filterBlock.toLowerCase();
    const searchMatch =
      !searchQuery ||
      item.child_number.includes(searchQuery) ||
      item.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.block.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.groupname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.parent_userid?.toLowerCase().includes(searchQuery.toLowerCase());

    return statusMatch && districtMatch && blockMatch && searchMatch;
  });

  const statusCounts = tableData.reduce(
    (acc, item) => {
      acc[item.child_status] = (acc[item.child_status] || 0) + 1;
      acc.total++;
      return acc;
    },
    { total: 0 }
  );

  return (
    <div style={styles.container}>
      {/* Notification messages */}
      {successMessage && (
        <div style={styles.successNotification}>
          <svg
            style={styles.notificationIcon}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div style={styles.errorNotification}>
          <svg
            style={styles.notificationIcon}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          {errorMessage}
        </div>
      )}

      <div style={styles.headerContainer}>
        {/* <button
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
        </button> */}
        <div>
          <h1 style={styles.header}>Block-wise Mobile Number Management</h1>
          <p style={styles.subHeader}>
            Add and manage mobile numbers for specific blocks
          </p>
        </div>
      </div>

      <div style={styles.controlsContainer}>
        <div style={styles.leftControls}>
          <button
            style={{
              ...styles.primaryButton,
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 16px",
              borderRadius: "6px",
              backgroundColor: "#4f46e5",
              color: "white",
              border: "none",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
              transition: "background-color 0.2s",
              ":hover": {
                backgroundColor: "#4338ca",
              },
            }}
            onClick={() => setShowAddModal(true)}
            aria-label="Add mobile number"
          >
            <svg
              style={{
                width: "16px",
                height: "16px",
              }}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            Add Number
          </button>

          <div
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              marginLeft: "12px",
            }}
          >
            <svg
              style={{
                position: "absolute",
                left: "12px",
                width: "16px",
                height: "16px",
                color: "#9ca3af",
              }}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              />
            </svg>
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: "8px 12px 8px 36px",
                borderRadius: "6px",
                border: "1px solid #d1d5db",
                fontSize: "14px",
                width: "200px",
                ":focus": {
                  outline: "none",
                  borderColor: "#4f46e5",
                  boxShadow: "0 0 0 3px rgba(79, 70, 229, 0.1)",
                },
              }}
            />
          </div>
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
              <option value="added">Added ({statusCounts.added || 0})</option>
              <option value="previously added">
                Previously Added ({statusCounts["previously added"] || 0})
              </option>
              <option value="not added">
                Not Added ({statusCounts["not added"] || 0})
              </option>
            </select>
          </div>
          <button
            style={styles.iconButton}
            onClick={() => fetchAllData()}
            aria-label="Refresh data"
          >
            <svg
              style={styles.refreshIcon}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          <button
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 16px",
              borderRadius: "6px",
              backgroundColor: filteredData.length > 0 ? "#f3f4f6" : "#f9fafb",
              color: filteredData.length > 0 ? "#1f2937" : "#9ca3af",
              border: "1px solid #e5e7eb",
              cursor: filteredData.length > 0 ? "pointer" : "not-allowed",
              fontSize: "14px",
              fontWeight: "500",
              transition: "all 0.2s ease",
              ":hover": {
                backgroundColor:
                  filteredData.length > 0 ? "#e5e7eb" : "#f9fafb",
                borderColor: filteredData.length > 0 ? "#d1d5db" : "#e5e7eb",
              },
              ":focus": {
                outline: "none",
                boxShadow:
                  filteredData.length > 0
                    ? "0 0 0 3px rgba(209, 213, 219, 0.5)"
                    : "none",
              },
            }}
            onClick={() => filteredData.length > 0 && downloadCSV(filteredData)}
            disabled={filteredData.length === 0}
            aria-disabled={filteredData.length === 0}
            aria-label={
              filteredData.length > 0
                ? "Export data as CSV"
                : "No data available to export"
            }
          >
            Download
          </button>
        </div>
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
                  <th style={styles.th}>#</th>
                  <th style={styles.th}>Mobile Number</th>
                  <th style={styles.th}>District</th>
                  <th style={styles.th}>Block</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Group</th>
                  <th style={styles.th}>Admin Number</th>
                  <th style={styles.th}>Remarks</th>
                </tr>
              </thead>
              <tbody style={styles.tableBody}>
                {filteredData.map((item, index) => (
                  <tr key={index} style={styles.tr}>
                    <td style={styles.td}>{index + 1}</td>
                    <td style={styles.td}>
                      <span style={styles.mobileNumber}>
                        +{item.child_number}
                      </span>
                    </td>
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
                    <td style={styles.td}>
                      {item.groupname || <span style={styles.naText}>N/A</span>}
                    </td>
                    <td style={styles.td}>
                      {item.parent_userid ? (
                        <a
                          href={`https://wa.me/${extractWhatsAppNumber(
                            item.parent_userid
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={styles.whatsappLink}
                        >
                          {extractWhatsAppNumber(item.parent_userid)}
                        </a>
                      ) : (
                        <span style={styles.naText}>N/A</span>
                      )}
                    </td>
                    <td style={styles.td}>
                      {item.child_remark || (
                        <span style={styles.naText}>-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={styles.noDataContainer}>
            <svg
              style={styles.noDataIcon}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-7.536 5.879a1 1 0 001.415 0 3 3 0 014.242 0 1 1 0 001.415-1.415 5 5 0 00-7.072 0 1 1 0 000 1.415z"
                clipRule="evenodd"
              />
            </svg>
            <p style={styles.noDataText}>
              {searchQuery
                ? "No matching records found"
                : "No data available for the selected filters"}
            </p>
            {searchQuery && (
              <button
                style={styles.clearSearchButton}
                onClick={() => setSearchQuery("")}
              >
                Clear search
              </button>
            )}
          </div>
        )}
      </div>

      {showAddModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeaderContainer}>
              <h3 style={styles.modalHeader}>Add Mobile Number </h3>
              <p style={styles.modalSubHeader}>
                Select district and block to add a number
              </p>
            </div>

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
                style={styles.secondaryButton}
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
                Add Number
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
    maxWidth: "1400px",
    margin: "0 auto",
    backgroundColor: "#f9fafb",
    minHeight: "100vh",
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
    marginTop: "8px",
    "&:hover": {
      backgroundColor: "#f3f4f6",
    },
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
    marginBottom: "24px",
    flexWrap: "wrap",
    gap: "16px",
  },
  leftControls: {
    display: "flex",
    gap: "16px",
    alignItems: "center",
  },
  rightControls: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
    flexWrap: "wrap",
  },
  searchContainer: {
    position: "relative",
    minWidth: "290px",
  },
  searchIcon: {
    position: "absolute",
    left: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    width: "16px",
    height: "16px",
    color: "#9ca3af",
  },
  searchInput: {
    padding: "10px 12px 10px 70px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    backgroundColor: "#fff",
    fontSize: "14px",
    color: "#111827",
    transition: "border-color 0.2s",
    outline: "none",
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
    width: "100%",
    "&:focus": {
      borderColor: "#4f46e5",
      boxShadow: "0 0 0 3px rgba(79, 70, 229, 0.1)",
    },
  },
  statsContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: "16px",
    marginBottom: "24px",
  },
  statCard: {
    backgroundColor: "#fff",
    borderRadius: "8px",
    padding: "16px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    textAlign: "center",
  },
  statValue: {
    fontSize: "24px",
    fontWeight: "600",
    color: "#111827",
    marginBottom: "4px",
  },
  statLabel: {
    fontSize: "14px",
    color: "#6b7280",
  },
  filterItem: {
    display: "flex",
    flexDirection: "column",
    minWidth: "160px",
  },
  inputLabel: {
    display: "block",
    fontSize: "14px",
    fontWeight: "500",
    color: "#374151",
    marginBottom: "8px",
  },
  select: {
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    backgroundColor: "#fff",
    fontSize: "14px",
    color: "#111827",
    transition: "border-color 0.2s",
    outline: "none",
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
    "&:focus": {
      borderColor: "#4f46e5",
      boxShadow: "0 0 0 3px rgba(79, 70, 229, 0.1)",
    },
    "&:disabled": {
      backgroundColor: "#f3f4f6",
      cursor: "not-allowed",
    },
  },
  button: {
    padding: "10px 16px",
    borderRadius: "8px",
    border: "none",
    fontWeight: "500",
    fontSize: "14px",
    cursor: "pointer",
    transition: "all 0.2s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
  primaryButton: {
    // backgroundColor: "#4f46e5",
    color: "#fff",
    "&:hover": {
      backgroundColor: "#4338ca",
    },
  },
  secondaryButton: {
    backgroundColor: "#fff",
    color: "#374151",
    border: "1px solid #d1d5db",
    "&:hover": {
      backgroundColor: "#f9fafb",
    },
  },
  iconButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "8px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#6b7280",
    transition: "all 0.2s",
    "&:hover": {
      backgroundColor: "#f3f4f6",
      color: "#4f46e5",
    },
  },
  buttonIcon: {
    width: "16px",
    height: "16px",
  },
  refreshIcon: {
    width: "20px",
    height: "20px",
  },
  tableContainer: {
    backgroundColor: "#fff",
    borderRadius: "8px",
    overflow: "hidden",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    minHeight: "300px",
  },
  tableWrapper: {
    overflowX: "auto",
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
  mobileNumber: {
    fontWeight: "500",
    color: "#1e40af",
  },
  whatsappLink: {
    color: "#1e40af",
    textDecoration: "none",
    "&:hover": {
      textDecoration: "underline",
    },
  },
  naText: {
    color: "#9ca3af",
    fontStyle: "italic",
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
  },
  noDataIcon: {
    width: "48px",
    height: "48px",
    color: "#9ca3af",
    marginBottom: "16px",
  },
  noDataText: {
    color: "#6b7280",
    fontSize: "16px",
    marginBottom: "16px",
  },
  clearSearchButton: {
    padding: "8px 16px",
    borderRadius: "6px",
    backgroundColor: "#f3f4f6",
    border: "none",
    color: "#374151",
    cursor: "pointer",
    fontSize: "14px",
    "&:hover": {
      backgroundColor: "#e5e7eb",
    },
  },
  filtersContainer: {
    display: "flex",
    gap: "20px",
    marginBottom: "24px",
    flexWrap: "wrap",
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
    padding: "10px 12px",
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
    padding: "10px 12px",
    border: "1px solid #d1d5db",
    borderTopRightRadius: "8px",
    borderBottomRightRadius: "8px",
    outline: "none",
    fontSize: "14px",
    color: "#111827",
    transition: "border-color 0.2s",
    "&:focus": {
      borderColor: "#4f46e5",
      boxShadow: "0 0 0 3px rgba(79, 70, 229, 0.1)",
    },
    "&:disabled": {
      backgroundColor: "#f3f4f6",
      cursor: "not-allowed",
    },
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
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 50,
  },
  modal: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "24px",
    width: "100%",
    maxWidth: "500px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
    maxHeight: "90vh",
    overflowY: "auto",
  },
  modalHeaderContainer: {
    marginBottom: "24px",
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
  },
  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    marginTop: "24px",
  },
  successNotification: {
    position: "fixed",
    top: "20px",
    right: "20px",
    backgroundColor: "#ecfdf5",
    color: "#065f46",
    padding: "12px 16px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
    zIndex: 100,
    animation: "slideIn 0.3s ease-out",
  },
  errorNotification: {
    position: "fixed",
    top: "20px",
    right: "20px",
    backgroundColor: "#fef2f2",
    color: "#b91c1c",
    padding: "12px 16px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
    zIndex: 100,
    animation: "slideIn 0.3s ease-out",
  },
  notificationIcon: {
    width: "20px",
    height: "20px",
  },
  "@keyframes spin": {
    "0%": { transform: "rotate(0deg)" },
    "100%": { transform: "rotate(360deg)" },
  },
  "@keyframes slideIn": {
    "0%": { transform: "translateY(-100%)", opacity: 0 },
    "100%": { transform: "translateY(0)", opacity: 1 },
  },
};
