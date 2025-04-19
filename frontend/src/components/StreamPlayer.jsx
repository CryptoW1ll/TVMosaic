import React, { useState, useEffect, useRef } from 'react';
import Hls from 'hls.js';
// Assuming styles are handled globally in App.css or you create StreamPlayer.css
// import './StreamPlayer.css';

// --- Component Props Definition ---
/**
 * @typedef {object} Stream
 * @property {string} url
 * @property {string} name
 */

/**
 * @typedef {object} StreamPlayerProps
 * @property {Stream} stream - The stream object containing url and name.
 * @property {number | string} identifier - A unique identifier for this player (e.g., the index from the map).
 * @property {boolean} isExpanded - Whether this player should be in fullscreen/expanded mode.
 * @property {boolean} hasAudio - Whether this player currently has the master audio focus.
 * @property {(identifier: number | string) => void} onToggleAudio - Callback function to request audio focus toggle from parent.
 * @property {(identifier: number | string) => void} onToggleExpand - Callback function to request fullscreen/expand toggle from parent.
 */

/**
 * Renders a single HLS video stream player.
 * @param {StreamPlayerProps} props
 */
export default function StreamPlayer({
  stream,
  identifier,
  isExpanded,
  hasAudio,
  onToggleAudio,
  onToggleExpand
}) {
  // --- State ---
  // Add internal loading/error state if needed for visual feedback
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- Refs ---
  const videoRef = useRef(null); // Ref for the specific video element
  const hlsRef = useRef(null);   // Ref for this player's HLS instance

  // --- Effects ---

  // Initialize/Cleanup HLS instance when stream URL changes or component mounts/unmounts
  useEffect(() => {
    const videoElement = videoRef.current;
    const streamUrl = stream?.url; // Get URL safely

    // --- Cleanup Function ---
    // This runs *before* the effect runs again OR when the component unmounts.
    const cleanup = () => {
      console.log(`Cleaning up HLS for stream: ${stream?.name || identifier}`);
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
       // Reset native src if it was used
      if (videoElement?.src && !Hls.isSupported() && videoElement.canPlayType('application/vnd.apple.mpegurl')) {
          videoElement.removeAttribute('src');
          videoElement.load(); // Reset the video element state
      }
    };
    // --- End Cleanup ---


    if (!videoElement || !streamUrl) {
      console.warn(`StreamPlayer ${identifier}: Skipping HLS setup - no video element or URL.`);
      cleanup(); // Ensure cleanup even if we don't set up
      return; // Exit if no video element or valid URL
    }

    console.log(`StreamPlayer ${identifier}: Initializing for ${stream.name} (${streamUrl})`);
    setIsLoading(true);
    setError(null);

    // --- HLS Setup ---
    if (Hls.isSupported()) {
      console.log(`StreamPlayer ${identifier}: Using hls.js`);
      const hls = new Hls({
         maxBufferLength: 15, // Keep buffers smaller for multiple streams
         maxMaxBufferLength: 30,
         // Add other HLS config as needed
      });

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log(`StreamPlayer ${identifier}: Manifest parsed`);
        setIsLoading(false);
        setError(null);
        if (videoElement.paused) {
          videoElement.play().catch(e => console.warn(`Autoplay prevented for stream ${identifier}:`, e));
        }
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error(`HLS Error (Stream ${identifier} - ${stream.name}):`, data);
        setIsLoading(false);
        if (data.fatal) {
            setError(`Error: ${data.details || data.type}`);
            // cleanup(); // Optional: Destroy on fatal error
        } else {
             // setError(`Warning: ${data.details || data.type}`);
        }
      });

      hls.loadSource(streamUrl);
      hls.attachMedia(videoElement);
      hlsRef.current = hls; // Store the instance

    } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
        // --- Native HLS ---
        console.log(`StreamPlayer ${identifier}: Using native HLS`);
        videoElement.src = streamUrl;

        const handleLoadedMetadata = () => {
             console.log(`StreamPlayer ${identifier}: Native Metadata loaded`);
             setIsLoading(false);
             setError(null);
             if (videoElement?.paused) {
                 videoElement.play().catch(e => console.warn(`Native Autoplay prevented for stream ${identifier}:`, e));
             }
             videoElement?.removeEventListener('loadedmetadata', handleLoadedMetadata);
             videoElement?.removeEventListener('error', handleError);
        }
        const handleError = (e) => {
             console.error(`Native HLS Error (Stream ${identifier} - ${stream.name}):`, e);
             setIsLoading(false);
             setError('Native playback error.');
             videoElement?.removeEventListener('loadedmetadata', handleLoadedMetadata);
             videoElement?.removeEventListener('error', handleError);
        }
        videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
        videoElement.addEventListener('error', handleError);

    } else {
      console.warn(`StreamPlayer ${identifier}: HLS not supported by this browser.`);
      setIsLoading(false);
      setError('HLS not supported.');
    }

    // Return the cleanup function
    return cleanup;

  }, [stream?.url, identifier]); // Rerun effect if stream URL or identifier changes


  // --- Handlers ---

  // These just call the props passed down from App.js
  const handleToggleAudio = (e) => {
    e.stopPropagation();
    if (onToggleAudio) {
      onToggleAudio(identifier); // Pass the identifier up
    } else {
        console.warn(`StreamPlayer ${identifier}: onToggleAudio prop is missing!`);
        // Fallback: Directly toggle (breaks single audio source rule)
        if(videoRef.current) videoRef.current.muted = !videoRef.current.muted;
    }
  };

  const handleToggleExpand = (e) => {
    e.stopPropagation();
    if (onToggleExpand) {
      onToggleExpand(identifier); // Pass the identifier up
    } else {
       console.warn(`StreamPlayer ${identifier}: onToggleExpand prop is missing!`);
        // Fallback: Attempt fullscreen directly (might not work as expected without parent coordination)
       if(videoRef.current?.parentElement?.requestFullscreen) {
           videoRef.current.parentElement.requestFullscreen().catch(console.error);
       }
    }
  };

  // --- Render Logic ---
  const containerClasses = `video-container ${isExpanded ? 'expanded' : ''} ${hasAudio ? 'audio-active' : ''}`;
  const audioButtonIcon = hasAudio ? "🔇" : "🔊";
  const audioButtonTitle = hasAudio ? "Mute" : "Unmute";
  const expandButtonIcon = isExpanded ? "🇽" : "⤢";

  return (
    <div
      className={containerClasses}
      // onClick={handleToggleAudio} // Optional: Add back if desired, ensures button uses stopPropagation
    >
      <video
        ref={videoRef} // Attach ref to the video element
        playsInline
        muted={!hasAudio} // Muted state is controlled by the parent via 'hasAudio' prop
        autoPlay
      />

      {/* Overlay for Loading/Error */}
      {(isLoading || error) && (
          <div className="video-overlay">
              {isLoading && <div className="buffering-indicator" style={{ display: 'block' }}></div>}
              {error && <div className="error-message">{error}</div>}
          </div>
      )}


      <div className="video-controls">
        <div className="stream-title">{stream?.name || `Stream ${identifier}`}</div>
        <div className="control-buttons">
          <button
            className="control-btn audio-btn"
            onClick={handleToggleAudio}
            title={audioButtonTitle}
            disabled={isLoading || !!error} // Disable if loading or error
          >
            {audioButtonIcon}
          </button>
          <button
            className="control-btn expand-btn"
            onClick={handleToggleExpand}
            title={isExpanded ? "Exit Fullscreen" : "Toggle Fullscreen"}
            disabled={isLoading || !!error} // Disable if loading or error
          >
            {expandButtonIcon}
          </button>
        </div>
      </div>

      {/* Buffering indicator is now part of the overlay */}
      {/* <div className="buffering-indicator" style={{ display: isLoading ? 'block' : 'none' }}></div> */}
    </div>
  );
}