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
      // Sync Events / Photos from MySQL
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
        }
      } catch (err) {
        console.warn("File upload to server disk failed, falling back to base64/URL", err);
      }
    }

    const newEvent = {
      id: "evt-user-" + Date.now(),
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

    // Save directly into MySQL database via API
    try {
      fetch("api/events.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newEvent.title,
          category: newEvent.category,
          date: newEvent.date,
          location: newEvent.location,
          description: newEvent.description,
          image: newEvent.image,
          show_on_tv: 1
        })
      }).then(r => r.json()).then(res => {
        if (res.success) {
          console.log("Event saved to MySQL successfully:", res);
        } else {
          console.warn("MySQL insert warning:", res.error);
        }
      }).catch(e => console.warn("MySQL sync error:", e));
    } catch (e) {
      console.warn("Network error saving to MySQL:", e);
    }

    return newEvent;
  }

  deleteEvent(id) {
    let events = this.getEvents();
    events = events.filter(e => e.id !== id);
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));

    // Delete from MySQL if on server
    try {
      fetch(`api/events.php?id=${encodeURIComponent(id)}`, {
        method: "DELETE"
      }).catch(() => {});
    } catch (e) {}

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
        headers: { "Content-Type": "application/json" },
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

  deleteLetter(id) {
    let letters = this.getLetters();
    letters = letters.filter(l => l.id !== id);
    localStorage.setItem(STORAGE_KEYS.LETTERS, JSON.stringify(letters));
    try {
      fetch(`api/letters.php?id=${encodeURIComponent(id)}`, { method: "DELETE" }).catch(() => {});
    } catch (e) {}
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

  addVideo(videoItem) {
    const videos = this.getVideos();
    let embedUrl = videoItem.videoUrl;

    if (embedUrl.includes("youtube.com/watch?v=")) {
      const videoId = embedUrl.split("v=")[1]?.split("&")[0];
      if (videoId) embedUrl = `https://www.youtube.com/embed/${videoId}`;
    } else if (embedUrl.includes("youtu.be/")) {
      const videoId = embedUrl.split("youtu.be/")[1]?.split("?")[0];
      if (videoId) embedUrl = `https://www.youtube.com/embed/${videoId}`;
    }

    const newVideo = {
      id: "vid-user-" + Date.now(),
      title: videoItem.title || "VOKAL Video Report",
      category: videoItem.category || "Advocacy",
      duration: videoItem.duration || "Live / Video",
      thumbnail: videoItem.thumbnail || "assets/vokal_logo_round.png",
      videoUrl: embedUrl,
      description: videoItem.description || "Video documentation uploaded by VOKAL media team.",
      isUserUploaded: true,
      createdAt: new Date().toISOString()
    };

    videos.unshift(newVideo);
    localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(videos));

    // Save to MySQL
    try {
      fetch("api/videos.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newVideo.title,
          video_url: videoItem.videoUrl,
          category: newVideo.category,
          duration: newVideo.duration,
          description: newVideo.description,
          thumbnail: newVideo.thumbnail,
          show_on_tv: 1
        })
      }).catch(() => {});
    } catch (e) {}

    return newVideo;
  }

  deleteVideo(id) {
    let videos = this.getVideos();
    videos = videos.filter(v => v.id !== id);
    localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(videos));
    try {
      fetch(`api/videos.php?id=${encodeURIComponent(id)}`, { method: "DELETE" }).catch(() => {});
    } catch (e) {}
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
        headers: { "Content-Type": "application/json" },
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
