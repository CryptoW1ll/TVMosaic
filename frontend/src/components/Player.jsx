// components/YouTubePlayer.jsx
import React from "react";
import ReactPlayer from "react-player";

export default function Player({ url, isExpanded, className }) {
  return (
    <div
      className={`youtube-container ${className} ${isExpanded ? "expanded" : ""}`}
      style={{
        width: "100%",
        aspectRatio: "16/9",        // Match your other players
        backgroundColor: "#000",    // Black background for consistency
        borderRadius: "8px",        // Rounded corners like other players
        overflow: "hidden",         // Hide YouTube's iframe border
      }}
    >
      <ReactPlayer
        url={url}
        width="100%"
        height="100%"
        controls={true}
        config={{
          youtube: {
            playerVars: {
              modestbranding: 1,    // Hide YouTube logo
              rel: 0,               // Disable related videos at end
            },
          },
        }}
      />
    </div>
  );
}