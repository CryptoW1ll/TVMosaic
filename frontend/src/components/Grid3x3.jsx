import IPTVPlayer from "./IPTVPlayer";

function Grid3x3() {
    return (
      <div className="h-screen w-screen">
        {/* Mobile: Single column (full width cells) */}
        <div className="sm:hidden grid grid-cols-1 gap-2 p-2 h-full w-full">
          {Array.from({ length: 9 }).map((_, index) => (
            <div 
              key={index}
              className="bg-gray-100 border border-gray-300 flex items-center justify-center"
              style={{ height: 'calc((100vh - 2rem) / 9)' }} // Equal height rows
            >
              <IPTVPlayer/> 
            </div>
          ))}
        </div>
  
        {/* Desktop: 3x3 grid */}
        <div className="hidden sm:grid grid-cols-3 grid-rows-3 gap-4 p-4 h-full w-full">
          {Array.from({ length: 9 }).map((_, index) => (
            <div 
              key={index}
              className="bg-gray-100 border border-gray-300 flex items-center justify-center"
            >
              <IPTVPlayer/> 
            </div>
          ))}
        </div>
      </div>
    )
  }
  
  export default Grid3x3;
