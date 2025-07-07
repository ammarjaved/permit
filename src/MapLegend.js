import React from 'react';

const MapLegend = () => {
  const legendItems = [
    { id: 'line1', label: 'Apprroved', color: 'green' },
    { id: 'line2', label: 'New', color: 'blue' },
    { id: 'line3', label: 'Task Force', color: 'yellow' },
    { id: 'line4', label: 'Reject', color: 'red' }

  ];

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-auto">
          <div 
            className="card border-light shadow-sm" 
            style={{ 
              backgroundColor: '#f8f9fa',
              minWidth: '200px',
              borderRadius: '8px'
            }}
          >
            <div className="card-body p-4">
              {/* Header */}
              <div className="d-flex align-items-center mb-4">
                <span 
                  className="me-2 text-primary" 
                  style={{ 
                    fontSize: '18px',
                    fontWeight: '500'
                  }}
                >
                  ≈
                </span>
                <h6 className="mb-0 text-primary fw-semibold">Map Legend</h6>
              </div>
              
              {/* Legend Items */}
              <div className="d-flex flex-column">
                {legendItems.map((item, index) => (
                  <div 
                    key={item.id} 
                    className="d-flex align-items-center mb-3"
                    style={{ marginBottom: index === legendItems.length - 1 ? '0' : '12px' }}
                  >
                    {/* Colored polygon shape */}
                    <div 
                      className="me-3"
                      style={{
                        width: '40px',
                        height: '20px',
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      {/* Polygon shape using CSS clip-path */}
                      <div
                        style={{
                          width: '36px',
                          height: '16px',
                          backgroundColor: item.color,
                          clipPath: 'polygon(0% 40%, 20% 20%, 40% 60%, 60% 10%, 80% 50%, 100% 30%, 100% 70%, 80% 90%, 60% 50%, 40% 100%, 20% 80%, 0% 60%)',
                          borderRadius: '2px'
                        }}
                      />
                    </div>
                    
                    {/* Lightning bolt icon and label */}
                    <div className="d-flex align-items-center">
                      <span 
                        className="me-2 text-muted" 
                        style={{ fontSize: '14px' }}
                      >
                        ⚡
                      </span>
                      <span 
                        className="text-dark" 
                        style={{ 
                          fontSize: '14px',
                          fontWeight: '400',
                          color: '#495057'
                        }}
                      >
                        {item.label}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapLegend;