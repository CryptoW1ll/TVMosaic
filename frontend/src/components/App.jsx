import { useState, useEffect } from "react";
import SelectionScreen from "./SelectionScreen";
import Sidebar from "./Sidebar";
import IPTVPlayer from "./IPTVPlayer";

function App() {
  const [screenCount, setScreenCount] = useState(1);
  const [gridLayout, setGridLayout] = useState("1x1");
  const [slots, setSlots] = useState({}); // <-- Track what's inside each slot!

  const [selectedSlot, setSelectedSlot] = useState(null);



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
    //const maxScreens = cols * rows;           // always correct

    if (screenCount < maxScreens) {
      setScreenCount(screenCount + 1);
    }
  };

  const canAddScreen =
    screenCount < (gridLayout === "1x1" ? 1 : gridLayout === "2x2" ? 4 : 9);

  const handleSelect = (slotId, type, data) => {
    console.log("Selected Slot:", slotId, "Type:", type, "Data:", data);
    if (type === "iptv") {
      setSlots((prev) => ({
        ...prev,
        [slotId]: { type: "iptv", data },
      }));
    }
    else if (type === "plex") {
      setSlots((prev) => ({
        ...prev,
        [slotId]: { type: "plex", data },
      }));
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar
        gridTypes={gridTypes}
        currentGrid={gridTypes.find((g) => g.id === gridLayout) || gridTypes[0]}
        changeGridType={changeGridType}
        addScreen={addScreen}
        canAddScreen={canAddScreen}
      />
      {/* <DynamicGrid
        gridLayout={gridLayout}
        screenCount={screenCount}
        handleSelect={handleSelect}
        slots={slots} // <-- Pass slots
      /> */}
      <DynamicGrid
          gridLayout={gridLayout}
          screenCount={screenCount}
          handleSelect={handleSelect}
          slots={slots}
          selectedSlot={selectedSlot}
          setSelectedSlot={setSelectedSlot}
        />

    </div>
  );
}


function DynamicGrid({ gridLayout, screenCount, handleSelect, slots, selectedSlot, setSelectedSlot }) {
  const [cols, rows] = gridLayout.split("x").map(Number);
  const [isNarrow, setIsNarrow] = useState(window.innerWidth < 960);

  useEffect(() => {
    const handleResize = () => {
      setIsNarrow(window.innerWidth < 960);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const columnCount = isNarrow ? 1 : cols;
  const rowCount = isNarrow ? screenCount : rows;

  return (
    <div className="relative flex-1 h-full">
      <div
        className="grid gap-1 p-1 h-full w-full"
        style={{
          gridTemplateColumns: `repeat(${columnCount}, 1fr)`,
          gridTemplateRows: `repeat(${rowCount}, 1fr)`,
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


function DynamicGrid2({ gridLayout, screenCount, handleSelect, slots, selectedSlot, setSelectedSlot }) {
  const [cols, rows] = gridLayout.split("x").map(Number);

  return (
    <div className="relative flex-1 h-full">
      {/* <div
        className="hidden sm:grid gap-1 p-1 h-full w-full"
        style={{
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
        }}
      > */}
      <div
        className={`grid gap-1 p-1 h-full w-full ${
          cols > 1 ? "sm:grid-cols-" + cols : "grid-cols-1"
        }`}
        style={{
          gridTemplateColumns: cols === 1 ? `1fr` : undefined,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
        }}
      >

        {Array.from({ length: screenCount }).map((_, index) => (
          <div
            key={index}
            className={`bg-gray-100 flex items-center justify-center aspect-video cursor-pointer`}
            style={{
              border: selectedSlot === index ? '2px solid red' : '1px solid black',
              boxSizing: 'border-box',
            }}
            onClick={(e) => {
              e.stopPropagation();     // prevent bubbling if needed
              setSelectedSlot(index);  // update selected slot state
                         
            }}
          >
            {slots[index]?.type === "iptv" ? (
              <IPTVPlayer 
                data={slots[index].data} 
                audioEnabled={selectedSlot === index} 
              />
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
            }}
          />
        ))}
      </div>

      {/* Attribution */}
      <div className="absolute bottom-1 right-1 bg-black bg-opacity-60 text-white text-[10px] px-1 rounded">
        Image: <a
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


function DynamicGrid1({ gridLayout, screenCount, handleSelect, slots }) {
  const [cols, rows] = gridLayout.split("x").map(Number);

  return (
    <div className="relative flex-1 h-full">
      <div
        className="hidden sm:grid gap-1 p-1 h-full w-full"
        style={{
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
        }}
      >
        {Array.from({ length: screenCount }).map((_, index) => (
          <div
            key={index}
            // className="bg-gray-100 border border-gray-300 flex items-center justify-center"
            className="bg-gray-100 border border-gray-300 flex items-center justify-center aspect-video"

          >
            {slots[index]?.type === "iptv" ? (
              // <IPTVPlayer data={slots[index].data} />
              <IPTVPlayer data={slots[index].data} audioEnabled={audioEnabledSlot === index} />

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
            }}
          />
        ))}
      </div>

      {/* This paragraph overlays the grid */}
       <div className="absolute bottom-1 right-1 bg-black bg-opacity-60 text-white text-[10px] px-1 rounded">
      Image: <a
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


export default App;