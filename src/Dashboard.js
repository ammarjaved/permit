import React, { useState,useEffect } from 'react';
 import { useNavigate } from 'react-router-dom';
import FormComponent from './FormComponent';
import MapCom from './Map'
import MapLegend from './MapLegend';

function Dashboard() {
    const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('tab1');
  const [xy1,setXY1]=useState({});
  const [fatureRecord,setFeatureRecord]=useState(null);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('message');
     navigate('/login');
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  return (
    <div style={{ height: '100vh', overflow: 'hidden' }}>
      <nav className="navbar navbar-dark fixed-top" style={{ borderBottom: "1px white solid",backgroundColor:'#3f51b5' }}>
        <div className="container-fluid">
          <div className="d-flex align-items-center">
            <button
              className="btn btn-link text-white me-3 p-0"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <span className="navbar-toggler-icon"></span>
            </button>
            <a className="navbar-brand fw-bold" href="#">PERMIT APP</a>
          </div>
        </div>
      </nav>
      <div className="d-flex" style={{ marginTop: '56px', height: 'calc(100vh - 56px)' }}>
        <div
          className={`sidebar  ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}
          style={{
            width: sidebarOpen ? '250px' : '0',
            transition: 'width 0.3s ease-in-out',
            overflowX: 'hidden',
            height: '100%',
            position: 'fixed',
            zIndex: 1000,
            backgroundColor:'#3f51b5'
          }}
        >
          <div className="p-3">
            <ul className="nav nav-tabs mb-3" role="tablist">
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link ${activeTab === 'tab1' ? 'active' : 'text-secondary'}`}
                  onClick={() => setActiveTab('tab1')}
                >
                  Navigation
                </button>
              </li>
            </ul>
            <div className="tab-content">
              {activeTab === 'tab1' && (
                <div className="nav flex-column">
                  <a onClick={handleLogout} style={{ borderBottom: "1px white solid", cursor: "pointer" }} className="nav-link text-white py-2">
                    Logout
                  </a>
                </div>
              )}
              <MapLegend />
            </div>
          </div>
        </div>
        {/* <div
          className="w-100"
          style={{
            marginLeft: sidebarOpen ? '250px' : '0',
            transition: 'margin-left 0.3s ease-in-out',
            height: '100%',
            overflowY: 'auto' // Ensure the content is scrollable if it overflows
          }}
        >
          <FormComponent />
        </div>

        <div
          className="w-100"
          style={{
            height: '100%',
            overflowY: 'auto' // Ensure the content is scrollable if it overflows
          }}
        >
          <MapCom />
        </div> */}

<div
  className="w-100 d-flex" // Use Flexbox for the layout
  style={{
    marginLeft: sidebarOpen ? '250px' : '0',
    transition: 'margin-left 0.3s ease-in-out',
    height: '100%',
    overflowY: 'auto', // Ensure the content is scrollable if it overflows
  }}
>
  {/* Table (70% width) */}
  <div
    style={{
      flex: '0 0 55%', // 70% width
      height: '100%',
      overflowY: 'auto', // Ensure the content is scrollable if it overflows
    }}
  >
    <FormComponent setXY1={setXY1} fatureRecord={fatureRecord}/>
  </div>

  {/* Map (30% width) */}
  <div
    style={{
      flex: '0 0 45%', // 30% width
      height: '100%',
      overflowY: 'auto', // Ensure the content is scrollable if it overflows
    }}
  >
    <MapCom xy1={xy1} setFeatureRecord={setFeatureRecord}/>
  </div>
</div>

      </div>
    </div>
  );
}

export default Dashboard;