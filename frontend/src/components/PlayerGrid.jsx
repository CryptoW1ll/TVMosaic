import React, { useEffect, useRef, useState } from "react";

const PlayerView = ({ player }) => {
  return (
    <div className="w-full h-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold rounded">
      {player.name}
    </div>
  );
};

const PlayerGrid = ({ players }) => {
  const containerRef = useRef(null);
  const [gridStyles, setGridStyles] = useState({});

  useEffect(() => {
    const updateGrid = () => {
      const aspectRatio = 9 / 16; // height / width
      const columnCount = players.length <= 4 ? 2 : 3;
      const rowCount = Math.ceil(players.length / columnCount);

      const containerHeight = window.innerHeight;
      const containerWidth = window.innerWidth;

      const gapSize = 12; // px
      const totalGapHeight = gapSize * (rowCount - 1);
      const totalGapWidth = gapSize * (columnCount - 1);

      const cellHeight = (containerHeight - totalGapHeight) / rowCount;
      const cellWidth = cellHeight / aspectRatio;

      // If total width exceeds screen, reduce cell size proportionally
      const totalWidth = cellWidth * columnCount + totalGapWidth;
      let finalCellWidth = cellWidth;
      let finalCellHeight = cellHeight;
      if (totalWidth > containerWidth) {
        finalCellWidth = (containerWidth - totalGapWidth) / columnCount;
        finalCellHeight = finalCellWidth * aspectRatio;
      }

      setGridStyles({
        gridTemplateColumns: `repeat(${columnCount}, ${finalCellWidth}px)`,
        gridAutoRows: `${finalCellHeight}px`,
        gap: `${gapSize}px`,
      });
    };

    updateGrid();
    window.addEventListener("resize", updateGrid);
    return () => window.removeEventListener("resize", updateGrid);
  }, [players.length]);

  return (
    <div ref={containerRef} className="w-screen h-screen p-2 box-border">
      <div
        className="grid w-full h-full justify-center content-center"
        style={gridStyles}
      >
        {players.map((player) => (
          <div
            key={player.id}
            className="bg-black text-white flex items-center justify-center rounded-md"
          >
            <PlayerView player={player} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlayerGrid;
