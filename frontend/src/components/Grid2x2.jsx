import IPTVPlayer from "./IPTVPlayer";

function Grid2x2() {
  return (
    <div className="flex-1 h-full w-full overflow-hidden">
      {/* Mobile: Stack vertically */}
      <div className="sm:hidden grid grid-cols-1 gap-2 p-2 h-full">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="bg-gray-100 border border-gray-300 flex items-center justify-center"
            style={{ height: 'calc((100vh - 2rem) / 4)' }} // optional fine-tune for mobile
          >
            <IPTVPlayer />
          </div>
        ))}
      </div>

      {/* Desktop: 2x2 Grid */}
      <div className="hidden sm:grid grid-cols-2 grid-rows-2 gap-4 p-4 h-full">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="bg-gray-100 border border-gray-300 flex items-center justify-center"
          >
            <IPTVPlayer />
          </div>
        ))}
      </div>
    </div>
  );
} export default Grid2x2;

// import IPTVPlayer from "./IPTVPlayer";

// function Grid2x2() {
//   return (
//     <div className="flex-1 h-full w-full overflow-hidden">
//       <div className="grid grid-cols-1 sm:grid-cols-2 sm:grid-rows-2 gap-4 p-4 h-full">
//         {Array.from({ length: 4 }).map((_, index) => (
//           <div
//             key={index}
//             className="bg-gray-100 border border-gray-300 flex items-center justify-center"
//           >
//             <IPTVPlayer />
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

