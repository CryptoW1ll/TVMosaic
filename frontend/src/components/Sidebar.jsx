import { useState, useEffect } from 'react';
//import '../iptv.css';
import '../tizen.css'; // Uncomment if you have a separate Tizen CSS file
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTableCellsLarge, faTableCells, faSquarePlus, faSquareMinus} from '@fortawesome/free-solid-svg-icons';
import { faSquare as faSquareRegular } from '@fortawesome/free-regular-svg-icons';


function Sidebar({ gridTypes, currentGrid, changeGridType, addScreen, canAddScreen, removeScreen, canRemoveScreen, screenCount }) {
    const [isVisible, setIsVisible] = useState(false); 

    const handleAddScreenClick = () => {
        if (screenCount === 1) {
            // When there's only one screen, switch to 2x2 grid
            const grid2x2 = gridTypes.find(grid => grid.name === '2x2');
            if (grid2x2) {
                changeGridType(grid2x2.id);
                setIsVisible(false);
            }
        } else {
            addScreen();
            setIsVisible(false);
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

    function getGridIcon(name) {
      switch (name) {
        case '1x1 Grid':
          return <FontAwesomeIcon icon={faSquareRegular} />;
        case '2x2 Grid':
          return <FontAwesomeIcon icon={faTableCellsLarge} />;
        default:
          return <FontAwesomeIcon icon={faTableCells} />;
      }
    }


      return (
  <>
    {!isVisible ? (
      <button className="toggle-btn" onClick={() => setIsVisible(true)}>
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
    ) : (
      <div className="tizen-sidebar">
        <button className="toggle-btn" onClick={() => setIsVisible(false)}>
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

        {/* {gridTypes.map((grid) => (
          <button
            key={grid.id}
            onClick={() => changeGridType(grid.id)}
            className={`tizen-button ${
              currentGrid.id === grid.id ? 'active' : ''
            }`}
          >
            {grid.name}
          </button>
        ))} */}
       {gridTypes.map((grid, index) => (
        <button
          key={grid.id}
          onClick={() => {
            changeGridType(grid.id);
            setIsVisible(false);
          }}
          className={`tizen-button ${
            currentGrid.id === grid.id ? 'active' : ''
          } ${index === 0 ? 'mt-[60px]' : ''}`}
        >
          <span className="flex items-center justify-between w-full">
            {/* {grid.name} */}
            {getGridIcon(grid.name)}
          </span>
        </button>
        ))}


        <button
          onClick={handleAddScreenClick}
          disabled={!(screenCount === 1 || canAddScreen)}
          className={`tizen-button ${
            !(screenCount === 1 || canAddScreen) ? 'disabled' : ''
          }`}
        >
          {/* Add Screen */}
          <FontAwesomeIcon icon={faSquarePlus} />
        </button>

        <button
          onClick={removeScreen}
          disabled={!canRemoveScreen}
          className={`tizen-button ${
            !canRemoveScreen ? 'disabled' : ''
          }`}
        >
          {/* Remove Screen */}
          <FontAwesomeIcon icon={faSquareMinus} />
        </button>
      </div>
    )}
  </>
);

}

export default Sidebar;
