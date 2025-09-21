import { useState, useEffect } from 'react';
//import '../iptv.css';
import '../tizen.css'; // Uncomment if you have a separate Tizen CSS file
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTableCellsLarge, faTableCells, faSquarePlus, faSquareMinus} from '@fortawesome/free-solid-svg-icons';
import { faSquare as faSquareRegular } from '@fortawesome/free-regular-svg-icons';


function Sidebar({ gridTypes, currentGrid, changeGridType, addScreen, canAddScreen, removeScreen, canRemoveScreen, screenCount }) {
    const [isVisible, setIsVisible] = useState(false); 

    const handleAddScreenClick = () => {
            addScreen();
            setIsVisible(false);
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
        <div className="hamburger-row mb-4">
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
        </div>

        <div className="grid-types-row flex flex-row gap-2 mb-4">
          {gridTypes.map((grid) => (
            <button
              key={grid.id}
              onClick={() => {
                changeGridType(grid.id);
                setIsVisible(false);
              }}
              className={`tizen-button ${
                currentGrid.id === grid.id ? 'active' : ''
              }`}
            >
              <span className="flex items-center justify-between w-full">
                {getGridIcon(grid.name)}
              </span>
            </button>
          ))}
        </div>

        <div className="add-iptv-row flex flex-row gap-2">
          <button
            onClick={handleAddScreenClick}
            disabled={!(screenCount === 1 || canAddScreen)}
            className={`tizen-button ${
              !(screenCount === 1 || canAddScreen) ? 'disabled' : ''
            }`}
          >
            <FontAwesomeIcon icon={faSquarePlus} />
          </button>

          <button
            onClick={removeScreen}
            disabled={!canRemoveScreen}
            className={`tizen-button ${
              !canRemoveScreen ? 'disabled' : ''
            }`}
          >
            <FontAwesomeIcon icon={faSquareMinus} />
          </button>
        </div>
      </div>
    )}
  </>
);

}

export default Sidebar;
