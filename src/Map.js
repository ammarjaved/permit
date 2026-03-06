import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, WMSTileLayer, LayersControl, Polygon, FeatureGroup, useMapEvents, useMap, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import NominatimSearch from './NominatimSearch';

// Fix for default markers in React Leaflet
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapCom = ({ xy1, setFeatureRecord }) => {
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [streetViewMarker, setStreetViewMarker] = useState(null);
  const [showStreetView, setShowStreetView] = useState(false);
  const [streetViewPosition, setStreetViewPosition] = useState(null);
  const [isStreetViewMode, setIsStreetViewMode] = useState(false);
  const [showStreetViewControls, setShowStreetViewControls] = useState(false); // New state

  const ZoomToCoordinates = ({ coordinates }) => {
    const map = useMap();
    
    useEffect(() => {
      if (coordinates && coordinates.lat && coordinates.lng) {
        map.setView([coordinates.lat, coordinates.lng], 19); // 15 is zoom level
      }
    }, [coordinates, map]);
    
    return null;
  };

  const FeatureClickHandler = ({ LayerName, onFeatureClick }) => {
    const [isLoading, setIsLoading] = useState(false);

    const coordinatesToPolygonWKT = (coordinates) => {
      if (!coordinates || coordinates.length < 3) {
        throw new Error('Polygon requires at least 3 coordinates');
      }
      
      // Format coordinates as "lon lat" pairs
      const coordinateStrings = coordinates.map(coord => `${coord[0]} ${coord[1]}`);
      
      // Close the polygon by adding the first coordinate at the end if not already closed
      const firstCoord = coordinateStrings[0];
      const lastCoord = coordinateStrings[coordinateStrings.length - 1];
      
      if (firstCoord !== lastCoord) {
        coordinateStrings.push(firstCoord);
      }
      
      // Join coordinates and wrap in POLYGON syntax
      return `POLYGON((${coordinateStrings.join(', ')}))`;
    };

    useMapEvents({
      click: async (e) => {
        // Handle Street View mode clicks first
        if (isStreetViewMode) {
          const { lat, lng } = e.latlng;
          setStreetViewMarker([lat, lng]);
          console.log("Street View marker placed at:", lat, lng);
          return; // Don't process feature info when in street view mode
        }

        // Original feature click handling
        const { lat, lng } = e.latlng;
        const map = e.target;
        
        setIsLoading(true);
        
        try {
          const bounds = map.getBounds();
          const size = map.getSize();
          const point = map.latLngToContainerPoint(e.latlng);
          
          const params = {
            REQUEST: 'GetFeatureInfo',
            SERVICE: 'WMS',
            VERSION: '1.1.1',
            LAYERS: LayerName,
            QUERY_LAYERS: LayerName,
            INFO_FORMAT: 'application/json',
            X: Math.round(point.x),
            Y: Math.round(point.y),
            BBOX: `${bounds.getWest()},${bounds.getSouth()},${bounds.getEast()},${bounds.getNorth()}`,
            WIDTH: size.x,
            HEIGHT: size.y,
            SRS: 'EPSG:4326',
            BUFFER: 5 // Add buffer for easier clicking
          };

          const queryString = new URLSearchParams(params).toString();
          const wmsUrl = 'http://121.121.232.54:7090/geoserver/cite/wms';
          const proxyUrl = `http://121.121.232.54:88/permit/proxy.php?url=${encodeURIComponent(`${wmsUrl}?${queryString}`)}`;
          
          const response = await fetch(proxyUrl);
          if (!response.ok) throw new Error('Failed to fetch feature info');
          
          const data = await response.json();
          
          if (data.features?.length > 0) {
            console.log(data.features[0].geometry);
            let poly = coordinatesToPolygonWKT(data.features[0].geometry.coordinates[0]);
            let obj = data.features[0].properties;
            console.log(poly);
            obj['geom'] = poly;
            onFeatureClick(obj);
            setFeatureRecord(obj);
          } else {
            // No features found at click location
            onFeatureClick(null);
          }
        } catch (error) {
          console.error('Error fetching feature info:', error);
        } finally {
          setIsLoading(false);
        }
      }
    });

    return isLoading ? (
      <div className="absolute top-4 left-4 z-[1000] bg-white rounded-lg shadow-lg p-2">
        Loading feature info...
      </div>
    ) : null;
  };

  // Street View functions
  const checkStreetViewAvailability = async (lat, lng) => {
    try {
      // This is a simple check - try to load the Street View image
      const testUrl = `https://maps.googleapis.com/maps/api/streetview?size=1x1&location=${lat},${lng}&key=YOUR_API_KEY`;
      // Note: This would need a valid API key to work properly
      return true; // Placeholder - in real implementation, check the response
    } catch (error) {
      return false;
    }
  };

  const openStreetViewInNewTab = (lat, lng) => {
    const streetViewUrl = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lng}`;
    window.open(streetViewUrl, '_blank');
  };

  const openStreetViewModal = (lat, lng) => {
    setStreetViewPosition({ lat, lng });
    setShowStreetView(true);
  };

  const toggleStreetViewMode = () => {
    setIsStreetViewMode(!isStreetViewMode);
    if (!isStreetViewMode) {
      setStreetViewMarker(null); // Clear marker when entering street view mode
    }
  };

  const toggleStreetViewControls = () => {
    setShowStreetViewControls(!showStreetViewControls);
    // Reset street view state when hiding controls
    if (showStreetViewControls) {
      setIsStreetViewMode(false);
      setStreetViewMarker(null);
      setShowStreetView(false);
    }
  };

  const center = [3.08155900955, 101.6441360473]; // New York City
  const zoom = 10;

  const { BaseLayer, Overlay } = LayersControl;
  
  console.log(xy1);

  return (
    <div style={{ position: 'relative' }}>
      <MapContainer center={center} zoom={zoom} style={{ height: '100vh', width: '100%' }}>
        <LayersControl position="topright">
          <BaseLayer checked name="Satellite Map">
            <TileLayer
              url="https://www.google.cn/maps/vt?lyrs=s@189&gl=cn&x={x}&y={y}&z={z}"
              attribution="Google Maps"
            />
          </BaseLayer> 
          <BaseLayer name="OpenStreetMap">
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />     
          </BaseLayer>
          
          <Overlay checked name="permit records">
            <WMSTileLayer
              url="http://121.121.232.54:7090/geoserver/cite/wms"
              params={{
                layers: 'cite:permit_records',
                format: 'image/png',
                transparent: true,
                version: '1.1.1'
              }}          
            />
          </Overlay>

          <Overlay name="Parliament Selengor">
            <WMSTileLayer
              url="http://121.121.232.54:7090/geoserver/cite/wms"
              params={{
                layers: 'cite:parliament_selangor',
                format: 'image/png',
                transparent: true,
                version: '1.1.1'
              }}          
            />
          </Overlay>

          <Overlay name="parliament_kuala_lumpur">
            <WMSTileLayer
              url="http://121.121.232.54:7090/geoserver/cite/wms"
              params={{
                layers: 'cite:parliament_kuala_lumpur',
                format: 'image/png',
                transparent: true,
                version: '1.1.1'
              }}          
            />
          </Overlay>

          <Overlay checked name="kl_oa2">
            <WMSTileLayer
              url="http://121.121.232.54:7090/geoserver/cite/wms"
              params={{
                layers: 'cite:kl_oa2',
                format: 'image/png',
                transparent: true,
                version: '1.1.1'
              }}          
            />
          </Overlay>
        </LayersControl>

        <ZoomToCoordinates coordinates={xy1} />

        <FeatureClickHandler
          LayerName={'cite:permit_records'}  
          onFeatureClick={setSelectedFeature} 
        />

        {/* Street View Marker */}
        {streetViewMarker && (
          <Marker position={streetViewMarker}>
            <Popup>
              <div style={{ textAlign: 'center', minWidth: '200px' }}>
                <p><strong>Street View Location</strong></p>
                <p>Lat: {streetViewMarker[0].toFixed(6)}</p>
                <p>Lng: {streetViewMarker[1].toFixed(6)}</p>
                <div style={{ marginTop: '10px' }}>
                  <button
                    onClick={() => openStreetViewInNewTab(streetViewMarker[0], streetViewMarker[1])}
                    style={{
                      backgroundColor: '#4285f4',
                      color: 'white',
                      border: 'none',
                      padding: '5px 10px',
                      margin: '2px',
                      borderRadius: '3px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    ✅ Open in New Tab 
                  </button>
                  <br />
                  <button
                    onClick={() => openStreetViewModal(streetViewMarker[0], streetViewMarker[1])}
                    style={{
                      backgroundColor: '#34a853',
                      color: 'white',
                      border: 'none',
                      padding: '5px 10px',
                      margin: '2px',
                      borderRadius: '3px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    🔧 click here to view
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Search Component */}
        <div style={{ 
          position: 'absolute', 
          top: '80px', 
          left: '10px', 
          zIndex: 1000,
          backgroundColor: 'white',
          padding: '5px',
          borderRadius: '4px',
          boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
        }}>
          <NominatimSearch 
            onLocationSelect={(location) => {
              console.log('Selected location:', location);
              // Optional: Add marker, update state, etc.
            }}
          />
        </div>
      </MapContainer>

      {/* Street View Toggle Button - Always visible */}
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        zIndex: 1000,
        backgroundColor: 'white',
        padding: '8px',
        borderRadius: '4px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
      }}>
        <button
          onClick={toggleStreetViewControls}
          style={{
            padding: '8px 12px',
            backgroundColor: showStreetViewControls ? '#dc3545' : '#4285f4',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 'bold'
          }}
        >
          🌍 {showStreetViewControls ? 'Hide Street View' : 'Street View'}
        </button>
      </div>

      {/* Street View Controls - Only show when toggled */}
      {showStreetViewControls && (
        <div style={{
          position: 'absolute',
          top: '60px', // Position below the toggle button
          right: '10px',
          zIndex: 1000,
          backgroundColor: 'white',
          padding: '8px',
          borderRadius: '4px',
          boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
          width: '80px',
          fontSize: '11px'
        }}>
          {/* Mode Toggle Button */}
          <button
            onClick={toggleStreetViewMode}
            style={{
              width: '100%',
              padding: '6px',
              marginBottom: '4px',
              backgroundColor: isStreetViewMode ? '#dc3545' : '#4285f4',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: 'bold'
            }}
          >
            📍 {isStreetViewMode ? 'Exit Mode' : 'Place Marker'}
          </button>
          
          {/* Status Indicator */}
          <div style={{ 
            fontSize: '10px', 
            color: isStreetViewMode ? '#dc3545' : '#28a745',
            textAlign: 'center',
            marginBottom: '4px',
            fontWeight: 'bold'
          }}>
            {isStreetViewMode ? '🔴 Click on map' : '🟢 Ready'}
          </div>

          {/* Current Marker Info (when exists) */}
          {streetViewMarker && (
            <div style={{ 
              backgroundColor: '#f8f9fa',
              padding: '4px',
              borderRadius: '3px',
              marginBottom: '4px'
            }}>
              <div style={{ fontSize: '10px', color: '#666', textAlign: 'center' }}>
                📌 {streetViewMarker[0].toFixed(4)}, {streetViewMarker[1].toFixed(4)}
              </div>
              <button
                onClick={() => setStreetViewMarker(null)}
                style={{
                  width: '100%',
                  padding: '3px',
                  marginTop: '3px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '2px',
                  cursor: 'pointer',
                  fontSize: '9px'
                }}
              >
                Clear
              </button>
            </div>
          )}
        </div>
      )}

      {/* Street View Modal */}
      {showStreetView && streetViewPosition && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            maxWidth: '90%',
            maxHeight: '90%',
            width: '800px',
            height: '600px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '15px'
            }}>
              <h3 style={{ margin: 0 }}>Street View</h3>
              <button
                onClick={() => setShowStreetView(false)}
                style={{
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
            <div style={{ width: '100%', height: 'calc(100% - 60px)' }}>
              <iframe
                src={`https://www.google.com/maps/embed/v1/streetview?key=AIzaSyB77dMb_UPjAwccZS0p5SoFVKnd8374Mc0&location=${streetViewPosition.lat},${streetViewPosition.lng}&heading=210&pitch=10&fov=35`}
                width="100%"
                height="100%"
                style={{ border: 0, borderRadius: '4px' }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Street View"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapCom;