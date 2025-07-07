import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, FeatureGroup,useMap  } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';

const DrawPolygonMap = ({ onGeoJSONUpdate, mygeom }) => {
  const [geoJSON, setGeoJSON] = useState(null);
  const [initialPolygon, setInitialPolygon] = useState(null);

  // Default map center and zoom
  const center = [3.0457599556399937, 101.62618867819415]; // New York City
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
        } else {
          console.error("Invalid polygon: At least 3 points are required");
        }
      } catch (error) {
        console.error("Error parsing mygeom:", error);
      }
    }
  }, [mygeom]);

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

  const FitPolygonBounds = ({ polygon }) => {
  const map = useMap();
  
  useEffect(() => {
    if (polygon && polygon.length >= 3) {
      // polygon is already in the format [[lat, lng], [lat, lng], ...]
      // No need to map it again, just use it directly
      map.fitBounds(polygon, { padding: [20, 20] });
    }
  }, [polygon, map]);
  
  return null;
};
  

  return (
    <div>
      <MapContainer center={center} zoom={zoom} style={{ height: '50vh', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Render initial polygon if valid */}
        {initialPolygon && initialPolygon.length >= 3 && (
          <Polygon
            positions={initialPolygon}
            pathOptions={{ color: "blue", fillColor: "lightblue", fillOpacity: 0.5 }}
          />
        )}

            <FitPolygonBounds polygon={initialPolygon} />


        {/* FeatureGroup and EditControl for drawing */}
        <FeatureGroup>
          <EditControl
            position="topright"
            onCreated={handleCreated}
            draw={{
              rectangle: false,
              circle: false,
              circlemarker: false,
              marker: false,
              polyline: false,
              polygon: true, // Enable polygon drawing
            }}
          />
        </FeatureGroup>
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