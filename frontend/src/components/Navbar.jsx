import React, { useState, useEffect } from 'react';

export default function Navbar() {
      const [time, setTime] = useState(new Date().toLocaleTimeString());

    return (
        <header>
            <h1>TV Stream Mosaic</h1>
            <div className="header-controls">
            <span id="time">{time}</span>
            </div>
        </header>
    );
}