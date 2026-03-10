import { useState } from "react";
import { VIDEOS } from "./data/data.js";
import DiscoverPage from "./pages/Discover.jsx";
import VideoPlayerPage from "./pages/VideoPlayer.jsx";

export default function App() {
  const [playingVideo, setPlayingVideo] = useState(null);

  const handleNext = () => {
    if (!playingVideo) return;
    const idx = VIDEOS.findIndex(v => v.id === playingVideo.id);
    setPlayingVideo(VIDEOS[(idx + 1) % VIDEOS.length]);
  };

  const handlePrev = () => {
    if (!playingVideo) return;
    const idx = VIDEOS.findIndex(v => v.id === playingVideo.id);
    setPlayingVideo(VIDEOS[(idx - 1 + VIDEOS.length) % VIDEOS.length]);
  };

  return (
    <>
      <DiscoverPage onSelectVideo={setPlayingVideo} />

      {playingVideo && (
        <VideoPlayerPage
          video={playingVideo}
          allVideos={VIDEOS}
          onBack={() => setPlayingVideo(null)}
          onNext={handleNext}
          onPrev={handlePrev}
        />
      )}
    </>
  );
}