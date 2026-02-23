// DisneyLogoImg.tsx
import React from 'react';

export const DisneyLogoImg: React.FC<{ height?: number }> = ({ height = 48 }) => (
  <img
    src="/disney_logo.png"
    alt="Disney Logo"
    height={height}
    style={{ display: 'inline-block', verticalAlign: 'middle', maxWidth: '100%' }}
  />
);
