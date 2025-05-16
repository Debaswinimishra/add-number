import React, { useEffect, useState } from "react";

const App = () => {
  const [data, setData] = useState([]);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");

  const recordsPerPage = 10;

  useEffect(() => {
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
      });
  }, []);

  // Filtered data based on status
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
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Number Addition Status</h1>
      {error ? (
        <p style={styles.error}>{error}</p>
      ) : (
        <>
          <div style={styles.filterBar}>
            <label>
              <b>Filter by Status:</b>
              <select
                style={styles.select}
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1); // Reset to first page on filter change
                }}
              >
                <option value="all">All</option>
                <option value="added">Added</option>
                <option value="not_added">Not Added</option>
              </select>
            </label>
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
              {currentData.map((item, index) => (
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
                        : styles.statusNotAdded),
                    }}
                  >
                    {item.child_status}
                  </td>
                  <td style={styles.td}>{item.child_remark}</td>
                  <td style={styles.td}>{item.parent_isadmin ? "✅" : "❌"}</td>
                  <td style={styles.td}>
                    {new Date(item.child_addedon).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
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
    </div>
  );
};

export default App;
