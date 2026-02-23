import React from 'react';
import type { Land } from '../disneyFoodTypes';
import { LocationCard } from './LocationCard';

interface LandSectionProps {
  land: Land;
}

export const LandSection: React.FC<LandSectionProps> = ({ land }) => {
  return (
    <div className="land-section">
      <h2 className="land-title">{land.name}</h2>
      <div className="locations-grid">
        {land.locations.map((location, index) => (
          <LocationCard key={index} location={location} landName={land.name} />
        ))}
      </div>
    </div>
  );
};
