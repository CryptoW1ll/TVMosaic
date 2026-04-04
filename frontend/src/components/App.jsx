import { useState, useEffect } from "react";
import Navbar from "./Navbar";
import Grids from "./Grids";
import { fetchAllChannels } from "./api";

// Helper to get a random channel
function getRandomChannel(channelList) {
  if (!Array.isArray(channelList) || channelList.length === 0) return null;
  const filtered = channelList.filter((c) => c.channelId !== 29952);
  if (filtered.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * filtered.length);
  return filtered[randomIndex];
}

function App() {
  const [screenCount, setScreenCount] = useState(1);
  const [gridLayout, setGridLayout] = useState("3x3");
  const [slots, setSlots] = useState({});
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [channels, setChannels] = useState([]);
  const [channelsLoaded, setChannelsLoaded] = useState(false);

  // Debug: Log channels whenever they change
  useEffect(() => {
    console.log("[DEBUG] channels:", channels);
  }, [channels]);

  useEffect(() => {
    async function loadChannels() {
      try {
        console.log("[DEBUG] fetchAllChannels called in App.jsx");
        const chs = await fetchAllChannels();
        console.log("[DEBUG] fetchAllChannels result in App.jsx:", chs);
        setChannels(chs);
        setChannelsLoaded(true);
        if (chs && chs.length > 0) {
          const randomChannel = getRandomChannel(chs);
          setSlots({ 0: { type: "iptv", data: randomChannel } });
          setSelectedSlot(null);
        }
      } catch (e) {
        setChannelsLoaded(true);
        console.error("Failed to fetch channels", e);
      }
    }
    loadChannels();
  }, []);

  useEffect(() => {
    // Reset selectedSlot to 0 if grid changes or channels reload
    setSelectedSlot(null);
  }, [gridLayout, screenCount, channelsLoaded]);

  // Debug: Log slots whenever they change
  useEffect(() => {
    console.log("[DEBUG] slots:", slots);
  }, [slots]);

  // Debug: Log random channel selection
  useEffect(() => {
    if (channels && channels.length > 0) {
      const random = getRandomChannel(channels);
      console.log("[DEBUG] Random channel selected:", random);
    }
  }, [channels]);

  // Only update slots for new screens, not all screens
  useEffect(() => {
    if (channelsLoaded && channels.length > 0 && screenCount > 0) {
      setSlots((prev) => {
        const newSlots = { ...prev };
        for (let i = 0; i < screenCount; i++) {
          if (!newSlots[i]) {
            newSlots[i] = { type: "iptv", data: getRandomChannel(channels) };
          }
        }
        return newSlots;
      });
    }
  }, [channelsLoaded, channels, screenCount]);

  const gridTypes = [
    { id: "1x1", name: "1x1 Grid" },
    { id: "2x2", name: "2x2 Grid" },
    { id: "3x3", name: "3x3 Grid" },
  ];

  const changeGridType = (layout) => {
    setGridLayout(layout);
    switch (layout) {
      case "1x1":
        setScreenCount(1);
        break;
      case "2x2":
        setScreenCount(2);
        break;
      case "3x3":
        setScreenCount(4);
        break;
      default:
        setScreenCount(1);
    }
    setSlots({}); // Reset slots when layout changes
  };

  const addScreen = () => {
    const maxScreens = gridLayout === "1x1" ? 1 : gridLayout === "2x2" ? 4 : 9;
    if (screenCount < maxScreens && channels.length > 0) {
      const nextSlot = screenCount;
      const channel = getRandomChannel(channels); // Use a random channel for the new player
      setSlots((prev) => ({
        ...prev,
        [nextSlot]: { type: "iptv", data: channel },
      }));
      setScreenCount(screenCount + 1);
    }
  };

  const canAddScreen =
    screenCount < (gridLayout === "1x1" ? 1 : gridLayout === "2x2" ? 4 : 9);

  const removeScreen = () => {
    if (screenCount > 1) {
      const lastSlot = screenCount - 1;
      setSlots((prev) => {
        const newSlots = { ...prev };
        delete newSlots[lastSlot];
        return newSlots;
      });
      setScreenCount(screenCount - 1);
      if (selectedSlot === lastSlot) setSelectedSlot(null);
    }
  };

  const canRemoveScreen = screenCount > 1;

  const handleSelect = (slotId, type, data) => {
    console.log("Selected Slot:", slotId, "Type:", type, "Data:", data);
    if (type === "iptv") {
      setSlots((prev) => ({
        ...prev,
        [slotId]: { type: "iptv", data },
      }));
    } else if (type === "plex") {
      setSlots((prev) => ({
        ...prev,
        [slotId]: { type: "plex", data },
      }));
    }
  };

  return (
    <div className="tv-app">
      <Navbar
        gridTypes={gridTypes}
        currentGrid={gridTypes.find((g) => g.id === gridLayout) || gridTypes[0]}
        changeGridType={changeGridType}
        addScreen={addScreen}
        canAddScreen={canAddScreen}
        removeScreen={removeScreen}
        canRemoveScreen={canRemoveScreen}
        screenCount={screenCount}
      />
      {channelsLoaded ? (
        <Grids
          gridLayout={gridLayout}
          screenCount={screenCount}
          handleSelect={handleSelect}
          allChannels={channels}
          slots={slots}
          selectedSlot={selectedSlot}
          setSelectedSlot={setSelectedSlot}
          handleAddScreenClick={addScreen}
        />
      ) : (
        <div className="tv-app__loading">
          <div className="tv-app__loading-spinner" />
          <span>Loading channels&hellip;</span>
        </div>
      )}
    </div>
  );
}
export default App;