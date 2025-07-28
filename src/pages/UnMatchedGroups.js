import React, { useState, useEffect } from "react";
import { get_unmatched_groups } from "../services/AppService";
import * as XLSX from "xlsx";

const UnMatchedGroups = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Styles
  const styles = {
    container: {
      padding: "20px",
      maxWidth: "1000px",
      margin: "0 auto",
      fontFamily: "Arial, sans-serif",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "20px",
      flexWrap: "wrap",
      gap: "10px",
    },
    tableTitle: {
      color: "#333",
      margin: 0,
      fontSize: "24px",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      marginBottom: "20px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
    },
    tableHeaderCell: {
      padding: "12px 15px",
      textAlign: "left",
      borderBottom: "2px solid #ddd",
      backgroundColor: "#f8f9fa",
      fontWeight: "600",
      color: "#495057",
      position: "sticky",
      top: 0,
    },
    tableCell: {
      padding: "12px 15px",
      textAlign: "left",
      borderBottom: "1px solid #eee",
    },
    tableRow: {
      "&:hover": {
        backgroundColor: "#f8f9fa",
      },
    },
    loadingContainer: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "200px",
    },
    spinner: {
      border: "4px solid rgba(0, 0, 0, 0.1)",
      borderTop: "4px solid #3498db",
      borderRadius: "50%",
      width: "40px",
      height: "40px",
      animation: "spin 1s linear infinite",
    },
    errorContainer: {
      textAlign: "center",
      padding: "20px",
      color: "#dc3545",
    },
    errorMessage: {
      marginBottom: "15px",
      fontSize: "18px",
    },
    retryButton: {
      padding: "8px 16px",
      backgroundColor: "#dc3545",
      color: "white",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
      fontSize: "16px",
      "&:hover": {
        backgroundColor: "#c82333",
      },
    },
    noDataMessage: {
      textAlign: "center",
      padding: "20px",
      color: "#6c757d",
      fontStyle: "italic",
      fontSize: "16px",
    },
    pagination: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      marginTop: "20px",
      flexWrap: "wrap",
      gap: "5px",
    },
    pageButton: {
      margin: "0 2px",
      padding: "6px 12px",
      border: "1px solid #dee2e6",
      backgroundColor: "white",
      cursor: "pointer",
      borderRadius: "4px",
      fontSize: "14px",
      "&:disabled": {
        opacity: 0.6,
        cursor: "not-allowed",
      },
      "&:hover:not(:disabled)": {
        backgroundColor: "#e9ecef",
      },
    },
    activePage: {
      backgroundColor: "#007bff",
      color: "white",
      borderColor: "#007bff",
    },
    exportButton: {
      padding: "8px 16px",
      backgroundColor: "#28a745",
      color: "white",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
      fontSize: "16px",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      "&:hover": {
        backgroundColor: "#218838",
      },
      "&:disabled": {
        backgroundColor: "#cccccc",
        cursor: "not-allowed",
      },
    },
    buttonContainer: {
      display: "flex",
      gap: "10px",
    },
    pageInfo: {
      margin: "0 15px",
      fontSize: "14px",
      color: "#6c757d",
    },
  };

  // Spinner animation
  const spinnerKeyframes = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;

  useEffect(() => {
    const fetchUnmatchedGroups = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await get_unmatched_groups();
        console.log("API Response:", response); // Log the response for debugging
        
        // Ensure we always set an array, even if response.data is null/undefined
        const data = Array.isArray(response?.data) ? response.data : [];
        setGroups(data);
      } catch (err) {
        setError(err.message || "Failed to fetch unmatched groups");
        console.error("API Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUnmatchedGroups();
  }, []);

  // Pagination logic with array checks
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = Array.isArray(groups) ? groups.slice(indexOfFirstItem, indexOfLastItem) : [];
  const totalPages = Math.ceil(Array.isArray(groups) ? groups.length / itemsPerPage : 0);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Export to Excel function with array check
  const exportToExcel = () => {
    if (!Array.isArray(groups)) return;

    // Prepare data with SL No.
    const dataWithSerial = groups.map((group, index) => ({
      "SL No.": index + 1,
      ID: group.id,
      Name: group.name || "N/A", // Provide default if name is missing
    }));

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(dataWithSerial);

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Unmatched Groups");

    // Export to file
    XLSX.writeFile(wb, "unmatched_groups.xlsx");
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <style>{spinnerKeyframes}</style>
        <div style={styles.spinner}></div>
        <p>Loading unmatched groups...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <p style={styles.errorMessage}>Error: {error}</p>
        <button
          onClick={() => window.location.reload()}
          style={styles.retryButton}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.tableTitle}>Unmatched Groups</h2>
        <div style={styles.buttonContainer}>
          <button
            onClick={exportToExcel}
            style={styles.exportButton}
            disabled={!Array.isArray(groups) || groups.length === 0}
          >
            <span>Export to Excel</span>
          </button>
        </div>
      </div>

      {!Array.isArray(groups) || groups.length === 0 ? (
        <p style={styles.noDataMessage}>No unmatched groups found</p>
      ) : (
        <>
          <div style={{ overflowX: "auto" }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.tableHeaderCell}>SL No.</th>
                  <th style={styles.tableHeaderCell}>ID</th>
                  <th style={styles.tableHeaderCell}>Name</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((group, index) => (
                  <tr key={group.id || index} style={styles.tableRow}>
                    <td style={styles.tableCell}>
                      {indexOfFirstItem + index + 1}
                    </td>
                    <td style={styles.tableCell}>{group.id || "N/A"}</td>
                    <td style={styles.tableCell}>{group.name || "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div style={styles.pagination}>
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                style={styles.pageButton}
              >
                &laquo; Previous
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => paginate(pageNum)}
                    style={{
                      ...styles.pageButton,
                      ...(currentPage === pageNum ? styles.activePage : {}),
                    }}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <span style={styles.pageInfo}>
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                style={styles.pageButton}
              >
                Next &raquo;
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UnMatchedGroups;