import { useState} from "react";
import Sidebar from "./Sidebar";
import Grids from "./Grids"; // Updated import

function App() {
  const [screenCount, setScreenCount] = useState(1);
  const [gridLayout, setGridLayout] = useState("3x3"); // 1x1
  const [slots, setSlots] = useState({}); 
  const [selectedSlot, setSelectedSlot] = useState(null);

  // const [players, setPlayers] = useState([
  //   { id: 1, name: "Screen_1", type: "iptv"},
  //   { id: 2, name: "Screen_2", type: "iptv"},
  //   { id: 3, name: "Screen_3", type: "iptv"},
  //   { id: 4, name: "Screen_4", type: "iptv"},
  //   { id: 5, name: "Screen_5", type: "iptv"},
  //   { id: 6, name: "Screen_6", type: "iptv"},
  //   { id: 7, name: "Screen_7", type: "iptv"},
  //   { id: 8, name: "Screen_8", type: "iptv"},
  //   { id: 9, name: "Screen_9", type: "iptv"},
  // ]);



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
      <Grids 
          gridLayout={gridLayout} 
          screenCount={screenCount} 
          handleSelect={handleSelect} 
          slots={slots} 
          selectedSlot={selectedSlot} 
          setSelectedSlot={setSelectedSlot} 
          handleAddScreenClick={addScreen} // Pass addScreen as handleAddScreenClick
        />
    </div>
  );
}
export default App;