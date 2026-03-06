import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, WMSTileLayer, Polygon, FeatureGroup, useMap, LayersControl } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import NominatimSearch from './NominatimSearch';

const DrawPolygonMap = ({ onGeoJSONUpdate, mygeom }) => {
  const [geoJSON, setGeoJSON] = useState(null);
  const [initialPolygon, setInitialPolygon] = useState(null);
  const [isInitialPolygonLoaded, setIsInitialPolygonLoaded] = useState(false);
  const featureGroupRef = useRef();

  // Default map center and zoom
  const center = [3.0457599556399937, 101.62618867819415];
  const zoom = 13;

  useEffect(() => {
    if (mygeom && typeof mygeom === 'string' && mygeom.trim() !== "") {
      try {
        // Remove "POLYGON((" and "))" from the string
        const coordsString = mygeom
          .replace("POLYGON((", "")
          .replace("))", "");

        // Convert coordinates to an array of [lat, lng] pairs
        const latLngs = coordsString.split(",").map((coord) => {
          const [lng, lat] = coord.trim().split(" ").map(Number);
          if (isNaN(lat) || isNaN(lng)) {
            throw new Error("Invalid coordinate format");
          }
          return [lat, lng]; // Leaflet uses [lat, lng] format
        });

        // Ensure the polygon has at least 3 points
        if (latLngs.length >= 3) {
          setInitialPolygon(latLngs);
          setIsInitialPolygonLoaded(false); // Reset loading state
        } else {
          console.error("Invalid polygon: At least 3 points are required");
        }
      } catch (error) {
        console.error("Error parsing mygeom:", error);
      }
    }
  }, [mygeom]);

  // Add initial polygon to the editable feature group
  useEffect(() => {
    if (initialPolygon && initialPolygon.length >= 3 && featureGroupRef.current && !isInitialPolygonLoaded) {
      const featureGroup = featureGroupRef.current;
      
      // Clear existing layers
      featureGroup.clearLayers();
      
      // Create a new Leaflet polygon
      const L = require('leaflet');
      const polygon = L.polygon(initialPolygon, {
        color: "blue",
        fillColor: "lightblue",
        fillOpacity: 0.5
      });
      
      // Add to feature group so it can be edited
      featureGroup.addLayer(polygon);
      
      // Create GeoJSON from the polygon
      const geoJSONData = polygon.toGeoJSON();
      setGeoJSON(geoJSONData);
      onGeoJSONUpdate(JSON.stringify(geoJSONData.geometry));
      
      setIsInitialPolygonLoaded(true);
    }
  }, [initialPolygon, isInitialPolygonLoaded, onGeoJSONUpdate]);

  // Handle polygon creation
  const handleCreated = (e) => {
    if (!e || !e.layer) {
      console.error("Invalid layer:", e);
      return;
    }

    const layer = e.layer;
    const geoJSONData = layer.toGeoJSON();

    if (!geoJSONData || !geoJSONData.geometry) {
      console.error("Invalid GeoJSON data:", geoJSONData);
      return;
    }

    setGeoJSON(geoJSONData);
    onGeoJSONUpdate(JSON.stringify(geoJSONData.geometry));
    console.log("Polygon GeoJSON:", geoJSONData);
  };

  // Handle polygon editing
  const handleEdited = (e) => {
    if (!e || !e.layers) {
      console.error("Invalid edit event:", e);
      return;
    }

    const layers = e.layers;
    layers.eachLayer((layer) => {
      const geoJSONData = layer.toGeoJSON();
      
      if (geoJSONData && geoJSONData.geometry) {
        setGeoJSON(geoJSONData);
        onGeoJSONUpdate(JSON.stringify(geoJSONData.geometry));
        console.log("Edited Polygon GeoJSON:", geoJSONData);
      }
    });
  };

  // Handle polygon deletion
  const handleDeleted = (e) => {
    if (!e || !e.layers) {
      console.error("Invalid delete event:", e);
      return;
    }

    // Clear the polygon data
    setGeoJSON(null);
    onGeoJSONUpdate(null);
    setInitialPolygon(null);
    setIsInitialPolygonLoaded(false);
    console.log("Polygon deleted");
  };

  const FitPolygonBounds = ({ polygon }) => {
    const map = useMap();
    
    useEffect(() => {
      if (polygon && polygon.length >= 3) {
        map.fitBounds(polygon, { padding: [20, 20] });
      }
    }, [polygon, map]);
    
    return null;
  };
  
  const { BaseLayer, Overlay } = LayersControl;

  return (
    <div>
      <MapContainer center={center} zoom={zoom} style={{ height: '50vh', width: '100%' }}>
        
        <LayersControl position="topright">
          <BaseLayer checked name="Street Map">
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
          </BaseLayer>

          <Overlay name="kl_oa2">
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
        </LayersControl>

        <FitPolygonBounds polygon={initialPolygon} />

        {/* FeatureGroup and EditControl for drawing and editing */}
        <FeatureGroup ref={featureGroupRef}>
          <EditControl
            position="topright"
            onCreated={handleCreated}
            onEdited={handleEdited}
            onDeleted={handleDeleted}
            draw={{
              rectangle: false,
              circle: false,
              circlemarker: false,
              marker: false,
              polyline: false,
              polygon: true, // Enable polygon drawing
            }}
            edit={{
              edit: true,    // Enable editing
              remove: true,  // Enable deletion
            }}
          />
        </FeatureGroup>

        <div style={{ 
          position: 'absolute', 
          top: '80px', 
          left: '10px', 
          zIndex: 10000,
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

      {/* Display GeoJSON data */}
      {/* {geoJSON && (
        <div style={{ margin: '20px', padding: '10px', background: '#f0f0f0' }}>
          <h3>Polygon GeoJSON:</h3>
          <pre>{JSON.stringify(geoJSON, null, 2)}</pre>
        </div>
      )} */}
    </div>
  );
};

export default DrawPolygonMap;