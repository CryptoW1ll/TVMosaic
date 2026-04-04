import { useEffect, useState, useRef } from "react";
import IPTVPlayer from "./IPTVPlayer";
import SelectionScreen from "./SelectionScreen";

function Grids({ gridLayout, screenCount, handleSelect, allChannels = [], slots, selectedSlot, setSelectedSlot, handleAddScreenClick }) {
  function getRandomChannel(slot) {
    if (!slot?.data || !Array.isArray(slot.data.channels)) return slot?.data;
    const filtered = slot.data.channels.filter(c => c.channelId !== 29952);
    if (filtered.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * filtered.length);
    return filtered[randomIndex];
  }

  useEffect(() => {
    for (let i = 0; i < screenCount; i++) {
      console.log(`[DEBUG] Grids: slot[${i}]`, slots[i]);
    }
  }, [slots, screenCount]);

  const [cols, rows] = gridLayout.split("x").map(Number);
  const [isNarrow, setIsNarrow] = useState(window.innerWidth < 960);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setIsNarrow(window.innerWidth < 960);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const columnCount = isNarrow ? 1 : cols;
  const rowCount = isNarrow ? screenCount : rows;

  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    if (containerRef.current) setContainerWidth(containerRef.current.clientWidth);
    const onResize = () => {
      if (containerRef.current) setContainerWidth(containerRef.current.clientWidth);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const aspectRatio = 9 / 16;
  // Use measured container height; fall back to viewport minus navbar so we never exceed the flex area
  const navbarH = 52;
  const gridHeight = (containerRef.current && containerRef.current.clientHeight > 0)
    ? containerRef.current.clientHeight
    : window.innerHeight - navbarH;
  let cellWidth = containerWidth / columnCount;
  let cellHeight = cellWidth * aspectRatio;
  const maxHeight = gridHeight / rowCount;
  if (cellHeight > maxHeight) {
    cellHeight = maxHeight;
    cellWidth = cellHeight / aspectRatio;
  }

  const playableChannels = (Array.isArray(allChannels) ? allChannels : []).filter(
    (c) => c && c.url && c.channelId !== 29952
  );

  return (
    <main
      ref={containerRef}
      className="tv-mosaic"
    >
      <div
        className="tv-mosaic__grid"
        style={{
          gridTemplateColumns: `repeat(${columnCount}, ${cellWidth}px)`,
          gridAutoRows: `${cellHeight}px`,
        }}
      >
        {Array.from({ length: screenCount }).map((_, index) => (
          <div
            key={index}
            className={`tv-mosaic__tile${selectedSlot === index ? ' tv-mosaic__tile--selected' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedSlot(index);
            }}
          >
            {slots[index]?.type === "iptv" && slots[index]?.data && slots[index]?.data.url
              ? (
                <IPTVPlayer
                  data={index === 0 ? { ...slots[index].data, channelId: undefined } : slots[index].data}
                  channels={playableChannels}
                  hasAudio={selectedSlot === index}
                  muted={selectedSlot !== index}
                  onToggleAudio={() => setSelectedSlot(selectedSlot === index ? null : index)}
                />
              )
              : (
                <SelectionScreen onSelect={(slotId, type, data) => handleSelect(index, type, data)} />
              )
            }
          </div>
        ))}

        {Array.from({ length: Math.max(0, cols * rows - screenCount) }).map((_, index) => (
          <div
            key={`empty-${index}`}
            className="tv-mosaic__tile tv-mosaic__tile--empty"
            style={{ aspectRatio: '16/9' }}
          >
            <button
              className="tv-mosaic__add-btn"
              onClick={handleAddScreenClick}
              aria-label="Add screen"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="tv-mosaic__add-icon">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v8M8 12h8" strokeLinecap="round" />
              </svg>
              <span>Add Screen</span>
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}

export default Grids;
