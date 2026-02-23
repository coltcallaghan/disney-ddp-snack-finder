// DisneyLogo.tsx
import React from 'react';

export const DisneyLogo: React.FC<{ size?: number }> = ({ size = 64 }) => (
  <img
    src="/disney-favicon.svg"
    alt="Disney Logo"
    width={size}
    height={size}
    style={{ display: 'inline-block', verticalAlign: 'middle' }}
  />
);
