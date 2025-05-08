import { useState } from "react";
import SelectionScreen from "./SelectionScreen";
import Sidebar from "./Sidebar";
import IPTVPlayer from "./IPTVPlayer";

function App() {
  const [screenCount, setScreenCount] = useState(1);
  const [gridLayout, setGridLayout] = useState("1x1");
  const [slots, setSlots] = useState({}); // <-- Track what's inside each slot!

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
      <DynamicGrid
        gridLayout={gridLayout}
        screenCount={screenCount}
        handleSelect={handleSelect}
        slots={slots} // <-- Pass slots
      />
    </div>
  );
}

function DynamicGrid({ gridLayout, screenCount, handleSelect, slots }) {
  const [cols, rows] = gridLayout.split("x").map(Number);

  return (
    <div className="flex-1 h-screen">
      <div className="sm:hidden grid grid-cols-1 gap-2 p-2 h-full w-full">
        {Array.from({ length: screenCount }).map((_, index) => (
          <div
            key={index}
            className="bg-gray-100 border border-gray-300 flex items-center justify-center"
            style={{
              height: `calc((100vh - ${screenCount * 0.5}rem) / ${screenCount})`,
            }}
          >
            {slots[index]?.type === "iptv" ? (
              <IPTVPlayer data={slots[index].data} /> 
            ) : (
              <SelectionScreen onSelect={(slotId, type, data) => handleSelect(index, type, data)} />
            )}
          </div>
        ))}
      </div>

      <div
        className="hidden sm:grid gap-4 p-4 h-full w-full"
        style={{
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
        }}
      >
        {Array.from({ length: screenCount }).map((_, index) => (
          <div
            key={index}
            className="bg-gray-100 border border-gray-300 flex items-center justify-center"
          >
            {slots[index]?.type === "iptv" ? (
              <IPTVPlayer data={slots[index].data} /> // show IPTV if selected
            ) : (
              <SelectionScreen onSelect={(slotId, type, data) => handleSelect(index, type, data)} />
            )}
          </div>
        ))}
        {Array.from({ length: cols * rows - screenCount }).map((_, index) => (
          <div
            key={`empty-${index}`}
            className="bg-gray-200 border border-gray-300"
          />
        ))}
      </div>
    </div>
  );
}

export default App;
