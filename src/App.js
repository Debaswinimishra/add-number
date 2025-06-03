import React, { useEffect, useState } from "react";

const App = () => {
  const [data, setData] = useState([]);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");

  const [showSyncModal, setShowSyncModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = React.useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const recordsPerPage = 10;

  useEffect(() => {
    setLoadingData(true);
    fetch("http://localhost:4000/api/getnumberadditionstatus")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch data");
        }
        return res.json();
      })
      .then((response) => {
        if (response.status === "success") {
          setData(response.data);
        } else {
          setError("API returned failure");
        }
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoadingData(false);
      });
  }, []);

  const filteredData =
    statusFilter === "all"
      ? data
      : data.filter((item) =>
          statusFilter === "added"
            ? item.child_status === "added"
            : item.child_status !== "added"
        );

  const totalPages = Math.ceil(filteredData.length / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const currentData = filteredData.slice(
    startIndex,
    startIndex + recordsPerPage
  );

  const handleSyncClick = () => {
    setShowSyncModal(true);
    setPasswordInput("");
    setPasswordError("");
  };

  const handleAddClick = () => {
    setShowAddModal(true);
    setPhoneNumber("");
  };

  const handlePasswordSubmit = () => {
    if (passwordInput === "ThinkZone@2025") {
      setLoading(true);
      fetch("http://localhost:4000/api/syncallgroups")
        .then((response) => {
          if (!response.ok) {
            throw new Error("API request failed");
          }
          return response.json();
        })
        .then((data) => {
          alert("Password correct! Sync started.\n" + JSON.stringify(data));
          setShowSyncModal(false);
          setPasswordError("");
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

  const handlePhoneNumberSubmit = () => {
    if (phoneNumber.trim() === "") {
      alert("Please enter a phone number.");
      return;
    }

    const fullNumber = "91" + phoneNumber;
    console.log(
      "JSON.stringify({ number: fullNumber })------------------>",
      JSON.stringify({ number: fullNumber })
    );
    // fetch("http://localhost:4000/api/addnumbertogroups", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify({ number: fullNumber }),
    // })
    //   .then((res) => {
    //     if (!res.ok) throw new Error("Failed to add number");
    //     return res.json();
    //   })
    //   .then((data) => {
    //     alert("Phone number submitted successfully.");
    //     setShowAddModal(false);
    //   })
    //   .catch((err) => {
    //     alert("Error: " + err.message);
    //   });
  };

  const filteredValues = currentData?.filter((item, id) => {
    return item.child_status === statusFilter;
  });

  return (
    <div style={styles.container}>
      <div style={styles.headerContainer}>
        <h1 style={styles.header}>Number Addition Status</h1>
        <div style={styles.headerActions}>
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
            <label style={styles.filterLabel}>Select VM:</label>
            <select style={styles.filterSelect}>
              {vmOptions.map((vm, index) => (
                <option key={index} value={vm.value}>
                  {vm.text}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.filterItem}>
            <label style={styles.filterLabel}>Status:</label>
            <select
              style={styles.filterSelect}
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">All</option>
              <option value="added">Added</option>
              <option value="pending">Pending</option>
              <option value="not added">Not Added</option>
            </select>
          </div>
        </div>
        <div style={styles.topButtons}>
          <button style={styles.primaryButton} onClick={handleSyncClick}>
            Sync Groups
          </button>
          <button style={styles.primaryButton} onClick={handleAddClick}>
            Add Number
          </button>
        </div>
      </div>

      {loadingData ? (
        <div style={styles.loadingContainer}>
          <p style={styles.loadingText}>Loading data...</p>
        </div>
      ) : error ? (
        <div style={styles.errorContainer}>
          <p style={styles.errorText}>{error}</p>
        </div>
      ) : (
        <div style={styles.tableContainer}>
          <div style={styles.tableHeader}>
            <p style={styles.infoText}>Total Records: {filteredData.length}</p>
          </div>

          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Group Name</th>
                <th style={styles.th}>Participant Number</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Remark</th>
                <th style={styles.th}>Group Admin</th>
                <th style={styles.th}>Added On</th>
              </tr>
            </thead>
            <tbody>
              {statusFilter !== "all"
                ? filteredValues.map((item, index) => (
                    <tr
                      key={item._id}
                      style={index % 2 === 0 ? styles.stripedRow : {}}
                    >
                      <td style={styles.td}>{item.groupname}</td>
                      <td style={styles.td}>{item.child_number}</td>
                      <td
                        style={{
                          ...styles.td,
                          ...(item.child_status === "added"
                            ? styles.statusAdded
                            : item.child_status == "pending"
                            ? styles.statusPending
                            : styles.statusNotAdded),
                        }}
                      >
                        {item.child_status}
                      </td>
                      <td style={styles.td}>{item.child_remark}</td>
                      <td style={styles.td}>
                        {item.parent_isadmin ? "✅" : "❌"}
                      </td>
                      <td style={styles.td}>
                        {new Date(item.child_addedon).toLocaleString()}
                      </td>
                    </tr>
                  ))
                : currentData.map((item, index) => (
                    <tr
                      key={item._id}
                      style={index % 2 === 0 ? styles.stripedRow : {}}
                    >
                      <td style={styles.td}>{item.groupname}</td>
                      <td style={styles.td}>{item.child_number}</td>
                      <td
                        style={{
                          ...styles.td,
                          ...(item.child_status === "added"
                            ? styles.statusAdded
                            : item.child_status == "pending"
                            ? styles.statusPending
                            : styles.statusNotAdded),
                        }}
                      >
                        {item.child_status}
                      </td>
                      <td style={styles.td}>{item.child_remark}</td>
                      <td style={styles.td}>
                        {item.parent_isadmin ? "✅" : "❌"}
                      </td>
                      <td style={styles.td}>
                        {new Date(item.child_addedon).toLocaleString()}
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>

          <div style={styles.pagination}>
            <button
              style={{
                ...styles.button,
                ...(currentPage === 1 ? styles.disabledButton : {}),
              }}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span style={styles.pageInfo}>
              Page {currentPage} of {totalPages}
            </span>
            <button
              style={{
                ...styles.button,
                ...(currentPage === totalPages ? styles.disabledButton : {}),
              }}
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      )}

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

      {/* Add Number Modal */}
      {showAddModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3 style={styles.modalTitle}>Enter Recovery Phone Number</h3>
            <div style={{ position: "relative" }}>
              <div style={styles.phonePrefix}>+91</div>
              <input
                type="text"
                style={{ ...styles.input, paddingLeft: "50px" }}
                placeholder="XXXXXXXXXX"
                value={phoneNumber}
                onChange={(e) => {
                  const input = e.target.value.replace(/\D/g, "");
                  if (input.length <= 10) setPhoneNumber(input);
                }}
              />
            </div>
            <div style={styles.modalButtons}>
              <button
                style={styles.modalButton}
                onClick={handlePhoneNumberSubmit}
                disabled={phoneNumber.length !== 10}
              >
                Submit
              </button>
              <button
                style={{ ...styles.modalButton, ...styles.cancelButton }}
                onClick={() => setShowAddModal(false)}
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

const vmOptions = [
  { value: "vm1", text: "vm1" },
  { value: "vm2", text: "vm2" },
  { value: "vm3", text: "vm3" },
  { value: "vm4", text: "vm4" },
  { value: "vm5", text: "vm5" },
  { value: "vm6", text: "vm6" },
  { value: "vm7", text: "vm7" },
  { value: "vm8", text: "vm8" },
  { value: "vm9", text: "vm9" },
  { value: "vm10", text: "vm10" },
  { value: "vm11", text: "vm11" },
  { value: "vm12", text: "vm12" },
  { value: "vm13", text: "vm13" },
  { value: "vm14", text: "vm14" },
  { value: "vm15", text: "vm15" },
  { value: "vm16", text: "vm16" },
  { value: "vm17", text: "vm17" },
  { value: "vm18", text: "vm18" },
  { value: "vm19", text: "vm19" },
  { value: "vm20", text: "vm20" },
  { value: "vm21", text: "vm21" },
  { value: "vm22", text: "vm22" },
  { value: "vm23", text: "vm23" },
  { value: "vm24", text: "vm24" },
  { value: "vm25", text: "vm25" },
  { value: "vm26", text: "vm26" },
  { value: "vm27", text: "vm27" },
  { value: "vm28", text: "vm28" },
  { value: "vm29", text: "vm29" },
  { value: "vm30", text: "vm30" },
];

const styles = {
  container: {
    fontFamily: "'Segoe UI', 'Roboto', sans-serif",
    padding: "20px",
    backgroundColor: "#f5f7fa",
    minHeight: "100vh",
    maxWidth: "1400px",
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
    transition: "all 0.2s ease",
    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
    ":hover": {
      backgroundColor: "#edf2f7",
    },
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
    marginBottom: "20px",
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
    transition: "all 0.2s ease",
    boxShadow: "0 2px 4px rgba(76, 110, 245, 0.3)",
    ":hover": {
      backgroundColor: "#3b5bdb",
      transform: "translateY(-1px)",
    },
  },
  filtersContainer: {
    display: "flex",
    gap: "20px",
    flexWrap: "wrap",
    marginBottom: "20px",
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
    ":focus": {
      outline: "none",
      borderColor: "#4c6ef5",
      boxShadow: "0 0 0 3px rgba(76, 110, 245, 0.1)",
    },
  },
  tableContainer: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
  },
  tableHeader: {
    padding: "16px 20px",
    backgroundColor: "#f8fafc",
    borderBottom: "1px solid #e2e8f0",
  },
  infoText: {
    fontWeight: "500",
    color: "#4a5568",
    margin: "0",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "14px",
  },
  th: {
    padding: "14px 16px",
    backgroundColor: "#f1f5f9",
    color: "#334155",
    fontWeight: "600",
    textAlign: "left",
    borderBottom: "1px solid #e2e8f0",
  },
  td: {
    padding: "12px 16px",
    color: "#475569",
    borderBottom: "1px solid #e2e8f0",
  },
  stripedRow: {
    backgroundColor: "#f8fafc",
  },
  statusAdded: {
    color: "#16a34a",
    fontWeight: "600",
  },
  statusPending: {
    color: "#2563eb",
    fontWeight: "600",
  },
  statusNotAdded: {
    color: "#dc2626",
    fontWeight: "600",
  },
  pagination: {
    padding: "16px 20px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "16px",
    backgroundColor: "#f8fafc",
    borderTop: "1px solid #e2e8f0",
  },
  button: {
    padding: "8px 16px",
    border: "none",
    backgroundColor: "#4c6ef5",
    color: "white",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "500",
    minWidth: "90px",
  },
  disabledButton: {
    backgroundColor: "#cbd5e1",
    cursor: "not-allowed",
  },
  pageInfo: {
    color: "#475569",
    fontWeight: "500",
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "200px",
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
  },
  loadingText: {
    color: "#64748b",
    fontSize: "16px",
  },
  errorContainer: {
    padding: "24px",
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    textAlign: "center",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
  },
  errorText: {
    color: "#dc2626",
    fontSize: "16px",
    fontWeight: "500",
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
    ":focus": {
      outline: "none",
      borderColor: "#4c6ef5",
      boxShadow: "0 0 0 3px rgba(76, 110, 245, 0.1)",
    },
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
    transition: "background-color 0.2s ease",
    ":hover": {
      backgroundColor: "#3b5bdb",
    },
  },
  cancelButton: {
    backgroundColor: "#94a3b8",
    ":hover": {
      backgroundColor: "#64748b",
    },
  },
  passwordError: {
    color: "#dc2626",
    marginTop: "-15px",
    marginBottom: "15px",
    fontSize: "14px",
  },
  phonePrefix: {
    position: "absolute",
    left: "12px",
    top: "12px",
    color: "#64748b",
    fontWeight: "500",
  },
};
