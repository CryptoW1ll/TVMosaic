import React, { useState } from 'react';
import '../index.css';
import IPTVPlayer from './IPTVPlayer';

function SelectionScreen({ onSelect }) {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [hlsUrl, setHlsUrl] = useState("");
  const [hlsName, setHlsName] = useState("");
  const [slotId, setSlotId] = useState(1); // Placeholder for slotId
  
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
    } else if (type === 'iptv') {
      // Handle IPTV selection
      onSelect(slotId, 'iptv');
    } else {
      // For types without input data (IPTV, TVGarden)
      onSelect(slotId, type);

      {
        // For TVGarden, you can add any specific logic here if needed
        if (type === 'tvGarden') {
          // Example: open a specific URL or perform an action
          window.open('https://example.com/tvgarden', '_blank');
        }

        switch (type) {
          case 'iptv':
            // Handle IPTV selection

            <IPTVPlayer />
            break;
          case 'tvGarden':
            // Handle TV Garden selection
            break;
          case 'youtube':
            // Handle YouTube selection
            break;
          case 'jellyfin':
            // Handle Jellyfin selection
            break;
          default:
            break;
        }
        
      }
      
    }
  };

  return (
    <div className="bg-black h-full w-full flex items-center justify-center">
      {/* Container for buttons */}
      <div className="flex flex-row items-center justify-center space-x-4">
        {/* Option 1: IPTV */}
        <button
          className="selection-button bg-blue-600 text-white px-4 py-2 rounded-md"
          onClick={() => handleSelect('iptv')}
        >
          📺 IPTV Channels
        </button>

        {/* Option 2: TV Garden */}
        <button
          className="selection-button bg-green-600 text-white px-4 py-2 rounded-md"
          onClick={() => handleSelect('tvGarden')}
        >
          🌳 TV Garden
        </button>

        {/* Option 3: YouTube */}
        <button
          className="selection-button bg-red-600 text-white px-4 py-2 rounded-md"
          onClick={() => handleSelect('youtube')}
        >
          🎥 YouTube
        </button>

        {/* Jellyfin */}
        <button
          className="selection-button bg-purple-600 text-white px-4 py-2 rounded-md"
          onClick={() => handleSelect('jellyfin')}
        >
          📺 Jellyfin
        </button>
      </div>
    </div>
  );
}

export default SelectionScreen;
