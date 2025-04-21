import { useState, useEffect, useRef } from 'react';
import Hls from 'hls.js';
import './App.css';

// --- Import Components ---
import IPTVPlayer from './components/IPTVPlayer';
import Footer from './components/Footer';
// Remove HLSStream if rendering video directly
// import HLSStream from './components/HLSStream';
import Navbar from './components/Navbar';
import Player from './components/Player'; // For YouTube/other URLs via react-player
import Container from './components/Container';
import SelectionScreen from './components/SelectionScreen'; // Needs modification
import TVGarden from './components/TVGarden';
import { fetchAllChannels } from './components/api';
import Iframe from 'react-iframe'; // Keep if needed for TVGarden or others

// Assuming react-player is installed: npm install react-player
import ReactPlayer from 'react-player';

const INITIAL_SLOT_COUNT = 4; // Define how many grid slots

function App() {
  // --- State ---

  // State for each grid slot's content
  const [gridSlots, setGridSlots] = useState(
    // Initialize grid slots, each starting with 'selection' type
    Array.from({ length: INITIAL_SLOT_COUNT }, (_, i) => ({
      id: i,              // Unique ID for the slot (0, 1, 2, 3)
      type: 'selection',  // Current content type: 'selection', 'iptv', 'tvgarden', 'youtube', 'hls'
      data: null,         // Data needed for the type (e.g., { url: '', name: '' } for hls)
    }))
  );

  // IPTV channels (fetched once)
  const [iptvChannels, setIptvChannels] = useState([]);
  const [isLoadingIptv, setIsLoadingIptv] = useState(false);
  const [errorLoadingIptv, setErrorLoadingIptv] = useState(null);

  // UI State
  const [currentLayout, setCurrentLayout] = useState('grid'); // Default: 2x2 for 4 slots
  const [showLayoutOptions, setShowLayoutOptions] = useState(false);
  const [showStreamsMenu, setShowStreamsMenu] = useState(false); // Maybe remove if not managing HLS list separately

  // Interaction State (using slot IDs as identifiers)
  const [expandedVideoIdentifier, setExpandedVideoIdentifier] = useState(null); // Stores slot ID or null
  const [activeAudioIdentifier, setActiveAudioIdentifier] = useState(null); // Stores slot ID or null

  // Clock
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  // --- Refs ---
  // Use objects keyed by slot ID for refs that depend on slot content
  const videoRefs = useRef({}); // Refs for <video> elements used by HLS: { 0: videoEl, 2: videoEl }
  const hlsRefs = useRef({});   // Refs for HLS instances: { 0: hlsInstance, 2: hlsInstance }
  const containerRefs = useRef({}); // Refs for the container div of each slot (for fullscreen)
  const playerRefs = useRef({}); // Refs for ReactPlayer instances { 1: playerRef, 3: playerRef }


  // --- Effects ---

  // Clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch IPTV channels
  useEffect(() => {
    const loadChannels = async () => {
      setIsLoadingIptv(true);
      setErrorLoadingIptv(null);
      try {
        const channels = await fetchAllChannels();
        setIptvChannels(Array.isArray(channels) ? channels : []);
      } catch (error) {
        console.error("Failed to fetch IPTV channels:", error);
        setErrorLoadingIptv("Failed to load IPTV channels.");
        setIptvChannels([]);
      } finally {
        setIsLoadingIptv(false);
      }
    };
    loadChannels();
  }, []);


  // --- HLS Management Effect ---
  useEffect(() => {
    console.log("HLS Management Effect - gridSlots changed");

    // Get IDs of slots currently set to 'hls'
    const currentHlsSlotIds = gridSlots
      .filter(slot => slot.type === 'hls' && slot.data?.url)
      .map(slot => slot.id);

    // Get IDs of HLS instances currently managed
    const managedHlsSlotIds = Object.keys(hlsRefs.current).map(Number);

    // 1. Destroy HLS instances for slots that are NO LONGER 'hls' or have no URL
    managedHlsSlotIds.forEach(slotId => {
      if (!currentHlsSlotIds.includes(slotId)) {
        console.log(`HLS Cleanup: Destroying HLS for slot ${slotId}`);
        if (hlsRefs.current[slotId]) {
          hlsRefs.current[slotId].destroy();
        }
        // Clean up refs for the removed HLS instance
        delete hlsRefs.current[slotId];
        delete videoRefs.current[slotId];
      }
    });

    // 2. Initialize HLS for slots that ARE 'hls' but DON'T have an instance yet
    currentHlsSlotIds.forEach(slotId => {
      const videoElement = videoRefs.current[slotId];
      const slotData = gridSlots.find(s => s.id === slotId)?.data;

      // Only initialize if video element exists, URL exists, and HLS instance doesn't
      if (videoElement && slotData?.url && !hlsRefs.current[slotId]) {
        console.log(`HLS Setup: Initializing HLS for slot ${slotId}`);

        if (Hls.isSupported()) {
          const hls = new Hls({ maxBufferLength: 30, maxMaxBufferLength: 60 });
          hls.loadSource(slotData.url);
          hls.attachMedia(videoElement);

          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            videoElement.muted = (activeAudioIdentifier !== slotId);
            videoElement.play().catch(e => console.warn(`Autoplay prevented for HLS slot ${slotId}:`, e.message));
          });

          hls.on(Hls.Events.ERROR, (event, data) => {
            console.error(`HLS Error (Slot ${slotId}):`, data);
            // Optional: Add recovery logic here
            if (data.fatal) {
                hls.destroy();
                delete hlsRefs.current[slotId]; // Ensure ref is removed on fatal error
                 // Optionally reset the slot back to selection on fatal error
                 // resetSlot(slotId, "HLS Error: Stream failed to load");
            }
          });

          hlsRefs.current[slotId] = hls; // Store the instance

        } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
          // Native HLS playback
          videoElement.src = slotData.url;
          videoElement.muted = (activeAudioIdentifier !== slotId);
          videoElement.addEventListener('loadedmetadata', () => {
             videoElement.play().catch(e => console.warn(`Autoplay prevented for native HLS slot ${slotId}:`, e.message));
          });
           videoElement.addEventListener('error', (e) => {
             console.error(`Native HLS Error (Slot ${slotId}):`, videoElement.error);
             // resetSlot(slotId, "HLS Error: Stream failed to load");
           });
           // Note: No HLS instance to store for native playback
           // We might need a flag to know native is active if we need to detach src later.
        } else {
             console.warn(`HLS not supported for slot ${slotId}`);
             // resetSlot(slotId, "HLS not supported by browser");
        }
      }
    });

    // Dependency: This effect depends on the entire gridSlots structure
    // and the active audio identifier (to set initial mute state correctly).
  }, [gridSlots, activeAudioIdentifier]);


  // --- Mute/Unmute Effect ---
  useEffect(() => {
    // Mute/Unmute HLS video elements
    Object.keys(videoRefs.current).forEach(slotIdKey => {
      const slotId = Number(slotIdKey);
      const videoElement = videoRefs.current[slotId];
      if (videoElement) {
        videoElement.muted = (activeAudioIdentifier !== slotId);
      }
    });

    // Mute/Unmute ReactPlayer instances (YouTube, etc.)
    // ReactPlayer's muted prop is controlled directly in the render based on activeAudioIdentifier
    // Force re-render might be needed if ReactPlayer doesn't update on prop change alone,
    // but usually changing the 'muted' prop works.

    // Mute/Unmute IPTV Player (needs internal handling or prop passing)
    // The IPTVPlayer component itself needs to react to the `hasAudio` prop changing.

  }, [activeAudioIdentifier, gridSlots]); // Re-run if active audio or grid content changes

  // --- Fullscreen Change Effect ---
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && expandedVideoIdentifier !== null) {
        setExpandedVideoIdentifier(null);
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [expandedVideoIdentifier]);

  // --- Handlers ---

  // Called by SelectionScreen when a choice is made
  const handleSelect = (slotId, type, data = null) => {
    console.log(`Setting slot ${slotId} to type: ${type}`, data);

    // **Important:** Clean up HLS if the slot *was* HLS before changing
    const currentSlot = gridSlots.find(s => s.id === slotId);
    if (currentSlot?.type === 'hls' && type !== 'hls') {
       if (hlsRefs.current[slotId]) {
          console.log(`HLS Cleanup: Destroying HLS for slot ${slotId} due to type change.`);
          hlsRefs.current[slotId].destroy();
          delete hlsRefs.current[slotId];
          delete videoRefs.current[slotId]; // Remove video ref as well
       }
       // Also handle native HLS cleanup if src was set directly
       if (videoRefs.current[slotId] && videoRefs.current[slotId].src && !Hls.isSupported()) {
           videoRefs.current[slotId].removeAttribute('src');
           videoRefs.current[slotId].load();
           delete videoRefs.current[slotId];
       }
    }
     // Clean up ReactPlayer ref if changing away from youtube/player type
     if (currentSlot?.type === 'youtube' && type !== 'youtube') {
        delete playerRefs.current[slotId];
     }
     // Add similar cleanup for other types if they hold specific refs


    setGridSlots(prevSlots =>
      prevSlots.map(slot =>
        slot.id === slotId
          ? { ...slot, type: type, data: data } // Update type and data
          : slot
      )
    );
     // Reset audio/expand if the changed slot was active
     if (activeAudioIdentifier === slotId) setActiveAudioIdentifier(null);
     if (expandedVideoIdentifier === slotId) setExpandedVideoIdentifier(null);
  };

   // Handler to reset a slot back to the selection screen
   const resetSlot = (slotId, message = null) => {
       console.log(`Resetting slot ${slotId}`);
       // Use handleSelect to perform cleanup logic correctly
       handleSelect(slotId, 'selection', message ? { message: message } : null);
       // Ensure fullscreen is exited if this slot was expanded
       if (expandedVideoIdentifier === slotId && document.fullscreenElement) {
           document.exitFullscreen().catch(console.error);
       }
   };


  const handleToggleLayoutOptions = () => setShowLayoutOptions(prev => !prev);
  const handleToggleStreamsMenu = () => setShowStreamsMenu(prev => !prev); // Keep or remove?
  const handleMuteAll = () => setActiveAudioIdentifier(null);

  // Toggle audio for a specific slot ID
  const handleToggleAudio = (slotId) => {
    setActiveAudioIdentifier(prevId => (prevId === slotId ? null : slotId));
  };

  // Toggle expand for a specific slot ID
  const handleToggleExpand = (slotId) => {
    const elementToFullscreen = containerRefs.current[slotId]; // Get the container div

    if (document.fullscreenElement) {
      document.exitFullscreen()
        .catch(err => console.error("Error exiting fullscreen:", err));
        // State update happens via event listener
    } else if (elementToFullscreen) {
      elementToFullscreen.requestFullscreen({ navigationUI: "hide" })
        .then(() => {
          setExpandedVideoIdentifier(slotId); // Set state *after* successful request
        })
        .catch(err => {
          console.error(`Fullscreen request failed for slot ${slotId}:`, err);
        });
    } else {
       console.warn(`Could not find container element for slot ${slotId}`);
    }
  };

  const changeLayout = (layout) => {
    setCurrentLayout(layout);
    setShowLayoutOptions(false);
  };

  // Helper to get layout class (adjust grid based on INITIAL_SLOT_COUNT if needed)
  const getGridLayoutClass = () => {
    // Basic example assuming 4 slots = 2x2
    if (INITIAL_SLOT_COUNT === 4) return 'grid-layout'; // Assumes grid-layout is 2x2
    if (INITIAL_SLOT_COUNT === 9) return 'three-by-three-layout';
    // Add more specific logic based on currentLayout and INITIAL_SLOT_COUNT
    return 'grid-layout'; // Default
  };

  // --- Render Function for Slot Content ---
  const renderSlotContent = (slot) => {
    const slotId = slot.id;
    const isActiveAudio = activeAudioIdentifier === slotId;
    const isExpanded = expandedVideoIdentifier === slotId;

    // Common controls (Mute/Expand/Close) - can be refactored into a component
    const commonControls = (typeSupportsAudio = true, typeSupportsExpand = true) => (
      <div className="video-controls slot-controls">
        {typeSupportsAudio && (
          <button onClick={() => handleToggleAudio(slotId)} title={isActiveAudio ? "Mute" : "Unmute"}>
            {isActiveAudio ? "🔇" : "🔊"}
          </button>
        )}
        {typeSupportsExpand && (
          <button onClick={() => handleToggleExpand(slotId)} title={isExpanded ? "Shrink" : "Expand"}>
            {isExpanded ? "🇽" : "⤢"}
          </button>
        )}
        <button onClick={() => resetSlot(slotId)} title="Close" className="close-btn">✖️</button>
      </div>
    );

    switch (slot.type) {
      case 'selection':
        return <SelectionScreen slotId={slotId} onSelect={handleSelect} initialMessage={slot.data?.message} />;

      case 'iptv':
        if (isLoadingIptv) return <div className="loading-message">Loading IPTV...</div>;
        if (errorLoadingIptv) return <div className="error-message">{errorLoadingIptv} <button onClick={() => resetSlot(slotId)}>X</button></div>;
        if (iptvChannels.length === 0) return <div className="no-channels-message">No IPTV Channels <button onClick={() => resetSlot(slotId)}>X</button></div>;
        return (
           <>
            {/* IPTVPlayer needs to handle its own internal state */}
            <IPTVPlayer
                channels={iptvChannels}
                identifier={slotId} // Pass slotId for potential internal use
                hasAudio={isActiveAudio} // Tell player if it should be unmuted
                // IPTV player might need its own internal fullscreen logic or coordination
            />
            {commonControls(true, true)}
            {/* Note: Expand on IPTVPlayer might need specific implementation */}
           </>
        );

      case 'tvgarden':
        return (
           <>
            <TVGarden src="https://tv.garden/" title={`TV Garden ${slotId}`} />
             {commonControls(false, true)} {/* TV Garden likely has no direct audio control from here */}
           </>
        );

      case 'youtube': // Using ReactPlayer
        if (!slot.data?.url) {
          resetSlot(slotId, 'Missing YouTube URL'); // Go back if URL is missing
          return <div className="error-message">Missing YouTube URL...</div>;
        }
        return (
          <>
            <ReactPlayer
              ref={el => playerRefs.current[slotId] = el}
              url={slot.data.url}
              playing={isActiveAudio} // Autoplay if it has audio focus
              muted={!isActiveAudio} // Mute if it doesn't have audio focus
              controls // Show native controls (optional)
              width="100%"
              height="100%"
              onError={(e) => {
                  console.error(`ReactPlayer Error (Slot ${slotId}, URL: ${slot.data.url}):`, e);
                  resetSlot(slotId, `Error loading YouTube video.`);
              }}
              // onPlay={() => setActiveAudioIdentifier(slotId)} // Optionally grab audio focus on play
            />
            {commonControls(true, true)}
          </>
        );

      case 'hls':
        if (!slot.data?.url) {
            resetSlot(slotId, 'Missing HLS URL');
            return <div className="error-message">Missing HLS URL...</div>;
        }
        return (
            <>
              {/* Container needed for controls overlay */}
              <div className="video-player-container">
                 <video
                    ref={el => videoRefs.current[slotId] = el}
                    className="stream-video"
                    playsInline
                    // Muted state is handled by effect
                    // Autoplay is attempted by effect
                  />
              </div>
               <div className="video-controls slot-controls hls-controls">
                   <span className="stream-name" title={slot.data?.url}>{slot.data?.name || 'HLS Stream'}</span>
                    <button onClick={() => handleToggleAudio(slotId)} title={isActiveAudio ? "Mute" : "Unmute"}>
                        {isActiveAudio ? "🔇" : "🔊"}
                    </button>
                    <button onClick={() => handleToggleExpand(slotId)} title={isExpanded ? "Shrink" : "Expand"}>
                        {isExpanded ? "🇽" : "⤢"}
                    </button>
                    <button onClick={() => resetSlot(slotId)} title="Close" className="close-btn">✖️</button>
                </div>
            </>
        );

      default:
        return <div className="error-message">Unknown slot type <button onClick={() => resetSlot(slotId)}>X</button></div>;
    }
  };


  // --- JSX ---
  return (
    <div className="app-container">
      <Navbar />

      <div className="mosaic-container">
        <div className={`mosaic ${getGridLayoutClass()}`}>
          {/* Map over gridSlots state to render each slot */}
          {gridSlots.map((slot) => (
            <div
              key={slot.id}
              ref={el => containerRefs.current[slot.id] = el} // Ref for the slot's container div
              className={`grid-item video-container-wrapper ${expandedVideoIdentifier === slot.id ? 'expanded' : ''}`}
              // Add a class based on type for specific styling if needed: e.g. `slot-type-${slot.type}`
            >
              {/* Render the dynamic content for this slot */}
              {renderSlotContent(slot)}
            </div>
          ))}
        </div>
      </div>

      {/* Layout options pop-up (can be kept if desired) */}
       {/* <div className={`layout-options ${showLayoutOptions ? 'show' : ''}`}> ... </div> */}

       {/* Streams menu might not be relevant anymore unless managing a global list */}
       {/* <div className={`streams-menu ${showStreamsMenu ? 'show' : ''}`}> ... </div> */}

      <Footer
        // Pass props needed by Footer, potentially removing stream menu toggle
        isLayoutOptionsOpen={showLayoutOptions}
        onToggleLayoutOptions={handleToggleLayoutOptions}
        // isStreamsMenuOpen={showStreamsMenu}
        // onToggleStreamsMenu={handleToggleStreamsMenu}
        onMuteAll={handleMuteAll}
        currentTime={time}
      />
    </div>
  );
}

export default App;