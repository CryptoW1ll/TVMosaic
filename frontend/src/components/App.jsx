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
      {/* Mobile grid (sm:hidden) */}
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

      {/* Larger grid (sm:grid, md:grid-cols-2, lg:grid-cols-3, etc.) */}
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
            className="bg-gray-100 border border-gray-300 flex items-center justify-center"
          >
            {slots[index]?.type === "iptv" ? (
              <IPTVPlayer data={slots[index].data} /> // show IPTV if selected
            ) : slots[index]?.type === "plex" ? (
              <TVGarden data={slots[index].data} />
            ) : (
              <SelectionScreen onSelect={(slotId, type, data) => handleSelect(index, type, data)} />
            )}
          </div>
        ))}
        {/* {Array.from({ length: cols * rows - screenCount }).map((_, index) => (
          <div
            key={`empty-${index}`}
            className="bg-gray-200 border border-gray-300"
          />
        ))} */}
        {Array.from({ length: cols * rows - screenCount }).map((_, index) => (
          <div
            key={`empty-${index}`}
            className="bg-gray-200 border border-gray-300 bg-center bg-cover"
            style={{
              // image tag" https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Philips_PM5544.svg/2560px-Philips_PM5544.svg.png
              backgroundImage: 'url(./Philips_PM5544.svg.png)',
            }}
          />
        ))}

      </div>
      <p className="text-xs text-gray-500 mt-2">
        Image credit: <a className="underline" href="https://commons.wikimedia.org/wiki/File:Philips_PM5544.svg" target="_blank" rel="noopener noreferrer">Philips PM5544 test card</a> via Wikimedia Commons
      </p>
    </div>
  );
}


export default App;

// import { useState } from "react";
// import SelectionScreen from "./SelectionScreen";
// import Sidebar          from "./Sidebar";
// import IPTVPlayer       from "./IPTVPlayer";

// function App() {
//   const [gridLayout, setGridLayout] = useState("1x1");   // "NxM"
//   const [slots, setSlots]     = useState({});            // id → {type,data}

//   /* ───────── derived helpers ───────── */
//   const [cols, rows] = gridLayout.split("x").map(Number);
//   const screenCount  = cols * rows;                      // 1,4,9 …

//   /* ───────── UI helpers ────────────── */
//   const gridTypes = [
//     { id: "1x1", name: "1×1 Grid" },
//     { id: "2x2", name: "2×2 Grid" },
//     { id: "3x3", name: "3×3 Grid" },
//   ];

//   const changeGridType = (layout) => {
//     setGridLayout(layout);        // screenCount updates automatically
//     setSlots({});                 // wipe selections
//   };

//   const addScreen = () => {
//     // let user progressively fill the grid
//     const filled = Object.keys(slots).length;
//     if (filled < screenCount) {
//       setSlots((p) => ({ ...p, [filled]: null }));     // reserve next slot
//     }
//   };

//   const canAddScreen = Object.keys(slots).length < screenCount;

//   const handleSelect = (slotId, type, data) =>
//     setSlots((p) => ({ ...p, [slotId]: { type, data } }));

//   /* ───────── render ─────────────────── */
//   return (
//     <div className="flex h-screen overflow-hidden">
//       <Sidebar
//         gridTypes={gridTypes}
//         //currentGrid={gridTypes.find((g) => g.id === gridLayout)!}
//         currentGrid={gridTypes.find((g) => g.id === gridLayout)}
//         changeGridType={changeGridType}
//         addScreen={addScreen}
//         canAddScreen={canAddScreen}
//       />

//       <DynamicGrid
//         cols={cols}
//         rows={rows}
//         slots={slots}
//         handleSelect={handleSelect}
//       />
//     </div>
//   );
// }

// /* ======================================================================= */

// function DynamicGrid({ cols, rows, slots, handleSelect }) {
//   const cell = (index) => {
//     const slot = slots[index];
//     if (!slot)
//       return (
//         <SelectionScreen
//           onSelect={(id, type, data) => handleSelect(index, type, data)}
//         />
//       );
//     if (slot.type === "iptv")  return <IPTVPlayer data={slot.data} />;
//     if (slot.type === "plex")  return <TVGarden   data={slot.data} />;
//   };

//   /* ───────── mobile: single column ─── */
//   const totalCells = cols * rows;
//   return (
//     <div className="flex-1 flex flex-col min-h-0">
//       <div className="sm:hidden grid grid-cols-1 gap-2 p-2 flex-1 overflow-auto">
//         {Array.from({ length: totalCells }).map((_, i) => (
//           <div
//             key={i}
//             className="border border-gray-300 flex items-center justify-center aspect-video bg-gray-100"
//           >
//             {cell(i)}
//           </div>
//         ))}
//       </div>

//       {/* ───────── desktop grid ───────── */}
//       <div
//         className="hidden sm:grid flex-1 min-h-0 overflow-auto gap-1 p-1"
//         style={{
//           gridTemplateColumns: `repeat(${cols}, 1fr)`,
//           gridTemplateRows:    `repeat(${rows}, 1fr)`,
//         }}
//       >
//         {Array.from({ length: totalCells }).map((_, i) => (
//           <div
//             key={i}
//             className="border border-gray-300 flex items-center justify-center aspect-video bg-gray-100"
//           >
//             {cell(i)}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// export default App;

