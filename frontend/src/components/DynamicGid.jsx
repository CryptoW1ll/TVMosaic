import { useEffect, useState, useRef } from "react";
import SelectionScreen from "./SelectionScreen";
import Sidebar from "./Sidebar";

function DynamicGrid({ gridLayout, screenCount, handleSelect, slots, selectedSlot, setSelectedSlot }) {
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

  // Calculate height based on actual container width
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

  const aspectRatio = 9 / 16; // height / width

  // Cell width based on container width and columns
  const cellWidth = containerWidth / columnCount;
  const gridHeight = cellWidth * aspectRatio * rowCount;

  if (gridLayout === "1x1") {

    return (
      <div className="flex items-center justify-center w-full h-full bg-black p-2">
        <div
          className="bg-gray-100 flex items-center justify-center aspect-video cursor-pointer w-full max-w-full max-h-full"
          // style={{
          //   border: selectedSlot === 0 ? "2px solid red" : "1px solid black",
          //   boxSizing: "border-box",
          // }}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedSlot(0);
          }}
        >
          {slots[0]?.type === "iptv" ? (
            <IPTVPlayer data={slots[0].data} audioEnabled={selectedSlot === 0} />
          ) : slots[0]?.type === "plex" ? (
            <TVGarden data={slots[0].data} />
          ) : (
            <SelectionScreen onSelect={(slotId, type, data) => handleSelect(0, type, data)} />
          )}
        </div>
      </div>
    );
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
              <TVGarden data={slots[index].data} />
            ) : (
              <SelectionScreen onSelect={(slotId, type, data) => handleSelect(index, type, data)} />
            )}
          </div>
        ))}

        {Array.from({ length: cols * rows - screenCount }).map((_, index) => (
          <div
            key={`empty-${index}`}
            className="bg-gray-200 border border-gray-300 bg-center bg-cover"
            style={{
              backgroundImage: 'url(./Philips_PM5544.svg.png)',
              aspectRatio: '16/9',
            }}
          />
        ))}
      </div>

      {/* Attribution */}
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
export default DynamicGrid;