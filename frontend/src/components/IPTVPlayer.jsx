import React, { useState, useRef, useEffect } from 'react';
import Hls from 'hls.js';
import '../App.css'; // Ensure path is correct

// --- Helper Function (Moved Outside Component) ---
/**
 * Selects a random channel from the provided list.
 * @param {IPTVChannel[]} channelList - The array of channels.
 * @returns {IPTVChannel|null} A random channel or null if the list is empty/invalid.
 */
function getRandomChannel(channelList) {
  // Ensure it's a valid array with items
  if (!Array.isArray(channelList) || channelList.length === 0) {
      console.warn("getRandomChannel: Channel list is empty or invalid.");
      return null;
  }
  const randomIndex = Math.floor(Math.random() * channelList.length);
  console.log(`getRandomChannel: Selected index ${randomIndex} from ${channelList.length} channels.`);
  return channelList[randomIndex];
}


// --- Component Props Definition (Example - Keep your JSDoc if you have it) ---
/**
 * @typedef {object} IPTVChannel
 * @property {string} name
 * @property {string} url
 * @property {string} category
 * @property {string} logo
 */
/**
 * @typedef {object} IPTVPlayerProps
 * @property {IPTVChannel[]} channels
 * @property {IPTVChannel|null|undefined} [initialChannel] // Allow undefined
 * @property {boolean} isExpanded
 * @property {boolean} hasAudio
 * @property {(identifier: 'iptv', videoElement: HTMLVideoElement | null) => void} onToggleAudio
 * @property {(identifier: 'iptv') => void} onToggleExpand
 * @property {(category: string) => void} [onCategoryChange]
 * @property {(channel: IPTVChannel) => void} [onChannelChange]
 */


// --- Component ---
/**
 * Renders an IPTV player with channel selection and controls.
 * @param {IPTVPlayerProps} props
 */
export default function IPTVPlayer({
  channels = [], // Default prop value is fine
  initialChannel, // REMOVE the default assignment here
  isExpanded,
  hasAudio,
  onToggleAudio,
  onToggleExpand,
  onCategoryChange,
  onChannelChange
}) {

  // --- State ---
  // CORRECT useState initializer function
  const [currentIptvChannel, setCurrentIptvChannel] = useState(() => {
    console.log("Calculating initial channel. Prop received:", initialChannel);
    // 1. Prioritize the prop if it's explicitly passed and not undefined
    if (initialChannel !== undefined) {
        console.log("Using provided initialChannel:", initialChannel);
        // Ensure even a passed null is handled correctly
        return initialChannel === null ? null : initialChannel;
    }
    // 2. If prop wasn't provided (is undefined), try getting random
    console.log("initialChannel prop undefined, attempting random selection.");
    const random = getRandomChannel(channels); // Pass the 'channels' prop
    if (random) {
        console.log("Using random channel:", random);
        return random;
    }
    // 3. Fallback if channels is empty or random fails
    console.log("Could not select random channel, falling back to null.");
    return null;
  });

  const [currentCategory, setCurrentCategory] = useState(
    // Initialize category based on the *actual* initial channel determined above
    () => currentIptvChannel?.category || 'All'
  );
  const [iptvLoading, setIptvLoading] = useState(false);
  const [iptvError, setIptvError] = useState(null);
  const [showIptvInfo, setShowIptvInfo] = useState(false);

  // --- Refs ---
  const iptvVideoRef = useRef(null);
  const iptvHlsRef = useRef(null);

  // --- Derived State ---
  const safeChannels = Array.isArray(channels) ? channels : [];
  const uniqueCategories = ['All', ...new Set(safeChannels.map(channel => channel.category || 'Unknown'))]; // Handle missing category
  const filteredIptvChannels = safeChannels.filter(channel => currentCategory === 'All' || channel.category === currentCategory);

   // --- Effects ---

   // Initialize Player & Handle Channel Changes
   useEffect(() => {
      // ... (This entire useEffect remains the same as the previous correct version) ...
      // It handles cleanup, HLS/native setup based on currentIptvChannel.url
      const videoElement = iptvVideoRef.current;

      const cleanup = () => {
          console.log(`Cleaning up IPTV player for: ${iptvHlsRef.current?.channelName || 'previous channel'}`);
          if (iptvHlsRef.current) {
              iptvHlsRef.current.destroy();
              iptvHlsRef.current = null;
          }
          if (videoElement?.src && !Hls.isSupported() && videoElement.canPlayType('application/vnd.apple.mpegurl')) {
              videoElement.removeAttribute('src');
              videoElement.load();
          }
      };

      if (!videoElement || !currentIptvChannel?.url) {
        console.warn("IPTV init skipped: No video element or channel URL.", { hasVideo: !!videoElement, channel: currentIptvChannel });
        setIptvLoading(false);
        setIptvError(currentIptvChannel ? `Channel "${currentIptvChannel.name}" has no valid URL.` : 'No channel selected.');
        cleanup();
        return;
      }

      console.log(`Initializing IPTV player effect for: ${currentIptvChannel.name}`);
      setIptvLoading(true);
      setIptvError(null);

      if (Hls.isSupported()) {
        console.log(`Initializing HLS for IPTV: ${currentIptvChannel.name}`);
        const hls = new Hls({ maxBufferLength: 30, maxMaxBufferLength: 60, liveSyncDurationCount: 3 });
        hls.channelName = currentIptvChannel.name;

        //hls.on(Hls.Events.MANIFEST_PARSED, () => { /* ... */ setIsLoading(false); setError(null); if (videoElement?.paused) videoElement.play().catch(e => console.warn("HLS Autoplay prevented", e)); });
        //hls.on(Hls.Events.ERROR, (event, data) => { /* ... */ console.error("HLS Error", data); setIsLoading(false); if (data.fatal) setIptvError(`Error: ${data.details || data.type}`); });
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          console.log(`IPTV Manifest parsed: ${currentIptvChannel.name}`);
          //setIsLoading(false);
          setIptvLoading(false)
          setIptvError(null); // Corrected state setter name
          if (videoElement?.paused) {
            videoElement.play().catch(e => console.warn(`IPTV Autoplay prevented for ${currentIptvChannel.name}:`, e));
          }
        });
  
        hls.on(Hls.Events.ERROR, (event, data) => {
          console.error(`HLS Error (IPTV ${currentIptvChannel.name}):`, data);
          //setIsLoading(false);
          setIptvLoading(false)
          if (data.fatal) {
              setIptvError(`Error loading stream: ${data.details || data.type}`); // Corrected state setter name
          } else {
               // Optionally set non-fatal errors too
               // setIptvError(`Warning: ${data.details || data.type}`); // Corrected state setter name
          }
        });
        hls.loadSource(currentIptvChannel.url);
        hls.attachMedia(videoElement);
        iptvHlsRef.current = hls;

      } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
        console.log(`Using native HLS for IPTV: ${currentIptvChannel.name}`);
        videoElement.src = currentIptvChannel.url;
        const handleLoadedMetadata = () => { /* ... */ setIptvLoading(false); setError(null); if (videoElement?.paused) videoElement.play().catch(e => console.warn("Native Autoplay prevented", e)); videoElement?.removeEventListener('loadedmetadata', handleLoadedMetadata); videoElement?.removeEventListener('error', handleError); };
        const handleError = (e) => { /* ... */ console.error("Native Error", e); setIptvLoading(false); setIptvError('Native playback error.'); videoElement?.removeEventListener('loadedmetadata', handleLoadedMetadata); videoElement?.removeEventListener('error', handleError); };
        videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
        videoElement.addEventListener('error', handleError);

      } else {
        console.warn(`HLS not supported for IPTV: ${currentIptvChannel.name}`);
        setIptvLoading(false);
        setIptvError('HLS playback not supported by this browser.');
      }
      return cleanup;
    }, [currentIptvChannel]); // Dependency is correct

   // Effect to potentially update if the initialChannel prop changes after mount
   useEffect(() => {
     // Only update if the prop is defined AND different from the current state's URL
     // (Comparing URLs is safer than object references if the parent re-creates the object)
     if (initialChannel !== undefined && initialChannel?.url !== currentIptvChannel?.url) {
         console.log("Initial channel prop changed, updating current channel state.");
         // Use null propagation in case initialChannel is null
         setCurrentIptvChannel(initialChannel === null ? null : initialChannel);
     }
   }, [initialChannel]); // Correct dependency

  // --- Handlers (Keep handlers like changeIptvChannel, filterChannelsByCategory, handleToggleAudio, handleToggleExpand as before) ---
    const changeIptvChannel = (channel) => {
      if (!channel || channel?.name === currentIptvChannel?.name) return;
      console.log(`Requesting IPTV channel change to: ${channel.name}`);
      setCurrentIptvChannel(channel);
      setShowIptvInfo(true);
      const timer = setTimeout(() => setShowIptvInfo(false), 3000);
      if (onChannelChange) onChannelChange(channel);
       // Update category state when channel changes
      setCurrentCategory(channel?.category || 'All');
      return () => clearTimeout(timer);
    };

    const filterChannelsByCategory = (category) => {
      setCurrentCategory(category);
      if (onCategoryChange) onCategoryChange(category);
    };

    const handleToggleAudio = (e) => {
      e.stopPropagation();
      if (onToggleAudio) onToggleAudio('iptv', iptvVideoRef.current);
      else { console.warn("onToggleAudio prop missing"); if(iptvVideoRef.current) iptvVideoRef.current.muted = !iptvVideoRef.current.muted; }
    };

    const handleToggleExpand = (e) => {
      e.stopPropagation();
      if (onToggleExpand) onToggleExpand('iptv');
      else { console.warn("onToggleExpand prop missing"); if(iptvVideoRef.current?.parentElement?.requestFullscreen) iptvVideoRef.current.parentElement.requestFullscreen().catch(console.error); }
    };

  // --- Render Logic ---
  // ... (Keep the JSX return statement exactly as before) ...
   const containerClasses = `video-container iptv-player ${isExpanded ? 'expanded' : ''} ${hasAudio ? 'audio-active' : ''}`;
   const audioButtonIcon = hasAudio ? "🔇" : "🔊";
   const audioButtonTitle = hasAudio ? "Mute" : "Unmute";
   const expandButtonIcon = isExpanded ? "🇽" : "⤢";

   return (
     <div className={containerClasses}>
        <video ref={iptvVideoRef} playsInline muted={!hasAudio} autoPlay />
        {(iptvLoading || iptvError) && ( <div className="video-overlay"> {iptvLoading && <div className="buffering-indicator" style={{ display: 'block' }}></div>} {iptvError && <div className="error-message">{iptvError}</div>} </div> )}
        <div className="video-controls">
            <div className="stream-title"> IPTV: {iptvLoading ? "Loading..." : iptvError ? "Error" : currentIptvChannel?.name || "No Channel"} </div>
            <div className="control-buttons"> <button className="control-btn audio-btn" onClick={handleToggleAudio} title={audioButtonTitle} disabled={!currentIptvChannel || iptvLoading || !!iptvError}> {audioButtonIcon} </button> <button className="control-btn expand-btn" onClick={handleToggleExpand} title={isExpanded ? "Exit Fullscreen" : "Toggle Fullscreen"} disabled={!currentIptvChannel || iptvLoading || !!iptvError}> {expandButtonIcon} </button> </div>
        </div>
        {!isExpanded && (
            <div className="iptv-controls">
                <div className="iptv-controls-row"> <div className="iptv-title"> {currentIptvChannel?.logo} {currentIptvChannel?.name || "Select Channel"} </div> <div className="iptv-category"> {currentIptvChannel?.category} </div> </div>
                <div className="iptv-category-filter"> {uniqueCategories.map(category => ( <button key={category} className={`category-btn ${currentCategory === category ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); filterChannelsByCategory(category); }} > {category} </button> ))} </div>
                <div className="iptv-channel-select"> {filteredIptvChannels.map((channel) => ( <button key={channel.name + channel.url} className={`iptv-channel-btn ${currentIptvChannel?.name === channel.name ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); changeIptvChannel(channel); }} title={channel.name} > {channel.logo} {channel.name} </button> ))} {filteredIptvChannels.length === 0 && <span>No channels in this category.</span>} </div>
            </div>
        )}
        <div className={`iptv-info ${showIptvInfo ? 'show' : ''} ${iptvError ? (iptvError.startsWith('Error') ? 'error' : 'warning') : ''}`}> {iptvError ? iptvError : `Playing: ${currentIptvChannel?.name}`} </div>
     </div>
   );
}