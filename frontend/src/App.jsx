import { useState, useEffect, useRef, useCallback } from 'react';
import Hls from 'hls.js';
import {
  FaVolumeMute,
  FaVolumeUp,
  FaExpand,
  FaCompress,
  FaTimes
} from 'react-icons/fa'; // <--- ADD THIS IMPORT
import './App.css'; // Global styles

// --- Import Components ---
import IPTVPlayer from './components/IPTVPlayer';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import SelectionScreen from './components/SelectionScreen';
import TVGarden from './components/TVGarden'; 
import { fetchAllChannels } from './components/api';
import ReactPlayer from 'react-player';

const INITIAL_SLOT_COUNT = 4; // Define how many grid slots initially

function App() {
    // --- State ---

    // State for each grid slot's content
    const [gridSlots, setGridSlots] = useState(() =>
        Array.from({ length: INITIAL_SLOT_COUNT }, (_, i) => ({
            id: i,
            type: 'selection', // Start with selection screen
            data: null,        // e.g., { url: '', name: '' } for hls/youtube, { message: 'Error' } for selection error
            // Added state for IPTV channel within the slot
            iptvChannel: null, // Store the selected IPTV channel object here
        }))
    );

    // IPTV channels (fetched once)
    const [iptvChannels, setIptvChannels] = useState([]);
    const [isLoadingIptv, setIsLoadingIptv] = useState(true); // Start loading initially
    const [errorLoadingIptv, setErrorLoadingIptv] = useState(null);

    // UI State
    const [currentLayout, setCurrentLayout] = useState('grid'); // Default layout
    const [showLayoutOptions, setShowLayoutOptions] = useState(false);
    // const [showStreamsMenu, setShowStreamsMenu] = useState(false); // Removed if not used

    // Interaction State (using slot IDs as identifiers)
    const [expandedVideoIdentifier, setExpandedVideoIdentifier] = useState(null); // Stores slot ID or null
    const [activeAudioIdentifier, setActiveAudioIdentifier] = useState(null); // Stores slot ID or null

    // Clock
    const [time, setTime] = useState(() => new Date().toLocaleTimeString());

    // --- Refs ---
    // Use objects keyed by slot ID for refs that depend on slot content
    const videoRefs = useRef({}); // Refs for <video> elements used by HLS: { 0: videoEl, 2: videoEl }
    const hlsRefs = useRef({});   // Refs for HLS instances: { 0: hlsInstance, 2: hlsInstance }
    const containerRefs = useRef({}); // Refs for the container div of each slot (for fullscreen)
    const playerRefs = useRef({}); // Refs for ReactPlayer instances { 1: playerRef, 3: playerRef }

    // --- Effects ---

    // Clock Update
    useEffect(() => {
        const timerId = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
        return () => clearInterval(timerId);
    }, []);

    // Fetch IPTV Channels on Mount
    useEffect(() => {
        const loadChannels = async () => {
            setIsLoadingIptv(true);
            setErrorLoadingIptv(null);
            try {
                const channels = await fetchAllChannels();
                if (Array.isArray(channels)) {
                    setIptvChannels(channels);
                    console.log(`Fetched ${channels.length} IPTV channels.`);
                } else {
                     throw new Error("Fetched data is not an array");
                }
            } catch (error) {
                console.error("Failed to fetch IPTV channels:", error);
                setErrorLoadingIptv(`Failed to load IPTV channels: ${error.message}`);
                setIptvChannels([]);
            } finally {
                setIsLoadingIptv(false);
            }
        };
        loadChannels();
    }, []); // Empty dependency array ensures this runs only once on mount

    // --- HLS Management Effect ---
    // Encapsulate HLS logic within useCallback to prevent unnecessary recreation
    const manageHlsInstances = useCallback(() => {
        console.log("HLS Management Effect Triggered");

        const currentHlsSlotIds = gridSlots
            .filter(slot => slot.type === 'hls' && slot.data?.url)
            .map(slot => slot.id);
        const managedHlsSlotIds = Object.keys(hlsRefs.current).map(Number);

        // 1. Destroy HLS for slots no longer 'hls' or missing URL/video element
        managedHlsSlotIds.forEach(slotId => {
            const videoElement = videoRefs.current[slotId];
            const slot = gridSlots.find(s => s.id === slotId);
            if (!currentHlsSlotIds.includes(slotId) || !videoElement || !slot?.data?.url) {
                console.log(`HLS Cleanup: Destroying HLS for slot ${slotId}`);
                if (hlsRefs.current[slotId]) {
                    hlsRefs.current[slotId].destroy();
                }
                // Clean up refs
                delete hlsRefs.current[slotId];
                // Don't delete videoRef here, it might be needed if type changes back
                 // Detach source for native HLS if needed
                 if (videoElement && videoElement.src && !Hls.isSupported()) {
                     videoElement.removeAttribute('src');
                     videoElement.load();
                     console.log(`HLS Cleanup: Removed native source for slot ${slotId}`);
                 }
            }
        });

        // 2. Initialize HLS for 'hls' slots that need it
        currentHlsSlotIds.forEach(slotId => {
            const videoElement = videoRefs.current[slotId];
            const slotData = gridSlots.find(s => s.id === slotId)?.data;

            // Only initialize if video element exists, URL exists, and HLS instance doesn't
            if (videoElement && slotData?.url && !hlsRefs.current[slotId] && !videoElement.src) { // Added !videoElement.src for native check
                console.log(`HLS Setup: Initializing HLS for slot ${slotId} - ${slotData.name}`);

                if (Hls.isSupported()) {
                    const hls = new Hls({ maxBufferLength: 30, maxMaxBufferLength: 60 });
                    hls.loadSource(slotData.url);
                    hls.attachMedia(videoElement);
                    hls.slotId = slotId; // Attach ID for error reporting

                    hls.on(Hls.Events.MANIFEST_PARSED, () => {
                        console.log(`HLS Manifest Parsed for slot ${slotId}`);
                        videoElement.muted = (activeAudioIdentifier !== slotId);
                        videoElement.play().catch(e => console.warn(`Autoplay prevented for HLS slot ${slotId}:`, e.message));
                    });
                    hls.on(Hls.Events.ERROR, (event, data) => {
                        console.error(`HLS Error (Slot ${data.hls.slotId || slotId}):`, data);
                        if (data.fatal) {
                            console.warn(`Fatal HLS Error on slot ${slotId}. Destroying instance.`);
                            hls.destroy();
                            delete hlsRefs.current[slotId];
                            // Reset slot on fatal error
                            handleSelect(slotId, 'selection', { message: `HLS Error: ${data.details || data.type}` });
                        }
                    });
                    hlsRefs.current[slotId] = hls; // Store the instance

                } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
                    console.log(`HLS Setup: Using native HLS for slot ${slotId}`);
                    videoElement.src = slotData.url;
                    videoElement.muted = (activeAudioIdentifier !== slotId);
                    const onLoadedMetadata = () => {
                         console.log(`Native HLS metadata loaded for slot ${slotId}`);
                         videoElement.play().catch(e => console.warn(`Autoplay prevented for native HLS slot ${slotId}:`, e.message));
                    };
                    const onError = () => {
                         console.error(`Native HLS Error (Slot ${slotId}):`, videoElement.error);
                         handleSelect(slotId, 'selection', { message: `Native HLS Error: Playback failed.` });
                         // Cleanup listeners
                         videoElement.removeEventListener('loadedmetadata', onLoadedMetadata);
                         videoElement.removeEventListener('error', onError);
                    };
                     // Remove old listeners before adding new ones
                     videoElement.removeEventListener('loadedmetadata', onLoadedMetadata);
                     videoElement.removeEventListener('error', onError);
                     // Add new listeners
                    videoElement.addEventListener('loadedmetadata', onLoadedMetadata, { once: true }); // Use once option
                    videoElement.addEventListener('error', onError, { once: true });
                    videoElement.load(); // Start loading the source

                } else {
                    console.warn(`HLS not supported for slot ${slotId}`);
                    handleSelect(slotId, 'selection', { message: "HLS not supported by browser" });
                }
            } else if (videoElement && slotData?.url && hlsRefs.current[slotId]) {
                // console.log(`HLS instance already exists for slot ${slotId}`); // Debug log
            } else if (videoElement && videoElement.src && !Hls.isSupported()) {
                 // console.log(`Native HLS source already set for slot ${slotId}`); // Debug log
            }
        });

    }, [gridSlots, activeAudioIdentifier]); // Dependencies: gridSlots and activeAudioIdentifier

    useEffect(() => {
        manageHlsInstances();
        // Return a cleanup function that destroys all managed HLS instances on component unmount
        return () => {
            console.log("App Unmount: Cleaning up all HLS instances.");
            Object.keys(hlsRefs.current).forEach(slotIdKey => {
                 const slotId = Number(slotIdKey);
                 if (hlsRefs.current[slotId]) {
                     console.log(`HLS Cleanup (Unmount): Destroying HLS for slot ${slotId}`);
                     hlsRefs.current[slotId].destroy();
                     delete hlsRefs.current[slotId];
                 }
                 // Also cleanup video refs potentially holding native src
                 if(videoRefs.current[slotId] && videoRefs.current[slotId].src && !Hls.isSupported()) {
                     videoRefs.current[slotId].removeAttribute('src');
                     videoRefs.current[slotId].load();
                 }
            });
        };
    }, [manageHlsInstances]); // Run whenever manageHlsInstances changes (due to its dependencies)


    // --- Mute/Unmute Effect ---
    useEffect(() => {
        // Mute/Unmute HLS/Native video elements
        Object.keys(videoRefs.current).forEach(slotIdKey => {
            const slotId = Number(slotIdKey);
            const videoElement = videoRefs.current[slotId];
            // Check if the slot is actually HLS type before muting
            const slot = gridSlots.find(s => s.id === slotId);
            if (videoElement && slot?.type === 'hls') {
                const shouldBeMuted = activeAudioIdentifier !== slotId;
                if (videoElement.muted !== shouldBeMuted) {
                   // console.log(`Setting video element muted state for slot ${slotId} to ${shouldBeMuted}`);
                   videoElement.muted = shouldBeMuted;
                }
            }
        });

        // Mute/Unmute ReactPlayer instances - handled by passing the `muted` prop directly in render.
        // Mute/Unmute IPTV Player - handled by passing the `hasAudio` prop directly in render.

    }, [activeAudioIdentifier, gridSlots]); // Re-run if active audio or grid content changes

    // --- Fullscreen Change Effect ---
    useEffect(() => {
        const handleFullscreenChange = () => {
            // If fullscreen is exited externally, reset the expanded state
            if (!document.fullscreenElement && expandedVideoIdentifier !== null) {
                console.log("Fullscreen exited externally, resetting expanded state.");
                setExpandedVideoIdentifier(null);
            }
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange); // Safari
        document.addEventListener('mozfullscreenchange', handleFullscreenChange); // Firefox
        document.addEventListener('MSFullscreenChange', handleFullscreenChange); // IE/Edge
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
             document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
             document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
             document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
        };
    }, [expandedVideoIdentifier]); // Depend on the expanded state

    // --- Handlers ---

    // Handler to update a slot's type and data, includes cleanup
    const handleSelect = useCallback((slotId, type, data = null, iptvChannelData = null) => {
        console.log(`Setting slot ${slotId} to type: ${type}`, data, iptvChannelData);

        setGridSlots(prevSlots => {
            const currentSlot = prevSlots.find(s => s.id === slotId);
            if (!currentSlot) return prevSlots; // Should not happen

            // --- Cleanup based on the *previous* type ---
            if (currentSlot.type === 'hls' && type !== 'hls') {
                console.log(`Cleanup: Slot ${slotId} changing from HLS.`);
                if (hlsRefs.current[slotId]) {
                    hlsRefs.current[slotId].destroy();
                    delete hlsRefs.current[slotId];
                }
                 // Clean up native HLS source if it was active
                 if (videoRefs.current[slotId] && videoRefs.current[slotId].src && !Hls.isSupported()) {
                    videoRefs.current[slotId].removeAttribute('src');
                    videoRefs.current[slotId].load(); // Reset video state
                 }
                 // Keep videoRef, it might be reused
            }
            if (currentSlot.type === 'youtube' && type !== 'youtube') {
                console.log(`Cleanup: Slot ${slotId} changing from YouTube.`);
                // ReactPlayer cleanup is mostly automatic, but clear ref
                delete playerRefs.current[slotId];
            }
             if (currentSlot.type === 'iptv' && type !== 'iptv') {
                 console.log(`Cleanup: Slot ${slotId} changing from IPTV.`);
                 // IPTVPlayer handles its own internal HLS cleanup via its useEffect
                 // No specific App-level ref cleanup needed here unless IPTVPlayer exposed something
             }
            // Add cleanup for other types if necessary

            // Update the specific slot
            return prevSlots.map(slot =>
                slot.id === slotId
                    ? { ...slot, type: type, data: data, iptvChannel: iptvChannelData } // Update type, data, and IPTV channel
                    : slot
            );
        });

        // Reset audio/expand if the changed slot was active/expanded
        if (activeAudioIdentifier === slotId) {
            setActiveAudioIdentifier(null);
        }
        if (expandedVideoIdentifier === slotId) {
             // If the slot being changed was fullscreen, exit fullscreen
            if (document.fullscreenElement) {
                document.exitFullscreen().catch(console.error);
            }
            setExpandedVideoIdentifier(null); // Reset state regardless
        }
    }, [activeAudioIdentifier, expandedVideoIdentifier]); // Dependencies for cleanup logic

    // Handler to reset a slot back to the selection screen
    const resetSlot = useCallback((slotId, message = null) => {
        console.log(`Resetting slot ${slotId} to selection screen.`);
        handleSelect(slotId, 'selection', message ? { message: message } : null, null); // Pass null for iptvChannel
    }, [handleSelect]);


    // UI Handlers
    const handleToggleLayoutOptions = () => setShowLayoutOptions(prev => !prev);
    // const handleToggleStreamsMenu = () => setShowStreamsMenu(prev => !prev); // Remove if not used
    const handleMuteAll = () => {
         console.log("Muting all slots.");
         setActiveAudioIdentifier(null);
    };

    // Toggle audio focus for a specific slot ID
    const handleToggleAudio = useCallback((slotId) => {
        console.log(`Toggling audio for slot ${slotId}. Current active: ${activeAudioIdentifier}`);
        setActiveAudioIdentifier(prevId => {
            const newActiveId = prevId === slotId ? null : slotId;
            console.log(`New active audio slot: ${newActiveId}`);
            return newActiveId;
        });
    }, [activeAudioIdentifier]); // Dependency is important


    // Toggle fullscreen for a specific slot ID
    const handleToggleExpand = useCallback((slotId) => {
        const containerElement = containerRefs.current[slotId];
        console.log(`Toggling expand for slot ${slotId}. Current expanded: ${expandedVideoIdentifier}`);

        if (expandedVideoIdentifier === slotId) {
            // Currently expanded, so exit
            if (document.fullscreenElement) {
                document.exitFullscreen()
                    .then(() => console.log(`Exited fullscreen for slot ${slotId}`))
                    .catch(err => console.error("Error exiting fullscreen:", err))
                    .finally(() => {
                         // State is reset via the fullscreenchange event listener
                         // setExpandedVideoIdentifier(null); // Can be redundant if listener works
                    });
            } else {
                 // Fallback if somehow state is expanded but not in fullscreen mode
                 setExpandedVideoIdentifier(null);
            }
        } else if (containerElement) {
             // Not expanded, or different slot expanded, so request fullscreen for this one
             // Exit current fullscreen first if another slot is expanded
             const enterFullscreen = () => {
                 containerElement.requestFullscreen({ navigationUI: "hide" })
                    .then(() => {
                        console.log(`Entered fullscreen for slot ${slotId}`);
                        setExpandedVideoIdentifier(slotId); // Set state *after* successful request
                    })
                    .catch(err => {
                        console.error(`Fullscreen request failed for slot ${slotId}:`, err);
                        // Ensure state is null if request fails
                        setExpandedVideoIdentifier(null);
                    });
             };

             if (document.fullscreenElement) {
                 document.exitFullscreen()
                    .then(enterFullscreen) // Enter new fullscreen after exiting old one
                    .catch(err => {
                         console.error("Error exiting previous fullscreen before expanding new:", err);
                         // Still try to enter fullscreen for the new slot
                         enterFullscreen();
                    });
             } else {
                  // No element is currently fullscreen, directly request
                  enterFullscreen();
             }
        } else {
            console.warn(`Could not find container element ref for slot ${slotId} to toggle expand.`);
        }
    }, [expandedVideoIdentifier]); // Dependency on expanded state

    // Layout changer (example)
    const changeLayout = (layout) => {
        setCurrentLayout(layout); // Example: 'grid', 'focus-1', 'pip' etc.
        setShowLayoutOptions(false);
        // Adjust INITIAL_SLOT_COUNT or gridSlots array if layout implies different number of slots
        console.log(`Layout changed to: ${layout}`);
    };

    // Helper to get CSS class for the grid layout
    const getGridLayoutClass = () => {
        // Add logic based on currentLayout and potentially slot count
        if (currentLayout === 'grid') {
            if (INITIAL_SLOT_COUNT === 9) return 'three-by-three-layout';
            if (INITIAL_SLOT_COUNT === 1) return 'single-slot-layout';
            return 'grid-layout'; // Default 2x2 for 4 slots
        }
        // Add other layout classes: 'focus-layout-0', 'pip-layout', etc.
        return 'grid-layout'; // Fallback
    };

    // --- Render Function for Individual Slot Content ---
    const renderSlotContent = (slot) => {
        const slotId = slot.id;
        const isActiveAudio = activeAudioIdentifier === slotId;
        const isExpanded = expandedVideoIdentifier === slotId;

        // Common controls (Mute/Expand/Close) - Used for types OTHER than IPTV
        const commonControls = (typeSupportsAudio = true, typeSupportsExpand = true) => (
            <div className="video-controls slot-controls common-controls">
                {/* Optional: Title display within common controls */}
                 <span className="stream-name" title={slot.data?.url || slot.data?.name}>
                    {slot.type === 'youtube' ? 'YouTube' : slot.type === 'hls' ? (slot.data?.name || 'HLS Stream') : ''}
                 </span>
                <div className="control-buttons">
                    {typeSupportsAudio && (
                        <button onClick={() => handleToggleAudio(slotId)} title={isActiveAudio ? "Mute" : "Unmute"} aria-label={isActiveAudio ? "Mute" : "Unmute"}>
                             {isActiveAudio ? <FaVolumeUp /> : <FaVolumeMute />}
                        </button>
                    )}
                    {typeSupportsExpand && (
                        <button onClick={() => handleToggleExpand(slotId)} title={isExpanded ? "Exit Fullscreen" : "Toggle Fullscreen"} aria-label={isExpanded ? "Exit Fullscreen" : "Toggle Fullscreen"}>
                            {isExpanded ? <FaCompress /> : <FaExpand />}
                        </button>
                    )}
                    <button onClick={() => resetSlot(slotId)} title="Close" aria-label="Close" className="close-btn">
                         <FaTimes />
                    </button>
                </div>
            </div>
        );

        switch (slot.type) {
            case 'selection':
                return <SelectionScreen
                            slotId={slotId}
                            onSelect={handleSelect} // Use the main handler
                            initialMessage={slot.data?.message}
                            isLoadingIptv={isLoadingIptv} // Pass loading state for IPTV button
                            hasIptvChannels={iptvChannels.length > 0} // Pass channel availability
                            hasIptvError={!!errorLoadingIptv} // Pass error state
                        />;

            case 'iptv':
                 // Show loading/error directly in the slot if channels haven't loaded yet for the app
                if (isLoadingIptv) return <div className="loading-message">Loading IPTV Channel List... <button onClick={() => resetSlot(slotId)} className="inline-close-btn">✖️</button></div>;
                if (errorLoadingIptv) return <div className="error-message">{errorLoadingIptv} <button onClick={() => resetSlot(slotId)} className="inline-close-btn">✖️</button></div>;
                if (!iptvChannels || iptvChannels.length === 0) return <div className="no-channels-message">No IPTV Channels Available <button onClick={() => resetSlot(slotId)} className="inline-close-btn">✖️</button></div>;

                 // Render the IPTVPlayer component, passing necessary props
                return (
                    <IPTVPlayer
                        key={`iptv-${slotId}`} // Add key for component stability if needed
                        identifier={slotId}
                        channels={iptvChannels}
                        initialChannel={slot.iptvChannel} // Pass the specific channel selected for this slot
                        hasAudio={isActiveAudio} // Controlled by App state
                        isExpanded={isExpanded}   // Controlled by App state
                        onToggleAudio={() => handleToggleAudio(slotId)} // Link to App handler
                        onToggleExpand={() => handleToggleExpand(slotId)} // Link to App handler
                        onClose={() => resetSlot(slotId)} // Link to App handler
                        // Optional: Propagate channel/category changes up if needed elsewhere
                        // onChannelChange={(channel) => console.log(`Slot ${slotId} changed IPTV channel to ${channel.name}`)}
                        // onCategoryChange={(category) => console.log(`Slot ${slotId} changed IPTV category to ${category}`)}
                    />
                    // Note: IPTVPlayer renders its own controls, so commonControls are not used here.
                );

            case 'tvgarden':
                return (
                    <>
                        <TVGarden src="https://tv.garden/" title={`TV Garden Slot ${slotId}`} />
                        {/* TV Garden has no direct audio control from App, expand/close are available */}
                        {commonControls(false, true)}
                    </>
                );

            case 'youtube':
                if (!slot.data?.url) {
                     // Should ideally be caught by handleSelect, but render fallback just in case
                    resetSlot(slotId, 'Missing YouTube URL');
                    return <div className="error-message">Missing YouTube URL... <button onClick={() => resetSlot(slotId)} className="inline-close-btn">✖️</button></div>;
                }
                return (
                    <>
                        <ReactPlayer
                            ref={el => { if (el) playerRefs.current[slotId] = el; else delete playerRefs.current[slotId]; }} // Assign or clear ref
                            url={slot.data.url}
                            playing={true} // Let ReactPlayer manage play state based on visibility/interaction? Set to true to attempt play.
                            volume={isActiveAudio ? 0.8 : 0} // Control volume directly (0 = muted)
                            muted={!isActiveAudio} // Also use muted prop for clarity/compatibility
                            controls // Show native controls (recommended for YouTube)
                            width="100%"
                            height="100%"
                            config={{
                                youtube: { playerVars: { showinfo: 0, modestbranding: 1, autoplay: 1 } } // Autoplay attempt
                            }}
                            onError={(e, data, hlsInstance) => { // Added params
                                console.error(`ReactPlayer Error (Slot ${slotId}, URL: ${slot.data.url}):`, e, data);
                                let errorMsg = "Error loading YouTube video.";
                                if (e === 'embedBlocked') errorMsg = "Video embedding blocked by owner.";
                                if (e === 'invalidParam') errorMsg = "Invalid video URL/parameters.";
                                resetSlot(slotId, errorMsg);
                            }}
                             // Optionally attempt to grab audio focus when player starts playing,
                             // but be careful as this might conflict with user clicks.
                             // onPlay={() => { if(!isActiveAudio) handleToggleAudio(slotId); }}
                        />
                        {commonControls(true, true)}
                    </>
                );

            case 'hls':
                if (!slot.data?.url) {
                    resetSlot(slotId, 'Missing HLS URL');
                    return <div className="error-message">Missing HLS URL... <button onClick={() => resetSlot(slotId)} className="inline-close-btn">✖️</button></div>;
                }
                return (
                    <>
                        {/* Container for the video element is the grid item itself */}
                        <video
                            ref={el => { if (el) videoRefs.current[slotId] = el; else delete videoRefs.current[slotId]; }} // Assign or clear ref
                            className="stream-video hls-video" // Add type class
                            playsInline
                            // Muted state is handled by the Mute/Unmute Effect
                            // Autoplay is attempted by the HLS Management Effect
                        />
                         {/* HLS controls overlay */}
                        {commonControls(true, true)}
                        {/* Optional: Add loading/error overlay specific to HLS if needed */}
                    </>
                );

            default:
                return <div className="error-message">Unknown slot type: {slot.type} <button onClick={() => resetSlot(slotId)} className="inline-close-btn">✖️</button></div>;
        }
    };

    // --- JSX Output ---
    return (
        <div className="app-container">
            <Navbar />

            <main className="mosaic-container">
                <div className={`mosaic ${getGridLayoutClass()}`}>
                    {/* Map over gridSlots state to render each slot */}
                    {gridSlots.map((slot) => (
                        <div
                            key={slot.id}
                            ref={el => { if (el) containerRefs.current[slot.id] = el; else delete containerRefs.current[slot.id]; }} // Assign or clear ref
                            className={`grid-item video-container-wrapper slot-type-${slot.type} ${expandedVideoIdentifier === slot.id ? 'expanded' : ''} ${activeAudioIdentifier === slot.id ? 'audio-active' : ''}`}
                            // onClick={() => { if (expandedVideoIdentifier !== slot.id) handleToggleAudio(slot.id); }} // Optional: Click grid item to activate audio
                        >
                            {/* Render the dynamic content for this slot */}
                            {renderSlotContent(slot)}
                        </div>
                    ))}
                </div>
            </main>

            {/* Layout options pop-up (can be kept if desired) */}
            {/* <div className={`layout-options ${showLayoutOptions ? 'show' : ''}`}> ... Options ... </div> */}

            <Footer
                isLayoutOptionsOpen={showLayoutOptions} // Pass state
                onToggleLayoutOptions={handleToggleLayoutOptions} // Pass handler
                // isStreamsMenuOpen={false} // Remove if streams menu removed
                // onToggleStreamsMenu={() => {}} // Remove if streams menu removed
                onMuteAll={handleMuteAll} // Pass handler
                currentTime={time} // Pass current time
                // Optional: Pass layout change handler if Footer controls it
                // onChangeLayout={changeLayout}
            />
        </div>
    );
}

export default App;