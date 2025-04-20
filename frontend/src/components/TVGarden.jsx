import React, { useState, useRef, useEffect } from 'react';
import '../App.css'; 

function TVGarden({ src, title }) {
  const [isMaximized, setIsMaximized] = useState(false);

  const toggleMaximize = () => {
    setIsMaximized(!isMaximized);
  };

  // Dynamically create the wrapper class string
  const wrapperClassName = `embed-iframe-wrapper ${isMaximized ? 'maximized' : ''}`;

  return (
    // Use a div with the calculated className
    <div className={wrapperClassName}>
      <iframe
        src={src}
        title={title}
        allowFullScreen // Keep this
        // Width and height are controlled by CSS via the wrapper
      />
      {/* Use a button with its className */}
      <button className="embed-maximize-button" onClick={toggleMaximize}>
        {isMaximized ? 'Minimize' : 'Maximize'}
      </button>
    </div>
  );
}

export default TVGarden;