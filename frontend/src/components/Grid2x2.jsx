import IPTVPlayer from "./IPTVPlayer";
function Grid2x2(){
    return(
        <div className="h-screen w-screen">
        {/* Mobile: Single column (full width cells) */}
        <div className="sm:hidden grid grid-cols-1 gap-2 p-2 h-full w-full">
          {Array.from({ length: 2 }).map((_, index) => (
            <div 
              key={index}
              className="bg-gray-100 border border-gray-300 flex items-center justify-center"
              style={{ height: 'calc((100vh - 2rem) / 4)' }}
            >
              <IPTVPlayer/> 
            </div>
          ))}
        </div>
  
        {/* Desktop: 2x2 grid */}
        <div className="hidden sm:grid grid-cols-2 grid-rows-2 gap-4 p-4 h-full w-full">
          {Array.from({ length: 2 }).map((_, index) => (
            <div 
              key={index}
              className="bg-gray-100 border border-gray-300 flex items-center justify-center"
            >
              <IPTVPlayer/> 
            </div>
          ))}
        </div>
      </div>);
} export default Grid2x2;