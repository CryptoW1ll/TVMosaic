import IPTVPlayer from "./IPTVPlayer"; // Adjust the import path as necessary
function Grid1x1(props) {
    return (
      <div className="h-screen w-screen">
        {/* Full-screen centered content */}
        <div className="h-full w-full grid place-items-center"> {/* Covers full screen and centers */}
          <IPTVPlayer/> 
        </div>
      </div>
    );
  }
  
  export default Grid1x1;