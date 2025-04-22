import React, { useState, useRef, useEffect } from 'react';
import Iframe from 'react-iframe';
import '../App.css'; 

function TVGarden({ src, title }) {
  const [isMaximized, setIsMaximized] = useState(false);

  const toggleMaximize = () => {
    setIsMaximized(!isMaximized);
  };

  // Dynamically create the wrapper class string
  //const wrapperClassName = `embed-iframe-wrapper ${isMaximized ? 'maximized' : ''}`;

  return (
    // Use a div with the calculated className
    <div className="video-container">
      <Iframe
        src={src}
        title={title}
        width="100%"
        height="100%"
      />
      {/* Use a button with its className */}
      {/* <button className="embed-maximize-button" onClick={toggleMaximize}>
        {isMaximized ? 'Minimize' : 'Maximize'}
      </button> */}
    </div>
  );
}

export default TVGarden;