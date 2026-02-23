import React from 'react';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedLand: string;
  onLandChange: (land: string) => void;
  selectedLocationType: string;
  onLocationTypeChange: (type: string) => void;
  availableLands: string[];
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedLand,
  onLandChange,
  selectedLocationType,
  onLocationTypeChange,
  availableLands,
}) => {
  return (
    <div className="filter-bar">
      <div className="filter-section">
        <label htmlFor="search">Search:</label>
        <input
          id="search"
          type="text"
          placeholder="Search for food or locations..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      
      <div className="filter-section">
        <label htmlFor="land">Land:</label>
        <select
          id="land"
          value={selectedLand}
          onChange={(e) => onLandChange(e.target.value)}
        >
          <option value="">All Lands</option>
          {availableLands.map((land) => (
            <option key={land} value={land}>
              {land}
            </option>
          ))}
        </select>
      </div>
      
      <div className="filter-section">
        <label htmlFor="type">Location Type:</label>
        <select
          id="type"
          value={selectedLocationType}
          onChange={(e) => onLocationTypeChange(e.target.value)}
        >
          <option value="">All Types</option>
          <option value="quick-service">Quick Service</option>
          <option value="snack">Snack</option>
          <option value="avoid">Avoid</option>
        </select>
      </div>
    </div>
  );
};
