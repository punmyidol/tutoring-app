import { useState, useEffect } from "react";
import { VIDEOS } from "./data/data.js";
import { saveVideo, loadAllVideos } from "./data/videoDB.js";
import DiscoverPage from "./pages/Discover.jsx";
import VideoPlayerPage from "./pages/VideoPlayer.jsx";

export default function App() {
  const [playingVideo, setPlayingVideo] = useState(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());
  const [votes, setVotes] = useState<Record<number, 'up' | 'down' | null>>({});
  const [watchHistory, setWatchHistory] = useState<Array<{ videoId: number; secondsWatched: number; watchedAt: number }>>([]);
  const [uploadedVideos, setUploadedVideos] = useState<any[]>([]);

  const allVideos = [...VIDEOS, ...uploadedVideos];

  // Restore persisted videos from IndexedDB on first load
  useEffect(() => {
    loadAllVideos().then(videos => {
      if (videos.length > 0) setUploadedVideos(videos);
    }).catch(() => {/* IndexedDB unavailable — silently skip */});
  }, []);

  const handleAddVideo = (metadata: any, blob: Blob) => {
    const localSrc = URL.createObjectURL(blob);
    const video = { ...metadata, localSrc };
    setUploadedVideos(prev => [video, ...prev]);
    saveVideo(metadata.id, blob, metadata).catch(() => {/* silently skip if storage fails */});
  };

  const handleNext = () => {
    if (!playingVideo) return;
    const idx = allVideos.findIndex(v => v.id === playingVideo.id);
    setPlayingVideo(allVideos[(idx + 1) % allVideos.length]);
  };

  const handlePrev = () => {
    if (!playingVideo) return;
    const idx = allVideos.findIndex(v => v.id === playingVideo.id);
    setPlayingVideo(allVideos[(idx - 1 + allVideos.length) % allVideos.length]);
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
        uploadedVideos={uploadedVideos}
        onAddVideo={handleAddVideo}
      />
      {playingVideo && (
        <VideoPlayerPage
          video={playingVideo}
          allVideos={allVideos}
          onBack={() => setPlayingVideo(null)}
          onNext={handleNext}
          onPrev={handlePrev}
          onWatched={handleWatched}
        />
      )}
    </>
  );
}
