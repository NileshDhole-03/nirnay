// src/components/Course/VideoPlayer.jsx
/* eslint-disable react/prop-types */
import React from "react";

const VideoPlayer = ({ url }) => {
  if (!url) return <p className="text-red-500">No video available</p>;

  return (
    <div className="w-full rounded-xl overflow-hidden shadow-md">
      <iframe
        className="w-full h-[400px] lg:h-[500px]"
        src={url}
        title="Course Video Player"
        allowFullScreen
      />
    </div>
  );
};

export default VideoPlayer;
