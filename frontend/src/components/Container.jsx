import React from 'react';
import '../App.css';
function Container({ children }) {
    return (
        <div className="video-container.iptv-player">
            {children}
        </div>
    );
}
export default Container;
