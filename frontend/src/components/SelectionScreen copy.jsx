import React, { useState } from 'react';
import '../App.css'; // Create basic styles

function SelectionScreenCopy({ slotId, onSelect, initialMessage }) {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [hlsUrl, setHlsUrl] = useState('');
  const [hlsName, setHlsName] = useState('');

  const handleSelect = (type) => {
    if (type === 'youtube') {
      if (youtubeUrl.trim()) {
        try {
            new URL(youtubeUrl); // Basic validation
            onSelect(slotId, 'youtube', { url: youtubeUrl.trim() });
        } catch {
            alert('Please enter a valid YouTube URL.');
        }
      } else {
        alert('Please enter a YouTube URL.');
      }
    } else if (type === 'hls') {
      if (hlsUrl.trim()) {
         try {
            new URL(hlsUrl); // Basic validation
            onSelect(slotId, 'hls', { url: hlsUrl.trim(), name: hlsName.trim() || 'HLS Stream' });
         } catch {
             alert('Please enter a valid HLS URL (.m3u8).');
         }
      } else {
        alert('Please enter an HLS URL.');
      }
    } else {
      // For types without input data (IPTV, TVGarden)
      onSelect(slotId, type);
    }
  };

  return (
    <div className="selection-screen">
      <h4>Select Content for Slot {slotId + 1}</h4>
        {initialMessage && <p className="selection-message">{initialMessage}</p>}

      <div className="selection-options">
         {/* Option 1: IPTV */}
        <button onClick={() => handleSelect('iptv')} className="selection-button">
          📺 IPTV Channels
        </button>

        {/* Option 2: TV Garden */}
        <button onClick={() => handleSelect('tvgarden')} className="selection-button">
          🌳 TV Garden
        </button>

        {/* Option 3: YouTube */}
        <div className="selection-input-group">
          <input
            type="text"
            placeholder="YouTube URL"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
          />
          <button onClick={() => handleSelect('youtube')} className="selection-button small">▶️ Load YouTube</button>
        </div>

        {/* Option 4: HLS Stream */}
        <div className="selection-input-group">
          <input
            type="text"
            placeholder="HLS URL (.m3u8)"
            value={hlsUrl}
            onChange={(e) => setHlsUrl(e.target.value)}
            className="hls-url-input"
          />
           <input
            type="text"
            placeholder="Name (Optional)"
            value={hlsName}
            onChange={(e) => setHlsName(e.target.value)}
            className="hls-name-input"
          />
          <button onClick={() => handleSelect('hls')} className="selection-button small">📡 Load HLS</button>
        </div>

      </div>
    </div>
  );
}

export default SelectionScreenCopy;