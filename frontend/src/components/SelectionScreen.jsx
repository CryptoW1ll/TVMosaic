import React, { useEffect, useState } from 'react';
import '../index.css';
import IPTVPlayer from './IPTVPlayer';
import { fetchAllChannels } from './api'; 

const SelectionScreen = ({ onSelect }) => {
  // Input states
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [hlsUrl, setHlsUrl] = useState('');
  const [hlsName, setHlsName] = useState('');
  
  // Player states
  const [currentView, setCurrentView] = useState('selection'); // 'selection' | 'iptv'
  const [currentChannel, setCurrentChannel] = useState(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [slotId] = useState(1); // Could be made dynamic for multiple slots
  const [iptvChannels, setIptvChannels] = useState([]); // State to hold IPTV channels

  useEffect(() => {
    // Fetch channels from your API
    const fetchChannels = async () => {
      try {
        const channels = await fetchAllChannels();
        setIptvChannels(channels); // Assuming channels is an array of channel objects
        console.log('Fetched channels:', channels);
      } catch (error) {
        console.error('Error fetching channels:', error);
      }
    };
    fetchChannels();
  }, []);
    

  const handleSelect = (type) => {
    switch (type) {
      case 'iptv':
        setCurrentView('iptv');
        return;
      
      case 'youtube':
        if (!youtubeUrl.trim()) {
          alert('Please enter a YouTube URL');
          return;
        }
        try {
          new URL(youtubeUrl);
          onSelect(slotId, 'youtube', { url: youtubeUrl.trim() });
        } catch {
          alert('Please enter a valid YouTube URL');
        }
        return;
      
      case 'hls':
        if (!hlsUrl.trim()) {
          alert('Please enter an HLS URL');
          return;
        }
        try {
          new URL(hlsUrl);
          onSelect(slotId, 'hls', { 
            url: hlsUrl.trim(), 
            name: hlsName.trim() || 'HLS Stream' 
          });
        } catch {
          alert('Please enter a valid HLS URL (.m3u8)');
        }
        return;
      
      case 'tvGarden':
        // Example of opening in new tab
        window.open('https://example.com/tvgarden', '_blank');
        return;
      
      case 'jellyfin':
        onSelect(slotId, 'jellyfin');
        return;
      
      default:
        onSelect(slotId, type);
    }
  };

  const handleCloseIPTV = () => {
    setCurrentView('selection');
    setCurrentChannel(null);
  };

  // Render the IPTV player if in iptv view
  if (currentView === 'iptv') {
    return (
      // <div className="iptv-container">
      <div className="iptv-container bg-black h-full w-full flex flex-col items-center justify-center p-4">
        <IPTVPlayer
          identifier={slotId}
          channels={iptvChannels}
          initialChannel={currentChannel}
          isExpanded={isExpanded}
          hasAudio={audioEnabled}
          onToggleAudio={() => setAudioEnabled(!audioEnabled)}
          onToggleExpand={() => setIsExpanded(!isExpanded)}
          onClose={handleCloseIPTV}
          onChannelChange={setCurrentChannel}
        />
      </div>
    );
  }

  // Render the selection screen by default
  return (
    <div className="selection-screen bg-black h-full w-full flex flex-col items-center justify-center p-4">


      {/* Selection buttons */}
      <div className="button-grid grid grid-cols-2 gap-4 w-full max-w-md">
        <button
          className="selection-button bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
          onClick={() => handleSelect('iptv')}
        >
          📺 IPTV Channels
        </button>

        <button
          className="selection-button bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors"
          onClick={() => handleSelect('tvGarden')}
        >
          🌳 TV Garden
        </button>

        <button
          className="selection-button bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors"
          onClick={() => handleSelect('youtube')}
        >
          🎥 YouTube
        </button>

        <button
          className="selection-button bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors"
          onClick={() => handleSelect('jellyfin')}
        >
          🏠 Jellyfin
        </button>
      </div>
    </div>
  );
};

export default SelectionScreen;