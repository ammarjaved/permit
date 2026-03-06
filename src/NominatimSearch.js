import React, { useState, useRef } from 'react';
import { useMap } from 'react-leaflet';

// Search component to add to your existing map - Malaysia only
const NominatimSearch = ({ onLocationSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchTimeoutRef = useRef(null);
  const map = useMap(); // Get map instance

  // Nominatim search function - restricted to Malaysia
  const searchLocation = async (query) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1&countrycodes=MY`,
        {
          headers: {
            'User-Agent': 'React-Leaflet-Search'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Search error:', error);
      return [];
    }
  };

  // Handle search input with debouncing
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for search
    searchTimeoutRef.current = setTimeout(async () => {
      if (query.length >= 2) {
        setIsLoading(true);
        const results = await searchLocation(query);
        setSearchResults(results);
        setIsLoading(false);
      } else {
        setSearchResults([]);
      }
    }, 300);
  };

  // Handle location selection
  const handleLocationSelect = (location) => {
    const lat = parseFloat(location.lat);
    const lon = parseFloat(location.lon);
    
    // Zoom to location
    map.setView([lat, lon], 16);
    
    // Update search query
    setSearchQuery(location.display_name.split(',')[0]);
    setSearchResults([]);
    
    // Call parent callback if provided
    if (onLocationSelect) {
      onLocationSelect({
        lat,
        lon,
        name: location.display_name.split(',')[0],
        fullName: location.display_name,
        data: location
      });
    }
  };

  return (
    <div className="absolute top-2 left-4 right-4 z-[9999] bg-white rounded-lg ">
      <div className="relative"  style={{ zIndex: 9999 }}>
        <input
          type="text"
          placeholder="Search for a location in Malaysia..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        
        {isLoading && (
          <div className="absolute right-3 top-2.5">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>

      {/* Search Results Dropdown */}
      {searchResults.length > 0 && (
        <div  className="mt-2 border rounded overflow-auto" 
              style={{ 
                maxHeight: '200px',
                backgroundColor: 'white',
                scrollbarWidth: 'thin',
                scrollbarColor: '#6c757d #f8f9fa'
              }}>
          {searchResults.map((location) => (
            <div
              key={location.place_id}
              onClick={() => handleLocationSelect(location)}
              className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
            >
              <div className="font-semibold text-gray-900">
                {location.display_name.split(',')[0]}
              </div>
              <div className="text-sm text-gray-600">
                {location.display_name}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NominatimSearch;