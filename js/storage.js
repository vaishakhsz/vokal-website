/**
 * VOKAL - Storage & Upload Manager (vokal.org.in)
 * Handles client-side persistent storage and automated 2-way sync with MySQL database.
 */

const STORAGE_KEYS = {
  EVENTS: "vokal_events_data",
  LETTERS: "vokal_letters_data",
  VIDEOS: "vokal_videos_data",
  FEEDBACK: "vokal_contact_inquiries"
};

// API secret key — must match VOKAL_API_SECRET in api/config.php
const VOKAL_API_KEY = "vkl_9xK3pR7nW2mQ8tY2026";

// Helper: authenticated fetch headers for write operations
const authHeaders = {
  "Content-Type": "application/json",
  "X-API-Key": VOKAL_API_KEY
};

class VokalStorageManager {
  constructor() {
    this.initStorage();
    this.syncWithServer();
  }

  initStorage() {
    if (!localStorage.getItem(STORAGE_KEYS.EVENTS)) {
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(VOKAL_DEFAULT_DATA.events));
    }
    if (!localStorage.getItem(STORAGE_KEYS.LETTERS)) {
      localStorage.setItem(STORAGE_KEYS.LETTERS, JSON.stringify(VOKAL_DEFAULT_DATA.lettersToGovt));
    }
    if (!localStorage.getItem(STORAGE_KEYS.VIDEOS)) {
      localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(VOKAL_DEFAULT_DATA.videos));
    }
  }

  /**
   * Sync local data with MySQL server database
   */
  async syncWithServer() {
    try {
      // Sync Events / Photos from MySQL (Server is single source of truth)
      const evtRes = await fetch("api/events.php");
      if (evtRes.ok) {
        const json = await evtRes.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          const mapped = json.data.map(dbItem => ({
            id: dbItem.event_uid || ("evt-" + dbItem.id),
            title: dbItem.title,
            category: dbItem.category,
            date: dbItem.event_date,
            location: dbItem.location,
            description: dbItem.description,
            image: dbItem.image_url,
            isUserUploaded: !!dbItem.is_user_uploaded,
            createdAt: dbItem.created_at
          }));
          localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(mapped));
          if (typeof renderEvents === "function") renderEvents();
        }
      }
    } catch (e) {
      console.log("Offline mode: using cached events", e.message);
    }

    try {
      // Sync Videos from MySQL
      const vidRes = await fetch("api/videos.php");
      if (vidRes.ok) {
        const json = await vidRes.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          const mapped = json.data.map(v => ({
            id: v.video_uid || ("vid-" + v.id),
            title: v.title,
            category: v.category,
            duration: v.duration,
            thumbnail: v.thumbnail_url || "assets/vokal_logo_round.png",
            videoUrl: v.embed_url || v.video_url,
            description: v.description,
            isUserUploaded: !!v.is_user_uploaded,
            createdAt: v.created_at
          }));
          localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(mapped));
          if (typeof renderVideos === "function") renderVideos();
        }
      }
    } catch (e) {
      console.log("Offline mode: using cached videos", e.message);
    }

    try {
      // Sync Letters from MySQL
      const letRes = await fetch("api/letters.php");
      if (letRes.ok) {
        const json = await letRes.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          const mapped = json.data.map(l => ({
            id: l.letter_uid || ("let-" + l.id),
            refNo: l.ref_no,
            recipient: l.recipient,
            department: l.department,
            subject: l.subject,
            date: l.submission_date,
            status: l.status,
            statusColor: l.status_color || "primary",
            docUrl: l.document_url || "#",
            docName: "Official_Representation.pdf",
            summary: l.summary,
            keyDemands: typeof l.key_demands === "string" ? JSON.parse(l.key_demands || "[]") : (l.key_demands || []),
            isUserUploaded: !!l.is_user_uploaded,
            createdAt: l.created_at
          }));
          localStorage.setItem(STORAGE_KEYS.LETTERS, JSON.stringify(mapped));
          if (typeof renderLetters === "function") renderLetters();
        }
      }
    } catch (e) {
      console.log("Offline mode: using cached letters", e.message);
    }
  }

  // --- EVENTS & PHOTOS ---
  getEvents() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.EVENTS);
      return data ? JSON.parse(data) : VOKAL_DEFAULT_DATA.events;
    } catch (e) {
      console.error("Error reading events:", e);
      return VOKAL_DEFAULT_DATA.events;
    }
  }

  async addEvent(eventItem, fileObj = null) {
    const events = this.getEvents();
    let finalImageUrl = eventItem.image || "assets/vokal_brand_header.png";

    // If a physical file was selected, upload directly to server storage /uploads/photos/
    if (fileObj) {
      try {
        const fd = new FormData();
        fd.append("file", fileObj);
        fd.append("type", "photo");
        const uploadRes = await fetch("api/upload.php", {
          method: "POST",
          body: fd
        });
        if (uploadRes.ok) {
          const uploadJson = await uploadRes.json();
          if (uploadJson.success && uploadJson.file && uploadJson.file.relative_url) {
            finalImageUrl = uploadJson.file.relative_url;
            eventItem.image = finalImageUrl;
          }
        } else {
          const errJson = await uploadRes.json().catch(() => null);
          console.warn("api/upload.php notice:", errJson ? errJson.error : uploadRes.statusText);
        }
      } catch (err) {
        console.warn("File upload to server disk failed, falling back to base64/URL", err);
      }
    }

    const eventUid = "evt-user-" + Date.now();
    const newEvent = {
      id: eventUid,
      title: eventItem.title || "Community Event",
      category: eventItem.category || "Community Care",
      date: eventItem.date || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      location: eventItem.location || "Kerala",
      description: eventItem.description || "",
      image: finalImageUrl,
      isUserUploaded: true,
      createdAt: new Date().toISOString()
    };

    events.unshift(newEvent);
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));

    // Save directly into MySQL database via API and await
    try {
      const dbRes = await fetch("api/events.php", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          event_uid: eventUid,
          title: newEvent.title,
          category: newEvent.category,
          date: newEvent.date,
          location: newEvent.location,
          description: newEvent.description,
          image: newEvent.image,
          show_on_tv: 1
        })
      });
      const res = await dbRes.json();
      if (res && res.success) {
        console.log("Event saved to MySQL successfully:", res);
        if (res.image_url) {
          newEvent.image = res.image_url;
          const currentEvents = this.getEvents();
          const found = currentEvents.find(e => e.id === newEvent.id);
          if (found) {
            found.image = res.image_url;
            localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(currentEvents));
          }
        }
      } else {
        console.warn("MySQL insert warning:", res ? res.error : "Unknown error");
      }
    } catch (e) {
      console.warn("Network error saving to MySQL:", e);
    }

    return newEvent;
  }

  async deleteEvent(id) {
    // 1. Remove from localStorage immediately (optimistic)
    let events = this.getEvents();
    events = events.filter(e => e.id !== id);
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));

    // 2. Delete from MySQL server — must succeed
    try {
      const res = await fetch(`api/events.php?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: { "X-API-Key": VOKAL_API_KEY }
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || (json && !json.success)) {
        console.warn("Server deletion failed:", json);
        // Re-sync from server to restore accurate state
        await this.syncWithServer();
        throw new Error(json?.error || "Server could not delete this entry. Please try again.");
      }
    } catch (e) {
      if (e.message && e.message.includes("Server could not delete")) throw e;
      console.warn("Network error during delete:", e);
    }

    return true;
  }

  // --- LETTERS TO GOVT ---
  getLetters() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LETTERS);
      return data ? JSON.parse(data) : VOKAL_DEFAULT_DATA.lettersToGovt;
    } catch (e) {
      console.error("Error reading letters:", e);
      return VOKAL_DEFAULT_DATA.lettersToGovt;
    }
  }

  async addLetter(letterItem, fileObj = null) {
    const letters = this.getLetters();
    const statusColors = {
      "Submitted": "secondary",
      "Action Taken": "success",
      "Under Review": "warning",
      "Implemented": "primary",
      "Hearing Scheduled": "info"
    };

    let docUrl = letterItem.docUrl || "#";

    if (fileObj) {
      try {
        const fd = new FormData();
        fd.append("file", fileObj);
        fd.append("type", "document");
        const res = await fetch("api/upload.php", { method: "POST", body: fd });
        const json = await res.json();
        if (json.success && json.file && json.file.relative_url) {
          docUrl = json.file.relative_url;
        }
      } catch (e) {}
    }

    const newLetter = {
      id: "let-user-" + Date.now(),
      refNo: letterItem.refNo || ("VOKAL/REP/" + new Date().getFullYear() + "/" + Math.floor(100 + Math.random() * 900)),
      recipient: letterItem.recipient || "Government of Kerala",
      department: letterItem.department || "General Administration",
      subject: letterItem.subject || "Official Animal Welfare Representation",
      date: letterItem.date || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      status: letterItem.status || "Submitted",
      statusColor: statusColors[letterItem.status] || "primary",
      docUrl: docUrl,
      docName: letterItem.docName || "Official_Representation.pdf",
      summary: letterItem.summary || "Representation submitted by VOKAL advocate team.",
      keyDemands: Array.isArray(letterItem.keyDemands) 
        ? letterItem.keyDemands 
        : (letterItem.keyDemands ? letterItem.keyDemands.split("\n").map(d => d.trim()).filter(Boolean) : ["Immediate administrative review", "Enforcement of PCA Act 1960"]),
      isUserUploaded: true,
      createdAt: new Date().toISOString()
    };

    letters.unshift(newLetter);
    localStorage.setItem(STORAGE_KEYS.LETTERS, JSON.stringify(letters));

    // Save to MySQL
    try {
      fetch("api/letters.php", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          ref_no: newLetter.refNo,
          subject: newLetter.subject,
          recipient: newLetter.recipient,
          department: newLetter.department,
          date: newLetter.date,
          status: newLetter.status,
          status_color: newLetter.statusColor,
          summary: newLetter.summary,
          key_demands: newLetter.keyDemands,
          document_url: newLetter.docUrl
        })
      }).catch(() => {});
    } catch (e) {}

    return newLetter;
  }

  async deleteLetter(id) {
    let letters = this.getLetters();
    letters = letters.filter(l => l.id !== id);
    localStorage.setItem(STORAGE_KEYS.LETTERS, JSON.stringify(letters));
    try {
      const res = await fetch(`api/letters.php?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: { "X-API-Key": VOKAL_API_KEY }
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || (json && !json.success)) {
        console.warn("Server deletion failed:", json);
        await this.syncWithServer();
        throw new Error(json?.error || "Server could not delete letter. Please try again.");
      }
    } catch (e) {
      if (e.message && e.message.includes("Server could not delete")) throw e;
      console.warn("Network error during delete:", e);
    }
    return true;
  }

  // --- VIDEOS ---
  getVideos() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.VIDEOS);
      return data ? JSON.parse(data) : VOKAL_DEFAULT_DATA.videos;
    } catch (e) {
      console.error("Error reading videos:", e);
      return VOKAL_DEFAULT_DATA.videos;
    }
  }

  async addVideo(videoItem) {
    const videos = this.getVideos();
    let embedUrl = videoItem.videoUrl;

    if (embedUrl.includes("youtube.com/watch?v=")) {
      const videoId = embedUrl.split("v=")[1]?.split("&")[0];
      if (videoId) embedUrl = `https://www.youtube.com/embed/${videoId}`;
    } else if (embedUrl.includes("youtu.be/")) {
      const videoId = embedUrl.split("youtu.be/")[1]?.split("?")[0];
      if (videoId) embedUrl = `https://www.youtube.com/embed/${videoId}`;
    }

    const videoUid = "vid-user-" + Date.now();
    const newVideo = {
      id: videoUid,
      title: videoItem.title || "VOKAL Update",
      category: videoItem.category || "General",
      duration: videoItem.duration || "10:00",
      thumbnail: videoItem.thumbnail || "assets/vokal_logo_round.png",
      videoUrl: embedUrl,
      description: videoItem.description || "Video submitted via VOKAL portal.",
      isUserUploaded: true,
      createdAt: new Date().toISOString()
    };

    videos.unshift(newVideo);
    localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(videos));

    // Save to MySQL
    try {
      fetch("api/videos.php", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          video_uid: videoUid,
          title: newVideo.title,
          videoUrl: newVideo.videoUrl,
          category: newVideo.category,
          duration: newVideo.duration,
          description: newVideo.description,
          thumbnail: newVideo.thumbnail
        })
      }).catch(() => {});
    } catch (e) {}

    return newVideo;
  }

  async deleteVideo(id) {
    let videos = this.getVideos();
    videos = videos.filter(v => v.id !== id);
    localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(videos));
    try {
      const res = await fetch(`api/videos.php?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: { "X-API-Key": VOKAL_API_KEY }
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || (json && !json.success)) {
        console.warn("Server deletion failed:", json);
        await this.syncWithServer();
        throw new Error(json?.error || "Server could not delete video. Please try again.");
      }
    } catch (e) {
      if (e.message && e.message.includes("Server could not delete")) throw e;
      console.warn("Network error during delete:", e);
    }
    return true;
  }

  // --- BACKUP / RESET ---
  resetToDefaults() {
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(VOKAL_DEFAULT_DATA.events));
    localStorage.setItem(STORAGE_KEYS.LETTERS, JSON.stringify(VOKAL_DEFAULT_DATA.lettersToGovt));
    localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(VOKAL_DEFAULT_DATA.videos));
    return true;
  }

  exportAllData() {
    return {
      exportedAt: new Date().toISOString(),
      organization: VOKAL_DEFAULT_DATA.organization,
      events: this.getEvents(),
      letters: this.getLetters(),
      videos: this.getVideos()
    };
  }

  importData(jsonData) {
    if (jsonData.events && Array.isArray(jsonData.events)) {
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(jsonData.events));
    }
    if (jsonData.letters && Array.isArray(jsonData.letters)) {
      localStorage.setItem(STORAGE_KEYS.LETTERS, JSON.stringify(jsonData.letters));
    }
    if (jsonData.videos && Array.isArray(jsonData.videos)) {
      localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(jsonData.videos));
    }
    return true;
  }

  // --- INQUIRIES & CRUELTY REPORTS ---
  saveInquiry(inquiry) {
    try {
      const existing = JSON.parse(localStorage.getItem(STORAGE_KEYS.FEEDBACK) || "[]");
      existing.unshift({
        ...inquiry,
        id: "rep-" + Date.now(),
        submittedAt: new Date().toISOString()
      });
      localStorage.setItem(STORAGE_KEYS.FEEDBACK, JSON.stringify(existing));

      // Save to MySQL
      fetch("api/inquiries.php", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify(inquiry)
      }).catch(() => {});

      return true;
    } catch (e) {
      console.error("Error saving inquiry:", e);
      return false;
    }
  }

  getInquiries() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.FEEDBACK) || "[]");
    } catch (e) {
      return [];
    }
  }
}

// Global instance
window.vokalStorage = new VokalStorageManager();
