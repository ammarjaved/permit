// src/FormComponent.js
import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Table from './table';
import MapComponent from './MapComponent';

function FormComponent({setXY1,fatureRecord}) {
    const [formData, setFormData] = useState({
        type: '',
        ba: '',
        tahun: new Date().getFullYear(),
        sn: '',
        tarikh_csp: '',
        jenis_kerja: '',
        nama_jalan: '',
        tarikh_lulus_opa_tnb: '',
        tarikh_fail_mo: '',
        pic_dbkl: '',
        file_no: '',
        pbt: '',
        jenis_bayaran: '',
        rm: '',
        status_permit: '',
        tarikh_permit: '',
        tarikh_tamat_kerja: '',
        tarikh_hantar_cbr_test: '',
        tarikh_siap_milling: '',
        tarikh_hantar_report: '',
        status_permit_teikini: '',
        geom:'',
        catatan: ''
      });
    
      const [isFormOpen, setIsFormOpen] = useState(false);
      const [isEditing, setIsEditing] = useState(false);
      const [dataType,setDataType]=useState('');
      const [mapKey, setMapKey] = useState(Date.now());
      const [xy,setxy]=useState({})

    useEffect(() => {
    setXY1(xy);
    }, [xy])
  
    useEffect(()=>{
        if (fatureRecord !== null) {

      handleRowClick(fatureRecord)
        }
    },[fatureRecord])

      const handleGeoJSONUpdate = (geoJSON) => {
        setFormData((prevFormData) => ({
          ...prevFormData,
          geom: geoJSON, // Update the geom field with the new GeoJSON
        }));
      };
    
      const handleChange = (e) => {
        const { name, value } = e.target;
        setDataType(value)
        setFormData(prevState => ({
          ...prevState,
          [name]: value
        }));
      };
    
      const handleSubmit = async (e) => {
        e.preventDefault();
        try {
          const response = await fetch('http://121.121.232.54:88/permit/save_permit.php', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
          });
          
          const result = await response.json();
          
          if (response.ok) {
            alert(result.message);
            
            // Create a complete record with the returned ID
            const updatedRecord = {
              ...formData,
              id: result.id
            };
            
            // Dispatch appropriate event based on operation type
            if (isEditing) {
              window.dispatchEvent(new CustomEvent('recordUpdated', { 
                detail: updatedRecord
              }));
            } else {
              window.dispatchEvent(new CustomEvent('newRecordAdded', { 
                detail: updatedRecord
              }));
            }
            
            resetForm();
            setIsFormOpen(false);
          } else {
            throw new Error(result.error || 'Failed to save permit data');
          }
        } catch (error) {
          console.error('Error saving permit data:', error);
          alert('Error saving permit data. Please try again.');
        }
      };
    
      const resetForm = () => {
        setFormData({
          type: '',
          ba: '',
          tahun: new Date().getFullYear(),
          sn: '',
          tarikh_csp: '',
          jenis_kerja: '',
          nama_jalan: '',
          tarikh_lulus_opa_tnb: '',
          tarikh_fail_mo: '',
          pic_dbkl: '',
          file_no: '',
          pbt: '',
          jenis_bayaran: '',
          rm: '',
          status_permit: '',
          tarikh_permit: '',
          tarikh_tamat_kerja: '',
          tarikh_hantar_cbr_test: '',
          tarikh_siap_milling: '',
          tarikh_hantar_report: '',
          status_permit_teikini: '',
          geom:'',
          catatan: ''
        });
        setMapKey(Date.now());
        setIsEditing(false);
      };
    
      const openNewForm = () => {
        resetForm();
        setIsFormOpen(true);
      };
    
      const handleRowClick = (record) => {
        // First completely reset the form to clear any previous values
        resetForm();
        
        // Create a new object with all form fields explicitly set
        // If record.geom is undefined or null, ensure we use an empty string
        const updatedRecord = {
            ...formData, // Start with the default empty values
            ...record,    // Override with record values
            geom: record.geom || '' // Explicitly handle geom field
        };
        
        setFormData(updatedRecord);
        setMapKey(Date.now());
        setIsEditing(true);
        setIsFormOpen(true);
    };
    
      const closeForm = () => {
        setIsFormOpen(false);
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
      
      // Reset form and close modal only after successful deletion
      resetForm();
      setIsFormOpen(false);
      
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


  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header  text-white d-flex justify-content-between align-items-center" style={{backgroundColor:'#3f51b5' }}>
              <h2 className="mb-0">Permit Records</h2>
              <button 
                className="btn btn-light" 
                onClick={openNewForm}
              >
                Add New Permit
              </button>
            </div>
            </div>
            <div className="card-body">
              <Table setxy={setxy} onRowClick={handleRowClick} />
            </div>
          
        </div>
      </div>

      {/* Sliding Form */}
      <div 
        className="position-fixed top-0 end-0 h-100 bg-white shadow-lg" 
        style={{
          width: '800px',
          transform: isFormOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s ease-in-out',
          zIndex: 1050,
          overflowY: 'auto'
        }}
      >
        <div className="p-3">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3>{isEditing ? 'Edit Permit' : 'New Permit'}</h3>
            <button className="btn btn-sm btn-outline-secondary" onClick={closeForm}>
              &times;
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="row g-2">
              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="form-control"
                      required
                    >
                      <option value="">Select a type</option>
                      <option value="DBKL">DBKL</option>
                      <option value="PBT">PBT</option>
                   </select>
                </div>
              </div>

              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label">BA</label>
                  <select
                    name="ba"
                    value={formData.ba}
                    onChange={handleChange}
                    className="form-control"
                    required
                  >
                    <option value="">Select a BA</option>
                      <option value="6121">6121</option>
                      <option value="6122">6122</option>
                      <option value="6123">6123</option>
                      <option value="6124">6124</option>
                   </select>
                </div>
              </div>

              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label">Year</label>
                  <input
                    type="number"
                    name="tahun"
                    value={formData.tahun}
                    onChange={handleChange}
                    className="form-control"
                    required
                  />
                </div>
              </div>

              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label">Serial No.</label>
                  <input
                    type="text"
                    name="sn"
                    value={formData.sn}
                    onChange={handleChange}
                    className="form-control"
                    required
                  />
                </div>
              </div>
               <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label">Street Name</label>
                  <input
                    type="text"
                    name="nama_jalan"
                    value={formData.nama_jalan}
                    onChange={handleChange}
                    className="form-control"
                    required
                  />
                </div>
              </div>

              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label">CSP Date</label>
                  <input
                    type="date"
                    name="tarikh_csp"
                    value={formData.tarikh_csp}
                    onChange={handleChange}
                    className="form-control"
                    required
                  />
                </div>
              </div>

                <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label">File No.</label>
                  <input
                    type="text"
                    name="file_no"
                    value={formData.file_no}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>
              </div>

                {dataType=='DBKL' && (<div className="col-md-6">
                <div className="form-group">
                  <label className="form-label">DBKL PIC</label>
                  <select
                    name="pic_dbkl"
                    value={formData.pic_dbkl}
                    onChange={handleChange}
                    className="form-control"
                  >
                      <option value="">Select Work Type</option>
                      <option value="SYUKRI">SYUKRI</option>
                      <option value="AFFENDY">AFFENDY</option>
                      <option value="WAN SAIFUL">WAN SAIFUL</option>
                      <option value="TAQIYAH">TAQIYAH</option>
                      <option value="DIN">DIN</option>

                     
                   </select>
                </div>
              </div>)}

                {/* <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label">Permit Status</label>
                  <select
                    name="status_permit"
                    value={formData.status_permit}
                    onChange={handleChange}
                    className="form-control"
                  >
                     <option value="">Select Permit Status</option>
                      <option value="APPROVED">APPROVED</option>
                      <option value="NEW">NEW</option>
                      <option value="TASK FORCE MTG">TASK FORCE MTG</option>
                      <option value="NEW">REJECTED</option>
                     
                   </select>
                </div>
              </div> */}

              {/* <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label">Work Type</label>
                  <select
                    name="jenis_kerja"
                    value={formData.jenis_kerja}
                    onChange={handleChange}
                    className="form-control"
                    required
                  >
                    <option value="">Select Work Type</option>
                      <option value="HDD">HDD</option>
                      <option value="KOREKAN TERBUKA">KOREKAN TERBUKA</option>
                     
                   </select>
                </div>
              </div> */}

             

              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label">TNB OPA Approval Date</label>
                  <input
                    type="date"
                    name="tarikh_lulus_opa_tnb"
                    value={formData.tarikh_lulus_opa_tnb}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>
              </div>

              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label">MO File Date</label>
                  <input
                    type="date"
                    name="tarikh_fail_mo"
                    value={formData.tarikh_fail_mo}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>
              </div>

            

            

              {dataType=='PBT' && (<div className="col-md-6">
                <div className="form-group">
                  <label className="form-label">PBT</label>
                  <select
                    name="pbt"
                    value={formData.pbt}
                    onChange={handleChange}
                    className="form-control"
                  >
                   <option value="">Select PBT</option>
                      <option value="MPS">MPS</option>
                      <option value=" KUSEL"> KUSEL</option>
                      <option value=" MPAJ"> MPAJ</option>
                   </select>
                </div>
              </div>)}

              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label">Payment Type</label>
                  <select
                    name="jenis_bayaran"
                    value={formData.jenis_bayaran}
                    onChange={handleChange}
                    className="form-control"
                  >
                      <option value="">Select Jenis Bayaran</option>
                      <option value="WANG CAGARAN">WANG CAGARAN</option>
                      <option value=" WANG HANGUS"> WANG HANGUS</option>
                     
                   </select>
                </div>
              </div>

              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label">Amount (RM)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="rm"
                    value={formData.rm}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>
              </div>

              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label">Permit Status</label>
                  <select
                    name="status_permit"
                    value={formData.status_permit}
                    onChange={handleChange}
                    className="form-control"
                  >
                     <option value="">Select Permit Status</option>
                      <option value="APPROVED">APPROVED</option>
                      <option value="NEW">NEW</option>
                      <option value="TASK FORCE">TASK FORCE MTG</option>
                      <option value="REJECT">REJECT</option>

                     
                   </select>
                </div>
              </div>

              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label">Permit Date</label>
                  <input
                    type="date"
                    name="tarikh_permit"
                    value={formData.tarikh_permit}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>
              </div>

              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label">Work End Date</label>
                  <input
                    type="date"
                    name="tarikh_tamat_kerja"
                    value={formData.tarikh_tamat_kerja}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>
              </div>

              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label">CBR Test Submission Date</label>
                  <input
                    type="date"
                    name="tarikh_hantar_cbr_test"
                    value={formData.tarikh_hantar_cbr_test}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>
              </div>

              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label">Milling Completion Date</label>
                  <input
                    type="date"
                    name="tarikh_siap_milling"
                    value={formData.tarikh_siap_milling}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>
              </div>

              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label">Report Submission Date</label>
                  <input
                    type="date"
                    name="tarikh_hantar_report"
                    value={formData.tarikh_hantar_report}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>
              </div>

              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label">Current Permit Status</label>
                  <input
                    type="text"
                    name="status_permit_teikini"
                    value={formData.status_permit_teikini}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>
              </div>

              <div className="col-md-6">
                <div className="form-group">
                  {/* <label className="form-label">Polygon Geojson</label> */}
                  <input
                    type="text"
                    name="geom"
                    value={formData.geom}
                    onChange={handleChange}
                    className="form-control"
                   hidden/>
                </div>
              </div>

              <div className="col-12">
                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <textarea
                    name="catatan"
                    value={formData.catatan}
                    onChange={handleChange}
                    className="form-control"
                    rows="3"
                  />
                </div>
              </div>

              <MapComponent  key={mapKey}    onGeoJSONUpdate={handleGeoJSONUpdate}  mygeom={formData.geom} />

            </div>

            <div className="mt-4 d-flex justify-content-between">
              <button type="button" className="btn btn-secondary" onClick={resetForm}>
                Reset
              </button>
             {/* <button type="button" className="btn btn-danger" onClick={() => deleteRec(formData.id)}>
              Delete
            </button> */}
              <button type="submit" className="btn btn-primary">
                {isEditing ? 'Update' : 'Save'} Permit
              </button>
            </div>
          </form>



        </div>
      </div>

      {/* Overlay when form is open */}
      {isFormOpen && (
        <div 
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark"
          style={{ opacity: 0.5, zIndex: 1040 }}
          onClick={closeForm}
        ></div>
      )}
    </div>
  );
}

export default FormComponent;