import React, { useState, useRef, useEffect } from 'react';
import Hls from 'hls.js';
import {
    FaVolumeMute, FaVolumeUp, FaExpand, FaCompress,
    FaBars, FaTimes, FaSyncAlt, FaRandom, FaTrash, FaStar,
} from 'react-icons/fa';
import { deleteChannel } from './api';
import '../iptv.css';

export default function IPTVPlayer({
    identifier,
    channels = [],
    data,
    isExpanded = false,
    hasAudio = false,
    onToggleAudio,
    onToggleExpand,
    onClose,
    onCategoryChange,
    onChannelChange,
    muted = true,
    onRequestUnmute
}) {
    // Debug: Log the data prop received
    useEffect(() => {
        console.log('[DEBUG] IPTVPlayer data prop:', data);
    }, [data]);
    // State
    // Exclude busted channelId 29952 from random selection.
    function pickRandomChannel(channelList) {
        if (!Array.isArray(channelList) || channelList.length === 0) return null;
        const filtered = channelList.filter((c) => c && c.channelId !== 29952);
        if (filtered.length === 0) return null;
        const randomIndex = Math.floor(Math.random() * filtered.length);
        return filtered[randomIndex];
    }

    // Cycle to the next channel in the currently visible list (wraps at end).
    function getNextChannelInList(channelList, currentUrl) {
        if (!Array.isArray(channelList) || channelList.length === 0) return null;
        if (!currentUrl) return channelList[0];
        const currentIndex = channelList.findIndex((c) => c?.url === currentUrl);
        if (currentIndex === -1) return channelList[0];
        return channelList[(currentIndex + 1) % channelList.length];
    }

    // Always use the data prop for the current channel, fallback to random channel if missing
    const [currentIptvChannel, setCurrentIptvChannel] = useState(() => {
        if (data && data.url) return data;
        if (channels && channels.length > 0) return pickRandomChannel(channels);
        return null;
    });

    // Update currentIptvChannel whenever data changes
    useEffect(() => {
        if (data && data.url) {
            setCurrentIptvChannel(data);
        } else if (channels && channels.length > 0) {
            setCurrentIptvChannel(pickRandomChannel(channels));
        }
    }, [data, channels]);
    const [currentCategory, setCurrentCategory] = useState(
        currentIptvChannel?.category || 'All'
    );
    const [iptvLoading, setIptvLoading] = useState(false);
    const [iptvError, setIptvError] = useState(null);
    const [showIptvInfo, setShowIptvInfo] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const [isControlsbarOpen, setIsControlsbarOpen] = useState(false);
    //const [isExpanded, setIsExpanded] = useState(false);

    const [favouriteChannels, setFavoriteChannels] = useState(() => {
        const storedChannels = localStorage.getItem('favouriteChannels');
        return storedChannels ? JSON.parse(storedChannels) : [];
    });
    const [isFavourite, setIsFavourite] = useState(() => {
        if (favouriteChannels.length > 0) {
            return favouriteChannels.some(channel => channel.id === currentIptvChannel?.id);
        }
        return false;
    });


    // Refs
    const iptvVideoRef = useRef(null);
    const iptvHlsRef = useRef(null);
    const sidebarRef = useRef(null);
    const infoTimeoutRef = useRef(null);
    const playerRef = useRef(null);

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
        let hideTimeout;
        setIsControlsbarOpen(true);
        clearTimeout(hideTimeout);
        hideTimeout = setTimeout(() => {
            setIsControlsbarOpen(false);
        }, 5000);

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

                // Move to the next channel in the currently filtered list on stream error.
                const newChannel =
                    getNextChannelInList(filteredIptvChannels, currentIptvChannel?.url) ||
                    pickRandomChannel(safeChannels);
                if (newChannel) {
                    setCurrentIptvChannel(newChannel);
                    setCurrentCategory(newChannel.category || 'All');
                    setSearchTerm('');
                    setIsSidebarOpen(false);
                    if (onChannelChange) onChannelChange(newChannel);
                }
                setShowIptvInfo(true);
                setIptvError(`Error: ${data.details || data.type}`);
                console.error('HLS Error:', data);
                if (data.fatal) {
                    hls.destroy();
                    iptvHlsRef.current = null;
                }

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

    // controls menu bar
useEffect(() => {
    if (!playerRef.current) return; // Don’t continue if not mounted

    const player = playerRef.current;
    let hideTimeout;

    const handleMouseMove = (e) => {
        const rect = player.getBoundingClientRect();
        const mouseY = e.clientY;

        if (mouseY > rect.bottom - 80 && mouseY < rect.bottom) {
            setIsControlsbarOpen(true);

            clearTimeout(hideTimeout);
            hideTimeout = setTimeout(() => {
                setIsControlsbarOpen(false);
            }, 5000);
        }
    };

    player.addEventListener("mousemove", handleMouseMove);

    return () => {
        player.removeEventListener("mousemove", handleMouseMove);
        clearTimeout(hideTimeout);
    };
}, [playerRef.current]); // Runs again if playerRef changes

useEffect(() => {
    const interval = setInterval(() => {
        if (playerRef.current) {
            clearInterval(interval);

            const player = playerRef.current;
            let hideTimeout;

            const handleMouseMove = (e) => {
                const rect = player.getBoundingClientRect();
                const mouseY = e.clientY;

                if (mouseY > rect.bottom - 80 && mouseY < rect.bottom) {
                    setIsControlsbarOpen(true);
                    clearTimeout(hideTimeout);
                    hideTimeout = setTimeout(() => {
                        setIsControlsbarOpen(false);
                    }, 15000);
                }
            };

            player.addEventListener("mousemove", handleMouseMove);

            // Cleanup
            return () => {
                player.removeEventListener("mousemove", handleMouseMove);
                clearTimeout(hideTimeout);
            };
        }
    }, 100);

    return () => clearInterval(interval);
}, []);

    
    // Removed initialChannel logic; now always use data prop

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

    const clearFilters = (e) => {
        e.stopPropagation();
        setCurrentCategory('All');
        setSearchTerm('');
        if (onCategoryChange) onCategoryChange('All');
    };

    const handleToggleAudio = (e) => {
        e.stopPropagation();
        if (onToggleAudio) {
            onToggleAudio();
            return;
        }
        if (onRequestUnmute) onRequestUnmute();
    };

    // const handleToggleExpand = (e) => {
    //     e.stopPropagation();
    //     setIsSidebarOpen(false);
    //     onToggleExpand();
    // };

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
    const audioButtonIcon = !muted ? <FaVolumeUp /> : <FaVolumeMute />;
    const audioButtonTitle = !muted ? "Mute" : "Unmute";
    //const expandButtonIcon = isExpanded ? <FaCompress /> : <FaExpand />;
    const expandButtonTitle = isExpanded ? "Exit Fullscreen" : "Toggle Fullscreen";
    // delete button
    const deleteButtonIcon = <FaTrash />;
    const deleteButtonTitle = "Delete Channel";
    const deleteButtonClasses = `control-btn delete-btn ${iptvLoading ? 'loading' : ''}`;
    const deleteButtonDisabled = !currentIptvChannel || iptvLoading;

    // favoutite button
    // const favouriteButtonIcon = isFavourite ? <FaTrash /> : <FaTrash />;
    const favouriteButtonIcon = isFavourite ? <FaStar /> : <FaStar />;
    const favouriteButtonTitle = isFavourite ? "Remove from Favourites" : "Add to Favourites";
    const favouriteButtonClasses = `control-btn favourite-btn ${iptvLoading ? 'loading' : ''}`;
    const favouriteButtonDisabled = !currentIptvChannel || iptvLoading;

    useEffect(() => {
        const videoElement = iptvVideoRef.current;
        if (!videoElement) return;

        videoElement.defaultMuted = muted;
        videoElement.muted = muted;
        videoElement.volume = 1;

        if (muted) {
            videoElement.setAttribute('muted', '');
            return;
        }

        videoElement.removeAttribute('muted');
        videoElement.play().catch((error) => {
            console.warn('Playback resume after unmute was blocked', error);
        });
    }, [muted]);

    return (
        <div className={`iptv-player-container ${containerClasses}`} ref={playerRef}>
            <video ref={iptvVideoRef} playsInline muted={muted} autoPlay={false} />

            {(iptvLoading || iptvError) && (
                <div className="video-overlay status-overlay">
                    {iptvLoading && <div className="tv-loader" aria-label="Loading" role="status" />}
                    {iptvError && <div className="error-message">{iptvError}</div>}
                </div>
            )}

            <div className={`iptv-info ${showIptvInfo ? 'show' : ''} ${iptvError ? (iptvError.startsWith('Error') ? 'error' : 'warning') : ''}`}>
            </div>

            <div className="video-controls">
                <div className={`controls-bar ${isControlsbarOpen ? 'open' : ''}`}>
                    <div className="controls-layout">
                        <div className="controls-left">
                            <div className={`stream-title ${isExpanded ? 'title-center-expanded' : ''} ${isSidebarOpen ? 'title-hidden-sidebar' : ''}`}>
                                {iptvLoading ? '' : iptvError ? 'Error' : currentIptvChannel?.name || 'No Channel'}
                            </div>
                        </div>

                        <div className="controls-center">
                            <button
                                className={favouriteButtonClasses}
                                onClick={(e) => { e.stopPropagation(); setIsFavourite(!isFavourite); }}
                                title={favouriteButtonTitle}
                                disabled={favouriteButtonDisabled}
                                aria-label={favouriteButtonTitle}
                            >
                                {favouriteButtonIcon}
                            </button>
                            <button
                                className="control-btn random-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    const nextChannel = getNextChannelInList(filteredIptvChannels, currentIptvChannel?.url);
                                    if (nextChannel) changeIptvChannel(nextChannel);
                                }}
                                title="Next Channel"
                                disabled={!currentIptvChannel || iptvLoading}
                                aria-label="Next Channel"
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
                        </div>

                        <div className="controls-right">
                            <button
                                id={`sidebar-toggle-btn-${identifier}`}
                                className="control-btn sidebar-toggle-btn"
                                onClick={toggleSidebar}
                                title={isSidebarOpen ? 'Close Channels' : 'Open Channels'}
                                aria-label={isSidebarOpen ? 'Close Channels' : 'Open Channels'}
                                aria-expanded={isSidebarOpen}
                                aria-controls={`iptv-sidebar-content-${identifier}`}
                            >
                                {isSidebarOpen ? <FaTimes /> : <FaBars />}
                            </button>
                            <button
                                className={deleteButtonClasses}
                                onClick={handleDeleteChannel}
                                title={deleteButtonTitle}
                                disabled={deleteButtonDisabled}
                                aria-label={deleteButtonTitle}
                                aria-disabled={deleteButtonDisabled}
                                type="button"
                            >
                                <FaTrash />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {!isExpanded && (
                <div
                    ref={sidebarRef}
                    className={`iptv-sidebar ${isSidebarOpen ? 'open' : ''}`}
                    id={`iptv-sidebar-content-${identifier}`}
                    aria-hidden={!isSidebarOpen}
                >
                    <div className="iptv-sidebar-top">
                        <div className="iptv-browse-header">
                            <h3 className="iptv-browse-title">Browse Channels</h3>
                            <span className="iptv-browse-subtitle">{filteredIptvChannels.length} of {safeChannels.length}</span>
                        </div>

                        <div className="iptv-browse-search sidebar-section">
                            <div className="iptv-browse-search-row">
                                <button
                                    type="button"
                                    className="iptv-browse-clear-btn"
                                    onClick={clearFilters}
                                    disabled={currentCategory === 'All' && !searchTerm}
                                >
                                    Reset
                                </button>
                                <label htmlFor={`search-input-${identifier}`} className="sr-only">Search Channels</label>
                                <input
                                    id={`search-input-${identifier}`}
                                    type="text"
                                    placeholder="Search channels..."
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    onClick={(e) => e.stopPropagation()}
                                    className="iptv-browse-search-input"
                                    aria-label="Search IPTV Channels"
                                />
                            </div>
                        </div>

                        <div className="iptv-browse-categories sidebar-section" role="listbox" aria-label="Channel categories">
                            {uniqueCategories.map((category) => (
                                <button
                                    key={category}
                                    type="button"
                                    className={`iptv-browse-category-btn ${currentCategory === category ? 'active' : ''}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        filterChannelsByCategory(category);
                                    }}
                                    aria-selected={currentCategory === category}
                                    title={category}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>

                        <div className="iptv-browse-resultsbar sidebar-section">
                            <span className="iptv-browse-resultscount">{currentCategory === 'All' ? 'All categories' : currentCategory}</span>
                            <span className="iptv-browse-resultscount">{filteredIptvChannels.length} channels</span>
                        </div>
                    </div>

                    <div className="iptv-channel-list-wrapper sidebar-section">
                        <div className="iptv-channel-select">
                            {filteredIptvChannels.map((channel, index) => (
                                <button
                                    key={`${channel.id || index}-${channel.url || 'unknown'}`}
                                    className={`iptv-channel-card ${currentIptvChannel?.url === channel.url ? 'active' : ''}`}
                                    onClick={(e) => { e.stopPropagation(); changeIptvChannel(channel); }}
                                    title={channel.name}
                                >
                                    {channel.Logo && (
                                        <img
                                            src={channel.Logo}
                                            alt="Channel logo"
                                            className="channel-logo-small"
                                            onError={(e) => {
                                                console.error(`Failed to load image: ${channel.Logo}`, e);
                                                e.target.style.display = 'none';
                                            }}
                                        />
                                    )}
                                    <div className="iptv-channel-card-copy">
                                        <span className="channel-name">{channel.name}</span>
                                        <span className="iptv-channel-card-meta">{channel.category || 'Unknown'}</span>
                                    </div>
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