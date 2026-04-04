import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTableCellsLarge, faTableCells, faSquarePlus, faSquareMinus } from '@fortawesome/free-solid-svg-icons';
import { faSquare as faSquareRegular } from '@fortawesome/free-regular-svg-icons';

export default function Navbar({ gridTypes, currentGrid, changeGridType, addScreen, canAddScreen, removeScreen, canRemoveScreen, screenCount }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  function getGridIcon(name) {
    switch (name) {
      case '1x1 Grid': return <FontAwesomeIcon icon={faSquareRegular} />;
      case '2x2 Grid': return <FontAwesomeIcon icon={faTableCellsLarge} />;
      default: return <FontAwesomeIcon icon={faTableCells} />;
    }
  }

  const timeStr = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateStr = time.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <header className="tv-navbar">
      {/* Logo */}
      <div className="tv-navbar__logo">
        <svg viewBox="0 0 20 20" fill="currentColor" className="tv-navbar__logo-icon" aria-hidden="true">
          <rect x="1" y="1" width="8" height="8" rx="1.5" />
          <rect x="11" y="1" width="8" height="8" rx="1.5" />
          <rect x="1" y="11" width="8" height="8" rx="1.5" />
          <rect x="11" y="11" width="8" height="8" rx="1.5" />
        </svg>
        <span className="tv-navbar__logo-text">
          TV<span className="tv-navbar__logo-accent">Mosaic</span>
        </span>
        <span className="tv-navbar__live-badge">LIVE</span>
      </div>

      {/* Layout Controls */}
      <nav className="tv-navbar__controls" aria-label="Grid layout controls">
        <div className="tv-navbar__grid-group" role="group" aria-label="Select grid layout">
          {gridTypes && gridTypes.map((grid) => (
            <button
              key={grid.id}
              className={`tv-navbar__grid-btn${currentGrid?.id === grid.id ? ' tv-navbar__grid-btn--active' : ''}`}
              onClick={() => changeGridType(grid.id)}
              title={grid.name}
              aria-pressed={currentGrid?.id === grid.id}
            >
              {getGridIcon(grid.name)}
            </button>
          ))}
        </div>

        <div className="tv-navbar__sep" aria-hidden="true" />

        <div className="tv-navbar__screen-group" role="group" aria-label="Screen management">
          <button
            className="tv-navbar__action-btn"
            onClick={addScreen}
            disabled={!(screenCount === 1 || canAddScreen)}
            title="Add screen"
          >
            <FontAwesomeIcon icon={faSquarePlus} />
            <span>Add</span>
          </button>
          <button
            className="tv-navbar__action-btn"
            onClick={removeScreen}
            disabled={!canRemoveScreen}
            title="Remove screen"
          >
            <FontAwesomeIcon icon={faSquareMinus} />
            <span>Remove</span>
          </button>
        </div>
      </nav>

      {/* Clock */}
      <div className="tv-navbar__clock" aria-live="polite" aria-atomic="true">
        <span className="tv-navbar__time">{timeStr}</span>
        <span className="tv-navbar__date">{dateStr}</span>
      </div>
    </header>
  );
}