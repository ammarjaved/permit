import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer,WMSTileLayer,LayersControl, Polygon, FeatureGrou,useMapEvents,useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const MapCom = ({xy1,setFeatureRecord}) => {
const [selectedFeature, setSelectedFeature] = useState(null);
const ZoomToCoordinates = ({ coordinates }) => {
  const map = useMap();
  
  useEffect(() => {
    if (coordinates && coordinates.lat && coordinates.lng) {
      map.setView([coordinates.lat, coordinates.lng], 19); // 15 is zoom level
    }
  }, [coordinates, map]);
  
  return null;
};
  // Default map center and zoom

  


  const FeatureClickHandler = ({ LayerName,onFeatureClick }) => {
  const [isLoading, setIsLoading] = useState(false);

  const coordinatesToPolygonWKT=(coordinates)=> {
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
}

  useMapEvents({
    click: async (e) => {
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
         console.log(data.features[0].geometry)
         let poly=coordinatesToPolygonWKT(data.features[0].geometry.coordinates[0]);
         let obj=data.features[0].properties;
         console.log(poly);
         obj['geom']=poly
          onFeatureClick(obj);
          setFeatureRecord(obj)

          
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

  

  const center = [3.0457599556399937, 101.62618867819415]; // New York City
  const zoom = 13;

  const { BaseLayer, Overlay } = LayersControl;
  
   console.log(xy1)

   

  return (
    <div>
      <MapContainer center={center} zoom={zoom} style={{ height: '100vh', width: '100%' }}>
        {/* <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        /> */}

    <LayersControl position="topright">
      <BaseLayer checked  name="Satellite Map">
      <TileLayer
          url="https://www.google.cn/maps/vt?lyrs=s@189&gl=cn&x={x}&y={y}&z={z}"
          attribution="Google Maps"
          />
      </BaseLayer> 
      <BaseLayer  name="OpenStreetMap">
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
      </LayersControl>

      <ZoomToCoordinates coordinates={xy1} />

          <FeatureClickHandler
          LayerName={'cite:permit_records'}  
          onFeatureClick={setSelectedFeature} 
        />
      </MapContainer>

    </div>
  );
};

export default MapCom;