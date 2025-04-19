import React from 'react';
import '../App.css'; // Make sure path is correct relative to Footer.js

// Define expected props for clarity (optional but good practice)
/**
 * @typedef {object} FooterProps
 * @property {boolean} isLayoutOptionsOpen
 * @property {() => void} onToggleLayoutOptions
 * @property {boolean} isStreamsMenuOpen
 * @property {() => void} onToggleStreamsMenu
 * @property {() => void} onMuteAll
 */

/**
 * Footer component with controls.
 * @param {FooterProps} props
 */
export default function Footer({
  isLayoutOptionsOpen,
  onToggleLayoutOptions,
  isStreamsMenuOpen,
  onToggleStreamsMenu,
  onMuteAll
}) {

  return (
    <footer>
      <div className="global-controls">
        <button
          className="global-btn"
          id="layoutBtn"
          onClick={onToggleLayoutOptions} // Call prop function
        >
          {/* Use prop value to display correct state */}
          Layout {isLayoutOptionsOpen ? '▲' : '▼'}
        </button>

        <button
          className="global-btn"
          id="audioMixBtn"
          title="Mute All"
          onClick={onMuteAll} // Call prop function
        >
          Mute All
        </button>

        <button
          className="global-btn"
          id="manageStreamsBtn"
          onClick={onToggleStreamsMenu} // Call prop function
        >
          {/* Use prop value to display correct state */}
          Manage Streams {isStreamsMenuOpen ? '▲' : '▼'}
        </button>

        <button
          className="global-btn"
          id="settingsBtn"
          onClick={() => alert('Settings feature coming soon!')}
        >
          Settings
        </button>
      </div>
      <div className="status">
        <div className="status-indicator"></div>
        <span>Status OK</span> {/* TODO: Make status dynamic */}
      </div>
    </footer>
  );
}