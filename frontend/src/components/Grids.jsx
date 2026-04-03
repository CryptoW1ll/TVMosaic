import { useEffect, useState, useRef } from "react";
import IPTVPlayer from "./IPTVPlayer";
import SelectionScreen from "./SelectionScreen";

function Grids({ gridLayout, screenCount, handleSelect, slots, selectedSlot, setSelectedSlot, handleAddScreenClick }) {
  // Helper to get a random channel excluding busted channelId 29952
  function getRandomChannel(slot) {
    if (!slot?.data || !Array.isArray(slot.data.channels)) return slot?.data;
    const filtered = slot.data.channels.filter(c => c.channelId !== 29952);
    if (filtered.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * filtered.length);
    return filtered[randomIndex];
  }
  // Debug: Log slot data for each player
  useEffect(() => {
    for (let i = 0; i < screenCount; i++) {
      console.log(`[DEBUG] Grids: slot[${i}]`, slots[i]);
    }
  }, [slots, screenCount]);
  const [cols, rows] = gridLayout.split("x").map(Number);
  const [isNarrow, setIsNarrow] = useState(window.innerWidth < 960);
  const containerRef = useRef(null);
  const [mutedStates, setMutedStates] = useState({});

  useEffect(() => {
    const handleResize = () => {
      setIsNarrow(window.innerWidth < 960);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const columnCount = isNarrow ? 1 : cols;
  const rowCount = isNarrow ? screenCount : rows;

  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.clientWidth);
    }

    const onResize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const aspectRatio = 9 / 16;
  const gridHeight = containerRef.current ? containerRef.current.clientHeight : window.innerHeight;
  let cellWidth = containerWidth / columnCount;
  let cellHeight = cellWidth * aspectRatio;

  // Ensure the height fits within the container
  const maxHeight = gridHeight / rowCount;
  if (cellHeight > maxHeight) {
    cellHeight = maxHeight;
    cellWidth = cellHeight / aspectRatio;
  }

  return (
    <div
      ref={containerRef}
      className="relative flex-1"
      style={{ height: gridHeight, minHeight: gridHeight }}
    >
      <div
        className="grid gap-1 p-1 h-full w-full"
        style={{
          gridTemplateColumns: `repeat(${columnCount}, ${cellWidth}px)`,
          gridAutoRows: `${cellHeight}px`,
        }}
      >
        {Array.from({ length: screenCount }).map((_, index) => (
          <div
            key={index}
            className="bg-gray-100 flex items-center justify-center aspect-video cursor-pointer"
            style={{
              border: selectedSlot === index ? "2px solid red" : "1px solid black",
              boxSizing: "border-box",
            }}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedSlot(index);
            }}
          >
            {slots[index]?.type === "iptv" && slots[index]?.data && slots[index]?.data.url
            ? (<IPTVPlayer 
                data={index === 0 ? { ...slots[index].data, channelId: undefined } : slots[index].data} // force random for player 0
                channels={Object.values(slots).map(s => s.data).filter(c => c && c.url && c.channelId !== 29952)}
                audioEnabled={selectedSlot === index} 
                muted={selectedSlot !== index} 
                onRequestUnmute={() => setSelectedSlot(selectedSlot === index ? null : index)}
              />) 
            : (<SelectionScreen onSelect={(slotId, type, data) => handleSelect(index, type, data)} />)
            }
          </div>
        ))}

        {Array.from({ length: Math.max(0, cols * rows - screenCount) }).map((_, index) => (
          <div
            key={`empty-${index}`}
            className="bg-gray-200 border border-gray-300 bg-center bg-cover flex items-center justify-center"
            style={{
              backgroundImage: 'url(./Philips_PM5544.svg.png)',
              aspectRatio: '16/9',
            }}
          >
            <button
              onClick={handleAddScreenClick}
              className="add-player-btn bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Add Player
            </button>
          </div>
        ))}
      </div>

      <div className="absolute bottom-1 right-1 bg-black bg-opacity-60 text-white text-[10px] px-1 rounded">
        {/* Image:{" "} */}
        <a
          className="underline"
          href="https://commons.wikimedia.org/wiki/File:Philips_PM5544.svg"
          target="_blank"
          rel="noopener noreferrer"
        >
          {/* Philips PM5544 */}
        </a>
      </div>
    </div>
  );
}

export default Grids;
