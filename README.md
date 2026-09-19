# VOKAL - Voice of Kerala for Animal Legit (`vokal.org.in`)

An official web platform, digital media repository, and community legal advocacy portal for **VOKAL** (Voice of Kerala for Animal Legit), dedicated to safeguarding animal rights, defending constitutional duties under Article 51A(g), enforcing the Prevention of Cruelty to Animals (PCA) Act 1960, and advancing humane coexistence across all 14 districts of Kerala.

---

## 🌟 Key Features & Architecture

1. **Official Advocacy Web Portal (`index.html`)**
   - **Constitutional Core**: Article 51A(g) mandate, High Court and Supreme Court animal rights jurisprudence.
   - **Spiritual Masters' Preface (Interactive Carousel)**:
     - *Mata Amritanandamayi Devi (Amma)* — Reverence for Nature and divine motherly compassion.
     - *Sree Narayana Guru* — Universal *Jeevakarunyam* (Anukampa Dasakam).
     - *Prophet Muhammad* — Authentic narrations from *Sahih al-Bukhari* (2363, 6009) and *Sahih Muslim* (2244) establishing that serving any living creature is a rewarded act of charity (*Sadaqah*).
     - *Jesus Christ* — The Good Shepherd and caring for God's creation.
     - *Swami Vivekananda* — Worship of God through service to all living beings.
     - *Mahatma Gandhi* — The greatness of a nation judged by the way its animals are treated.
     - *Gautama Buddha* — Universal *Karuna* (Compassion) and *Metta* (Loving-kindness).
     - *Adi Shankaracharya* — The unified divine consciousness dwelling in all life.
   - **Events & High-Res Gallery**: Rescue drives, anti-rabies vaccination (ARV) camps, reflective glow-collar drives, and public legal rallies across Kerala.
   - **Video Showcase & Media**: Educational documentaries, Animal Birth Control (ABC) Rules 2023 explainers, and rescue footage.
   - **Letters to Government**: Memorandums submitted to the Hon'ble Chief Minister of Kerala, Kerala State Police DGP, LSGD Minister, and Animal Husbandry Department with status tracking.
   - **Citizen Grievance & Cruelty Report Desk**: Incident reporting across all 14 Kerala districts.

2. **Dedicated TV Display Mode (`tv.html`)**
   - **Optimized for Large Screens**: Custom designed for 1080p and 4K Smart TVs, conference halls, community lobbies, and public exhibitions.
   - **Ambient High-Contrast Dark UI**: Emerald and gold accents, live digital time display, and glowing indicators.
   - **Hands-Free Auto-Slide**: Cycles smoothly through featured rescue events, campaigns, master quotes, and live impact statistics every 10 seconds.
   - **Smart TV Remote & Keyboard Controls**:
     - `F`: Toggle Fullscreen mode
     - `Space`: Pause / Resume auto-slideshow
     - `←` / `→`: Manually cycle previous or next slide
     - `R`: Refresh playlist from the live server
   - **Live Metrics Counter**: Active rescues, court representations, and sterilizations tracked in real time.

3. **Admin Management Portal (`admin.html`)**
   - Direct interface to upload high-resolution event photos, add video streams, publish government representations, and triage incoming cruelty reports.
   - Zero-leak credential policy (credentials are kept private and never displayed in public footers or client UI).
   - Works seamlessly with both the MySQL backend and offline LocalStorage fallback.

4. **Production Server REST API (`api/`) & Upload Pipeline**
   - High-throughput file upload endpoint (`api/upload.php`) supporting direct server-side storage for massive photo galleries and video files.
   - Secure MIME validation, auto-generated hash filenames, and direct indexing into MySQL.
   - Full REST endpoints for events, videos, government letters, citizen inquiries, and TV playlists.

---

## 🗄️ MySQL Database Setup & Import

The database schema is located in `database/vokal_database.sql`. It is pre-seeded with verified VOKAL data, authentic spiritual quotes, Kerala government petitions, and sample events.

### Step 1: Create Database
Open phpMyAdmin, MySQL Workbench, or your terminal:
```sql
CREATE DATABASE vokal_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Step 2: Import Schema & Seed Data
- **Via phpMyAdmin**:
  1. Select `vokal_db` from the left sidebar.
  2. Click the **Import** tab in the top navigation.
  3. Browse and select `database/vokal_database.sql`.
  4. Click **Go** / **Import**.

- **Via MySQL Command Line**:
  ```bash
  mysql -u root -p vokal_db < database/vokal_database.sql
  ```

### Database Tables Breakdown
| Table | Description |
|---|---|
| `admin_users` | Administrator authentication table with role management |
| `events_photos` | High-res gallery photos, rescue drives, dates, and locations |
| `videos` | YouTube, Vimeo, and self-hosted MP4 documentary videos |
| `letters_govt` | Official memorandums submitted to Kerala Ministers and Police DGP |
| `citizen_inquiries` | Incoming cruelty complaints and volunteer signups across 14 districts |
| `tv_display_slides` | Custom playlist items, titles, badges, and background media for TV display |
| `site_settings` | Dynamic site configuration (helpline numbers, organization email, etc.) |

---

## 🌐 Server Configuration & Large File Uploads

When managing high-resolution photos and video files on your server, configure your server's upload and memory limits:

### 1. Database Connection (`api/config.php`)
Set your MySQL credentials via environment variables or edit `api/config.php`:
```php
$db_host = getenv('DB_HOST') ?: 'localhost';
$db_name = getenv('DB_NAME') ?: 'vokal_db';
$db_user = getenv('DB_USER') ?: 'root';
$db_pass = getenv('DB_PASS') ?: '';
```

### 2. Directory Permissions (`uploads/`)
Ensure the web server (Apache/Nginx/PHP-FPM) has write permissions to the upload directories:
```bash
chmod -R 755 uploads/
# On Ubuntu/Debian Apache:
# chown -R www-data:www-data uploads/
```

The upload directories are structured as:
```
uploads/
├── photos/     # High-resolution JPEG/PNG/WebP photos (up to 25MB each)
├── documents/  # Official government PDFs and memorandums (up to 50MB each)
└── videos/     # Self-hosted MP4/WebM videos (up to 200MB each)
```

### 3. PHP Settings for Heavy Media (`php.ini`)
For uploading large volumes of photos and videos, update your server's `php.ini` or `.htaccess`:
```ini
upload_max_filesize = 250M
post_max_size = 260M
memory_limit = 512M
max_execution_time = 300
max_input_time = 300
```

---

## 📺 How to Run TV Display Mode

1. **On a Smart TV / Android TV**:
   - Open the TV's web browser (e.g., Google Chrome, Silk Browser on FireStick, or Puffin TV).
   - Navigate to:
     ```
     http://your-server-ip/vokal-website/tv.html
     # Or on your public domain:
     https://vokal.org.in/tv.html
     ```
   - Press the Fullscreen button or press `F` on an attached keyboard/air-mouse.

2. **On a Dedicated Display (Raspberry Pi / Mini PC via HDMI)**:
   - Run Chrome or Edge in kiosk mode on startup:
     ```bash
     google-chrome --kiosk --disable-translate --start-fullscreen "https://vokal.org.in/tv.html"
     ```
   - The TV interface will run continuously, automatically cycling through news, photos, quotes, and impact numbers every 10 seconds.

---

## 🚀 Running Locally for Development

1. **Using Built-in PHP Server (with MySQL enabled)**:
   ```bash
   cd vokal-website
   php -S localhost:8000
   ```
   Open `http://localhost:8000` in your browser.

2. **Using XAMPP / WAMP / MAMP**:
   - Copy the `vokal-website` folder into `htdocs/` (or `www/`).
   - Start Apache and MySQL in the XAMPP Control Panel.
   - Import `database/vokal_database.sql` via `http://localhost/phpmyadmin`.
   - Access the site at `http://localhost/vokal-website/`.

---

## 📁 Repository Structure

```
vokal-website/
├── index.html              # Main public portal
├── admin.html              # Secure admin content management portal
├── tv.html                 # 1080p/4K fullscreen Smart TV signage interface
├── README.md               # Documentation & deployment instructions
├── .gitignore              # Git ignore rules for media and local configs
├── api/                    # Server-side PHP REST API & file handlers
│   ├── config.php          # Database PDO connection & CORS headers
│   ├── upload.php          # Large file & photo upload processor
│   ├── events.php          # Events and photo gallery CRUD API
│   ├── videos.php          # Video resources and embed API
│   ├── letters.php         # Government representations CRUD API
│   ├── inquiries.php       # Cruelty report submission API
│   └── tv.php              # TV signage playlist & live stats API
├── database/
│   └── vokal_database.sql  # Complete MySQL database schema & seed data
├── uploads/                # User & admin media storage
│   ├── photos/             # Stored photo files
│   ├── documents/          # Stored PDF representations
│   └── videos/             # Stored MP4 video clips
├── css/
│   └── style.css           # Responsive styling & themes
├── js/
│   ├── data.js             # Seed data for offline & static operation
│   ├── storage.js          # Client-side storage and API sync engine
│   └── main.js             # UI animations, slider, lightbox, and modals
└── assets/
    ├── masters/            # Spiritual Master portraits
    ├── letters/            # Official representation text sources
    └── *.png / *.jpg       # Official logos, emblem, letterhead graphics
```

---

## ⚖️ Legal Framework

- **Constitution of India**: Article 51A(g) — *"It shall be the duty of every citizen of India to protect and improve the natural environment including forests, lakes, rivers and wild life, and to have compassion for living creatures."*
- **Statutory Law**: Prevention of Cruelty to Animals (PCA) Act, 1960.
- **Rules & Orders**: Animal Birth Control (Dogs) Rules, 2023 & Hon'ble High Court of Kerala directives.

---

## 🤝 Contribution & Maintenance

- **Lead Organization**: VOKAL (Voice of Kerala for Animal Legit)
- **State Coverage**: All 14 Districts of Kerala
- **Contact & Helpline**: Animal Cruelty & Legal Redressal Desk, Kerala
