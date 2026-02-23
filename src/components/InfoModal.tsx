import React from 'react';

export const InfoModal: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>&times;</button>
        <h2>How to Use the Disney Dining Plan</h2>
        <p><b>What is the Disney Dining Plan?</b><br/>
        The Disney Dining Plan is a prepaid meal package available to guests staying at Disney Resort hotels with a vacation package. It allows you to pay for meals and snacks in advance and redeem credits at participating locations throughout Walt Disney World.
        </p>
        <h3>Types of Dining Plans</h3>
        <ul>
          <li><b>Quick Service Plan:</b> 2 Quick Service Meals + 1 Snack per person, per night.</li>
          <li><b>Standard Plan:</b> 1 Table Service Meal + 1 Quick Service Meal + 1 Snack per person, per night.</li>
        </ul>
        <h3>How to Use Your Credits</h3>
        <ul>
          <li>Present your MagicBand or Key to the World card when ordering to redeem credits.</li>
          <li>Snacks include items like ice cream, popcorn, bottled drinks, fries, bakery treats, and more. Look for the Disney Dining Plan snack icon on menus.</li>
          <li>Quick Service credits are for counter-service meals (entrée + drink). Table Service credits are for sit-down restaurants (entrée + drink, sometimes dessert).</li>
          <li>Unused credits expire at midnight on the day you check out—use them all!</li>
        </ul>
        <h3>Tips for Maximizing Value</h3>
        <ul>
          <li>Use snack credits for higher-value items (not just bottled water or soda).</li>
          <li>At EPCOT festivals, many food booth items count as snacks and can be a great value.</li>
          <li>Signature restaurants require 2 Table Service credits per person.</li>
          <li>Kids must order from the kids’ menu when using a child’s credit.</li>
        </ul>
        <p style={{fontSize: '0.95em', color: '#666'}}>For more details, visit <a href="https://allears.net/walt-disney-worlds-disney-dining-plan/" target="_blank" rel="noopener noreferrer">AllEars Disney Dining Plan Guide</a>.</p>
      </div>
    </div>
  );
};
