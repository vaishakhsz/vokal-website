/**
 * VOKAL - Voice of Kerala for Animal Legit (vokal.org.in)
 * Main Application Logic, Dynamic Renderers & Secure Admin Login / Log Off
 */

document.addEventListener("DOMContentLoaded", function () {
  // 1. Render all dynamic content
  renderSpiritualMastersSlider();
  renderEvents();
  renderVideos();
  renderLetters();
  
  // 2. Setup upload forms and contact inquiries
  setupUploadForms();
  setupContactForm();
  setupVideoPlayerModal();

  // 3. Initialize In-Page Admin Portal with Login / Log Off
  initAdminAuthSystem();

  // 4. Initialize animations and scrollspy
  initScrollAnimations();
  initScrollSpy();
});

// ==========================================
// 1. SPIRITUAL MASTERS SLIDER (Buddha, Jesus, Muhammad, Amma)
// ==========================================
function renderSpiritualMastersSlider() {
  const masters = VOKAL_DEFAULT_DATA.spiritualMasters;
  const carouselInner = document.getElementById("mastersCarouselInner");
  const navContainer = document.getElementById("mastersNavRow");
  const dotsContainer = document.getElementById("mastersIndicatorDots");
  const counterBadge = document.getElementById("masterCounterBadge");
  const carouselEl = document.getElementById("spiritualMastersCarousel");

  if (!carouselInner || !carouselEl) return;

  carouselInner.innerHTML = "";
  if (navContainer) navContainer.innerHTML = "";
  if (dotsContainer) dotsContainer.innerHTML = "";

  masters.forEach((master, index) => {
    const isActive = index === 0 ? "active" : "";
    const isAmma = master.id === "master-amritanandamayi" && master.images && master.images.length > 1;

    // 1. Carousel Slide Item
    const slide = document.createElement("div");
    slide.className = `carousel-item ${isActive}`;
    slide.setAttribute("data-master-index", index);

    let portraitHtml = `
      <div class="master-portrait-wrap">
        <img src="${master.image}" alt="${master.name}" loading="lazy">
        <div class="master-tradition-tag">
          <i class="bi bi-flower1" style="color: #ff4081;"></i>
          <span>${master.tradition}</span>
        </div>
      </div>
    `;

    if (isAmma) {
      portraitHtml = `
        <div class="master-portrait-wrap master-multi-photo-wrap position-relative" id="ammaPortraitWrap">
          <img src="${master.images[0]}" alt="${master.name}" id="ammaDynamicPhoto" class="master-photo-fader" loading="eager">
          <div class="master-photo-pills" id="ammaPhotoPills">
            ${master.images.map((_, i) => `<span class="photo-pip ${i === 0 ? 'active' : ''}" data-pip-idx="${i}"></span>`).join('')}
          </div>
          <div class="master-tradition-tag">
            <i class="bi bi-flower1" style="color: #ff4081;"></i>
            <span>${master.tradition}</span>
          </div>
        </div>
      `;
    }

    slide.innerHTML = `
      <div class="master-slide-grid">
        ${portraitHtml}
        <div class="master-content-wrap">
          <div class="master-quote-symbol">“</div>
          <div class="d-flex align-items-center gap-2 mb-1">
            <span class="badge bg-light text-success border small">Teaching ${index + 1} of ${masters.length}</span>
          </div>
          <h3 class="master-name">${master.name}</h3>
          <p class="master-title">${master.title}</p>
          <p class="master-quote-text serif-quote">${master.quote}</p>
          <div class="master-teaching-box">
            <strong class="d-block text-dark mb-1"><i class="bi bi-lightbulb-fill me-1" style="color: #ff4081;"></i> Essence of Teaching:</strong>
            ${master.teaching}
          </div>
        </div>
      </div>
    `;
    carouselInner.appendChild(slide);

    // 2. Bottom Nav Pill Button (if present)
    if (navContainer) {
      const navBtn = document.createElement("button");
      navBtn.type = "button";
      navBtn.className = `master-nav-btn ${isActive}`;
      navBtn.innerHTML = `
        <img src="${master.portrait || master.image}" alt="${master.name}">
        <span>${master.name}</span>
      `;
      navBtn.addEventListener("click", () => {
        carouselInstance.to(index);
        handleMasterSlideChange(index);
      });
      navContainer.appendChild(navBtn);
    }

    // 3. Indicator Dots
    if (dotsContainer) {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = `master-dot ${isActive}`;
      dot.setAttribute("aria-label", `Slide to ${master.name}`);
      dot.addEventListener("click", () => {
        carouselInstance.to(index);
        handleMasterSlideChange(index);
      });
      dotsContainer.appendChild(dot);
    }
  });

  // 4. Initialize Bootstrap Carousel with manual interval control
  const carouselInstance = new bootstrap.Carousel(carouselEl, {
    interval: false,
    ride: false,
    wrap: true,
    touch: true
  });

  // 5. Multi-Photo Fader & Master Duration Timers
  let isPaused = false;
  let masterTimer = null;
  let ammaPhotoTimer = null;
  let currentAmmaPhotoIdx = 0;
  let currentMasterIdx = 0;

  function switchAmmaPhoto(targetIdx) {
    const ammaImg = document.getElementById("ammaDynamicPhoto");
    const pips = document.querySelectorAll(".photo-pip");
    const ammaData = masters.find(m => m.id === "master-amritanandamayi");
    if (!ammaImg || !ammaData || !ammaData.images) return;

    currentAmmaPhotoIdx = (targetIdx !== undefined) ? targetIdx : (currentAmmaPhotoIdx + 1) % ammaData.images.length;

    ammaImg.style.opacity = "0.25";
    ammaImg.style.transform = "scale(0.98)";
    setTimeout(() => {
      ammaImg.src = ammaData.images[currentAmmaPhotoIdx];
      ammaImg.style.opacity = "1";
      ammaImg.style.transform = "scale(1)";
    }, 220);

    pips.forEach((pip, idx) => {
      pip.classList.toggle("active", idx === currentAmmaPhotoIdx);
    });
  }

  function startAmmaPhotoCycle() {
    clearInterval(ammaPhotoTimer);
    currentAmmaPhotoIdx = 0;
    switchAmmaPhoto(0);
    if (isPaused) return;
    ammaPhotoTimer = setInterval(() => {
      if (!isPaused) {
        switchAmmaPhoto();
      }
    }, 10000); // 10 seconds each photo
  }

  function stopAmmaPhotoCycle() {
    clearInterval(ammaPhotoTimer);
  }

  function scheduleNextMaster(durationMs) {
    clearTimeout(masterTimer);
    if (isPaused) return;
    masterTimer = setTimeout(() => {
      if (!isPaused) {
        carouselInstance.next();
      }
    }, durationMs);
  }

  function handleMasterSlideChange(index) {
    currentMasterIdx = index;
    stopAmmaPhotoCycle();
    clearTimeout(masterTimer);

    if (index === 0) {
      // Amma: 4 photos * 10s = 40 seconds total before advancing
      startAmmaPhotoCycle();
      scheduleNextMaster(40000);
    } else {
      // Other Masters: 10 seconds each
      scheduleNextMaster(10000);
    }
  }

  // Start initial sequence on first master (Amma)
  handleMasterSlideChange(0);

  // Pause / Resume Toggle Button (Clean: No numeric timers!)
  const pausePlayBtn = document.getElementById("masterPausePlayBtn");
  const pausePlayIcon = document.getElementById("pausePlayIcon");
  const pausePlayText = document.getElementById("pausePlayText");

  if (pausePlayBtn) {
    pausePlayBtn.addEventListener("click", () => {
      if (isPaused) {
        // Resume
        isPaused = false;
        if (pausePlayIcon) pausePlayIcon.className = "bi bi-pause-fill fs-6";
        if (pausePlayText) pausePlayText.textContent = "Pause";
        pausePlayBtn.className = "btn btn-sm btn-outline-dark py-1 px-3 rounded-pill d-flex align-items-center gap-1 shadow-sm";
        pausePlayBtn.style.backgroundColor = "";
        pausePlayBtn.style.borderColor = "";
        handleMasterSlideChange(currentMasterIdx);
        showToast("Auto-slide resumed", "info");
      } else {
        // Pause
        isPaused = true;
        clearTimeout(masterTimer);
        stopAmmaPhotoCycle();
        if (pausePlayIcon) pausePlayIcon.className = "bi bi-play-fill fs-6";
        if (pausePlayText) pausePlayText.textContent = "Resume";
        pausePlayBtn.className = "btn btn-sm text-white py-1 px-3 rounded-pill d-flex align-items-center gap-1 shadow-sm fw-bold border-0";
        pausePlayBtn.style.backgroundColor = "#ff4081";
        showToast("Teachings slide paused", "info");
      }
    });
  }

  // 6. Connect Floating & Header Arrow Buttons
  const prevBtns = [
    document.getElementById("masterPrevBtn"),
    document.getElementById("masterFloatPrevBtn")
  ];
  const nextBtns = [
    document.getElementById("masterNextBtn"),
    document.getElementById("masterFloatNextBtn")
  ];

  prevBtns.forEach(btn => {
    if (btn) {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        carouselInstance.prev();
      });
    }
  });

  nextBtns.forEach(btn => {
    if (btn) {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        carouselInstance.next();
      });
    }
  });

  // 7. Synchronize Carousel Events (slide change)
  carouselEl.addEventListener("slide.bs.carousel", (e) => {
    const targetIndex = e.to;
    handleMasterSlideChange(targetIndex);
    const currentMaster = masters[targetIndex];

    // Update Counter Badge
    if (counterBadge && currentMaster) {
      counterBadge.textContent = `Master ${targetIndex + 1} of ${masters.length}: ${currentMaster.name}`;
    }

    // Update Nav Pills (if present)
    if (navContainer) {
      const navButtons = navContainer.querySelectorAll(".master-nav-btn");
      navButtons.forEach((btn, idx) => {
        btn.classList.toggle("active", idx === targetIndex);
      });
    }

    // Update Indicator Dots
    if (dotsContainer) {
      const dots = dotsContainer.querySelectorAll(".master-dot");
      dots.forEach((dot, idx) => {
        dot.classList.toggle("active", idx === targetIndex);
      });
    }
  });

  // 8. Mobile Touch Swipe Gesture Support
  let touchStartX = 0;
  let touchEndX = 0;

  carouselEl.addEventListener("touchstart", (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  carouselEl.addEventListener("touchend", (e) => {
    touchEndX = e.changedTouches[0].screenX;
    if (touchEndX < touchStartX - 40) {
      carouselInstance.next();
      resetAutoTimer();
    } else if (touchEndX > touchStartX + 40) {
      carouselInstance.prev();
      resetAutoTimer();
    }
  }, { passive: true });
}

// ==========================================
// 2. EVENTS & PHOTO GALLERY — FOLDER FORMAT
// ==========================================

function renderEvents() {
  const container = document.getElementById("eventsGrid");
  if (!container) return;

  const folderList = window.vokalStorage.getFoldersWithItems('event');
  container.innerHTML = "";

  if (folderList.length === 0) {
    container.innerHTML = `
      <div class="col-12 text-center py-5 text-muted">
        <i class="bi bi-folder2-open display-4 text-muted d-block mb-3"></i>
        <h5>No event albums yet</h5>
        <p class="small text-secondary">Event photos will be added via the Admin Portal and will appear here as folders.</p>
      </div>
    `;
    return;
  }

  folderList.forEach((folder, idx) => {
    const colorList = ["#4caf50", "#1565c0", "#e91e63", "#ff9800", "#9c27b0", "#00897b", "#607d8b"];
    const color = colorList[idx % colorList.length];
    const safeName = folder.name;
    const items = folder.items;

    const cardCol = document.createElement("div");
    cardCol.className = "col-md-4 col-lg-3 col-sm-6";
    cardCol.innerHTML = `
      <div class="folder-card" data-folder="${escapeHtml(safeName)}" onclick="openEventFolder(this.getAttribute('data-folder'))" style="--folder-color: ${color}; cursor: pointer;">
        <div class="folder-tab"></div>
        <div class="folder-body p-3 text-center">
          <i class="bi bi-folder-fill display-5 mb-2 d-block" style="color: ${color};"></i>
          <h6 class="fw-bold mb-2 folder-title text-truncate" title="${escapeHtml(safeName)}">${escapeHtml(safeName)}</h6>
          <span class="badge bg-light text-dark border px-2 py-1" style="font-size: 0.75rem;">${items.length} photo${items.length !== 1 ? "s" : ""}</span>
        </div>
      </div>
    `;
    container.appendChild(cardCol);
  });
}

// Open a folder and show all photos inside the shared modal
function openEventFolder(dateStr) {
  const folderList = window.vokalStorage.getFoldersWithItems('event');
  const folder = folderList.find(f => f.name === dateStr);
  const items = folder ? folder.items : [];

  const titleEl  = document.getElementById("folderModalTitle");
  const subEl    = document.getElementById("folderModalSubtitle");
  const bodyEl   = document.getElementById("folderModalBody");

  if (!titleEl || !bodyEl) return;

  titleEl.innerHTML = `<i class="bi bi-folder-fill me-2"></i>${escapeHtml(dateStr)}`;
  subEl.textContent = `${items.length} photo${items.length !== 1 ? "s" : ""} in this album`;

  if (items.length === 0) {
    bodyEl.innerHTML = `
      <div class="text-center py-5 text-muted">
        <i class="bi bi-images display-4 text-muted d-block mb-3"></i>
        <h5>This album is empty</h5>
        <p class="small text-secondary mb-0">No photos have been uploaded to this album yet.</p>
        ${isAdminLoggedIn() ? `
          <div class="mt-3">
            <a href="admin.html" class="btn btn-vokal-primary btn-sm fw-bold"><i class="bi bi-plus-lg me-1"></i> Upload Photo in Admin Hub</a>
          </div>
        ` : ''}
      </div>
    `;
  } else {
    bodyEl.innerHTML = `
      <div class="row g-3">
        ${items.map(event => `
          <div class="col-md-6 col-lg-4">
            <div class="vk-card h-100">
              <div class="event-card-img-wrap" style="cursor:pointer;" onclick="openPhotoLightbox('${event.image}', '${escapeHtml(event.title)}', '${escapeHtml(event.description)}', '${escapeHtml(event.date)}')">
                <img src="${event.image}" alt="${escapeHtml(event.title)}" class="card-img-top event-card-img" loading="lazy">
                <span class="event-category-badge">${escapeHtml(event.category || dateStr)}</span>
                ${event.isUserUploaded ? '<span class="badge text-white position-absolute top-0 end-0 m-2" style="background:#ff4081;font-size:0.7rem;"><i class="bi bi-star-fill"></i> Uploaded</span>' : ''}
              </div>
              <div class="event-body">
                <div class="event-meta">
                  <span><i class="bi bi-calendar3 me-1 text-primary"></i>${escapeHtml(event.date)}</span>
                  <span><i class="bi bi-geo-alt-fill me-1 text-danger"></i>${escapeHtml(event.location)}</span>
                </div>
                <h6 class="fw-bold mb-1 text-dark">${escapeHtml(event.title)}</h6>
                <p class="text-muted small mb-2">${escapeHtml(event.description.length > 100 ? event.description.substring(0, 97) + "..." : event.description)}</p>
                <div class="d-flex justify-content-between align-items-center pt-2 border-top">
                  <button class="btn btn-link text-decoration-none p-0 text-success fw-bold small"
                    onclick="openPhotoLightbox('${event.image}','${escapeHtml(event.title)}','${escapeHtml(event.description)}','${escapeHtml(event.date)}')">
                    <i class="bi bi-arrows-fullscreen me-1"></i>Full Photo
                  </button>
                  ${isAdminLoggedIn() ? `
                    <div class="d-flex gap-2">
                      <button class="btn btn-link text-decoration-none p-0 text-primary fw-bold small" onclick="promptRenamePublicItem('${event.id}', '${escapeHtml(event.title)}', 'event')">
                        <i class="bi bi-pencil-square me-1"></i>Rename
                      </button>
                      <button class="btn btn-link text-decoration-none p-0 text-danger fw-bold small" onclick="deleteUserEvent('${event.id}')">
                        <i class="bi bi-trash3 me-1"></i>Delete
                      </button>
                    </div>
                  ` : ''}
                </div>
              </div>
            </div>
          </div>
        `).join("")}
      </div>
    `;
  }

  // Update modal footer with Admin actions if logged in
  let footerEl = document.getElementById("folderModalFooter");
  if (!footerEl) {
    footerEl = document.createElement("div");
    footerEl.id = "folderModalFooter";
    footerEl.className = "modal-footer bg-light d-flex justify-content-between flex-wrap gap-2";
    document.querySelector("#folderViewerModal .modal-content")?.appendChild(footerEl);
  }

  if (footerEl) {
    if (isAdminLoggedIn()) {
      footerEl.style.display = "flex";
      footerEl.innerHTML = `
        <div class="d-flex gap-2">
          <button class="btn btn-outline-danger btn-sm fw-bold" onclick="publicDeleteFolder('${escapeHtml(dateStr)}', 'event')">
            <i class="bi bi-trash3-fill me-1"></i> Delete Album
          </button>
          <button class="btn btn-outline-primary btn-sm fw-bold" onclick="publicRenameFolder('${escapeHtml(dateStr)}', 'event')">
            <i class="bi bi-pencil-fill me-1"></i> Rename Album
          </button>
        </div>
        <a href="admin.html" class="btn btn-vokal-primary btn-sm fw-bold">
          <i class="bi bi-speedometer2 me-1"></i> Manage in Admin Portal
        </a>
      `;
    } else {
      footerEl.style.display = "none";
    }
  }

  const modal = new bootstrap.Modal(document.getElementById("folderViewerModal"));
  modal.show();
}

function deleteUserEvent(id) {
  if (!isAdminLoggedIn()) {
    showToast("Please log in via the Admin Portal to manage content.", "warning");
    window.open("admin.html", "_blank");
    return;
  }
  if (confirm("Are you sure you want to delete this photo?")) {
    window.vokalStorage.deleteEvent(id);
    renderEvents();
    renderInPageAdmin();
    // Also refresh the folder modal if open
    const folderModal = document.getElementById("folderViewerModal");
    if (folderModal && folderModal.classList.contains("show")) {
      const titleEl = document.getElementById("folderModalTitle");
      const title = titleEl ? titleEl.textContent.trim() : "";
      openEventFolder(title);
    }
    showToast("Photo removed successfully. The album remains intact.", "info");
  }
}

function openPhotoLightbox(src, title, desc, date) {
  const modalEl = document.getElementById("photoLightboxModal");
  if (!modalEl) return;

  document.getElementById("lightboxImage").src = src;
  document.getElementById("lightboxTitle").textContent = title;
  document.getElementById("lightboxDesc").textContent = desc;
  document.getElementById("lightboxDate").textContent = date;

  const modal = new bootstrap.Modal(modalEl);
  modal.show();
}

// ==========================================
// 3. VIDEOS & MEDIA LINKS — FOLDER FORMAT
// ==========================================
function renderVideos() {
  const container = document.getElementById("videosGrid");
  if (!container) return;

  const folderList = window.vokalStorage.getFoldersWithItems('video');
  container.innerHTML = "";

  if (folderList.length === 0) {
    container.innerHTML = `
      <div class="col-12 text-center py-5 text-muted">
        <i class="bi bi-camera-video display-4 text-muted d-block mb-3"></i>
        <h5>No video albums yet</h5>
        <p class="small text-secondary">Videos will appear here as folders once added.</p>
      </div>
    `;
    return;
  }

  folderList.forEach((folder, idx) => {
    const colorList = ["#1565c0", "#6a1b9a", "#e65100", "#c62828", "#00695c", "#2e7d32"];
    const color = colorList[idx % colorList.length];
    const safeName = folder.name;
    const items = folder.items;

    const cardCol = document.createElement("div");
    cardCol.className = "col-md-4 col-lg-3 col-sm-6";
    cardCol.innerHTML = `
      <div class="folder-card" data-folder="${escapeHtml(safeName)}" onclick="openVideoFolder(this.getAttribute('data-folder'))" style="--folder-color: ${color}; cursor: pointer;">
        <div class="folder-tab"></div>
        <div class="folder-body p-3 text-center">
          <i class="bi bi-folder-fill display-5 mb-2 d-block" style="color: ${color};"></i>
          <h6 class="fw-bold mb-2 folder-title text-truncate" title="${escapeHtml(safeName)}">${escapeHtml(safeName)}</h6>
          <span class="badge bg-light text-dark border px-2 py-1" style="font-size: 0.75rem;">${items.length} video${items.length !== 1 ? "s" : ""}</span>
        </div>
      </div>
    `;
    container.appendChild(cardCol);
  });
}

function openVideoFolder(dateStr) {
  const folderList = window.vokalStorage.getFoldersWithItems('video');
  const folder = folderList.find(f => f.name === dateStr);
  const items = folder ? folder.items : [];

  const titleEl = document.getElementById("folderModalTitle");
  const subEl   = document.getElementById("folderModalSubtitle");
  const bodyEl  = document.getElementById("folderModalBody");

  if (!titleEl || !bodyEl) return;

  titleEl.innerHTML = `<i class="bi bi-camera-video-fill me-2"></i>${escapeHtml(dateStr)}`;
  subEl.textContent = `${items.length} video${items.length !== 1 ? "s" : ""} in this folder`;

  if (items.length === 0) {
    bodyEl.innerHTML = `
      <div class="text-center py-5 text-muted">
        <i class="bi bi-camera-video display-4 text-muted d-block mb-3"></i>
        <h5>This folder is empty</h5>
        <p class="small text-secondary mb-0">No videos have been added to this folder yet.</p>
        ${isAdminLoggedIn() ? `
          <div class="mt-3">
            <a href="admin.html" class="btn btn-vokal-primary btn-sm fw-bold"><i class="bi bi-plus-lg me-1"></i> Add Video in Admin Hub</a>
          </div>
        ` : ''}
      </div>
    `;
  } else {
    bodyEl.innerHTML = `
      <div class="row g-3">
        ${items.map(video => {
          const parsed = (typeof parseVideoUrl === 'function')
            ? parseVideoUrl(video.videoUrl)
            : (window.parseVideoUrl ? window.parseVideoUrl(video.videoUrl) : { embedUrl: video.videoUrl, directUrl: video.videoUrl, platform: 'Video' });

          const isFb = parsed.platform === 'Facebook';
          const isIg = parsed.platform === 'Instagram';
          const targetUrl = parsed.directUrl || video.videoUrl;

          // Directly open external social videos on Facebook/Instagram to avoid iframe "Video unavailable" restrictions
          const playClickAction = (isFb || isIg)
            ? `window.open('${targetUrl}', '_blank', 'noopener,noreferrer')`
            : `playVideoModal('${video.videoUrl}', '${escapeHtml(video.title)}', '${escapeHtml(video.description)}')`;

          let watchBtn = '';
          if (isFb) {
            watchBtn = `<a href="${targetUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm fw-semibold"><i class="bi bi-facebook me-1"></i> Watch on Facebook</a>`;
          } else if (isIg) {
            watchBtn = `<a href="${targetUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-sm text-white fw-semibold" style="background: linear-gradient(45deg, #f09433, #dc2743, #bc1888);"><i class="bi bi-instagram me-1"></i> Watch on Instagram</a>`;
          } else {
            watchBtn = `<button class="btn btn-vokal-outline btn-sm" onclick="playVideoModal('${video.videoUrl}', '${escapeHtml(video.title)}', '${escapeHtml(video.description)}')"><i class="bi bi-play-circle-fill me-1"></i> Watch</button>`;
          }

          return `
          <div class="col-md-6">
            <div class="vk-card h-100">
              <div class="video-card-thumb position-relative" style="cursor: pointer;" onclick="${playClickAction}">
                <img src="${video.thumbnail}" alt="${escapeHtml(video.title)}" loading="lazy">
                <div class="video-play-btn"><i class="${isFb ? 'bi bi-facebook' : isIg ? 'bi bi-instagram' : 'bi bi-play-fill'} ms-1"></i></div>
                <span class="video-duration-badge"><i class="bi bi-clock me-1"></i>${video.duration}</span>
                ${isFb ? '<span class="badge bg-primary position-absolute top-0 start-0 m-2"><i class="bi bi-facebook me-1"></i>Facebook Video</span>' : ''}
                ${isIg ? '<span class="badge position-absolute top-0 start-0 m-2 text-white" style="background: linear-gradient(45deg, #f09433, #dc2743, #bc1888);"><i class="bi bi-instagram me-1"></i>Instagram</span>' : ''}
              </div>
              <div class="p-3">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span class="badge bg-light text-dark border px-2 py-1">${escapeHtml(video.category || dateStr)}</span>
                  ${video.isUserUploaded ? '<span class="badge text-white" style="background: #ff4081;"><i class="bi bi-star-fill"></i> Uploaded</span>' : ''}
                </div>
                <h6 class="fw-bold mb-2">${escapeHtml(video.title)}</h6>
                <p class="text-muted small mb-2">${escapeHtml(video.description)}</p>
                <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
                  ${watchBtn}
                  ${isAdminLoggedIn() ? `
                    <div class="d-flex gap-2 ms-auto">
                      <button class="btn btn-link text-decoration-none p-0 text-primary fw-bold small" onclick="promptRenamePublicItem('${video.id}', '${escapeHtml(video.title)}', 'video')">
                        <i class="bi bi-pencil-square me-1"></i>Rename
                      </button>
                      <button class="btn btn-link text-decoration-none p-0 text-danger fw-bold small" onclick="deleteUserVideo('${video.id}')">
                        <i class="bi bi-trash3 me-1"></i>Delete
                      </button>
                    </div>
                  ` : ''}
                </div>
              </div>
            </div>
          </div>
        `;
        }).join("")}
      </div>
    `;
  }

  let footerEl = document.getElementById("folderModalFooter");
  if (!footerEl) {
    footerEl = document.createElement("div");
    footerEl.id = "folderModalFooter";
    footerEl.className = "modal-footer bg-light d-flex justify-content-between flex-wrap gap-2";
    document.querySelector("#folderViewerModal .modal-content")?.appendChild(footerEl);
  }

  if (footerEl) {
    if (isAdminLoggedIn()) {
      footerEl.style.display = "flex";
      footerEl.innerHTML = `
        <div class="d-flex gap-2">
          <button class="btn btn-outline-danger btn-sm fw-bold" onclick="publicDeleteFolder('${escapeHtml(dateStr)}', 'video')">
            <i class="bi bi-trash3-fill me-1"></i> Delete Folder
          </button>
          <button class="btn btn-outline-primary btn-sm fw-bold" onclick="publicRenameFolder('${escapeHtml(dateStr)}', 'video')">
            <i class="bi bi-pencil-fill me-1"></i> Rename Folder
          </button>
        </div>
        <a href="admin.html" class="btn btn-vokal-primary btn-sm fw-bold">
          <i class="bi bi-speedometer2 me-1"></i> Manage in Admin Portal
        </a>
      `;
    } else {
      footerEl.style.display = "none";
    }
  }

  const modal = new bootstrap.Modal(document.getElementById("folderViewerModal"));
  modal.show();
}

function playVideoModal(url, title, desc) {
  const parsed = (typeof parseVideoUrl === 'function') 
    ? parseVideoUrl(url) 
    : (window.parseVideoUrl ? window.parseVideoUrl(url) : { embedUrl: url, directUrl: url, platform: 'Video', canEmbed: true, isFile: false });

  // Direct open on Facebook / Instagram to prevent iframe "Video unavailable" restrictions
  if (parsed.platform === 'Facebook' || parsed.platform === 'Instagram') {
    window.open(parsed.directUrl || url, '_blank', 'noopener,noreferrer');
    return;
  }

  const modalEl = document.getElementById("videoPlayerModal");
  if (!modalEl) return;

  const iframe = document.getElementById("videoPlayerIframe");
  const html5 = document.getElementById("videoPlayerHtml5");
  const titleEl = document.getElementById("videoPlayerTitle");
  const descEl = document.getElementById("videoPlayerDesc");
  const badgeEl = document.getElementById("videoPlayerBadge");
  const extBtn = document.getElementById("videoPlayerExternalBtn");

  if (titleEl) titleEl.textContent = title || "VOKAL Video";
  if (descEl) descEl.textContent = desc || "";
  if (badgeEl) {
    badgeEl.textContent = parsed.platform;
    if (parsed.platform === 'YouTube') {
      badgeEl.className = "badge bg-danger px-2 py-1";
      badgeEl.style.background = "";
    } else if (parsed.platform === 'Facebook') {
      badgeEl.className = "badge bg-primary px-2 py-1";
      badgeEl.style.background = "";
    } else if (parsed.platform === 'Instagram') {
      badgeEl.className = "badge px-2 py-1";
      badgeEl.style.background = "linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)";
    } else {
      badgeEl.className = "badge bg-secondary px-2 py-1";
      badgeEl.style.background = "";
    }
  }

  if (extBtn) {
    extBtn.href = parsed.directUrl || url;
    extBtn.innerHTML = `<i class="bi bi-box-arrow-up-right me-1"></i> Open on ${parsed.platform}`;
    extBtn.style.display = "inline-flex";
  }

  if (parsed.isFile) {
    if (iframe) {
      iframe.src = "";
      iframe.classList.add("d-none");
    }
    if (html5) {
      html5.src = parsed.directUrl;
      html5.classList.remove("d-none");
      html5.play().catch(() => {});
    }
  } else {
    if (html5) {
      html5.pause();
      html5.src = "";
      html5.classList.add("d-none");
    }
    if (iframe) {
      iframe.classList.remove("d-none");
      iframe.src = parsed.embedUrl;
    }
  }

  const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
  modal.show();
}

function setupVideoPlayerModal() {
  const modalEl = document.getElementById("videoPlayerModal");
  if (!modalEl) return;
  modalEl.addEventListener("hidden.bs.modal", () => {
    const iframe = document.getElementById("videoPlayerIframe");
    if (iframe) iframe.src = "";
    const html5 = document.getElementById("videoPlayerHtml5");
    if (html5) {
      html5.pause();
      html5.src = "";
    }
  });
}

function deleteUserVideo(id) {
  if (!isAdminLoggedIn()) {
    showToast("Please log in via the Admin Portal to manage content.", "warning");
    window.open("admin.html", "_blank");
    return;
  }
  if (confirm("Delete this video link?")) {
    window.vokalStorage.deleteVideo(id);
    renderVideos();
    renderInPageAdmin();
    const folderModal = document.getElementById("folderViewerModal");
    if (folderModal && folderModal.classList.contains("show")) {
      const titleEl = document.getElementById("folderModalTitle");
      const title = titleEl ? titleEl.textContent.trim() : "";
      openVideoFolder(title);
    }
    showToast("Video link deleted. The folder remains intact.", "info");
  }
}

async function promptRenamePublicItem(id, currentName, type) {
  if (!isAdminLoggedIn()) {
    showToast("Please log in via the Admin Portal to manage content.", "warning");
    window.open("admin.html", "_blank");
    return;
  }
  const typeLabel = (type === 'letter') ? 'Letter' : (type === 'video') ? 'Video' : 'Photo';
  const newName = prompt(`Enter new title/name for this ${typeLabel}:`, currentName);
  if (!newName || !newName.trim() || newName.trim() === currentName) return;

  try {
    await window.vokalStorage.renameItem(id, newName.trim(), type);
    showToast(`${typeLabel} renamed to "${newName.trim()}" successfully!`, "success");
    
    // Refresh views & modal
    if (type === 'event' || type === 'photo') {
      renderEvents();
      const titleEl = document.getElementById("folderModalTitle");
      if (titleEl) openEventFolder(titleEl.textContent.trim());
    } else if (type === 'video') {
      renderVideos();
      const titleEl = document.getElementById("folderModalTitle");
      if (titleEl) openVideoFolder(titleEl.textContent.trim());
    } else if (type === 'letter') {
      renderLetters();
      const titleEl = document.getElementById("folderModalTitle");
      if (titleEl) openLetterFolder(titleEl.textContent.trim());
    }
  } catch (err) {
    showToast("Rename failed: " + err.message, "danger");
  }
}

// ==========================================
// 4. LETTERS TO GOVERNMENT — FOLDER FORMAT
// ==========================================
function renderLetters() {
  const container = document.getElementById("lettersGrid");
  if (!container) return;

  const folderList = window.vokalStorage.getFoldersWithItems('letter');
  container.innerHTML = "";

  if (folderList.length === 0) {
    container.innerHTML = `
      <div class="col-12 text-center py-5 text-muted">
        <i class="bi bi-folder2-open display-4 text-muted d-block mb-3"></i>
        <h5>No letter folders yet</h5>
        <p class="small text-secondary">Government representations will appear here organised by department.</p>
      </div>
    `;
    return;
  }

  folderList.forEach((folder, idx) => {
    const colorList = ["#c62828", "#1565c0", "#2e7d32", "#ff8f00", "#4a148c", "#880e4f"];
    const color = colorList[idx % colorList.length];
    const safeName = folder.name;
    const items = folder.items;

    const cardCol = document.createElement("div");
    cardCol.className = "col-md-4 col-lg-3 col-sm-6";
    cardCol.innerHTML = `
      <div class="folder-card" data-folder="${escapeHtml(safeName)}" onclick="openLetterFolder(this.getAttribute('data-folder'))" style="--folder-color: ${color}; cursor: pointer;">
        <div class="folder-tab"></div>
        <div class="folder-body p-3 text-center">
          <i class="bi bi-folder-fill display-5 mb-2 d-block" style="color: ${color};"></i>
          <h6 class="fw-bold mb-2 folder-title text-truncate" title="${escapeHtml(safeName)}">${escapeHtml(safeName)}</h6>
          <span class="badge bg-light text-dark border px-2 py-1" style="font-size: 0.75rem;">${items.length} letter${items.length !== 1 ? "s" : ""}</span>
        </div>
      </div>
    `;
    container.appendChild(cardCol);
  });
}

function openLetterFolder(dateStr) {
  const folderList = window.vokalStorage.getFoldersWithItems('letter');
  const folder = folderList.find(f => f.name === dateStr);
  const items = folder ? folder.items : [];

  const titleEl = document.getElementById("folderModalTitle");
  const subEl   = document.getElementById("folderModalSubtitle");
  const bodyEl  = document.getElementById("folderModalBody");

  if (!titleEl || !bodyEl) return;

  titleEl.innerHTML = `<i class="bi bi-envelope-paper-fill me-2"></i>${escapeHtml(dateStr)}`;
  subEl.textContent = `${items.length} letter${items.length !== 1 ? "s" : ""} in this folder`;

  if (items.length === 0) {
    bodyEl.innerHTML = `
      <div class="text-center py-5 text-muted">
        <i class="bi bi-folder2-open display-4 text-muted d-block mb-3"></i>
        <h5>This folder is empty</h5>
        <p class="small text-secondary mb-0">No representations have been uploaded to this folder yet.</p>
        ${isAdminLoggedIn() ? `
          <div class="mt-3">
            <a href="admin.html" class="btn btn-vokal-primary btn-sm fw-bold"><i class="bi bi-plus-lg me-1"></i> Upload Letter in Admin Hub</a>
          </div>
        ` : ''}
      </div>
    `;
  } else {
    bodyEl.innerHTML = `
      <div class="row g-3">
        ${items.map(letter => {
          const demandsHtml = (letter.keyDemands || []).map(d => `<li>${escapeHtml(d)}</li>`).join("");
          return `
            <div class="col-12">
              <div class="letter-card">
                <div class="d-flex justify-content-between align-items-start mb-2">
                  <span class="letter-ref-badge">${escapeHtml(letter.refNo)}</span>
                  <span class="badge bg-${letter.statusColor || 'primary'}">${escapeHtml(letter.status)}</span>
                </div>
                <h5 class="fw-bold mt-2 text-dark">${escapeHtml(letter.subject)}</h5>
                <div class="text-muted small mb-2">
                  <strong><i class="bi bi-building me-1"></i> To:</strong> ${escapeHtml(letter.recipient)} (${escapeHtml(letter.department)})
                </div>
                <div class="text-muted small mb-3">
                  <i class="bi bi-calendar-event me-1"></i> Submitted on: <strong>${escapeHtml(letter.date)}</strong>
                </div>
                <p class="text-secondary small mb-2">${escapeHtml(letter.summary)}</p>
                <h6 class="fw-bold small text-dark mt-2 mb-1"><i class="bi bi-check2-circle text-success me-1"></i> Key Demands &amp; Petitions:</h6>
                <ul class="letter-demands-list mb-3">${demandsHtml}</ul>
                <div class="mt-auto pt-3 border-top d-flex gap-2 flex-wrap justify-content-between align-items-center">
                  <div class="d-flex gap-2">
                    <button class="btn btn-sm btn-vokal-primary" onclick="viewLetterModal('${letter.id}')">
                      <i class="bi bi-file-earmark-text me-1"></i> View Details
                    </button>
                    <a href="${letter.docUrl}" download="${letter.refNo.replace(/\//g, '_')}.txt" class="btn btn-sm btn-outline-secondary">
                      <i class="bi bi-download me-1"></i> Download
                    </a>
                  </div>
                  ${isAdminLoggedIn() ? `
                    <div class="d-flex gap-2">
                      <button class="btn btn-link text-decoration-none p-0 text-primary fw-bold small" onclick="promptRenamePublicItem('${letter.id}', '${escapeHtml(letter.subject)}', 'letter')">
                        <i class="bi bi-pencil-square me-1"></i>Rename
                      </button>
                      <button class="btn btn-link text-decoration-none p-0 text-danger fw-bold small" onclick="deleteUserLetter('${letter.id}')">
                        <i class="bi bi-trash3 me-1"></i>Delete
                      </button>
                    </div>
                  ` : ''}
                </div>
              </div>
            </div>
          `;
        }).join("")}
      </div>
    `;
  }

  let footerEl = document.getElementById("folderModalFooter");
  if (!footerEl) {
    footerEl = document.createElement("div");
    footerEl.id = "folderModalFooter";
    footerEl.className = "modal-footer bg-light d-flex justify-content-between flex-wrap gap-2";
    document.querySelector("#folderViewerModal .modal-content")?.appendChild(footerEl);
  }

  if (footerEl) {
    if (isAdminLoggedIn()) {
      footerEl.style.display = "flex";
      footerEl.innerHTML = `
        <div class="d-flex gap-2">
          <button class="btn btn-outline-danger btn-sm fw-bold" onclick="publicDeleteFolder('${escapeHtml(dateStr)}', 'letter')">
            <i class="bi bi-trash3-fill me-1"></i> Delete Folder
          </button>
          <button class="btn btn-outline-primary btn-sm fw-bold" onclick="publicRenameFolder('${escapeHtml(dateStr)}', 'letter')">
            <i class="bi bi-pencil-fill me-1"></i> Rename Folder
          </button>
        </div>
        <a href="admin.html" class="btn btn-vokal-primary btn-sm fw-bold">
          <i class="bi bi-speedometer2 me-1"></i> Manage in Admin Portal
        </a>
      `;
    } else {
      footerEl.style.display = "none";
    }
  }

  const modal = new bootstrap.Modal(document.getElementById("folderViewerModal"));
  modal.show();
}

async function publicDeleteFolder(folderName, type) {
  if (!isAdminLoggedIn()) return;
  const folders = window.vokalStorage.getFolders();
  const f = folders.find(x => x.name === folderName);
  if (!confirm(`Are you sure you want to permanently delete the folder "${folderName}" and all items inside it?`)) return;

  try {
    if (f && f.id) {
      await window.vokalStorage.deleteFolder(f.id);
    } else {
      let allF = window.vokalStorage.getFolders().filter(x => x.name !== folderName);
      localStorage.setItem("vokal_folders_data", JSON.stringify(allF));
    }
    bootstrap.Modal.getInstance(document.getElementById("folderViewerModal"))?.hide();
    renderEvents();
    renderVideos();
    renderLetters();
    showToast(`Folder "${folderName}" deleted successfully.`, "success");
  } catch (err) {
    showToast("Delete failed: " + err.message, "danger");
  }
}

async function publicRenameFolder(folderName, type) {
  if (!isAdminLoggedIn()) return;
  const folders = window.vokalStorage.getFolders();
  const f = folders.find(x => x.name === folderName);
  const newName = prompt(`Enter new name for folder "${folderName}":`, folderName);
  if (!newName || newName.trim() === "" || newName.trim() === folderName) return;

  try {
    if (f && f.id) {
      await window.vokalStorage.editFolder(f.id, newName.trim(), type);
    } else {
      await window.vokalStorage.addFolder(newName.trim(), type);
    }
    bootstrap.Modal.getInstance(document.getElementById("folderViewerModal"))?.hide();
    renderEvents();
    renderVideos();
    renderLetters();
    showToast(`Folder renamed to "${newName.trim()}" successfully!`, "success");
  } catch (err) {
    showToast("Rename failed: " + err.message, "danger");
  }
}

function deleteUserLetter(id) {
  if (!isAdminLoggedIn()) {
    showToast("Please log in via the Admin Portal to manage content.", "warning");
    window.open("admin.html", "_blank");
    return;
  }
  if (confirm("Are you sure you want to delete this letter representation?")) {
    window.vokalStorage.deleteLetter(id);
    renderLetters();
    renderInPageAdmin();
    const folderModal = document.getElementById("folderViewerModal");
    if (folderModal && folderModal.classList.contains("show")) {
      const titleEl = document.getElementById("folderModalTitle");
      const title = titleEl ? titleEl.textContent.trim() : "";
      openLetterFolder(title);
    }
    showToast("Letter representation removed. The folder remains intact.", "info");
  }
}

// ==========================================
// 5. IN-PAGE ADMIN PORTAL: LOGIN & LOG OFF
// ==========================================
// Authorized admin authentication

function isAdminLoggedIn() {
  return sessionStorage.getItem("vokal_admin_auth") === "true";
}

function initAdminAuthSystem() {
  const loginCard = document.getElementById("adminLoginCard");
  const controlPanel = document.getElementById("adminControlPanel");
  if (!loginCard && !controlPanel) return;
  const loginForm = document.getElementById("adminLoginForm");
  const loginError = document.getElementById("adminLoginError");

  // Check existing session
  if (isAdminLoggedIn()) {
    showAdminControlPanel();
  } else {
    showAdminLoginForm();
  }

  // Handle Login submission
  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const usernameInput = document.getElementById("adminLoginUser").value.trim();
      const passwordInput = document.getElementById("adminLoginPass").value.trim();

      if (usernameInput === "admin" && passwordInput === "admin123") {
        try {
          sessionStorage.setItem("vokal_admin_auth", "true");
          if (loginError) loginError.classList.add("d-none");
          loginForm.reset();
          showAdminControlPanel();
          showToast("Welcome Admin! Logged in successfully.", "success");
        } catch(err) {
          alert("Login error: " + err.message);
        }
      } else {
        if (loginError) {
          loginError.textContent = "Invalid username or password. Please try again.";
          loginError.classList.remove("d-none");
        }
        showToast("Invalid username or password. Please try again.", "danger");
      }
    });
  }
}

function showAdminControlPanel() {
  const loginCard = document.getElementById("adminLoginCard");
  const controlPanel = document.getElementById("adminControlPanel");
  if (loginCard) loginCard.classList.add("d-none");
  if (controlPanel) controlPanel.classList.remove("d-none");
  renderInPageAdmin();
}

function showAdminLoginForm() {
  const loginCard = document.getElementById("adminLoginCard");
  const controlPanel = document.getElementById("adminControlPanel");
  if (loginCard) loginCard.classList.remove("d-none");
  if (controlPanel) controlPanel.classList.add("d-none");
}

function logOffAdmin() {
  if (confirm("Are you sure you want to log off from the Admin Hub?")) {
    sessionStorage.removeItem("vokal_admin_auth");
    if (window.location.pathname.endsWith("admin.html")) {
      window.location.reload();
      return;
    }
    showToast("You have been logged off successfully.", "info");
  }
}

function renderInPageAdmin() {
  if (!isAdminLoggedIn()) return;

  // Update counts
  const photos = window.vokalStorage.getEvents();
  const letters = window.vokalStorage.getLetters();
  const videos = window.vokalStorage.getVideos();
  const inquiries = window.vokalStorage.getInquiries();

  const elPhotoCount = document.getElementById("inPageAdminPhotoCount");
  const elLetterCount = document.getElementById("inPageAdminLetterCount");
  const elVideoCount = document.getElementById("inPageAdminVideoCount");
  const elInquiryCount = document.getElementById("inPageAdminInquiryCount");

  if (elPhotoCount) elPhotoCount.textContent = photos.length;
  if (elLetterCount) elLetterCount.textContent = letters.length;
  if (elVideoCount) elVideoCount.textContent = videos.length;
  if (elInquiryCount) elInquiryCount.textContent = inquiries.length;

  // Render Admin Photo List
  const adminPhotoList = document.getElementById("inPageAdminPhotosList");
  if (adminPhotoList) {
    adminPhotoList.innerHTML = "";
    photos.forEach(p => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><img src="${p.image}" class="admin-table-thumb"></td>
        <td><strong>${escapeHtml(p.title)}</strong><br><small class="text-muted">${p.location} | ${p.date}</small></td>
        <td><span class="badge bg-light text-dark border">${p.category}</span></td>
        <td>${p.isUserUploaded ? '<span class="badge bg-warning text-dark">Uploaded</span>' : '<span class="badge bg-secondary">Default</span>'}</td>
        <td>
          <button class="btn btn-outline-danger btn-sm" onclick="deleteUserEvent('${p.id}')">
            <i class="bi bi-trash3"></i> Delete
          </button>
        </td>
      `;
      adminPhotoList.appendChild(tr);
    });
  }

  // Render Admin Letters List
  const adminLettersList = document.getElementById("inPageAdminLettersList");
  if (adminLettersList) {
    adminLettersList.innerHTML = "";
    letters.forEach(l => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><code>${l.refNo}</code></td>
        <td><strong>${escapeHtml(l.subject)}</strong><br><small class="text-muted">${l.recipient} (${l.department})</small></td>
        <td><span class="badge bg-${l.statusColor || 'primary'}">${l.status}</span></td>
        <td>${l.date}</td>
        <td>
          <button class="btn btn-outline-danger btn-sm" onclick="deleteUserLetter('${l.id}')">
            <i class="bi bi-trash3"></i> Delete
          </button>
        </td>
      `;
      adminLettersList.appendChild(tr);
    });
  }

  // Render Admin Videos List
  const adminVideosList = document.getElementById("inPageAdminVideosList");
  if (adminVideosList) {
    adminVideosList.innerHTML = "";
    videos.forEach(v => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><img src="${v.thumbnail}" class="admin-table-thumb"></td>
        <td><strong>${escapeHtml(v.title)}</strong><br><small class="text-muted">${v.duration}</small></td>
        <td><span class="badge bg-light text-dark border">${v.category}</span></td>
        <td><a href="${v.videoUrl}" target="_blank" class="small">Open Link <i class="bi bi-box-arrow-up-right"></i></a></td>
        <td>
          <button class="btn btn-outline-danger btn-sm" onclick="deleteUserVideo('${v.id}')">
            <i class="bi bi-trash3"></i> Delete
          </button>
        </td>
      `;
      adminVideosList.appendChild(tr);
    });
  }

  // Render Admin Inquiries
  const adminInquiriesList = document.getElementById("inPageAdminInquiriesList");
  if (adminInquiriesList) {
    adminInquiriesList.innerHTML = "";
    if (inquiries.length === 0) {
      adminInquiriesList.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-4">No citizen inquiries or reports received yet. Form submissions appear here in real time.</td></tr>`;
    } else {
      inquiries.forEach(i => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td class="small text-muted">${new Date(i.submittedAt).toLocaleDateString()}</td>
          <td><strong>${escapeHtml(i.name)}</strong><br><small><a href="mailto:${escapeHtml(i.email)}" class="text-success">${escapeHtml(i.email || 'No email')}</a></small></td>
          <td><span class="badge bg-light text-dark border">${escapeHtml(i.district)}</span></td>
          <td><span class="badge bg-danger">${escapeHtml(i.type)}</span></td>
          <td class="small">${escapeHtml(i.message)}</td>
        `;
        adminInquiriesList.appendChild(tr);
      });
    }
  }
}

// ==========================================
// 6. UPLOAD SETUP (ADMIN PROTECTED)
// ==========================================
function setupUploadForms() {
  setupPhotoUpload("inpagePhotoFile", "inpagePhotoPreview", "inpagePhotoForm", "inpagePhotoTitle", "inpagePhotoCategory", "inpagePhotoLocation", "inpagePhotoDate", "inpagePhotoDesc", "inpagePhotoUrl");
  setupLetterUpload("inpageLetterForm", "inpageLetterSubject", "inpageLetterRefNo", "inpageLetterRecipient", "inpageLetterDepartment", "inpageLetterStatus", "inpageLetterDate", "inpageLetterSummary", "inpageLetterDemands", "inpageLetterFile");
  setupVideoUpload("inpageVideoForm", "inpageVideoTitle", "inpageVideoUrl", "inpageVideoCategory", "inpageVideoDuration", "inpageVideoDesc", "inpageVideoThumbnail");
}

function setupPhotoUpload(fileId, previewId, formId, titleId, catId, locId, dateId, descId, urlId) {
  const fileInput = document.getElementById(fileId);
  const preview = document.getElementById(previewId);
  let encodedPhotoData = "";

  if (fileInput && preview) {
    fileInput.addEventListener("change", function () {
      const file = this.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
          encodedPhotoData = e.target.result;
          preview.src = encodedPhotoData;
          preview.classList.remove("d-none");
        };
        reader.readAsDataURL(file);
      }
    });
  }

  const form = document.getElementById(formId);
  if (form) {
    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      if (!isAdminLoggedIn()) {
        showToast("Please log in via the Admin Portal to upload photos.", "warning");
        window.open("admin.html", "_blank");
        return;
      }

      const submitBtn = form.querySelector("button[type='submit']");
      const origHtml = submitBtn ? submitBtn.innerHTML : "";
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Saving to Database...';
      }

      try {
        const title = document.getElementById(titleId).value.trim();
        const category = document.getElementById(catId).value;
        const locationVal = document.getElementById(locId).value.trim();
        const date = document.getElementById(dateId).value || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        const description = document.getElementById(descId).value.trim();
        const urlInput = document.getElementById(urlId) ? document.getElementById(urlId).value.trim() : "";

        const finalImage = encodedPhotoData || urlInput || "assets/vokal_brand_header.png";

        const fileInputEl = document.getElementById(fileId);
        const fileObj = (fileInputEl && fileInputEl.files && fileInputEl.files[0]) ? fileInputEl.files[0] : null;

        await window.vokalStorage.addEvent({
          title,
          category,
          location: locationVal,
          date,
          description,
          image: finalImage
        }, fileObj);

        renderEvents();
        renderInPageAdmin();
        form.reset();
        encodedPhotoData = "";
        if (preview) preview.classList.add("d-none");

        showToast("Event photo published and saved to MySQL successfully!", "success");
      } catch (err) {
        console.error("Photo upload error:", err);
        showToast("Upload failed: " + err.message, "danger");
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = origHtml;
        }
      }
    });
  }
}

function setupLetterUpload(formId, subjId, refId, recId, deptId, statusId, dateId, sumId, demId, fileId) {
  let docUrl = "#";
  const fileInput = document.getElementById(fileId);
  if (fileInput) {
    fileInput.addEventListener("change", function () {
      const file = this.files[0];
      if (file) docUrl = URL.createObjectURL(file);
    });
  }

  const form = document.getElementById(formId);
  if (form) {
    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      if (!isAdminLoggedIn()) {
        showToast("Please log in via the Admin Portal to upload representations.", "warning");
        window.open("admin.html", "_blank");
        return;
      }

      const submitBtn = form.querySelector("button[type='submit']");
      const origHtml = submitBtn ? submitBtn.innerHTML : "";
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Saving to Database...';
      }

      try {
        const subject = document.getElementById(subjId).value.trim();
        const refNo = document.getElementById(refId).value.trim();
        const recipient = document.getElementById(recId).value.trim();
        const department = document.getElementById(deptId).value.trim();
        const status = document.getElementById(statusId).value;
        const date = document.getElementById(dateId).value || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        const summary = document.getElementById(sumId).value.trim();
        const demands = document.getElementById(demId).value.trim();

        const letterFileObj = (fileInput && fileInput.files && fileInput.files[0]) ? fileInput.files[0] : null;

        await window.vokalStorage.addLetter({
          subject,
          refNo,
          recipient,
          department,
          status,
          date,
          summary,
          keyDemands: demands,
          docUrl
        }, letterFileObj);

        renderLetters();
        renderInPageAdmin();
        form.reset();
        docUrl = "#";

        showToast("Govt letter representation published and saved to MySQL!", "success");
      } catch (err) {
        console.error("Letter upload error:", err);
        showToast("Upload failed: " + err.message, "danger");
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = origHtml;
        }
      }
    });
  }
}

function setupVideoUpload(formId, titleId, urlId, catId, durId, descId, thumbId) {
  const form = document.getElementById(formId);
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!isAdminLoggedIn()) {
        showToast("Please log in via the Admin Portal to add video links.", "warning");
        window.open("admin.html", "_blank");
        return;
      }

      const title = document.getElementById(titleId).value.trim();
      const videoUrl = document.getElementById(urlId).value.trim();
      const category = document.getElementById(catId).value;
      const duration = document.getElementById(durId).value.trim() || "Live / Video";
      const description = document.getElementById(descId).value.trim();
      const thumbnail = document.getElementById(thumbId) && document.getElementById(thumbId).value.trim() 
        ? document.getElementById(thumbId).value.trim() 
        : "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80";

      window.vokalStorage.addVideo({
        title,
        videoUrl,
        category,
        duration,
        description,
        thumbnail
      });

      renderVideos();
      renderInPageAdmin();
      form.reset();

      showToast("Video link uploaded and added to the gallery!", "success");
    });
  }
}

// ==========================================
// 7. CUSTOMER INQUIRY & CRUELTY REPORT FORM
// ==========================================
function setupContactForm() {
  const form = document.getElementById("vokalContactForm");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("contactName").value.trim();
    const email = document.getElementById("contactEmail").value.trim();
    const district = document.getElementById("contactDistrict").value;
    const type = document.getElementById("contactType").value;
    const message = document.getElementById("contactMessage").value.trim();

    window.vokalStorage.saveInquiry({
      name,
      email,
      district,
      type,
      message
    });

    form.reset();
    renderInPageAdmin();
    showToast("Your inquiry has been received by VOKAL. Our district volunteers will review it promptly!", "success");
  });
}

// Backup & Reset Actions
function exportSiteDataBackup() {
  if (!isAdminLoggedIn()) return;
  const data = window.vokalStorage.exportAllData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `vokal_database_backup_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast("Database exported successfully!", "success");
}

function importSiteDataBackup(inputEl) {
  if (!isAdminLoggedIn() || !inputEl.files[0]) return;
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const parsed = JSON.parse(e.target.result);
      window.vokalStorage.importData(parsed);
      renderEvents();
      renderVideos();
      renderLetters();
      renderInPageAdmin();
      showToast("Data backup successfully restored!", "success");
    } catch (err) {
      alert("Invalid backup file: " + err.message);
    }
  };
  reader.readAsText(inputEl.files[0]);
}

function resetSiteDataDefaults() {
  if (!isAdminLoggedIn()) return;
  if (confirm("Reset all data to official defaults? This will erase custom test uploads.")) {
    window.vokalStorage.resetToDefaults();
    renderEvents();
    renderVideos();
    renderLetters();
    renderInPageAdmin();
    showToast("Reset to official default data completed", "info");
  }
}

// Toast notification helper
function showToast(message, type = "success") {
  let toastContainer = document.getElementById("vokalToastContainer");
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.id = "vokalToastContainer";
    toastContainer.className = "toast-container position-fixed bottom-0 end-0 p-3";
    toastContainer.style.zIndex = "9999";
    document.body.appendChild(toastContainer);
  }

  const toastEl = document.createElement("div");
  toastEl.className = `toast align-items-center text-white bg-${type === 'success' ? 'success' : type === 'info' ? 'primary' : 'danger'} border-0`;
  toastEl.setAttribute("role", "alert");
  toastEl.setAttribute("aria-live", "assertive");
  toastEl.setAttribute("aria-atomic", "true");

  toastEl.innerHTML = `
    <div class="d-flex">
      <div class="toast-body d-flex align-items-center gap-2">
        <i class="bi ${type === 'success' ? 'bi-check-circle-fill' : 'bi-info-circle-fill'} fs-5"></i>
        <span>${message}</span>
      </div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
  `;

  toastContainer.appendChild(toastEl);
  const toast = new bootstrap.Toast(toastEl, { delay: 4500 });
  toast.show();

  toastEl.addEventListener("hidden.bs.modal", () => {
    toastEl.remove();
  });
}

function escapeHtml(string) {
  if (!string) return "";
  return String(string)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Initialize scroll animations
function initScrollAnimations() {
  const elements = document.querySelectorAll('.animate-on-scroll');
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry, idx) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('is-visible');
        }, idx * 100); // Stagger effect
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  elements.forEach(el => observer.observe(el));
}

// Initialize ScrollSpy for Navbar
function initScrollSpy() {
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".navbar-nav .nav-link-btn");
  if(!navLinks.length) return;

  window.addEventListener("scroll", () => {
    let current = "";
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      if (scrollY >= sectionTop - 200) {
        current = section.getAttribute("id");
      }
    });

    navLinks.forEach(link => {
      link.classList.remove("active");
      if (current && link.getAttribute("href").includes(current)) {
        link.classList.add("active");
      }
    });
  });
}
