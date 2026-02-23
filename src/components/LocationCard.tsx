import React from 'react';
import type { Location } from '../disneyFoodTypes';

interface LocationCardProps {
  location: Location;
  landName: string;
}

export const LocationCard: React.FC<LocationCardProps> = ({ location, landName }) => {
  const getLocationTypeClass = (type: string) => {
    switch (type) {
      case 'quick-service':
        return 'location-quick-service';
      case 'snack':
        return 'location-snack';
      case 'avoid':
        return 'location-avoid';
      default:
        return '';
    }
  };

  const getLocationTypeBadge = (type: string) => {
    switch (type) {
      case 'quick-service':
        return 'Quick Service';
      case 'snack':
        return 'Snack';
      case 'avoid':
        return 'Avoid';
      default:
        return type;
    }
  };

  return (
    <div className={`location-card ${getLocationTypeClass(location.type)}`}>
      <div className="location-header">
        <h3>{location.name}</h3>
        <span className={`location-badge ${getLocationTypeClass(location.type)}`}>
          {getLocationTypeBadge(location.type)}
        </span>
      </div>
      
      <div className="location-meta">
        <span className="land-tag">{landName}</span>
        {location.description && (
          <span className="location-description">{location.description}</span>
        )}
      </div>
      
      {location.foodItems.length > 0 && (
        <div className="food-items">
          <h4>Available Items:</h4>
          <ul>
            {location.foodItems.map((item, index) => (
              <li key={index}>{item.name}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
