import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "./config";

const API_BASE = `${API_BASE_URL}/api/settings`;

export default function AnnouncementEditor() {
  const [announcement, setAnnouncement] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let mounted = true;
    const fetchAnnouncement = async () => {
      try {
        const res = await axios.get(`${API_BASE}/top-announcement`);
        if (mounted) {
          setAnnouncement(res.data.announcement ?? "");
        }
      } catch (err) {
        console.error("Failed to load announcement", err);
        if (mounted) setMessage("Failed to load announcement");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchAnnouncement();
    return () => (mounted = false);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      const res = await axios.post(`${API_BASE}/top-announcement`, { announcement });
      setMessage("Saved!");
      // Optionally sync the exact returned value
      if (res.data && res.data.announcement) {
        setAnnouncement(res.data.announcement);
      }
    } catch (err) {
      console.error("Failed to save announcement", err);
      setMessage("Save failed");
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(""), 1800);
    }
  };

  if (loading) return <div>Loading announcement...</div>;

  return (
    <div style={{ maxWidth: 720 }}>
      {/* optional: show sample image above announcement - local path provided below */}
      {/* <img src="/uploads/your-image.jpg" alt="banner" style={{ width: "100%", borderRadius: 8 }} /> */}

      <label style={{ display: "block", marginBottom: 6, fontWeight: "600" }}>Top Announcement</label>
      <textarea
        value={announcement}
        onChange={(e) => setAnnouncement(e.target.value)}
        rows={3}
        style={{ width: "100%", padding: 10, borderRadius: 8, resize: "vertical" }}
      />

      <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
        <button onClick={handleSave} disabled={saving} style={{ padding: "8px 14px", borderRadius: 8 }}>
          {saving ? "Saving..." : "Save Announcement"}
        </button>

        <button onClick={() => {
          // Optionally revert to last saved version by re-fetching
          axios.get(`${API_BASE}/top-announcement`).then(r => setAnnouncement(r.data.announcement ?? ""));
        }} style={{ padding: "8px 14px", borderRadius: 8 }}>
          Revert
        </button>

        <div style={{ marginLeft: "auto", alignSelf: "center", color: "#333" }}>{message}</div>
      </div>
    </div>
  );
}
