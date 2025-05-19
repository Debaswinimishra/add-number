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

  console.log("status filter------------->", statusFilter);
  console.log("filteredValues-=---------->", filteredValues);

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Number Addition Status</h1>
      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <button
          style={{
            padding: "8px 16px",
            border: "none",
            // backgroundColor: "#007bff",
            color: "black",
            borderRadius: "5px",
            cursor: "pointer",
          }}
          onClick={() => window.location.reload()}
        >
          Refresh 🔄
        </button>
      </div>

      <div style={styles.topButtons}>
        <button style={styles.button} onClick={handleSyncClick}>
          Sync
        </button>
        <button style={styles.button} onClick={handleAddClick}>
          Add Number
        </button>
      </div>

      {loadingData ? (
        <p style={styles.loading}>Loading data...</p>
      ) : error ? (
        <p style={styles.error}>{error}</p>
      ) : (
        <>
          <div style={{ display: "flex" }}>
            <div style={styles.filterBar}>
              <label>
                <b>Select VM:</b>
                <select style={{ padding: "8px", borderRadius: "5px" }}>
                  {vmOptions.map((vm, index) => (
                    <option key={index} value={vm.value}>
                      {vm.text}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div style={styles.filterBar}>
              <label>
                <b>Status:</b>
                <select
                  style={styles.select}
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
              </label>
            </div>
          </div>
          <p style={styles.infoText}>Total Records: {filteredData.length}</p>

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
            <span>
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
        </>
      )}

      {/* Sync Modal */}
      {showSyncModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3>Enter Password</h3>
            <input
              type="password"
              style={styles.input}
              placeholder="Enter password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
            />
            {passwordError && (
              <p style={{ color: "red", marginTop: "-10px" }}>
                {passwordError}
              </p>
            )}
            <div>
              <button style={styles.modalButton} onClick={handlePasswordSubmit}>
                Submit
              </button>
              <button
                style={{ ...styles.modalButton, ...styles.cancelButton }}
                onClick={() => setShowSyncModal(false)}
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
            <h3>Enter Recovery Phone Number</h3>
            <div style={{ display: "flex", alignItems: "center" }}>
              <input
                type="text"
                style={styles.input}
                placeholder="+91XXXXXXXXXX"
                value={`+91${phoneNumber}`}
                onChange={(e) => {
                  const input = e.target.value.replace(/\D/g, "");
                  const numberOnly = input.startsWith("91")
                    ? input.slice(2)
                    : input;
                  if (numberOnly.length <= 10) setPhoneNumber(numberOnly);
                }}
              />
            </div>
            <div>
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
    fontFamily: "Segoe UI, sans-serif",
    padding: "30px",
    backgroundColor: "#f9f9f9",
    minHeight: "100vh",
  },
  header: {
    textAlign: "center",
    marginBottom: "20px",
    color: "#333",
  },
  filterBar: {
    textAlign: "left",
    marginBottom: "20px",
  },
  select: {
    padding: "8px",
    fontSize: "16px",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    backgroundColor: "#fff",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  th: {
    padding: "12px",
    backgroundColor: "#007BFF",
    color: "#fff",
    border: "1px solid #ddd",
    textAlign: "left",
  },
  td: {
    padding: "12px",
    border: "1px solid #ddd",
    color: "#333",
  },
  statusAdded: {
    color: "green",
    fontWeight: "bold",
  },
  statusNotAdded: {
    color: "red",
    fontWeight: "bold",
  },
  statusPending: {
    color: "blue",
    fontWeight: "bold",
  },
  error: {
    color: "red",
    textAlign: "center",
    fontSize: "18px",
  },
  infoText: {
    textAlign: "center",
    marginBottom: "10px",
    fontWeight: "500",
  },
  stripedRow: {
    backgroundColor: "#f2f2f2",
  },
  pagination: {
    marginTop: "20px",
    textAlign: "center",
  },
  button: {
    margin: "0 5px",
    padding: "8px 16px",
    border: "none",
    backgroundColor: "#007bff",
    color: "white",
    borderRadius: "5px",
    cursor: "pointer",
  },
  disabledButton: {
    backgroundColor: "#aaa",
    cursor: "not-allowed",
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
  },
  modal: {
    backgroundColor: "#fff",
    padding: "30px",
    borderRadius: "10px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
    minWidth: "300px",
    maxWidth: "90%",
  },
  input: {
    width: "100%",
    padding: "10px",
    marginTop: "10px",
    marginBottom: "20px",
    fontSize: "16px",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },
  modalButton: {
    margin: "0 5px",
    padding: "8px 16px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    backgroundColor: "#007bff",
    color: "white",
  },
  cancelButton: {
    backgroundColor: "#aaa",
    color: "#fff",
    marginLeft: "10px",
  },
  topButtons: {
    marginBottom: "20px",
    display: "flex",
    gap: "10px",
  },
  loading: {
    fontSize: "16px",
    textAlign: "center",
    color: "#333",
    padding: "20px",
  },
};
