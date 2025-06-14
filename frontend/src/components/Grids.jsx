import { useEffect, useState, useRef } from "react";
import IPTVPlayer from "./IPTVPlayer";
import SelectionScreen from "./SelectionScreen";

function Grids({ gridLayout, screenCount, handleSelect, slots, selectedSlot, setSelectedSlot }) {
  const [cols, rows] = gridLayout.split("x").map(Number);
  const [isNarrow, setIsNarrow] = useState(window.innerWidth < 960);
  const containerRef = useRef(null);

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
  const cellWidth = containerWidth / columnCount;
  const gridHeight = cellWidth * aspectRatio * rowCount;

  return (
    <div
      ref={containerRef}
      className="relative flex-1"
      style={{ height: gridHeight, minHeight: gridHeight }}
    >
      <div
        className="grid gap-1 p-1 h-full w-full"
        style={{
          gridTemplateColumns: `repeat(${columnCount}, 1fr)`,
          gridAutoRows: 'auto',
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
            {slots[index]?.type === "iptv" ? (
              <IPTVPlayer data={slots[index].data} audioEnabled={selectedSlot === index} />
            ) : slots[index]?.type === "plex" ? (
              <SelectionScreen onSelect={(slotId, type, data) => handleSelect(index, type, data)} />
            ) : (
              <SelectionScreen onSelect={(slotId, type, data) => handleSelect(index, type, data)} />
            )}
          </div>
        ))}

        {Array.from({ length: cols * rows }).map((_, index) => (
          <div
            key={`empty-${index}`}
            className="bg-gray-200 border border-gray-300 bg-center bg-cover flex items-center justify-center"
            style={{
              backgroundImage: 'url(./Philips_PM5544.svg.png)',
              aspectRatio: '16/9',
            }}
          >
            <button
              onClick={() => {
                alert("Add Player Button Clicked");
              }}
              className="add-player-btn bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Add Player
            </button>
          </div>
        ))}
      </div>

      <div className="absolute bottom-1 right-1 bg-black bg-opacity-60 text-white text-[10px] px-1 rounded">
        Image:{" "}
        <a
          className="underline"
          href="https://commons.wikimedia.org/wiki/File:Philips_PM5544.svg"
          target="_blank"
          rel="noopener noreferrer"
        >
          Philips PM5544
        </a>
      </div>
    </div>
  );
}

export default Grids;
