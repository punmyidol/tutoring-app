import { useState } from "react";
import { VIDEOS } from "./data/data.js";
import DiscoverPage from "./pages/Discover.jsx";
import VideoPlayerPage from "./pages/VideoPlayer.jsx";

export default function App() {
  const [playingVideo, setPlayingVideo] = useState(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());
  const [votes, setVotes] = useState<Record<number, 'up' | 'down' | null>>({});
  const [watchHistory, setWatchHistory] = useState<Array<{ videoId: number; secondsWatched: number; watchedAt: number }>>([]);

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

  const handleToggleSave = (id: number) => {
    setSavedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleVote = (id: number, direction: 'up' | 'down') => {
    setVotes(prev => ({
      ...prev,
      [id]: prev[id] === direction ? null : direction,
    }));
  };

  const handleWatched = (videoId: number, secondsWatched: number) => {
    if (secondsWatched < 3) return;
    setWatchHistory(prev => [...prev, { videoId, secondsWatched, watchedAt: Date.now() }]);
  };

  return (
    <>
      <DiscoverPage
        onSelectVideo={setPlayingVideo}
        theme={theme}
        onToggleTheme={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
        savedIds={savedIds}
        votes={votes}
        onToggleSave={handleToggleSave}
        onVote={handleVote}
        watchHistory={watchHistory}
      />
      {playingVideo && (
        <VideoPlayerPage
          video={playingVideo}
          allVideos={VIDEOS}
          onBack={() => setPlayingVideo(null)}
          onNext={handleNext}
          onPrev={handlePrev}
          onWatched={handleWatched}
        />
      )}
    </>
  );
}
