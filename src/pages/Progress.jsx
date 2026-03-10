import { useMemo } from "react";
import { VIDEOS, SUBJECT_COLORS } from "../data/data.js";

function fmtTime(totalSeconds) {
  if (totalSeconds < 60) return `${totalSeconds}s`;
  const mins = Math.floor(totalSeconds / 60);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  const remMins = mins % 60;
  return remMins > 0 ? `${hrs}h ${remMins}m` : `${hrs}h`;
}

function StatCard({ label, value, sub, accent }) {
  return (
    <div style={{
      background: "var(--bg-secondary)", border: "1px solid var(--border)",
      borderRadius: 16, padding: "20px 22px", flex: "1 1 140px",
    }}>
      <div style={{ fontSize: 32, fontWeight: 800, color: accent || "var(--text)", lineHeight: 1, marginBottom: 6 }}>
        {value}
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 2 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: "var(--text-dim)" }}>{sub}</div>}
    </div>
  );
}

export default function ProgressPage({ watchHistory }) {
  const stats = useMemo(() => {
    const uniqueIds = new Set(watchHistory.map(e => e.videoId));
    const totalSeconds = watchHistory.reduce((sum, e) => sum + e.secondsWatched, 0);

    const bySubject = {};
    for (const entry of watchHistory) {
      const video = VIDEOS.find(v => v.id === entry.videoId);
      if (!video) continue;
      if (!bySubject[video.subject]) bySubject[video.subject] = { seconds: 0, count: 0 };
      bySubject[video.subject].seconds += entry.secondsWatched;
      bySubject[video.subject].count += 1;
    }

    // recent unique watches
    const seen = new Set();
    const recentUnique = [...watchHistory].reverse().filter(e => {
      if (seen.has(e.videoId)) return false;
      seen.add(e.videoId);
      return true;
    }).slice(0, 6);

    const contentLearned = Math.round((uniqueIds.size / VIDEOS.length) * 100);
    const maxSubjectSeconds = Math.max(...Object.values(bySubject).map(s => s.seconds), 1);

    return { uniqueIds, totalSeconds, bySubject, recentUnique, contentLearned, maxSubjectSeconds };
  }, [watchHistory]);

  const isEmpty = watchHistory.length === 0;

  return (
    <div style={{ padding: "36px 24px 80px", width: "100%", boxSizing: "border-box" }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 42, fontWeight: 900, lineHeight: 1.1, marginBottom: 8, letterSpacing: "-1px" }}>
          Your <span style={{ color: "#4a7bff" }}>progress</span>.
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: 15 }}>
          {isEmpty ? "Start watching to track your learning journey" : `${stats.uniqueIds.size} video${stats.uniqueIds.size !== 1 ? "s" : ""} watched across ${Object.keys(stats.bySubject).length} subject${Object.keys(stats.bySubject).length !== 1 ? "s" : ""}`}
        </p>
      </div>

      {isEmpty ? (
        <div style={{ textAlign: "center", padding: "80px 20px", color: "var(--text-very-dim)" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📈</div>
          <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>No watch history yet</div>
          <div style={{ fontSize: 13 }}>Click a video on the Discover page to get started</div>
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div style={{ display: "flex", gap: 12, marginBottom: 32, flexWrap: "wrap" }}>
            <StatCard
              label="Videos watched"
              value={stats.uniqueIds.size}
              sub={`of ${VIDEOS.length} available`}
              accent="#4a7bff"
            />
            <StatCard
              label="Time spent"
              value={fmtTime(stats.totalSeconds)}
              sub={stats.totalSeconds >= 3600 ? `${Math.round(stats.totalSeconds / 86400 * 10) / 10} days` : `${Math.round(stats.totalSeconds / 3600 * 10) / 10} hours`}
              accent="#00c896"
            />
            <StatCard
              label="Content learned"
              value={`${stats.contentLearned}%`}
              sub={`${stats.uniqueIds.size} of ${VIDEOS.length} lessons`}
              accent="#9b27af"
            />
            <StatCard
              label="Subjects covered"
              value={Object.keys(stats.bySubject).length}
              sub={`of ${Object.keys(SUBJECT_COLORS).length} total`}
              accent="#ff6b1a"
            />
          </div>

          {/* Subject breakdown */}
          <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 16, padding: "24px 28px", marginBottom: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 20, letterSpacing: 0.5, textTransform: "uppercase" }}>
              Time by subject
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {Object.entries(stats.bySubject)
                .sort((a, b) => b[1].seconds - a[1].seconds)
                .map(([subject, data]) => {
                  const col = SUBJECT_COLORS[subject];
                  const pct = (data.seconds / stats.maxSubjectSeconds) * 100;
                  return (
                    <div key={subject}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 14 }}>{col?.emoji}</span>
                          <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>{subject}</span>
                          <span style={{ fontSize: 11, color: "var(--text-dim)" }}>
                            {data.count} session{data.count !== 1 ? "s" : ""}
                          </span>
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 600, color: col?.bg }}>{fmtTime(data.seconds)}</span>
                      </div>
                      <div style={{ height: 6, background: "var(--border)", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{
                          height: "100%", width: `${pct}%`, background: col?.bg,
                          borderRadius: 3, transition: "width 0.6s cubic-bezier(.22,.68,0,1.2)",
                        }} />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Recently watched */}
          {stats.recentUnique.length > 0 && (
            <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 16, padding: "24px 28px" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 20, letterSpacing: 0.5, textTransform: "uppercase" }}>
                Recently watched
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {stats.recentUnique.map(entry => {
                  const video = VIDEOS.find(v => v.id === entry.videoId);
                  if (!video) return null;
                  const col = SUBJECT_COLORS[video.subject];
                  const ago = Date.now() - entry.watchedAt;
                  const agoStr = ago < 60000 ? "just now"
                    : ago < 3600000 ? `${Math.floor(ago / 60000)}m ago`
                    : ago < 86400000 ? `${Math.floor(ago / 3600000)}h ago`
                    : `${Math.floor(ago / 86400000)}d ago`;
                  return (
                    <div key={entry.videoId} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <img
                        src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`}
                        alt={video.title}
                        style={{ width: 56, height: 40, objectFit: "cover", borderRadius: 8, flexShrink: 0, border: `2px solid ${col?.bg}` }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {video.title}
                        </div>
                        <div style={{ fontSize: 11, color: "var(--text-dim)" }}>
                          {video.creator} · {col?.emoji} {video.subject}
                        </div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2, flexShrink: 0 }}>
                        <span style={{ fontSize: 11, color: "var(--text-dim)" }}>{agoStr}</span>
                        <span style={{ fontSize: 11, fontWeight: 600, color: col?.bg }}>{fmtTime(entry.secondsWatched)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
