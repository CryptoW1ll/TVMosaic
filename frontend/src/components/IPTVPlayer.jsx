import React, { useState, useRef, useEffect } from 'react';
import Hls from 'hls.js';
// Import icons
import {
    FaVolumeMute, FaVolumeUp, FaExpand, FaCompress,
    FaBars,     // Hamburger icon
    FaTimes,    // Close icon 
    FaSyncAlt   // Optional: Reload icon
} from 'react-icons/fa';

import '../iptv.css'; 
import '../App.css'; 

// --- Helper Function ---
function getRandomChannel(channelList) {
    if (!Array.isArray(channelList) || channelList.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * channelList.length);
    return channelList[randomIndex];
}

// --- Component Props Definition ---
/**
 * @typedef {object} IPTVChannel
 * @property {string} name - Channel name
 * @property {string} url - Stream URL (M3U8)
 * @property {string} [category] - Channel category (optional)
 * @property {string} [logo] - URL to channel logo (optional)
 */

/**
 * @typedef {object} IPTVPlayerProps
 * @property {string | number} identifier - Unique ID for this player instance (e.g., slotId from parent).
 * @property {IPTVChannel[]} channels - List of available channels.
 * @property {IPTVChannel | null} [initialChannel] - Channel to load initially (optional).
 * @property {boolean} isExpanded - Whether the player is currently in expanded/fullscreen mode.
 * @property {boolean} hasAudio - Whether the player should currently have audio enabled (controlled by parent).
 * @property {() => void} onToggleAudio - Callback function when the user clicks the audio toggle button.
 * @property {() => void} onToggleExpand - Callback function when the user clicks the expand/compress button.
 * @property {() => void} onClose - Callback function when the user clicks the close button.
 * @property {(category: string) => void} [onCategoryChange] - Callback when category changes (optional).
 * @property {(channel: IPTVChannel) => void} [onChannelChange] - Callback when channel changes (optional).
 */

// --- Component ---
/**
 * IPTV Player Component
 * @param {IPTVPlayerProps} props
 */
export default function IPTVPlayer({
    identifier, // Added identifier prop
    channels = [],
    initialChannel,
    isExpanded = false,
    hasAudio = true,
    onToggleAudio,
    onToggleExpand,
    onClose, 
    onCategoryChange,
    onChannelChange
}) {

    // --- State ---
    const [currentIptvChannel, setCurrentIptvChannel] = useState(() => {
        if (initialChannel && initialChannel.url) return initialChannel;
        // Fallback to random channel from the list
        const random = getRandomChannel(channels);
        return random || null; // Start with null if no channels or random fails
    });

    const [currentCategory, setCurrentCategory] = useState(
        () => currentIptvChannel?.category || 'All'
    );
    const [iptvLoading, setIptvLoading] = useState(false);
    const [iptvError, setIptvError] = useState(null);
    const [showIptvInfo, setShowIptvInfo] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // --- Refs ---
    const iptvVideoRef = useRef(null);
    const iptvHlsRef = useRef(null);
    const sidebarRef = useRef(null); // Ref for sidebar (optional, for outside click)
    const infoTimeoutRef = useRef(null); // Ref for the info overlay timeout

    // --- Derived State ---
    const safeChannels = Array.isArray(channels) ? channels : [];
    const uniqueCategories = ['All', ...new Set(safeChannels.map(channel => channel.category || 'Unknown').filter(Boolean))]; // Filter out potential null/undefined categories

    const filteredIptvChannels = safeChannels.filter(channel => {
        const categoryMatch = currentCategory === 'All' || channel.category === currentCategory;
        // Ensure channel name exists before checking includes
        const searchMatch = !searchTerm || (channel.name && channel.name.toLowerCase().includes(searchTerm.toLowerCase()));
        return categoryMatch && searchMatch;
    });

    // --- Effects ---

    // Initialize Player & Handle Channel Changes
    useEffect(() => {
        const videoElement = iptvVideoRef.current;

        const cleanup = () => {
            if (iptvHlsRef.current) {
                console.log(`IPTVPlayer (${identifier}): Destroying HLS instance for`, iptvHlsRef.current.channelName);
                iptvHlsRef.current.destroy();
                iptvHlsRef.current = null;
            }
            if (videoElement) {
                videoElement.removeAttribute('src'); // Clean up src for native HLS
                videoElement.load(); // Stop any download
                // Remove specific event listeners if added dynamically
                videoElement.removeEventListener('loadedmetadata', handleNativeLoadedMetadata);
                videoElement.removeEventListener('error', handleNativeError);
            }
            setIptvLoading(false); // Ensure loading is reset on cleanup
            if (infoTimeoutRef.current) {
                clearTimeout(infoTimeoutRef.current);
            }
        };

        // Define reusable event handlers
        const handleNativeLoadedMetadata = () => {
            setIptvLoading(false);
            setIptvError(null);
            console.log(`IPTVPlayer (${identifier}): Native HLS metadata loaded for ${currentIptvChannel?.name}`);
            videoElement?.play().catch(e => console.warn(`IPTVPlayer (${identifier}): Native Autoplay prevented`, e.message));
        };
        const handleNativeError = (e) => {
            console.error(`IPTVPlayer (${identifier}): Native playback error for ${currentIptvChannel?.name}`, videoElement?.error);
            setIptvLoading(false);
            setIptvError(`Error: Native playback failed.`);
            // Don't trigger cleanup here automatically, error state handles UI
        };


        if (!videoElement) {
            console.warn(`IPTVPlayer (${identifier}): Video element ref is not ready.`);
            return; // Don't proceed if video element isn't available
        }

        if (!currentIptvChannel?.url) {
            cleanup(); // Clean previous instance if any
            setIptvError(currentIptvChannel ? `Channel "${currentIptvChannel.name}" has no valid URL.` : 'No channel selected.');
            // Ensure video is visually empty
             if (videoElement) videoElement.poster = ''; // Optional: clear poster
            return; // Stop if no valid channel/URL
        }

        console.log(`IPTVPlayer (${identifier}): Setting up channel: ${currentIptvChannel.name} (${currentIptvChannel.url})`);
        cleanup(); // Clean up previous instance before setting up new one
        setIptvLoading(true);
        setIptvError(null);
        setShowIptvInfo(true); // Show info on channel change attempt

        if (Hls.isSupported()) {
            console.log(`IPTVPlayer (${identifier}): Using HLS.js`);
            const hls = new Hls({
                 // Consider smaller buffer to reduce latency for live streams
                 maxBufferLength: 30, // seconds
                 maxMaxBufferLength: 60,
                 // Start loading fragility: retry settings might be useful
                 fragLoadRetryDelay: 1000, // ms
                 fragLoadRetryMax: 4,
                 // Manifest load fragility
                 manifestLoadRetryDelay: 500,
                 manifestLoadRetryMax: 2,
            });
            iptvHlsRef.current = hls; // Store ref immediately
            hls.channelName = currentIptvChannel.name; // Store name for logging

            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                console.log(`IPTVPlayer (${identifier}): HLS Manifest parsed for ${hls.channelName}`);
                setIptvLoading(false);
                setIptvError(null); // Clear error on success
                setShowIptvInfo(true); // Refresh info display
                infoTimeoutRef.current = setTimeout(() => setShowIptvInfo(false), 3000);
                videoElement?.play().catch(e => console.warn(`IPTVPlayer (${identifier}): HLS Autoplay prevented`, e.message));
            });
            hls.on(Hls.Events.ERROR, (event, data) => {
                console.error(`IPTVPlayer (${identifier}): HLS Error on ${hls.channelName}`, data);
                setIptvLoading(false);
                const errorMsg = `Error: ${data.details || data.type}`;
                setIptvError(errorMsg);
                setShowIptvInfo(true); // Show error info
                 // No automatic timeout for errors
                if (data.fatal) {
                    console.warn(`IPTVPlayer (${identifier}): Fatal HLS error, destroying instance.`);
                    hls.destroy(); // Attempt cleanup on fatal error
                    iptvHlsRef.current = null; // Clear the ref
                }
            });

            hls.loadSource(currentIptvChannel.url);
            hls.attachMedia(videoElement);

        } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
            console.log(`IPTVPlayer (${identifier}): Using native HLS`);
            videoElement.src = currentIptvChannel.url;
            // Remove previous listeners before adding new ones
            videoElement.removeEventListener('loadedmetadata', handleNativeLoadedMetadata);
            videoElement.removeEventListener('error', handleNativeError);
            // Add new listeners
            videoElement.addEventListener('loadedmetadata', handleNativeLoadedMetadata);
            videoElement.addEventListener('error', handleNativeError);
            // Trigger loading (browser handles it)
            videoElement.load();
            // Set info timer for native playback attempt
            infoTimeoutRef.current = setTimeout(() => setShowIptvInfo(false), 3000);

        } else {
            console.error(`IPTVPlayer (${identifier}): HLS not supported by this browser.`);
            setIptvLoading(false);
            setIptvError('HLS playback is not supported in this browser.');
            setShowIptvInfo(true);
        }

        // Return the master cleanup function
        return cleanup;

    }, [currentIptvChannel, identifier]); // Rerun when channel or identifier changes

    // Effect to update if initialChannel prop changes *after* initial mount
    useEffect(() => {
        if (initialChannel !== undefined && initialChannel?.url !== currentIptvChannel?.url) {
             // Check if initialChannel is explicitly null to clear the player
            if (initialChannel === null) {
                setCurrentIptvChannel(null);
                setCurrentCategory('All');
            } else if (initialChannel.url) { // Only set if it has a URL
                setCurrentIptvChannel(initialChannel);
                 setCurrentCategory(initialChannel.category || 'All');
            }
        }
    }, [initialChannel]); // Dependency on initialChannel prop

     // Effect to clear info overlay automatically, except for errors
     useEffect(() => {
        if (showIptvInfo && !iptvError && !iptvLoading) {
            if (infoTimeoutRef.current) clearTimeout(infoTimeoutRef.current);
            infoTimeoutRef.current = setTimeout(() => setShowIptvInfo(false), 3000);
        }
        // Cleanup timeout if component unmounts while info is shown
        return () => {
            if (infoTimeoutRef.current) clearTimeout(infoTimeoutRef.current);
        };
    }, [showIptvInfo, iptvError, iptvLoading]);


    // --- Handlers ---

    const changeIptvChannel = (channel) => {
        if (!channel || channel?.url === currentIptvChannel?.url) {
             console.log(`IPTVPlayer (${identifier}): Channel change ignored (same or invalid channel)`);
             return; // Don't change if it's the same URL or invalid channel
        }
        console.log(`IPTVPlayer (${identifier}): User changing to channel: ${channel.name}`);
        setCurrentIptvChannel(channel); // Triggers the main useEffect
        setCurrentCategory(channel?.category || 'All'); // Update category filter to match selected channel
        setSearchTerm(''); // Clear search on channel change
        setIsSidebarOpen(false); // Close sidebar on channel selection
        if (onChannelChange) {
            onChannelChange(channel);
        }
        // Info display is handled by the main useEffect
    };

    const filterChannelsByCategory = (category) => {
        if (category !== currentCategory) {
            console.log(`IPTVPlayer (${identifier}): Filtering by category: ${category}`);
            setCurrentCategory(category);
            setSearchTerm(''); // Clear search when changing category
             if (onCategoryChange) {
                onCategoryChange(category);
            }
        }
    };

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    // Use the onToggleAudio prop passed from the parent (App.js)
    const handleToggleAudio = (e) => {
        e.stopPropagation();
        console.log(`IPTVPlayer (${identifier}): Audio toggle clicked.`);
        if (onToggleAudio) {
            onToggleAudio(); // Call the parent's handler
        } else {
            console.warn(`IPTVPlayer (${identifier}): onToggleAudio prop is missing.`);
            // Fallback - directly toggle video (but UI icon won't sync with App state)
            if (iptvVideoRef.current) {
                iptvVideoRef.current.muted = !iptvVideoRef.current.muted;
            }
        }
    };

    // Use the onToggleExpand prop passed from the parent (App.js)
    const handleToggleExpand = (e) => {
        e.stopPropagation();
        console.log(`IPTVPlayer (${identifier}): Expand toggle clicked.`);
        setIsSidebarOpen(false); // Ensure sidebar is closed when expanding/compressing
        if (onToggleExpand) {
            onToggleExpand(); // Call the parent's handler
        } else {
            console.warn(`IPTVPlayer (${identifier}): onToggleExpand prop is missing.`);
        }
    };

     // Use the onClose prop passed from the parent (App.js)
    const handleClose = (e) => {
        e.stopPropagation();
        console.log(`IPTVPlayer (${identifier}): Close button clicked.`);
        setIsSidebarOpen(false); // Ensure sidebar is closed
        if (onClose) {
            onClose(); // Call the parent's handler to reset the slot
        } else {
            console.warn(`IPTVPlayer (${identifier}): onClose prop is missing.`);
        }
    };

    // Sidebar Toggle Handler
    const toggleSidebar = (e) => {
        e.stopPropagation();
         // Don't allow opening sidebar if expanded
        if (!isExpanded) {
            setIsSidebarOpen(prev => !prev);
        } else {
             setIsSidebarOpen(false); // Ensure it's closed if expanded
        }
    };

    // Optional: Close sidebar when clicking outside of it
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Check if the click is outside the sidebar and not on the toggle button
            const toggleButton = document.getElementById(`sidebar-toggle-btn-${identifier}`);
            if (sidebarRef.current && !sidebarRef.current.contains(event.target) &&
                (!toggleButton || !toggleButton.contains(event.target)))
            {
               setIsSidebarOpen(false);
            }
        };

        if (isSidebarOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isSidebarOpen, identifier]); // Add identifier to ensure unique toggle button ID


    // --- Render Logic ---
    const containerClasses = `video-container iptv-player ${isExpanded ? 'expanded' : ''} ${hasAudio ? 'audio-active' : ''} ${!isExpanded && isSidebarOpen ? 'sidebar-open' : ''}`;
    const audioButtonIcon = hasAudio ? <FaVolumeUp /> : <FaVolumeMute />;
    const audioButtonTitle = hasAudio ? "Mute" : "Unmute";
    const expandButtonIcon = isExpanded ? <FaCompress /> : <FaExpand />;
    const expandButtonTitle = isExpanded ? "Exit Fullscreen" : "Toggle Fullscreen";
    const canInteract = !!currentIptvChannel && !iptvLoading && !iptvError; // Simplify conditions

    return (
        <div className={containerClasses}>
            {/* Video element needs to be muted based on parent's state */}
            <video ref={iptvVideoRef} playsInline muted={!hasAudio} autoPlay={false} />

            {(iptvLoading || iptvError) && (
                <div className="video-overlay status-overlay"> {/* Added class */}
                    {iptvLoading && <div className="spinner"></div>}
                    {iptvError && <div className="error-message">{iptvError}</div>}
                </div>
            )}

            {/* Channel Info Overlay */}
             <div className={`iptv-info ${showIptvInfo ? 'show' : ''} ${iptvError ? (iptvError.startsWith('Error') ? 'error' : 'warning') : ''}`}>
                {iptvError ? iptvError : iptvLoading ? `Loading: ${currentIptvChannel?.name}` : `Playing: ${currentIptvChannel?.name || "No Channel"}`}
             </div>


            {/* --- Controls Bar --- */}
            <div className="video-controls">
                 {/* Sidebar Toggle Button - Only show when NOT expanded */}
                 {!isExpanded && (
                    <button
                        id={`sidebar-toggle-btn-${identifier}`} // Unique ID per instance
                        className="control-btn sidebar-toggle-btn"
                        onClick={toggleSidebar}
                        title={isSidebarOpen ? "Close Channels" : "Open Channels"}
                        aria-label={isSidebarOpen ? "Close Channels" : "Open Channels"}
                        aria-expanded={isSidebarOpen}
                        aria-controls={`iptv-sidebar-content-${identifier}`} // Link to sidebar content
                    >
                       {isSidebarOpen ? <FaTimes /> : <FaBars />}
                    </button>
                 )}

                {/* Stream Title - Show only if not expanded or if sidebar is closed */}
                <div className={`stream-title ${isExpanded ? 'title-center-expanded' : ''} ${isSidebarOpen ? 'title-hidden-sidebar' : ''}`}>
                   IPTV: {iptvLoading ? "Loading..." : iptvError ? "Error" : currentIptvChannel?.name || "No Channel"}
                </div>

                {/* Main Control Buttons */}
                <div className="control-buttons">
                    {/* Volume Control */}
                    <button
                        className="control-btn audio-btn"
                        onClick={handleToggleAudio}
                        title={audioButtonTitle}
                        disabled={!currentIptvChannel || iptvLoading} // Disable if no channel or loading
                        aria-label={audioButtonTitle}
                    >
                        {audioButtonIcon}
                    </button>
                    {/* Expand Control */}
                    <button
                        className="control-btn expand-btn"
                        onClick={handleToggleExpand}
                        title={expandButtonTitle}
                        disabled={!currentIptvChannel || iptvLoading} // Disable if no channel or loading
                        aria-label={expandButtonTitle}
                    >
                        {expandButtonIcon}
                    </button>
                     {/* Close Button */}
                    <button
                        className="control-btn close-btn"
                        onClick={handleClose}
                        title="Close Player"
                        aria-label="Close Player"
                    >
                        <FaTimes />
                    </button>
                </div>
            </div>

            {/* --- Sidebar --- */}
            {/* Render sidebar only when not expanded */}
            {!isExpanded && (
                <div
                    ref={sidebarRef} // Ref for potential outside click
                    className={`iptv-sidebar ${isSidebarOpen ? 'open' : ''}`}
                    id={`iptv-sidebar-content-${identifier}`} // Unique ID
                    aria-hidden={!isSidebarOpen} // Hide from screen readers when closed
                >
                    {/* Header with Title and Close Button */}
                    <div className="sidebar-header">
                        <h3>Channels</h3>
                         <button
                            className="control-btn sidebar-close-btn"
                            onClick={toggleSidebar} // Same toggle function
                            title="Close Channels"
                            aria-label="Close Channels"
                        >
                           <FaTimes />
                         </button>
                    </div>

                    {/* Category Filter */}
                    <div className="iptv-category-filter sidebar-section">
                         <label htmlFor={`category-select-${identifier}`}>Category:</label>
                         <select
                             id={`category-select-${identifier}`} // Unique ID
                             value={currentCategory}
                             onChange={(e) => filterChannelsByCategory(e.target.value)}
                             onClick={(e) => e.stopPropagation()} // Prevent closing sidebar if clicking select
                         >
                             {uniqueCategories.map(category => (
                                 <option key={category} value={category}>
                                     {category}
                                 </option>
                             ))}
                         </select>
                    </div>

                    {/* Search Input */}
                    <div className="iptv-search sidebar-section">
                        <label htmlFor={`search-input-${identifier}`} className="sr-only">Search Channels</label> {/* Screen reader label */}
                        <input
                            id={`search-input-${identifier}`} // Unique ID
                            type="text"
                            placeholder="Search channels..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            onClick={(e) => e.stopPropagation()} // Prevent clicks bubbling
                            aria-label="Search IPTV Channels"
                        />
                    </div>

                    {/* Channel List */}
                    <div className="iptv-channel-list-wrapper sidebar-section">
                        <div className="iptv-channel-select">
                            {filteredIptvChannels.map((channel) => (
                                <button
                                    key={channel.name + channel.url} // Use a combination for better key uniqueness
                                    className={`iptv-channel-btn ${currentIptvChannel?.url === channel.url ? 'active' : ''}`} // Compare URL for active state
                                    onClick={(e) => { e.stopPropagation(); changeIptvChannel(channel); }}
                                    title={channel.name}
                                >
                                    {channel.logo && <img src={channel.logo} alt="" className="channel-logo-small" onError={(e) => e.target.style.display='none'} />} {/* Hide logo on error */}
                                    <span className="channel-name">{channel.name}</span>
                                </button>
                            ))}
                            {/* Informative messages for empty list states */}
                            {safeChannels.length > 0 && filteredIptvChannels.length === 0 && searchTerm && (
                                <span className="no-results">No channels match "{searchTerm}".</span>
                            )}
                             {safeChannels.length > 0 && filteredIptvChannels.length === 0 && !searchTerm && currentCategory !== 'All' && (
                                <span className="no-results">No channels found in the "{currentCategory}" category.</span>
                            )}
                             {safeChannels.length > 0 && filteredIptvChannels.length === 0 && !searchTerm && currentCategory === 'All' && (
                                 <span className="no-results">No channels available. Check filters.</span> // Should not happen if safeChannels > 0 unless filtering issue
                             )}
                             {safeChannels.length === 0 && (
                                 <span className="no-results">No channels loaded.</span>
                             )}
                        </div>
                    </div>
                </div>
            )}
            {/* --- End Sidebar --- */}

        </div>
    );
}