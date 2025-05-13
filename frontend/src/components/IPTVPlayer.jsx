import React, { useState, useRef, useEffect } from 'react';
import Hls from 'hls.js';
import {
    FaVolumeMute, FaVolumeUp, FaExpand, FaCompress,
    FaBars, FaTimes, FaSyncAlt, FaRandom
} from 'react-icons/fa';
import { deleteChannel } from './api';
import '../iptv.css';
import '../App.css';

/**
 * @typedef {object} IPTVChannel
 * @property {string} id - Unique channel identifier
 * @property {string} name - Channel name
 * @property {string} url - Stream URL (M3U8)
 * @property {string} [category] - Channel category (optional)
 * @property {string} [logo] - URL to channel logo (optional)
 */

/**
 * @typedef {object} IPTVPlayerProps
 * @property {string|number} identifier - Unique ID for this player instance
 * @property {IPTVChannel[]} channels - List of available channels
 * @property {IPTVChannel|null} [initialChannel] - Channel to load initially
 * @property {boolean} isExpanded - Whether player is in expanded mode
 * @property {boolean} hasAudio - Whether audio is enabled
 * @property {() => void} onToggleAudio - Audio toggle callback
 * @property {() => void} onToggleExpand - Expand toggle callback
 * @property {() => void} onClose - Close callback
 * @property {(category: string) => void} [onCategoryChange] - Category change callback
 * @property {(channel: IPTVChannel|null) => void} [onChannelChange] - Channel change callback
 */

export default function IPTVPlayer({
    identifier,
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
    // State
    const [currentIptvChannel, setCurrentIptvChannel] = useState(() => {
        if (initialChannel && initialChannel.url) return initialChannel;
        return getRandomChannel(channels);
    });
    const [currentCategory, setCurrentCategory] = useState(
        currentIptvChannel?.category || 'All'
    );
    const [iptvLoading, setIptvLoading] = useState(false);
    const [iptvError, setIptvError] = useState(null);
    const [showIptvInfo, setShowIptvInfo] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Refs
    const iptvVideoRef = useRef(null);
    const iptvHlsRef = useRef(null);
    const sidebarRef = useRef(null);
    const infoTimeoutRef = useRef(null);

    // Helper function
    function getRandomChannel(channelList) {
        if (!Array.isArray(channelList) || channelList.length === 0) return null;
        const randomIndex = Math.floor(Math.random() * channelList.length);
        return channelList[randomIndex];
    }

    // Filter channels
    const safeChannels = Array.isArray(channels) ? channels : [];
    const uniqueCategories = ['All', ...new Set(
        safeChannels.map(channel => channel.category || 'Unknown').filter(Boolean)
    )];
    const filteredIptvChannels = safeChannels.filter(channel => {
        const categoryMatch = currentCategory === 'All' || channel.category === currentCategory;
        const searchMatch = !searchTerm || 
            (channel.name && channel.name.toLowerCase().includes(searchTerm.toLowerCase()));
        return categoryMatch && searchMatch;
    });

    // Player setup and cleanup
    useEffect(() => {
        const videoElement = iptvVideoRef.current;

        const cleanup = () => {
            if (iptvHlsRef.current) {
                iptvHlsRef.current.destroy();
                iptvHlsRef.current = null;
            }
            if (videoElement) {
                videoElement.removeAttribute('src');
                videoElement.load();
            }
            setIptvLoading(false);
            clearTimeout(infoTimeoutRef.current);
        };

        const handleNativeLoadedMetadata = () => {
            setIptvLoading(false);
            setIptvError(null);
            videoElement?.play().catch(e => console.warn('Autoplay prevented', e));
        };

        const handleNativeError = () => {
            setIptvLoading(false);
            setIptvError('Error: Native playback failed.');
        };

        if (!videoElement) return;

        if (!currentIptvChannel?.url) {
            cleanup();
            setIptvError(currentIptvChannel ? 
                `Channel "${currentIptvChannel.name}" has no valid URL.` : 
                'No channel selected.');
            return;
        }

        console.log(`Setting up channel: ${currentIptvChannel.name}`);
        cleanup();
        setIptvLoading(true);
        setIptvError(null);
        setShowIptvInfo(true);

        if (Hls.isSupported()) {
            const hls = new Hls({
                maxBufferLength: 30,
                maxMaxBufferLength: 60,
                fragLoadRetryDelay: 1000,
                fragLoadRetryMax: 4,
                manifestLoadRetryDelay: 500,
                manifestLoadRetryMax: 2,
            });
            iptvHlsRef.current = hls;

            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                setIptvLoading(false);
                setIptvError(null);
                setShowIptvInfo(true);
                infoTimeoutRef.current = setTimeout(() => setShowIptvInfo(false), 6000);
                videoElement?.play().catch(e => console.warn('Autoplay prevented', e));
                return;
            });

            hls.on(Hls.Events.ERROR, (event, data) => {
                setIptvLoading(false); 
                setIptvError(null);

                // delete the channel
                deleteChannel(currentIptvChannel.channelId);
                setCurrentIptvChannel(null);
                setCurrentCategory('All');
                setSearchTerm('');
                setIsSidebarOpen(false);
                setIptvLoading(false);
                setIptvError(null);
                setShowIptvInfo(false);

                // set new random channel
                const newChannel = getRandomChannel(safeChannels);
                if (newChannel) {
                    setCurrentIptvChannel(newChannel);
                    setCurrentCategory(newChannel.category || 'All');
                    setSearchTerm('');
                    setIsSidebarOpen(false);
                    if (onChannelChange) onChannelChange(newChannel);
                }
                setShowIptvInfo(true);

                

                //setIptvError(`Error: ${data.details || data.type}`);
                // setShowIptvInfo(true);               
                // if (data.fatal) {
                //     hls.destroy();
                //     iptvHlsRef.current = null;
                // }
            });

            hls.loadSource(currentIptvChannel.url);
            hls.attachMedia(videoElement);
        } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
            videoElement.src = currentIptvChannel.url;
            videoElement.addEventListener('loadedmetadata', handleNativeLoadedMetadata);
            videoElement.addEventListener('error', handleNativeError);
            videoElement.load();
            infoTimeoutRef.current = setTimeout(() => setShowIptvInfo(false), 3000);
        } else {
            setIptvLoading(false);
            setIptvError('HLS playback is not supported in this browser.');
            setShowIptvInfo(true);
        }

        return cleanup;
    }, [currentIptvChannel, identifier]);


    
    useEffect(() => {
        if (initialChannel && initialChannel.url) {
            // Ensure the channel has an ID before setting it
            //if (!initialChannel.id) {
            if (!initialChannel.channelId) {
                // this is always triggered!
                // IPTVPlayer.jsx:195 Initial channel has no ID: {channelId: 145, name: 'MAV Select USA', url: 'https://d3h07n6l1exhds.cloudfront.net/v1/master/37…6c5b73da68a62b09d1/cc-0z2yyo4dxctc7/playlist.m3u8', category: 'Motorsports', icon: '⚽'}
                console.warn('Initial channel has no ID:', initialChannel);
            }
            setCurrentIptvChannel(initialChannel);
            setCurrentCategory(initialChannel.category || 'All');
        }
    }, [initialChannel]);

    // Auto-hide info overlay
    useEffect(() => {
        if (showIptvInfo && !iptvError && !iptvLoading) {
            clearTimeout(infoTimeoutRef.current);
            infoTimeoutRef.current = setTimeout(() => setShowIptvInfo(false), 3000);
        }
        return () => clearTimeout(infoTimeoutRef.current);
    }, [showIptvInfo, iptvError, iptvLoading]);

    // Event handlers

    const handleDeleteChannel = async (e) => {
        e.stopPropagation();
        
        // Check if current channel exists and has an ID
        if (!currentIptvChannel) {
            console.warn('No channel selected to delete');
            setIptvError('No channel selected to delete');
            return;
        }
    
        if (!currentIptvChannel.channelId) {
            console.warn('Channel has no ID, cannot delete:', currentIptvChannel);
            setIptvError('This channel cannot be deleted (missing ID)');
            return;
        }
    
        try {
            setIptvLoading(true);
            setIptvError(null);
            
            // Call API to delete channel
            await deleteChannel(currentIptvChannel.id);
            console.log('Channel deleted successfully:', currentIptvChannel.name);
            
            // Clear the current channel after successful deletion
            setCurrentIptvChannel(null);
            setCurrentCategory('All');
            setSearchTerm('');
            setIptvLoading(false);
            setShowIptvInfo(false);
            
            // Notify parent component about the deletion
            if (onChannelChange) {
                onChannelChange(null);
            }
            
        } catch (error) {
            console.error('Failed to delete channel:', error);
            setIptvError('Failed to delete channel');
            setIptvLoading(false);
        }
    };

    const changeIptvChannel = (channel) => {
        if (!channel || channel.url === currentIptvChannel?.url) return;
        
        setCurrentIptvChannel(channel);
        setCurrentCategory(channel.category || 'All');
        setSearchTerm('');
        setIsSidebarOpen(false);
        
        if (onChannelChange) onChannelChange(channel);
    };

    const filterChannelsByCategory = (category) => {
        if (category !== currentCategory) {
            setCurrentCategory(category);
            setSearchTerm('');
            if (onCategoryChange) onCategoryChange(category);
        }
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleToggleAudio = (e) => {
        e.stopPropagation();
        onToggleAudio();
    };

    const handleToggleExpand = (e) => {
        e.stopPropagation();
        setIsSidebarOpen(false);
        onToggleExpand();
    };

    const handleClose = (e) => {
        e.stopPropagation();
        setIsSidebarOpen(false);
        onClose();
    };

    const toggleSidebar = (e) => {
        e.stopPropagation();
        if (!isExpanded) {
            setIsSidebarOpen(prev => !prev);
        } else {
            setIsSidebarOpen(false);
        }
    };

    // Render
    const containerClasses = `video-container iptv-player ${isExpanded ? 'expanded' : ''} ${hasAudio ? 'audio-active' : ''} ${!isExpanded && isSidebarOpen ? 'sidebar-open' : ''}`;
    const audioButtonIcon = hasAudio ? <FaVolumeUp /> : <FaVolumeMute />;
    const audioButtonTitle = hasAudio ? "Mute" : "Unmute";
    const expandButtonIcon = isExpanded ? <FaCompress /> : <FaExpand />;
    const expandButtonTitle = isExpanded ? "Exit Fullscreen" : "Toggle Fullscreen";
    const randomChannel = isExpanded ? currentIptvChannel : getRandomChannel(filteredIptvChannels);

    return (
        <div className={containerClasses}>
            <video ref={iptvVideoRef} playsInline muted={!hasAudio} autoPlay={false} />

            {(iptvLoading || iptvError) && (
                <div className="video-overlay status-overlay">
                    {iptvLoading && <div className="spinner"></div>}
                    {iptvError && (
                        <div className="error-message">
                            {iptvError}
                            <button 
                                className="retry-button"
                                onClick={() => setIptvError(null)}
                            >
                                Dismiss
                            </button>
                        </div>
                    )}
                    {currentIptvChannel?.channelId && (
                        <button 
                            className="delete-button" 
                            onClick={handleDeleteChannel}
                            disabled={iptvLoading}
                        >
                            {iptvLoading ? 'Deleting...' : 'Delete Channel'}
                        </button>
                    )}
                </div>
            )}

            <div className={`iptv-info ${showIptvInfo ? 'show' : ''} ${iptvError ? (iptvError.startsWith('Error') ? 'error' : 'warning') : ''}`}>
                {iptvError ? iptvError : iptvLoading ? `Loading: ${currentIptvChannel?.name}` : `Playing: ${currentIptvChannel?.name || "No Channel"}`}
            </div>

            <div className="video-controls">
                {!isExpanded && (
                    <button
                        id={`sidebar-toggle-btn-${identifier}`}
                        className="control-btn sidebar-toggle-btn"
                        onClick={toggleSidebar}
                        title={isSidebarOpen ? "Close Channels" : "Open Channels"}
                        aria-label={isSidebarOpen ? "Close Channels" : "Open Channels"}
                        aria-expanded={isSidebarOpen}
                        aria-controls={`iptv-sidebar-content-${identifier}`}
                    >
                        {isSidebarOpen ? <FaTimes /> : <FaBars />}
                    </button>
                )}

                <div className={`stream-title ${isExpanded ? 'title-center-expanded' : ''} ${isSidebarOpen ? 'title-hidden-sidebar' : ''}`}>
                    IPTV: {iptvLoading ? "Loading..." : iptvError ? "Error" : currentIptvChannel?.name || "No Channel"}
                </div>

                <div className="control-buttons">
                    <button
                        className="control-btn random-btn"
                        onClick={(e) => { e.stopPropagation(); changeIptvChannel(randomChannel); }}
                        title="Random Channel"
                        disabled={!currentIptvChannel || iptvLoading}
                        aria-label="Random Channel"
                    >
                        <FaRandom />
                    </button>
                    <button
                        className="control-btn audio-btn"
                        onClick={handleToggleAudio}
                        title={audioButtonTitle}
                        disabled={!currentIptvChannel || iptvLoading}
                        aria-label={audioButtonTitle}
                    >
                        {audioButtonIcon}
                    </button>
                    <button
                        className="control-btn expand-btn"
                        onClick={handleToggleExpand}
                        title={expandButtonTitle}
                        disabled={!currentIptvChannel || iptvLoading}
                        aria-label={expandButtonTitle}
                    >
                        {expandButtonIcon}
                    </button>
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

            {!isExpanded && (
                <div
                    ref={sidebarRef}
                    className={`iptv-sidebar ${isSidebarOpen ? 'open' : ''}`}
                    id={`iptv-sidebar-content-${identifier}`}
                    aria-hidden={!isSidebarOpen}
                >
                    <div className="sidebar-header">
                        <h3>Channels</h3>
                        {/* <button
                            className="control-btn sidebar-close-btn"
                            onClick={toggleSidebar}
                            title="Close Channels"
                            aria-label="Close Channels"
                        >
                            <FaTimes />
                        </button> */}
                    </div>

                    <div className="iptv-category-filter sidebar-section">
                        <label htmlFor={`category-select-${identifier}`}>Category:</label>
                        <select
                            id={`category-select-${identifier}`}
                            value={currentCategory}
                            onChange={(e) => filterChannelsByCategory(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {uniqueCategories.map(category => (
                                <option key={category} value={category}>
                                    {category}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="iptv-search sidebar-section">
                        <label htmlFor={`search-input-${identifier}`} className="sr-only">Search Channels</label>
                        <input
                            id={`search-input-${identifier}`}
                            type="text"
                            placeholder="Search channels..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            onClick={(e) => e.stopPropagation()}
                            aria-label="Search IPTV Channels"
                        />
                    </div>

                    <div className="iptv-channel-list-wrapper sidebar-section">
                        <div className="iptv-channel-select">
                            {filteredIptvChannels.map((channel) => (
                                <button
                                    key={channel.id || channel.url}
                                    className={`iptv-channel-btn ${currentIptvChannel?.url === channel.url ? 'active' : ''}`}
                                    onClick={(e) => { e.stopPropagation(); changeIptvChannel(channel); }}
                                    title={channel.name}
                                >
                                    {channel.logo && <img src={channel.logo} alt="" className="channel-logo-small" onError={(e) => e.target.style.display = 'none'} />}
                                    <span className="channel-name">{channel.name}</span>
                                </button>
                            ))}
                            {safeChannels.length > 0 && filteredIptvChannels.length === 0 && searchTerm && (
                                <span className="no-results">No channels match "{searchTerm}".</span>
                            )}
                            {safeChannels.length > 0 && filteredIptvChannels.length === 0 && !searchTerm && currentCategory !== 'All' && (
                                <span className="no-results">No channels found in the "{currentCategory}" category.</span>
                            )}
                            {safeChannels.length > 0 && filteredIptvChannels.length === 0 && !searchTerm && currentCategory === 'All' && (
                                <span className="no-results">No channels available. Check filters.</span>
                            )}
                            {safeChannels.length === 0 && (
                                <span className="no-results">No channels loaded.</span>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}