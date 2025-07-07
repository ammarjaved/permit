import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

function Table({ setxy,onRowClick }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(5);
  const [filterValues, setFilterValues] = useState({});
  const [filteredData, setFilteredData] = useState([]);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  // Subscribe to a custom event for new records
  useEffect(() => {
    fetchData();

    // Create event listeners for record updates
    window.addEventListener('newRecordAdded', handleNewRecord);
    window.addEventListener('recordUpdated', handleRecordUpdate);
    
    return () => {
      // Clean up event listeners
      window.removeEventListener('newRecordAdded', handleNewRecord);
      window.removeEventListener('recordUpdated', handleRecordUpdate);
    };
  }, []);


    const calculateCentroidFromWKT = (wktString) => {
    if (!wktString || wktString.trim() === '') return null;
    
    try {
      if (wktString.startsWith('POLYGON')) {
        const coordsString = wktString
          .replace("POLYGON((", "")
          .replace("))", "");
        
        const latLngs = coordsString.split(",").map((coord) => {
          const [lng, lat] = coord.trim().split(" ").map(Number);
          return { lat, lng };
        });
        
        if (latLngs.length >= 3) {
          const centroid = latLngs.reduce(
            (acc, point) => ({
              lat: acc.lat + point.lat,
              lng: acc.lng + point.lng
            }),
            { lat: 0, lng: 0 }
          );
          
          return {
            lat: centroid.lat / latLngs.length,
            lng: centroid.lng / latLngs.length
          };
        }
      }
    } catch (error) {
      console.error("Error parsing WKT:", error);
    }
    return null;
  };

  // Apply filters when data or filter values change
  useEffect(() => {
    applyFilters();
  }, [data, filterValues]);

  const fetchData = () => {
    setLoading(true);
    // Fetch data from PHP backend
    fetch('http://121.121.232.54:88/permit/fetchData.php')
      .then((response) => response.json())
      .then((fetchedData) => {
        setData(fetchedData);
        setFilteredData(fetchedData);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        setLoading(false);
      });
  };

  // Handler for new record event
  const handleNewRecord = (event) => {
    const newRecord = event.detail;
    setData(prevData => [newRecord, ...prevData]);
  };

  // Handler for updated record event
  const handleRecordUpdate = (event) => {
    const updatedRecord = event.detail;
    setData(prevData => prevData.map(record => 
      record.id === updatedRecord.id ? updatedRecord : record
    ));
  };

  // Apply filters to the data
  const applyFilters = () => {
    let filtered = [...data];
    
    // Apply each filter if it has a value
    Object.entries(filterValues).forEach(([key, value]) => {
      if (value && value.trim() !== '') {
        filtered = filtered.filter(record => 
          record[key] && 
          record[key].toString().toLowerCase().includes(value.toLowerCase())
        );
      }
    });
    
    setFilteredData(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Handle filter input change
  const handleFilterChange = (key, value) => {
    setFilterValues(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilterValues({});
  };

  // Toggle filter panel
  const toggleFilterPanel = () => {
    setIsFilterPanelOpen(!isFilterPanelOpen);
  };

  // Column definitions with friendly names
  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'type', label: 'Type' },
    { key: 'ba', label: 'BA' },
    { key: 'tahun', label: 'Year' },
    // { key: 'sn', label: 'Serial No.' },
    // { key: 'tarikh_csp', label: 'CSP Date' },
    // { key: 'jenis_kerja', label: 'Work Type' },
    { key: 'nama_jalan', label: 'Street Name' },
    // { key: 'tarikh_lulus_opa_tnb', label: 'TNB OPA Approval' },
    // { key: 'tarikh_fail_mo', label: 'MO File Date' },
    // { key: 'pic_dbkl', label: 'DBKL PIC' },
    // { key: 'file_no', label: 'File No.' },
    // { key: 'pbt', label: 'PBT' },
    // { key: 'jenis_bayaran', label: 'Payment Type' },
    { key: 'rm', label: 'Amount (RM)' },
    { key: 'status_permit', label: 'Permit Status' },
    { key: 'tarikh_permit', label: 'Permit Date' },
    // { key: 'tarikh_tamat_kerja', label: 'Work End Date' },
    // { key: 'tarikh_hantar_cbr_test', label: 'CBR Test Submission' },
    // { key: 'tarikh_siap_milling', label: 'Milling Completion' },
    // { key: 'tarikh_hantar_report', label: 'Report Submission' },
    // { key: 'status_permit_teikini', label: 'Current Permit Status' },
    // { key: 'catatan', label: 'Notes' }
    {key:'Action',label:'Action'},
    {key:'Zoom',label:'Zoom'}
  ];

  // Specify which columns you want to include in the filter
  const filterableColumns = [
    { key: 'type', label: 'Type' },
    { key: 'ba', label: 'BA' },
    { key: 'tahun', label: 'Year' }, 
    // { key: 'jenis_kerja', label: 'Work Type' },
    { key: 'status_permit', label: 'Permit Status' }
  ];

  // Calculate pagination
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredData.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredData.length / recordsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Previous and next page handlers
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  const calculateCentroid=(wkt) =>{
    let res=calculateCentroidFromWKT(wkt);
    setxy(res);
    // console.log(res);
  };


  const deleteRec = async (id) => {
  // Show confirmation dialog first
  if (!window.confirm("Are you sure you want to delete this record?")) {
    return false;
  }
  try {
    const response = await fetch('http://121.121.232.54:88/permit/delete_permit.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: id })
    });
    
    const result = await response.json();
    
    if (response.ok && result.success) {
      alert('Record deleted successfully!');
      
      // Call parent component function to update the list if needed
      // refreshList(); // uncomment if you have this function
      
      return true;
    } else {
      alert(result.message || 'Failed to delete record');
      return false;
    }
  } catch (error) {
    console.error('Error deleting record:', error);
    alert('Network error occurred while deleting');
    return false;
  }
};


  // Check if any filters are active
  const hasActiveFilters = Object.values(filterValues).some(value => value && value.trim() !== '');

  return (
    <div className="container-fluid mt-2">
      {loading ? (
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <>
          {/* Filter section */}
          <div className="card mb-3">
            <div className="card-header d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center">
                <button 
                  className="btn btn-sm btn-link p-0 me-2" 
                  onClick={toggleFilterPanel}
                  aria-expanded={isFilterPanelOpen}
                  aria-controls="filterPanel"
                >
                  <i className={`bi ${isFilterPanelOpen ? 'bi-chevron-down' : 'bi-chevron-right'}`}></i>
                </button>
                <h5 className="mb-0">
                  Filters {hasActiveFilters && <span className="badge bg-primary ms-2">Active</span>}
                </h5>
              </div>
              <div>
                {hasActiveFilters && (
                  <button 
                    className="btn btn-sm btn-outline-secondary" 
                    onClick={clearFilters}
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
            {isFilterPanelOpen && (
              <div className="card-body" id="filterPanel">
                <div className="row row-cols-1 row-cols-md-3 row-cols-lg-4 g-2">
                  {filterableColumns.map((column) => (
                    <div className="col" key={`filter-${column.key}`}>
                      <div className="form-floating">
                        <input
                          type="text"
                          className="form-control"
                          id={`filter-${column.key}`}
                          placeholder={column.label}
                          value={filterValues[column.key] || ''}
                          onChange={(e) => handleFilterChange(column.key, e.target.value)}
                        />
                        <label htmlFor={`filter-${column.key}`}>{column.label}</label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Pagination controls - top */}
          <div className="d-flex justify-content-between align-items-center mb-2">
            <div>
              Showing {indexOfFirstRecord + 1} to {Math.min(indexOfLastRecord, filteredData.length)} of {filteredData.length} records
            </div>
            <div className="d-flex align-items-center">
              <label className="me-2">Records per page:</label>
              <select 
                className="form-select form-select-sm" 
                value={recordsPerPage}
                onChange={(e) => setRecordsPerPage(Number(e.target.value))}
                style={{ width: 'auto' }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="table-responsive">
            <table className="table table-striped table-hover table-bordered">
              <thead className="table">
                <tr>
                  {columns.map((column) => (
                    <th key={column.key} scope="col">{column.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentRecords.length > 0 ? (
                  currentRecords.map((record) => (
                    <tr 
                      key={record.id} 
                      onClick={() => onRowClick(record)}
                      style={{ cursor: 'pointer' }}
                    >
                      {columns.map((column) => (
                        <td key={`${record.id}-${column.key}`}>
                        {
                          
                         column.key === 'Action' ? (
                         <button type="button" className="btn btn-danger"   onClick={(e) => {
                          e.stopPropagation();
                          deleteRec(record.id);
                        }}>
                          Delete
                        </button>
                        
                        ):column.key === 'Zoom' ? (
                         <button type="button" className="btn btn-warning"   onClick={(e) => {
                          e.stopPropagation();
                          calculateCentroid(record.geom);
                        }}>
                          Zoom
                        </button>
                        
                        ) : (
                          record[column.key]
                        )
                        }
                          
                          
                          </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={columns.length} className="text-center">No records found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination controls - bottom */}
          <nav aria-label="Page navigation">
            <ul className="pagination justify-content-center">
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <button className="page-link" onClick={goToPreviousPage}>Previous</button>
              </li>
              
              {/* Display page numbers with ellipsis for large sets */}
              {Array.from({ length: totalPages }).map((_, index) => {
                const pageNumber = index + 1;
                
                // Show first page, last page, current page, and pages around current
                if (
                  pageNumber === 1 || 
                  pageNumber === totalPages || 
                  (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                ) {
                  return (
                    <li 
                      key={pageNumber} 
                      className={`page-item ${currentPage === pageNumber ? 'active' : ''}`}
                    >
                      <button 
                        className="page-link" 
                        onClick={() => paginate(pageNumber)}
                      >
                        {pageNumber}
                      </button>
                    </li>
                  );
                } 
                // Show ellipsis
                else if (
                  (pageNumber === 2 && currentPage > 3) || 
                  (pageNumber === totalPages - 1 && currentPage < totalPages - 2)
                ) {
                  return <li key={pageNumber} className="page-item disabled"><span className="page-link">...</span></li>;
                }
                
                return null;
              })}
              
              <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                <button className="page-link" onClick={goToNextPage}>Next</button>
              </li>
            </ul>
          </nav>
        </>
      )}
    </div>
  );
}

export default Table;