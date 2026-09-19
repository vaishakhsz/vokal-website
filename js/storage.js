/**
 * VOKAL - Storage & Upload Manager (vokal.org.in)
 * Handles client-side persistent storage for uploaded photos, letters, and video links.
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

  addEvent(eventItem) {
    const events = this.getEvents();
    const newEvent = {
      id: "evt-user-" + Date.now(),
      title: eventItem.title || "Community Event",
      category: eventItem.category || "Community Care",
      date: eventItem.date || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      location: eventItem.location || "Kerala",
      description: eventItem.description || "",
      image: eventItem.image || "https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=800&q=80",
      isUserUploaded: true,
      createdAt: new Date().toISOString()
    };
    events.unshift(newEvent);
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
    return newEvent;
  }

  deleteEvent(id) {
    let events = this.getEvents();
    events = events.filter(e => e.id !== id);
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
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

  addLetter(letterItem) {
    const letters = this.getLetters();
    const statusColors = {
      "Submitted": "secondary",
      "Action Taken": "success",
      "Under Review": "warning",
      "Implemented": "primary",
      "Hearing Scheduled": "info"
    };

    const newLetter = {
      id: "let-user-" + Date.now(),
      refNo: letterItem.refNo || ("VOKAL/REP/" + new Date().getFullYear() + "/" + Math.floor(100 + Math.random() * 900)),
      recipient: letterItem.recipient || "Government of Kerala",
      department: letterItem.department || "General Administration",
      subject: letterItem.subject || "Official Animal Welfare Representation",
      date: letterItem.date || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      status: letterItem.status || "Submitted",
      statusColor: statusColors[letterItem.status] || "primary",
      docUrl: letterItem.docUrl || "#",
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
    return newLetter;
  }

  deleteLetter(id) {
    let letters = this.getLetters();
    letters = letters.filter(l => l.id !== id);
    localStorage.setItem(STORAGE_KEYS.LETTERS, JSON.stringify(letters));
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

    // Normalize YouTube standard/shortened URLs into embed URLs
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
      thumbnail: videoItem.thumbnail || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80",
      videoUrl: embedUrl,
      description: videoItem.description || "Video documentation uploaded by VOKAL media team.",
      isUserUploaded: true,
      createdAt: new Date().toISOString()
    };

    videos.unshift(newVideo);
    localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(videos));
    return newVideo;
  }

  deleteVideo(id) {
    let videos = this.getVideos();
    videos = videos.filter(v => v.id !== id);
    localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(videos));
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
