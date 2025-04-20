import React from 'react';
import '../App.css';


function onSelect(option) {
    console.log(`Selected option: ${option}`);
    // Here you can add logic to handle the selected option, like navigating to a different screen or loading content.
    alert(`You selected: ${option}`);
}

function SelectionScreen() {
    return (
        <div className="selection-screen" > 
            <p>Select an option below:</p>

            <button onClick={() => onSelect('Netflix')}>Netflix</button>
            <button onClick={() => onSelect('TVNZ+')}>Netflix</button>
            <button onClick={() => onSelect('IPTV')}>IPTV</button>
            <button onClick={() => onSelect('Youtube')}>Youtube</button>
            <button onClick={() => onSelect('Twitch')}>Twitch</button>
            <button onClick={() => onSelect('Rumble')}>Rumble</button>
        </div>
    );
}
export default SelectionScreen;