import React, { useState, useEffect } from 'react';

export default function Navbar() {
      const [time, setTime] = useState(new Date().toLocaleTimeString());

    return (
        // <nav className="navbar">
        // <div className="navbar__logo">MyApp</div>
        // <ul className="navbar__links">
        //     <li><a href="#home">Home</a></li>
        //     <li><a href="#about">About</a></li>
        //     <li><a href="#services">Services</a></li>
        //     <li><a href="#contact">Contact</a></li>
        // </ul>
        // </nav>
        <header>
            <h1>TV Stream Mosaic</h1>
            <div className="header-controls">
            <span id="time">{time}</span>
            </div>
        </header>
    );
}