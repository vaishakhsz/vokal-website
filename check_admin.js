
    document.addEventListener("DOMContentLoaded", function () {
      const overlay = document.getElementById("adminAuthOverlay");
      const loginForm = document.getElementById("adminStandaloneLoginForm");
      const loginError = document.getElementById("adminAuthError");

      function evaluateAuth() {
        if (isAdminLoggedIn()) {
          if (overlay) overlay.classList.add("d-none");
          loadAdminDashboard();
        } else {
          if (overlay) overlay.classList.remove("d-none");
        }
      }

      if (loginForm) {
        loginForm.addEventListener("submit", function (e) {
          e.preventDefault();
          const u = document.getElementById("standaloneUser").value.trim();
          const p = document.getElementById("standalonePass").value.trim();

          if (u === "admin" && p === "admin123") {
            sessionStorage.setItem("vokal_admin_auth", "true");
            if (loginError) loginError.classList.add("d-none");
            loginForm.reset();
            evaluateAuth();
            showToast("Welcome Administrator! Signed in successfully.", "success");
          } else {
            if (loginError) {
              loginError.textContent = "Invalid username or password. Please try again.";
              loginError.classList.remove("d-none");
            }
            showToast("Invalid administrative credentials.", "danger");
          }
        });
      }

      evaluateAuth();
    });

    function logOffAdmin() {
      if (confirm("Are you sure you want to log off from the Admin Hub?")) {
        sessionStorage.removeItem("vokal_admin_auth");
        window.location.reload();
      }
    }

    function loadAdminDashboard() {
      try {
        renderAdminPhotos();
        renderAdminLetters();
        renderAdminVideos();
        renderAdminInquiries();
        updateAdminCounts();
        updateFolderDropdowns();
      } catch (err) {
        alert("Dashboard Load Error: " + err.message + "\nStack: " + err.stack);
      }
    }

    function updateAdminCounts() {
      const photos = window.vokalStorage.getEvents();
      const letters = window.vokalStorage.getLetters();
      const videos = window.vokalStorage.getVideos();
      const inquiries = window.vokalStorage.getInquiries();

      document.getElementById("adminTotalPhotos").textContent = photos.length;
      document.getElementById("adminTotalLetters").textContent = letters.length;
      document.getElementById("adminTotalVideos").textContent = videos.length;
      document.getElementById("adminTotalInquiries").textContent = inquiries.length;
      document.getElementById("inquiryCountBadge").textContent = inquiries.length;
    }

    function renderAdminFolders() {
      const tbody = document.getElementById("adminFoldersTableBody");
      if (!tbody) return;
      const folders = window.vokalStorage.getFolders();
      tbody.innerHTML = "";

      if (folders.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted py-4">No folders created yet.</td></tr>`;
        return;
      }

      folders.forEach(f => {
        const tr = document.createElement("tr");
        tr.id = `folder-row-${f.id}`;
        tr.innerHTML = `
          <td class="fw-bold"><i class="bi bi-folder-fill text-warning me-2"></i>${f.name}</td>
          <td><span class="badge bg-secondary text-uppercase">${f.type}</span></td>
          <td>${f.created_at}</td>
          <td>
            <div class="d-flex gap-1">
              <button class="btn btn-outline-primary btn-sm" title="Edit" onclick="showEditFolderModal('${f.id}')">
                <i class="bi bi-pencil-fill"></i>
              </button>
              <button class="btn btn-outline-danger btn-sm" title="Delete" onclick="adminDeleteFolder('${f.id}')">
                <i class="bi bi-trash3"></i>
              </button>
            </div>
          </td>
        `;
        tbody.appendChild(tr);
      });
    }

    async function adminDeleteFolder(id) {
      if (!confirm("Permanently delete this folder AND ALL items inside it? This cannot be undone.")) return;
      try {
        await window.vokalStorage.deleteFolder(id);
        loadAdminDashboard();
        showToast("Folder deleted successfully.", "success");
      } catch (err) {
        showToast("Delete failed: " + err.message, "danger");
      }
    }

    function showAdminFolderModal() {
      // Create modal if not exists
      let modalEl = document.getElementById("editFolderModal");
      if (!modalEl) {
        modalEl = document.createElement("div");
        modalEl.className = "modal fade";
        modalEl.id = "editFolderModal";
        modalEl.tabIndex = -1;
        modalEl.innerHTML = `
          <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content border-0 rounded-4 shadow-lg">
              <div class="modal-header bg-warning">
                <h5 class="modal-title fw-bold"><i class="bi bi-folder-plus me-2"></i>Manage Folder</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
              </div>
              <div class="modal-body p-4">
                <input type="hidden" id="editFolderId">
                <div class="mb-3">
                  <label class="form-label fw-bold small">Folder Name (e.g. Date)</label>
                  <input type="text" id="editFolderName" class="form-control" required>
                </div>
                <div class="mb-3">
                  <label class="form-label fw-bold small">Content Type</label>
                  <select id="editFolderType" class="form-select">
                    <option value="event">Photos / Events</option>
                    <option value="video">Videos</option>
                    <option value="letter">Govt Letters</option>
                  </select>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                <button type="button" class="btn btn-warning fw-bold" onclick="saveAdminFolder()">
                  <i class="bi bi-check-circle me-1"></i> Save Folder
                </button>
              </div>
            </div>
          </div>
        `;
        document.body.appendChild(modalEl);
      }

      document.getElementById("editFolderId").value = "";
      
      // Auto-populate current date like "23 Sep 2026"
      const now = new Date();
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const dateString = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
      document.getElementById("editFolderName").value = dateString;
      
      document.getElementById("editFolderType").value = "event";

      new bootstrap.Modal(modalEl).show();
    }

    function showEditFolderModal(id) {
      const folders = window.vokalStorage.getFolders();
      const f = folders.find(x => String(x.id) === String(id));
      if (!f) return;
      showAdminFolderModal();
      document.getElementById("editFolderId").value = f.id;
      document.getElementById("editFolderName").value = f.name;
      document.getElementById("editFolderType").value = f.type;
    }

    async function saveAdminFolder() {
      const id = document.getElementById("editFolderId").value;
      const name = document.getElementById("editFolderName").value.trim();
      const type = document.getElementById("editFolderType").value;
      
      if (!name) { showToast("Folder name is required.", "warning"); return; }

      try {
        if (id) {
          await window.vokalStorage.editFolder(id, name, type);
          showToast("Folder updated successfully!", "success");
        } else {
          await window.vokalStorage.addFolder(name, type);
          showToast("Folder created successfully!", "success");
        }
        bootstrap.Modal.getInstance(document.getElementById("editFolderModal"))?.hide();
        loadAdminDashboard();
      } catch (e) {
        showToast("Error: " + e.message, "danger");
      }
    }

    function updateFolderDropdowns() {
      const folders = window.vokalStorage.getFolders();
      
      const photoFolders = folders.filter(f => f.type === 'event');
      const photoOptions = photoFolders.length > 0 ? photoFolders.map(f => `<option value="${f.name}">${f.name}</option>`).join('') : '<option value="General">General</option>';
      if (document.getElementById("photoCategory")) document.getElementById("photoCategory").innerHTML = photoOptions;
      if (document.getElementById("editPhotoCategory")) document.getElementById("editPhotoCategory").innerHTML = photoOptions;

      const videoFolders = folders.filter(f => f.type === 'video');
      const videoOptions = videoFolders.length > 0 ? videoFolders.map(f => `<option value="${f.name}">${f.name}</option>`).join('') : '<option value="General">General</option>';
      if (document.getElementById("videoCategory")) document.getElementById("videoCategory").innerHTML = videoOptions;

      const letterFolders = folders.filter(f => f.type === 'letter');
      const letterOptions = letterFolders.length > 0 ? letterFolders.map(f => `<option value="${f.name}">${f.name}</option>`).join('') : '<option value="General">General</option>';
      if (document.getElementById("letterDept")) document.getElementById("letterDept").innerHTML = letterOptions;
    }

    function renderAdminPhotos() {
      const grid = document.getElementById("adminPhotosGrid");
      if (!grid) return;
      const photos = window.vokalStorage.getEvents();
      const folders = window.vokalStorage.getFolders().filter(f => f.type === 'event');
      grid.innerHTML = "";

      if (folders.length === 0 && photos.length === 0) {
        grid.innerHTML = `<div class="col-12 text-center text-muted py-4">No event photos in database. Click Create Folder to start.</div>`;
        return;
      }

      const grouped = {};
      folders.forEach(f => { grouped[f.name] = []; });
      photos.forEach(p => {
        const cat = p.category || "General";
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(p);
      });

      Object.entries(grouped).forEach(([folderName, items]) => {
        const col = document.createElement("div");
        col.className = "col-md-6 col-lg-4";
        col.innerHTML = `
          <div class="card border-0 shadow-sm rounded-4 h-100 folder-card-ui" onclick="openAdminFolder('${folderName}', 'photo')" style="cursor: pointer;">
            <div class="card-body p-4 text-center">
              <i class="bi bi-folder-fill display-4 text-primary mb-3 d-block"></i>
              <h5 class="fw-bold mb-1">${folderName}</h5>
              <span class="badge bg-light text-dark border">${items.length} Photos</span>
            </div>
          </div>
        `;
        grid.appendChild(col);
      });
    }

    function renderAdminLetters() {
      const grid = document.getElementById("adminLettersGrid");
      if (!grid) return;
      const letters = window.vokalStorage.getLetters();
      const folders = window.vokalStorage.getFolders().filter(f => f.type === 'letter');
      grid.innerHTML = "";

      if (folders.length === 0 && letters.length === 0) {
        grid.innerHTML = `<div class="col-12 text-center text-muted py-4">No letters in database. Click Create Folder to start.</div>`;
        return;
      }

      const grouped = {};
      folders.forEach(f => { grouped[f.name] = []; });
      letters.forEach(l => {
        const cat = l.department || "General";
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(l);
      });

      Object.entries(grouped).forEach(([folderName, items]) => {
        const col = document.createElement("div");
        col.className = "col-md-6 col-lg-4";
        col.innerHTML = `
          <div class="card border-0 shadow-sm rounded-4 h-100 folder-card-ui" onclick="openAdminFolder('${folderName}', 'letter')" style="cursor: pointer;">
            <div class="card-body p-4 text-center">
              <i class="bi bi-folder-fill display-4 text-success mb-3 d-block"></i>
              <h5 class="fw-bold mb-1">${folderName}</h5>
              <span class="badge bg-light text-dark border">${items.length} Letters</span>
            </div>
          </div>
        `;
        grid.appendChild(col);
      });
    }

    function renderAdminVideos() {
      const grid = document.getElementById("adminVideosGrid");
      if (!grid) return;
      const videos = window.vokalStorage.getVideos();
      const folders = window.vokalStorage.getFolders().filter(f => f.type === 'video');
      grid.innerHTML = "";

      if (folders.length === 0 && videos.length === 0) {
        grid.innerHTML = `<div class="col-12 text-center text-muted py-4">No videos in database. Click Create Folder to start.</div>`;
        return;
      }

      const grouped = {};
      folders.forEach(f => { grouped[f.name] = []; });
      videos.forEach(v => {
        const cat = v.category || "General";
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(v);
      });

      Object.entries(grouped).forEach(([folderName, items]) => {
        const col = document.createElement("div");
        col.className = "col-md-6 col-lg-4";
        col.innerHTML = `
          <div class="card border-0 shadow-sm rounded-4 h-100 folder-card-ui" onclick="openAdminFolder('${folderName}', 'video')" style="cursor: pointer;">
            <div class="card-body p-4 text-center">
              <i class="bi bi-folder-fill display-4 text-danger mb-3 d-block"></i>
              <h5 class="fw-bold mb-1">${folderName}</h5>
              <span class="badge bg-light text-dark border">${items.length} Videos</span>
            </div>
          </div>
        `;
        grid.appendChild(col);
      });
    }

    // Modal to view folder contents and upload directly
    function openAdminFolder(folderName, type) {
      let items = [];
      let html = '';
      let titleIcon = '';
      let btnLabel = '';

      if (type === 'photo') {
        items = window.vokalStorage.getEvents().filter(x => (x.category || 'General') === folderName);
        titleIcon = 'bi-images text-primary';
        btnLabel = 'Upload Photo';
        html = items.map(p => `
          <div class="d-flex align-items-center gap-3 p-3 border-bottom">
            <img src="${p.image}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;">
            <div class="flex-grow-1">
              <h6 class="fw-bold mb-1">${p.title}</h6>
              <small class="text-muted">${p.date} • ${p.location}</small>
            </div>
            <div class="d-flex gap-1">
              <button class="btn btn-outline-primary btn-sm" onclick="bootstrap.Modal.getInstance(document.getElementById('adminFolderItemsModal'))?.hide(); showEditPhotoModal('${p.id}');"><i class="bi bi-pencil-fill"></i></button>
              <button class="btn btn-outline-danger btn-sm" onclick="adminDeleteEvent('${p.id}');"><i class="bi bi-trash3"></i></button>
            </div>
          </div>
        `).join('');
      } else if (type === 'letter') {
        items = window.vokalStorage.getLetters().filter(x => (x.department || 'General') === folderName);
        titleIcon = 'bi-file-earmark-text-fill text-success';
        btnLabel = 'Upload Letter';
        html = items.map(l => `
          <div class="d-flex align-items-center gap-3 p-3 border-bottom">
            <div class="fs-1 text-success"><i class="bi bi-file-pdf-fill"></i></div>
            <div class="flex-grow-1">
              <h6 class="fw-bold mb-1">${l.subject}</h6>
              <small class="text-muted">Ref: ${l.refNo} • ${l.date}</small>
            </div>
            <button class="btn btn-outline-danger btn-sm" onclick="adminDeleteLetter('${l.id}'); this.parentElement.remove();"><i class="bi bi-trash3"></i></button>
          </div>
        `).join('');
      } else if (type === 'video') {
        items = window.vokalStorage.getVideos().filter(x => (x.category || 'General') === folderName);
        titleIcon = 'bi-youtube text-danger';
        btnLabel = 'Add Video';
        html = items.map(v => `
          <div class="d-flex align-items-center gap-3 p-3 border-bottom">
            <img src="${v.thumbnail}" style="width: 80px; height: 60px; object-fit: cover; border-radius: 8px;">
            <div class="flex-grow-1">
              <h6 class="fw-bold mb-1">${v.title}</h6>
              <small class="text-muted">${v.duration}</small>
            </div>
            <button class="btn btn-outline-danger btn-sm" onclick="adminDeleteVideo('${v.id}'); this.parentElement.remove();"><i class="bi bi-trash3"></i></button>
          </div>
        `).join('');
      }

      if (items.length === 0) {
        html = `<div class="text-center py-5 text-muted">Folder is empty. Click below to add.</div>`;
      }

      let modalEl = document.getElementById("adminFolderItemsModal");
      if (!modalEl) {
        modalEl = document.createElement("div");
        modalEl.className = "modal fade";
        modalEl.id = "adminFolderItemsModal";
        modalEl.tabIndex = -1;
        document.body.appendChild(modalEl);
      }
      
      modalEl.innerHTML = `
        <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
          <div class="modal-content border-0 rounded-4 shadow-lg">
            <div class="modal-header bg-light">
              <h5 class="modal-title fw-bold"><i class="bi ${titleIcon} me-2"></i>${folderName}</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body p-0">
              ${html}
            </div>
            <div class="modal-footer bg-light">
              <button class="btn btn-vokal-primary w-100 fw-bold" onclick="uploadDirectlyToFolder('${folderName}', '${type}')">
                <i class="bi bi-plus-lg me-1"></i> ${btnLabel}
              </button>
            </div>
          </div>
        </div>
      `;

      new bootstrap.Modal(modalEl).show();
    }

    function uploadDirectlyToFolder(folderName, type) {
      bootstrap.Modal.getInstance(document.getElementById("adminFolderItemsModal"))?.hide();
      showAdminUploadModal(type);
      
      setTimeout(() => {
        if (type === 'photo') document.getElementById("photoCategory").value = folderName;
        if (type === 'letter') document.getElementById("letterDept").value = folderName;
        if (type === 'video') document.getElementById("videoCategory").value = folderName;
      }, 300);
    }

    function showEditPhotoModal(id) {
      const photos = window.vokalStorage.getEvents();
      const p = photos.find(x => x.id === id);
      if (!p) return;

      // Build edit modal dynamically
      let modalEl = document.getElementById("editPhotoModal");
      if (!modalEl) {
        modalEl = document.createElement("div");
        modalEl.className = "modal fade";
        modalEl.id = "editPhotoModal";
        modalEl.tabIndex = -1;
        modalEl.innerHTML = `
          <div class="modal-dialog modal-lg modal-dialog-centered">
            <div class="modal-content border-0 rounded-4 shadow-lg">
              <div class="modal-header" style="background: linear-gradient(135deg,#ff4081,#c2185b);">
                <h5 class="modal-title text-white fw-bold"><i class="bi bi-pencil-fill me-2"></i>Edit Event Photo</h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
              </div>
              <div class="modal-body p-4">
                <input type="hidden" id="editPhotoId">
                <div class="row g-3">
                  <div class="col-12 text-center">
                    <img id="editPhotoPreview" src="" class="img-fluid rounded-3 mb-2" style="max-height:160px; object-fit:cover;">
                  </div>
                  <div class="col-md-8">
                    <label class="form-label fw-bold small">Title *</label>
                    <input type="text" id="editPhotoTitle" class="form-control" required>
                  </div>
                  <div class="col-md-4">
                    <label class="form-label fw-bold small">Folder *</label>
                    <select id="editPhotoCategory" class="form-select">
                      <!-- Dynamically populated -->
                    </select>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-bold small">Location</label>
                    <input type="text" id="editPhotoLocation" class="form-control">
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-bold small">Date</label>
                    <input type="text" id="editPhotoDate" class="form-control" placeholder="e.g. August 28, 2026">
                  </div>
                  <div class="col-12">
                    <label class="form-label fw-bold small">Description</label>
                    <textarea id="editPhotoDesc" class="form-control" rows="3"></textarea>
                  </div>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                <button type="button" class="btn btn-vokal-primary fw-bold" onclick="saveEditedPhoto()">
                  <i class="bi bi-check-circle me-1"></i> Save Changes
                </button>
              </div>
            </div>
          </div>
        `;
        document.body.appendChild(modalEl);
      }

      document.getElementById("editPhotoId").value = p.id;
      document.getElementById("editPhotoTitle").value = p.title;
      // Populate folders in edit photo modal dynamically
      updateFolderDropdowns();
      
      setTimeout(() => {
        document.getElementById("editPhotoCategory").value = p.category;
      }, 100);

      document.getElementById("editPhotoLocation").value = p.location;
      document.getElementById("editPhotoDate").value = p.date;
      document.getElementById("editPhotoDesc").value = p.description;
      document.getElementById("editPhotoPreview").src = p.image;

      new bootstrap.Modal(modalEl).show();
    }

    async function saveEditedPhoto() {
      const id = document.getElementById("editPhotoId").value;
      const updated = {
        title: document.getElementById("editPhotoTitle").value.trim(),
        category: document.getElementById("editPhotoCategory").value,
        location: document.getElementById("editPhotoLocation").value.trim(),
        date: document.getElementById("editPhotoDate").value.trim(),
        description: document.getElementById("editPhotoDesc").value.trim()
      };
      if (!updated.title) { showToast("Title is required.", "warning"); return; }

      try {
        const photos = window.vokalStorage.getEvents();
        const existing = photos.find(p => p.id === id);
        if (!existing) { showToast("Photo not found.", "danger"); return; }

        const res = await fetch(\`api/events.php?api_key=\${encodeURIComponent(VOKAL_API_KEY)}\`, {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify({
            event_uid: id,
            title: updated.title,
            category: updated.category,
            date: updated.date,
            location: updated.location,
            description: updated.description,
            image: existing.image,
            show_on_tv: 1
          })
        });
        const json = await res.json();
        if (json.success) {
          const idx = photos.findIndex(p => p.id === id);
          if (idx !== -1) {
            photos[idx] = { ...photos[idx], ...updated };
            localStorage.setItem("vokal_events_data", JSON.stringify(photos));
          }
          bootstrap.Modal.getInstance(document.getElementById("editPhotoModal"))?.hide();
          loadAdminDashboard();
          showToast("Photo updated successfully!", "success");
        } else {
          showToast("Update failed: " + (json.error || "Unknown error"), "danger");
        }
      } catch (e) {
        showToast("Update failed: " + e.message, "danger");
      }
    }

    async function adminDeleteEvent(id) {
      if (!confirm("Permanently delete this photo from the database?")) return;
      try {
        await window.vokalStorage.deleteEvent(id);
        loadAdminDashboard();
        showToast("Photo deleted from database successfully.", "success");
        bootstrap.Modal.getInstance(document.getElementById("adminFolderItemsModal"))?.hide();
      } catch (err) {
        showToast("Delete failed: " + err.message, "danger");
      }
    }

    async function adminDeleteLetter(id) {
      if (!confirm("Permanently delete this letter representation from the database?")) return;
      try {
        await window.vokalStorage.deleteLetter(id);
        loadAdminDashboard();
        showToast("Letter deleted from database successfully.", "success");
        bootstrap.Modal.getInstance(document.getElementById("adminFolderItemsModal"))?.hide();
      } catch (err) {
        showToast("Delete failed: " + err.message, "danger");
      }
    }

    async function adminDeleteVideo(id) {
      if (!confirm("Permanently delete this video link from the database?")) return;
      try {
        await window.vokalStorage.deleteVideo(id);
        loadAdminDashboard();
        showToast("Video link deleted from database successfully.", "success");
        bootstrap.Modal.getInstance(document.getElementById("adminFolderItemsModal"))?.hide();
      } catch (err) {
        showToast("Delete failed: " + err.message, "danger");
      }
    }

    function renderAdminInquiries() {
      const grid = document.getElementById("adminInquiriesGrid");
      if (!grid) return;
      const inquiries = window.vokalStorage.getInquiries();
      grid.innerHTML = "";

      if (inquiries.length === 0) {
        grid.innerHTML = `<div class="col-12 text-center text-muted py-4">No reports received yet.</div>`;
        return;
      }

      // Group inquiries by Date automatically
      const grouped = {};
      inquiries.forEach(i => {
        const dateStr = new Date(i.submittedAt).toLocaleDateString();
        if (!grouped[dateStr]) grouped[dateStr] = [];
        grouped[dateStr].push(i);
      });

      Object.entries(grouped).forEach(([dateStr, items]) => {
        const col = document.createElement("div");
        col.className = "col-md-6 col-lg-4";
        col.innerHTML = `
          <div class="card border-0 shadow-sm rounded-4 h-100 folder-card-ui" onclick="openInquiriesFolder('${dateStr}')" style="cursor: pointer;">
            <div class="card-body p-4 text-center">
              <i class="bi bi-folder-fill display-4 text-danger mb-3 d-block"></i>
              <h5 class="fw-bold mb-1">${dateStr}</h5>
              <span class="badge bg-light text-dark border">${items.length} Inquiries</span>
            </div>
          </div>
        `;
        grid.appendChild(col);
      });
    }

    function openInquiriesFolder(dateStr) {
      const inquiries = window.vokalStorage.getInquiries();
      const items = inquiries.filter(i => new Date(i.submittedAt).toLocaleDateString() === dateStr);
      
      let modalEl = document.getElementById("viewInquiriesModal");
      if (!modalEl) {
        modalEl = document.createElement("div");
        modalEl.className = "modal fade";
        modalEl.id = "viewInquiriesModal";
        modalEl.tabIndex = -1;
        modalEl.innerHTML = `
          <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div class="modal-content border-0 rounded-4 shadow-lg">
              <div class="modal-header bg-danger">
                <h5 class="modal-title fw-bold text-white"><i class="bi bi-folder2-open me-2"></i>Inquiries: <span id="inqModalDate"></span></h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
              </div>
              <div class="modal-body p-4 bg-light" id="inqModalBody">
              </div>
            </div>
          </div>
        `;
        document.body.appendChild(modalEl);
      }

      document.getElementById("inqModalDate").textContent = dateStr;
      
      const body = document.getElementById("inqModalBody");
      body.innerHTML = items.map(i => `
        <div class="card border-0 shadow-sm mb-3">
          <div class="card-body">
            <div class="d-flex justify-content-between mb-2">
              <span class="badge bg-danger">${i.type}</span>
              <span class="badge bg-light text-dark border">${i.district}</span>
            </div>
            <h6 class="fw-bold mb-1">${i.name}</h6>
            <a href="mailto:${i.email || 'voiceofkerala.legit@gmail.com'}" class="text-success small mb-3 d-block">${i.email || 'No email provided'}</a>
            <p class="mb-0 text-muted small bg-white p-3 rounded border">${i.message}</p>
          </div>
        </div>
      `).join('');

      new bootstrap.Modal(modalEl).show();
    }

    function showAdminUploadModal(tab) {
      const modalEl = document.getElementById("uploadContentModal");
      if (modalEl) {
        const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
        modal.show();
        if (tab === 'photo') document.getElementById('tab-photo-btn')?.click();
        if (tab === 'letter') document.getElementById('tab-letter-btn')?.click();
        if (tab === 'video') document.getElementById('tab-video-btn')?.click();
      }
    }

    // Photo Upload Handler
    const photoForm = document.getElementById("formUploadPhoto");
    if (photoForm) {
      const photoFile = document.getElementById("photoFileInput");
      const photoPreview = document.getElementById("photoPreview");
      let photoData = "";

      photoFile?.addEventListener("change", function () {
        const file = this.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = e => {
            photoData = e.target.result;
            if (photoPreview) {
              photoPreview.src = photoData;
              photoPreview.classList.remove("d-none");
            }
          };
          reader.readAsDataURL(file);
        }
      });

      photoForm.addEventListener("submit", async function (e) {
        e.preventDefault();
        const submitBtn = photoForm.querySelector("button[type='submit']");
        const origText = submitBtn ? submitBtn.innerHTML : "";
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Saving to Database...';
        }

        try {
          const title = document.getElementById("photoTitle").value.trim();
          const category = document.getElementById("photoCategory").value;
          const location = document.getElementById("photoLocation").value.trim();
          const date = document.getElementById("photoDate").value || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
          const description = document.getElementById("photoDesc").value.trim();
          const urlInput = document.getElementById("photoUrlInput")?.value.trim();
          const finalImg = photoData || urlInput || "assets/vokal_brand_header.png";
          const fileObj = photoFile?.files?.[0] || null;

          await window.vokalStorage.addEvent({
            title, category, location, date, description, image: finalImg
          }, fileObj);

          photoForm.reset();
          photoData = "";
          photoPreview?.classList.add("d-none");
          bootstrap.Modal.getInstance(document.getElementById("uploadContentModal"))?.hide();
          loadAdminDashboard();
          showToast("Photo uploaded and saved to MySQL database successfully!", "success");
        } catch (err) {
          console.error("Photo upload error:", err);
          showToast("Upload failed: " + err.message, "danger");
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = origText;
          }
        }
      });
    }

    // Letter Upload Handler
    const letterForm = document.getElementById("formUploadLetter");
    if (letterForm) {
      letterForm.addEventListener("submit", async function (e) {
        e.preventDefault();
        const submitBtn = letterForm.querySelector("button[type='submit']");
        const origText = submitBtn ? submitBtn.innerHTML : "";
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Saving to Database...';
        }

        try {
          const subject = document.getElementById("letterSubject").value.trim();
          const refNo = document.getElementById("letterRefNo").value.trim();
          const recipient = document.getElementById("letterRecipient").value.trim();
          const department = document.getElementById("letterDept").value.trim();
          const status = document.getElementById("letterStatus").value;
          const date = document.getElementById("letterDate").value || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
          const summary = document.getElementById("letterSummary").value.trim();
          const demands = document.getElementById("letterDemands").value.trim();
          const letterFile = document.getElementById("letterFileInput")?.files?.[0] || null;

          await window.vokalStorage.addLetter({
            subject, refNo, recipient, department, status, date, summary, keyDemands: demands
          }, letterFile);

          letterForm.reset();
          bootstrap.Modal.getInstance(document.getElementById("uploadContentModal"))?.hide();
          loadAdminDashboard();
          showToast("Official letter representation published and saved to MySQL!", "success");
        } catch (err) {
          console.error("Letter upload error:", err);
          showToast("Upload failed: " + err.message, "danger");
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = origText;
          }
        }
      });
    }

    // Video Upload Handler
    const videoForm = document.getElementById("formUploadVideo");
    if (videoForm) {
      videoForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const title = document.getElementById("videoTitle").value.trim();
        const videoUrl = document.getElementById("videoUrl").value.trim();
        const category = document.getElementById("videoCategory").value;
        const duration = document.getElementById("videoDuration").value.trim() || "10:00";
        const description = document.getElementById("videoDesc").value.trim();

        window.vokalStorage.addVideo({
          title, videoUrl, category, duration, description
        });

        videoForm.reset();
        bootstrap.Modal.getInstance(document.getElementById("uploadContentModal"))?.hide();
        loadAdminDashboard();
        showToast("Video documentation added and saved to MySQL!", "success");
      });
    }

    // Backup & Export
    function exportDataBackup() {
      const data = window.vokalStorage.exportAllData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `vokal_database_backup_${new Date().toISOString().slice(0,10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast("Database exported successfully!", "success");
    }

    function importDataBackup() {
      const fileInput = document.getElementById("backupFileInput");
      if (!fileInput.files[0]) {
        alert("Please select a valid JSON backup file first.");
        return;
      }
      const reader = new FileReader();
      reader.onload = function (e) {
        try {
          const parsed = JSON.parse(e.target.result);
          window.vokalStorage.importData(parsed);
          loadAdminDashboard();
          showToast("Data backup successfully restored!", "success");
        } catch (err) {
          alert("Invalid backup file: " + err.message);
        }
      };
      reader.readAsText(fileInput.files[0]);
    }

    function resetDefaults() {
      if (confirm("Reset everything to official defaults? This will erase custom user additions.")) {
        window.vokalStorage.resetToDefaults();
        loadAdminDashboard();
        showToast("Reset to official default data completed", "info");
      }
    }
  
