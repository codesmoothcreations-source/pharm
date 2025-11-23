import React, { useState } from "react";
import { FaSearch, FaYoutube } from "react-icons/fa";
import "./VideoSearchPage.css";

// Minimal YouTube search page that opens videos on YouTube when clicked.
// Requires a Vite environment variable: VITE_YT_API_KEY
const YT_API_KEY = import.meta.env.VITE_YT_API_KEY;

const popularSearches = [
  "pharmacy education",
  "medicine tutorials",
  "nursing procedures",
  "anatomy and physiology",
  "pharmacology"
];

const VideoSearchPage = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const searchYouTube = async (e) => {
    if (e) e.preventDefault();
    setError("");

    const q = query.trim();
    if (!q) {
      setError("Please enter a search term.");
      return;
    }

    if (!YT_API_KEY) {
      setError("YouTube API key not configured. Please set VITE_YT_API_KEY in your project .env.");
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        part: "snippet",
        q: q,
        type: "video",
        maxResults: "12",
        key: YT_API_KEY
      });

      const res = await fetch(`https://www.googleapis.com/youtube/v3/search?${params.toString()}`);
      if (!res.ok) throw new Error(`YouTube API error: ${res.status}`);
      const data = await res.json();

      const videos = (data.items || []).map(item => ({
        videoId: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
        channelTitle: item.snippet.channelTitle
      }));

      setResults(videos);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch YouTube results. Check console for details.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const openOnYouTube = (videoId) => {
    window.open(`https://www.youtube.com/watch?v=${videoId}`, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="video-search-page">
      <div className="container">
        <header className="page-header">
          <h1><FaYoutube /> Video Search</h1>
          <p>Search YouTube for educational videos. Click a result to watch on YouTube.</p>
        </header>

        <form className="search-form" onSubmit={searchYouTube}>
          <div className="search-input-wrapper">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search YouTube (e.g., pharmacy tutorials)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search videos"
            />
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Searching..." : "Search"}
            </button>
          </div>
        </form>

        {error && <div className="error">{error}</div>}

        {!error && !loading && results.length === 0 && (
          <section className="suggestions">
            <h3>Popular searches</h3>
            <div className="tags">
              {popularSearches.map(s => (
                <button key={s} className="tag" onClick={() => setQuery(s)}>{s}</button>
              ))}
            </div>
          </section>
        )}

        {results.length > 0 && (
          <section className="results">
            {results.map(v => (
              <article key={v.videoId} className="result-card" onClick={() => openOnYouTube(v.videoId)}>
                <img src={v.thumbnail} alt={v.title} loading="lazy" />
                <div className="result-body">
                  <h4 className="title">{v.title}</h4>
                  <p className="channel">{v.channelTitle}</p>
                  {v.description && <p className="description">{v.description.substring(0, 120)}{v.description.length > 120 ? '...' : ''}</p>}
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}
      // </div>

export default VideoSearchPage;