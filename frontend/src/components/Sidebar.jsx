import { useState, useEffect } from 'react';
import '../iptv.css';


function Sidebar({ gridTypes, currentGrid, changeGridType, addScreen, canAddScreen, removeScreen, canRemoveScreen, screenCount }) {
    const [isVisible, setIsVisible] = useState(true); 

    const handleAddScreenClick = () => {
        if (screenCount === 1) {
            // When there's only one screen, switch to 2x2 grid
            const grid2x2 = gridTypes.find(grid => grid.name === '2x2');
            if (grid2x2) {
                changeGridType(grid2x2.id);
            }
        } else {
            addScreen();
        }
    };

    if (!isVisible) {
        return (
            // <button 
            //     onClick={() => setIsVisible(true)} 
            //     className="p-2 text-white fixed top-4 left-4 z-50"
            // >
            //     Open Sidebar
            // </button>
            <button            
              //className="control-btn sidebar-toggle-btn"
              className="p-2 text-white fixed top-4 left-4 z-50"
              onClick={() => setIsVisible(true)} 
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 6h16M4 12h16m-7 6h7" />
              </svg>  
            </button>
        );
    }


      return (
        <div className="bg-gray-200 p-4 w-48">
          <button            
              className="control-btn sidebar-toggle-btn"
              //onClick={toggleSidebar}
              onClick={() => setIsVisible(false)} 
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 6h16M4 12h16m-7 6h7" />
            </svg>  
          </button>

        {/* <h2 className="mb-4 font-semibold text-lg">Grids</h2> */}

        {gridTypes.map((grid) => (
          <button
            key={grid.id}
            onClick={() => changeGridType(grid.id)}
            className={`w-full mb-2 px-4 py-2 rounded-md ${
              currentGrid.id === grid.id
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-800 hover:bg-gray-300'
            }`}
          >
            {grid.name}
          </button>
        ))}

        {/* Add Screen Button */}
        <button
          onClick={handleAddScreenClick}
          // The button should be enabled if there is 1 screen or if we can add another screen
          disabled={!(screenCount === 1 || canAddScreen)} 
          className={`w-full mt-4 px-4 py-2 rounded-md ${
            (screenCount === 1 || canAddScreen) 
              ? 'bg-green-600 text-white hover:bg-green-700' 
              : 'bg-gray-400 text-gray-600 cursor-not-allowed'
          }`}
        >
          Add Screen
        </button>

        {/* Remove Screen Button */}
        <button
          onClick={removeScreen}
          disabled={!canRemoveScreen}
          className={`w-full mt-4 px-4 py-2 rounded-md ${
            canRemoveScreen 
              ? 'bg-red-600 text-white hover:bg-red-700' 
              : 'bg-gray-400 text-gray-600 cursor-not-allowed'
          }`}
        >
          Remove Screen
        </button>
      </div>
    );
}

export default Sidebar;
