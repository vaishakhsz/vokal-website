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

// Universal Video URL Parser for YouTube, Facebook, Instagram, Vimeo, and direct files
function parseVideoUrl(rawUrl) {
  if (!rawUrl) return { embedUrl: '', directUrl: '', platform: 'Video', canEmbed: false, isFile: false };
  const url = String(rawUrl).trim();

  // 1. Direct video file (.mp4, .webm, .ogg)
  if (/\.(mp4|webm|ogg)($|\?)/i.test(url)) {
    return { embedUrl: url, directUrl: url, platform: 'Video File', canEmbed: true, isFile: true };
  }

  // 2. YouTube
  const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/ ]{11})/i);
  if (ytMatch && ytMatch[1]) {
    return {
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?autoplay=1&rel=0`,
      directUrl: url,
      platform: 'YouTube',
      canEmbed: true,
      isFile: false
    };
  }

  // 3. Facebook
  if (/facebook\.com|fb\.watch/i.test(url)) {
    return {
      embedUrl: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false&autoplay=true`,
      directUrl: url,
      platform: 'Facebook',
      canEmbed: true,
      isFile: false
    };
  }

  // 4. Instagram
  const igMatch = url.match(/instagram\.com\/(?:p|reel|tv)\/([a-zA-Z0-9_-]+)/i);
  if (igMatch && igMatch[1]) {
    return {
      embedUrl: `https://www.instagram.com/reel/${igMatch[1]}/embed`,
      directUrl: url,
      platform: 'Instagram',
      canEmbed: true,
      isFile: false
    };
  }

  // 5. Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/[^\/]*\/videos\/|album\/\d+\/video\/|video\/|)(\d+)/i);
  if (vimeoMatch && vimeoMatch[1]) {
    return {
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`,
      directUrl: url,
      platform: 'Vimeo',
      canEmbed: true,
      isFile: false
    };
  }

  const isEmbed = url.includes('/embed') || url.includes('/player') || url.includes('plugins');
  return {
    embedUrl: url,
    directUrl: url,
    platform: 'External Video',
    canEmbed: isEmbed,
    isFile: false
  };
}
window.parseVideoUrl = parseVideoUrl;

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
        if (json.success && Array.isArray(json.data)) {
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
        if (json.success && Array.isArray(json.data)) {
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
        if (json.success && Array.isArray(json.data)) {
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
          if (typeof renderAdminInquiries === "function") renderAdminInquiries();
          if (typeof updateAdminCounts === "function") updateAdminCounts();
        }
      }
    } catch (e) {
      console.log("Offline mode: using cached letters", e.message);
    }

    try {
      // Sync Inquiries / Cruelty Reports from MySQL (Server is single source of truth)
      const inqRes = await fetch("api/inquiries.php");
      if (inqRes.ok) {
        const json = await inqRes.json();
        if (json.success && Array.isArray(json.data)) {
          const mappedInq = json.data.map(i => ({
            id: i.id,
            name: i.name,
            email: i.email,
            district: i.district,
            type: i.type,
            message: i.message,
            status: i.status || 'new',
            submittedAt: i.submitted_at || i.created_at || new Date().toISOString()
          }));
          localStorage.setItem(STORAGE_KEYS.FEEDBACK, JSON.stringify(mappedInq));
          if (typeof renderAdminInquiries === "function") renderAdminInquiries();
          if (typeof updateAdminCounts === "function") updateAdminCounts();
        }
      }
    } catch (e) {
      console.log("Offline mode: using cached inquiries", e.message);
    }

    try {
      // Sync Folders from MySQL
      const fldrRes = await fetch("api/folders.php");
      if (fldrRes.ok) {
        const json = await fldrRes.json();
        if (json.success && Array.isArray(json.data)) {
          localStorage.setItem("vokal_folders_data", JSON.stringify(json.data));
          if (typeof renderAdminFolders === "function") renderAdminFolders();
          if (typeof updateFolderDropdowns === "function") updateFolderDropdowns();
          if (typeof renderAdminPhotos === "function") renderAdminPhotos();
          if (typeof renderAdminLetters === "function") renderAdminLetters();
          if (typeof renderAdminVideos === "function") renderAdminVideos();
          if (typeof renderEvents === "function") renderEvents();
          if (typeof renderVideos === "function") renderVideos();
          if (typeof renderLetters === "function") renderLetters();
          if (typeof renderAdminInquiries === "function") renderAdminInquiries();
          if (typeof updateAdminCounts === "function") updateAdminCounts();
        }
      }
    } catch (e) {
      console.log("Offline mode: using cached folders", e.message);
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
    try {
      const res = await fetch(`api/events.php?id=${encodeURIComponent(id)}&api_key=${encodeURIComponent(VOKAL_API_KEY)}`, {
        method: "DELETE",
        headers: { "X-API-Key": VOKAL_API_KEY }
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || (json && !json.success)) {
        console.warn("Server deletion failed:", json);
        await this.syncWithServer();
        throw new Error(json?.error || "Server could not delete this photo. Please try again.");
      }
    } catch (e) {
      console.warn("Error during delete:", e);
      await this.syncWithServer();
      throw e;
    }

    // Remove from localStorage
    let events = this.getEvents();
    events = events.filter(e => e.id !== id && String(e.id) !== String(id));
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
    try {
      const res = await fetch(`api/letters.php?id=${encodeURIComponent(id)}&api_key=${encodeURIComponent(VOKAL_API_KEY)}`, {
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
      console.warn("Error during delete:", e);
      await this.syncWithServer();
      throw e;
    }

    let letters = this.getLetters();
    letters = letters.filter(l => l.id !== id && String(l.id) !== String(id));
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

  async addVideo(videoItem) {
    const videos = this.getVideos();
    const parsed = parseVideoUrl(videoItem.videoUrl);
    const embedUrl = parsed.embedUrl || videoItem.videoUrl;

    const videoUid = "vid-user-" + Date.now();
    const newVideo = {
      id: videoUid,
      title: videoItem.title || "VOKAL Update",
      category: videoItem.category || "General",
      duration: videoItem.duration || "10:00",
      thumbnail: videoItem.thumbnail || "assets/vokal_logo_round.png",
      videoUrl: embedUrl,
      originalUrl: parsed.directUrl,
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
          videoUrl: parsed.directUrl,
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
    try {
      const res = await fetch(`api/videos.php?id=${encodeURIComponent(id)}&api_key=${encodeURIComponent(VOKAL_API_KEY)}`, {
        method: "DELETE",
        headers: { "X-API-Key": VOKAL_API_KEY }
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || (json && !json.success)) {
        console.warn("Server deletion notice:", json);
      }
    } catch (e) {
      console.warn("Error during deleteVideo server request:", e);
    }

    let videos = this.getVideos();
    videos = videos.filter(v => v.id !== id && String(v.id) !== String(id));
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

  // --- FOLDERS ---
  getFolders() {
    try {
      const data = localStorage.getItem("vokal_folders_data");
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  /**
   * Retrieves all folders along with their contained items for a given type ('event', 'video', 'letter').
   * IMPORTANT: Empty folders (0 items) are always preserved and returned!
   * Deleted folders are strictly filtered out and never re-synthesized.
   */
  getFoldersWithItems(type) {
    const normType = (type === 'photo' || type === 'event') ? 'event' : type;
    let deletedList = [];
    try {
      deletedList = JSON.parse(localStorage.getItem('vokal_deleted_folders') || '[]');
    } catch (e) {}

    const allFolders = this.getFolders() || [];
    // If a folder exists on the server/DB, remove it from the deletedList blacklist
    if (deletedList.length > 0 && allFolders.length > 0) {
      deletedList = deletedList.filter(name => !allFolders.some(f => f.name === name));
      localStorage.setItem('vokal_deleted_folders', JSON.stringify(deletedList));
    }

    const registeredFolders = allFolders
      .filter(f => f.type === normType && !deletedList.includes(f.name));

    let allItems = [];
    if (normType === 'event') {
      allItems = this.getEvents() || [];
    } else if (normType === 'video') {
      allItems = this.getVideos() || [];
    } else if (normType === 'letter') {
      allItems = this.getLetters() || [];
    }

    const folderMap = new Map();

    // 1. Add all registered folders first so they are ALWAYS present, even if empty (0 items)!
    registeredFolders.forEach(f => {
      folderMap.set(f.name, {
        id: f.id,
        name: f.name,
        type: normType,
        items: [],
        isRegistered: true,
        createdAt: f.created_at || ''
      });
    });

    // 2. Distribute items into folders (excluding deleted folders)
    allItems.forEach(item => {
      const cat = (normType === 'letter' ? (item.department || item.category) : item.category) || '';
      const date = item.date || '';

      if (deletedList.includes(cat) || deletedList.includes(date)) {
        return; // Permanently skip items belonging to deleted folders
      }

      let matchedKey = null;
      if (cat && folderMap.has(cat)) {
        matchedKey = cat;
      } else if (date && folderMap.has(date)) {
        matchedKey = date;
      }

      if (matchedKey) {
        folderMap.get(matchedKey).items.push(item);
      } else {
        // Legacy or uncataloged item: group under category or date or 'General'
        const fallbackKey = cat || date || 'General';
        if (!deletedList.includes(fallbackKey)) {
          if (!folderMap.has(fallbackKey)) {
            folderMap.set(fallbackKey, {
              id: 'legacy-' + fallbackKey.replace(/[^a-zA-Z0-9]/g, '_'),
              name: fallbackKey,
              type: normType,
              items: [],
              isRegistered: false,
              createdAt: item.createdAt || ''
            });
          }
          folderMap.get(fallbackKey).items.push(item);
        }
      }
    });

    return Array.from(folderMap.values());
  }

  async addFolder(name, type) {
    const normType = (type === 'photo' || type === 'event') ? 'event' : type;

    // Remove from deleted list if previously deleted
    try {
      let deletedList = JSON.parse(localStorage.getItem('vokal_deleted_folders') || '[]');
      deletedList = deletedList.filter(n => n !== name);
      localStorage.setItem('vokal_deleted_folders', JSON.stringify(deletedList));
    } catch (e) {}

    let newFolder = {
      id: "fld-" + Date.now(),
      name: name,
      type: normType,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };

    try {
      const res = await fetch(`api/folders.php?api_key=${encodeURIComponent(VOKAL_API_KEY)}`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ name, type: normType, api_key: VOKAL_API_KEY })
      });
      const json = await res.json().catch(() => null);
      if (json && json.success) {
        newFolder.id = json.id || newFolder.id;
      }
    } catch (e) {
      console.warn("Server addFolder warning:", e);
    }

    // Immediately cache in localStorage
    let folders = this.getFolders();
    folders = folders.filter(f => !(f.name === name && f.type === normType));
    folders.unshift(newFolder);
    localStorage.setItem("vokal_folders_data", JSON.stringify(folders));

    try {
      await this.syncWithServer();
    } catch (e) {}

    return newFolder;
  }

  async editFolder(id, name, type, oldName = null) {
    const normType = (type === 'photo' || type === 'event') ? 'event' : (type || 'event');
    let folders = this.getFolders();
    const existing = folders.find(f => String(f.id) === String(id));
    const previousName = oldName || (existing ? existing.name : null);

    // Un-blacklist new name, blacklist old name
    try {
      let deletedList = JSON.parse(localStorage.getItem('vokal_deleted_folders') || '[]');
      deletedList = deletedList.filter(n => n !== name);
      if (previousName && previousName !== name && !deletedList.includes(previousName)) {
        deletedList.push(previousName);
      }
      localStorage.setItem('vokal_deleted_folders', JSON.stringify(deletedList));
    } catch (e) {}

    try {
      const res = await fetch(`api/folders.php?api_key=${encodeURIComponent(VOKAL_API_KEY)}`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ id, name, type: normType, old_name: previousName, api_key: VOKAL_API_KEY })
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || (json && !json.success)) {
        console.warn("Server editFolder notice:", json);
      }
    } catch (e) {
      console.warn("Server editFolder error:", e);
    }

    // Update in localStorage
    folders = folders.map(f => {
      if (String(f.id) === String(id) || (previousName && f.name === previousName)) {
        return { ...f, name: name, type: normType };
      }
      return f;
    });
    localStorage.setItem("vokal_folders_data", JSON.stringify(folders));

    // Cascade rename to local items so items remain in folder!
    if (previousName && previousName !== name) {
      if (normType === 'event') {
        let events = this.getEvents();
        events.forEach(e => {
          if (e.category === previousName) e.category = name;
          if (e.date === previousName) e.date = name;
        });
        localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
      } else if (normType === 'video') {
        let videos = this.getVideos();
        videos.forEach(v => {
          if (v.category === previousName) v.category = name;
          if (v.date === previousName) v.date = name;
        });
        localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(videos));
      } else if (normType === 'letter') {
        let letters = this.getLetters();
        letters.forEach(l => {
          if (l.department === previousName) l.department = name;
          if (l.category === previousName) l.category = name;
          if (l.date === previousName) l.date = name;
        });
        localStorage.setItem(STORAGE_KEYS.LETTERS, JSON.stringify(letters));
      }
    }

    try {
      await this.syncWithServer();
    } catch (e) {}

    return { success: true, id, name, type: normType };
  }

  async renameItem(id, newName, type) {
    if (!id || !newName) throw new Error("ID and new name are required");
    const name = String(newName).trim();
    if (!name) throw new Error("New name cannot be empty");

    const normType = (type === 'photo' || type === 'event') ? 'event' : type;

    if (normType === 'event') {
      let events = this.getEvents();
      const idx = events.findIndex(e => String(e.id) === String(id));
      if (idx !== -1) {
        events[idx].title = name;
        localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
      }
      try {
        await fetch(`api/events.php?api_key=${encodeURIComponent(VOKAL_API_KEY)}`, {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify({
            id: id,
            event_uid: id,
            title: name,
            action: 'rename'
          })
        });
      } catch (e) {
        console.warn("Server rename error:", e);
      }
    } else if (normType === 'video') {
      let videos = this.getVideos();
      const idx = videos.findIndex(v => String(v.id) === String(id));
      if (idx !== -1) {
        videos[idx].title = name;
        localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(videos));
      }
      try {
        await fetch(`api/videos.php?api_key=${encodeURIComponent(VOKAL_API_KEY)}`, {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify({
            id: id,
            video_uid: id,
            title: name,
            action: 'rename'
          })
        });
      } catch (e) {
        console.warn("Server rename error:", e);
      }
    } else if (normType === 'letter') {
      let letters = this.getLetters();
      const idx = letters.findIndex(l => String(l.id) === String(id));
      if (idx !== -1) {
        letters[idx].subject = name;
        localStorage.setItem(STORAGE_KEYS.LETTERS, JSON.stringify(letters));
      }
      try {
        await fetch(`api/letters.php?api_key=${encodeURIComponent(VOKAL_API_KEY)}`, {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify({
            id: id,
            letter_uid: id,
            subject: name,
            action: 'rename'
          })
        });
      } catch (e) {
        console.warn("Server rename error:", e);
      }
    }

    try {
      await this.syncWithServer();
    } catch (e) {}

    return { success: true, id, name, type: normType };
  }

  async deleteFolder(id, name = null, type = null) {
    let folders = this.getFolders();
    const deleted = folders.find(f => String(f.id) === String(id)) || { id, name, type };
    const folderName = name || (deleted ? deleted.name : '');
    const folderType = type || (deleted ? deleted.type : 'event');
    const normType = (folderType === 'photo' || folderType === 'event') ? 'event' : folderType;

    // Permanently record in deleted folders list so nothing ever resurrects it
    if (folderName) {
      try {
        let deletedList = JSON.parse(localStorage.getItem('vokal_deleted_folders') || '[]');
        if (!deletedList.includes(folderName)) {
          deletedList.push(folderName);
          localStorage.setItem('vokal_deleted_folders', JSON.stringify(deletedList));
        }
      } catch (e) {}
    }

    try {
      const res = await fetch(`api/folders.php?id=${encodeURIComponent(id || '')}&name=${encodeURIComponent(folderName)}&type=${encodeURIComponent(normType)}&api_key=${encodeURIComponent(VOKAL_API_KEY)}`, {
        method: "DELETE",
        headers: authHeaders,
        body: JSON.stringify({ id, name: folderName, type: normType })
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || (json && !json.success)) {
        console.warn("Server folder deletion notice:", json);
      }
    } catch (e) {
      console.warn("Folder server delete warning:", e);
    }

    // Remove from localStorage
    folders = folders.filter(f => String(f.id) !== String(id) && f.name !== folderName);
    localStorage.setItem("vokal_folders_data", JSON.stringify(folders));

    // Also remove contained items from localStorage
    if (folderName) {
      if (normType === 'event') {
        let evts = this.getEvents().filter(e => e.category !== folderName && e.date !== folderName);
        localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(evts));
      } else if (normType === 'video') {
        let vids = this.getVideos().filter(v => v.category !== folderName && v.date !== folderName);
        localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(vids));
      } else if (normType === 'letter') {
        let lets = this.getLetters().filter(l => l.department !== folderName && l.category !== folderName && l.date !== folderName);
        localStorage.setItem(STORAGE_KEYS.LETTERS, JSON.stringify(lets));
      }
    }

    try {
      await this.syncWithServer();
    } catch (e) {}

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

  async deleteInquiry(id) {
    try {
      await fetch(`api/inquiries.php?id=${encodeURIComponent(id)}&api_key=${encodeURIComponent(VOKAL_API_KEY)}`, {
        method: "DELETE",
        headers: authHeaders,
        body: JSON.stringify({ id, api_key: VOKAL_API_KEY })
      });
    } catch (err) {
      console.warn("Server deleteInquiry error:", err);
    }
    let inqs = this.getInquiries();
    inqs = inqs.filter(i => String(i.id) !== String(id));
    localStorage.setItem(STORAGE_KEYS.FEEDBACK, JSON.stringify(inqs));
    return true;
  }
}

// Global instance
window.vokalStorage = new VokalStorageManager();

if (typeof window.escapeHtml !== 'function') {
  window.escapeHtml = function(string) {
    if (!string) return "";
    return String(string)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };
}

