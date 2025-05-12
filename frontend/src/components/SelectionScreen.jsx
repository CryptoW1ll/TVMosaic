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

      case 'plex':
      setCurrentView('plex');
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
        // window.open('https://example.com/tvgarden', '_blank');
        setCurrentView('tvgarden');
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
  else if (currentView === 'plex') {
    return (
      <iframe 
        className="plex-container bg-black h-full w-full flex flex-col items-center justify-center p-4"
        // src="https://watch.plex.tv/live-tv/channel/ufc-2"
        // src="https://app.plex.tv/desktop/#!/live-tv"
        src="https://watch.plex.tv/live-tv?_gl=1*1cv6qor*_gcl_au*MTM0NDM4OTA2OC4xNzQ3MDQyMjcz*_ga*Mjg5MDM4NDQuMTc0NjY5Mzk3MQ..*_ga_G6FQWNSENB*czE3NDcwNDIyNzQkbzIkZzAkdDE3NDcwNDIyNzQkajYwJGwwJGgw"
        title="Plex Player"
        width="100%"
        height="100%"
        frameBorder="0"
        allowFullScreen
        sandbox="allow-same-origin allow-scripts allow-popups allow-forms">
      </iframe>
    );
  }
  else if (currentView === 'tvgarden') {
    return (
      <iframe 
        className="plex-container bg-black h-full w-full flex flex-col items-center justify-center p-4"
        src="https://tv.garden/"
        title="TV Garden"
        width="100%"
        height="100%"
        frameBorder="0"
        allowFullScreen
        sandbox="allow-same-origin allow-scripts allow-popups allow-forms">
      </iframe>
    );
  }

  // Render the selection screen by default
  return (
    <div className="selection-screen bg-black h-full w-full flex flex-col items-center justify-center p-4">

      {/* Selection buttons */}
      {/* <div className="button-grid grid grid-cols-2 gap-4 w-full max-w-md"> */}
      <div className="button-grid grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md mx-auto">
        <button
          className="selection-button bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors text-lg sm:text-xl"
          onClick={() => handleSelect('iptv')}
              >
          📺 IPTV Channels
        </button>

        <button
          className="selection-button bg-orange-400 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors text-lg sm:text-xl"

          onClick={() => handleSelect('plex')}
        >
          📺 Plex
        </button>

        <button
              className="selection-button bg-green-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors text-lg sm:text-xl"

          onClick={() => handleSelect('tvGarden')}
        >
          🌳 TV Garden
        </button>

        <button
              className="selection-button bg-red-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors text-lg sm:text-xl"

          onClick={() => handleSelect('youtube')}
        >
          🎥 YouTube
        </button>

        <button
              className="selection-button bg-purple-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors text-lg sm:text-xl"

          onClick={() => handleSelect('jellyfin')}
        >
          🏠 Jellyfin
        </button>
      </div>
    </div>
  );
};

export default SelectionScreen;