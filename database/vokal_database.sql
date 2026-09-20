-- =====================================================================
-- VOKAL (Voice of Kerala for Animal Legit) - Official MySQL Database
-- Domain: vokal.org.in | Legal Registration: Reg. No: 147/2026
-- Compatible with cPanel, phpMyAdmin, MySQL 5.7+, MySQL 8.0+, MariaDB
-- =====================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- ---------------------------------------------------------------------
-- 1. TABLE: admin_users (Authorized Content Administrators)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `admin_users`;
CREATE TABLE `admin_users` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(64) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `full_name` VARCHAR(128) NOT NULL DEFAULT 'VOKAL Administrator',
  `email` VARCHAR(128) NOT NULL DEFAULT 'voiceofkerala.legit@gmail.com',
  `role` ENUM('superadmin', 'editor', 'moderator') NOT NULL DEFAULT 'editor',
  `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  `last_login` DATETIME NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Default Admin Account: username: admin | password: admin123
INSERT INTO `admin_users` (`username`, `password_hash`, `full_name`, `email`, `role`, `status`)
VALUES ('admin', '$2y$10$TKh8H1.PfQx37YgCzwiKb.KjNyWgaHb9cbcoQgdIVFlYg7B77UdFm', 'VOKAL Chief Admin', 'voiceofkerala.legit@gmail.com', 'superadmin', 'active')
ON DUPLICATE KEY UPDATE `username`=`username`;

-- ---------------------------------------------------------------------
-- 2. TABLE: events_photos (Gallery of Rescues, Medical Camps, Drives)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `events_photos`;
CREATE TABLE `events_photos` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `event_uid` VARCHAR(64) NOT NULL UNIQUE,
  `title` VARCHAR(255) NOT NULL,
  `category` VARCHAR(64) NOT NULL DEFAULT 'Community Care',
  `event_date` VARCHAR(64) NOT NULL,
  `location` VARCHAR(128) NOT NULL,
  `description` TEXT NULL,
  `image_url` VARCHAR(512) NOT NULL,
  `thumbnail_url` VARCHAR(512) NULL,
  `file_path` VARCHAR(512) NULL,
  `file_size_bytes` BIGINT UNSIGNED NULL,
  `is_featured` TINYINT(1) NOT NULL DEFAULT 0,
  `show_on_tv` TINYINT(1) NOT NULL DEFAULT 1,
  `is_user_uploaded` TINYINT(1) NOT NULL DEFAULT 0,
  `uploaded_by` INT UNSIGNED NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_category` (`category`),
  INDEX `idx_show_tv` (`show_on_tv`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `events_photos` (`event_uid`, `title`, `category`, `event_date`, `location`, `description`, `image_url`, `is_featured`, `show_on_tv`, `is_user_uploaded`) VALUES
('evt-01', 'Mega Anti-Rabies Vaccination & Glow Collar Drive', 'Vaccination & Care', 'August 28, 2026', 'Ernakulam North & Marine Drive, Kochi', 'Vaccinated over 320 community dogs and fitted reflective safety collars to prevent nighttime vehicular road accidents. Conducted with certified volunteer veterinarians.', 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=1000&q=80', 1, 1, 0),
('evt-02', 'High Court Legal Workshop for Animal Feeder Protection', 'Legal & Advocacy', 'August 14, 2026', 'High Court Advocates Association Hall, Kochi', 'Educated 150+ street dog caretakers and residential community feeders on Article 51A(g), Animal Birth Control 2023 Rules, and Kerala High Court interim directives.', 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=1000&q=80', 1, 1, 0),
('evt-03', 'Emergency Flood Rescue Operation: Stray Animals', 'Emergency Rescue', 'July 22, 2026', 'Kuttanad & Alappuzha Waterlogged Zones', 'Mobilized volunteer rescue boats to save 85 trapped cattle, stray dogs, and kittens from submerged wetlands. Provided emergency dry feed, antibiotics, and shelter.', 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=1000&q=80', 1, 1, 0),
('evt-04', 'Monsoon Feeding Drive & Water Bowls Distribution', 'Community Support', 'June 10, 2026', 'Thrissur Round & Municipal Markets', 'Distributed 200 cement feeding bowls and 1.5 tonnes of nutritious meals to community animals during torrential downpours. Coordinated with local auto-rickshaw feeder unions.', 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=1000&q=80', 0, 1, 0),
('evt-05', 'Public Awareness Rally: Stop Illegal Culling & Poisoning', 'Public Rallies', 'May 05, 2026', 'Secretariat Ground, Thiruvananthapuram', 'United 800+ citizens against cruel strychnine poisoning incidents. Handed formal petition to the Minister of Animal Husbandry demanding swift police prosecution under IPC 428/429.', 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=1000&q=80', 0, 1, 0);

-- ---------------------------------------------------------------------
-- 3. TABLE: videos (Video Links, YouTube Embeds, MP4 Streams)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `videos`;
CREATE TABLE `videos` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `video_uid` VARCHAR(64) NOT NULL UNIQUE,
  `title` VARCHAR(255) NOT NULL,
  `video_url` VARCHAR(512) NOT NULL,
  `embed_url` VARCHAR(512) NULL,
  `category` VARCHAR(64) NOT NULL DEFAULT 'Legal Insights',
  `duration` VARCHAR(32) NOT NULL DEFAULT '10:00',
  `description` TEXT NULL,
  `thumbnail_url` VARCHAR(512) NULL,
  `file_path` VARCHAR(512) NULL,
  `show_on_tv` TINYINT(1) NOT NULL DEFAULT 1,
  `is_user_uploaded` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_video_category` (`category`),
  INDEX `idx_video_tv` (`show_on_tv`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `videos` (`video_uid`, `title`, `video_url`, `embed_url`, `category`, `duration`, `description`, `thumbnail_url`, `show_on_tv`, `is_user_uploaded`) VALUES
('vid-01', 'Legal Rights of Animal Feeders in Kerala: High Court Ruling Analysis', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'Legal Insights', '14:20', 'Comprehensive legal breakdown explaining High Court orders prohibiting harassment against community animal feeders. Guidance on filing police complaints under Section 506 IPC.', 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80', 1, 0),
('vid-02', 'Why ABC (Animal Birth Control) Rules 2023 Work Better Than Culling', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'Scientific Policy', '18:45', 'Veterinary experts and animal scientists explain the science of population stabilization, herd immunity through mass vaccination, and vacuum effect following illegal culling.', 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=800&q=80', 1, 0),
('vid-03', 'Documentary: The Silent Street Guardians of Kochi', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'Rescue Stories', '22:10', 'Follow everyday feeders, auto drivers, and students who wake up at 4 AM every single morning to cook, feed, medicate, and care for community animals across Ernakulam district.', 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=800&q=80', 1, 0),
('vid-04', 'Compassion in Sanatana Dharma & World Religions: Voice for Voiceless', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'Spiritual Wisdom', '12:30', 'A thoughtful exploration of divine mercy, Karuna, Ahimsa, and reverence for sentient creatures as taught by Buddha, Jesus, Prophet Muhammad, and Mata Amritanandamayi.', 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80', 1, 0);

-- ---------------------------------------------------------------------
-- 4. TABLE: letters_govt (Legal Petitions & Representations to Authorities)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `letters_govt`;
CREATE TABLE `letters_govt` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `letter_uid` VARCHAR(64) NOT NULL UNIQUE,
  `ref_no` VARCHAR(64) NOT NULL UNIQUE,
  `subject` VARCHAR(255) NOT NULL,
  `recipient` VARCHAR(128) NOT NULL,
  `department` VARCHAR(128) NOT NULL,
  `submission_date` VARCHAR(64) NOT NULL,
  `status` VARCHAR(64) NOT NULL DEFAULT 'Under Review',
  `status_color` VARCHAR(32) NOT NULL DEFAULT 'warning',
  `summary` TEXT NOT NULL,
  `key_demands` JSON NULL,
  `document_url` VARCHAR(512) NULL,
  `file_path` VARCHAR(512) NULL,
  `is_user_uploaded` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_ref_no` (`ref_no`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `letters_govt` (`letter_uid`, `ref_no`, `subject`, `recipient`, `department`, `submission_date`, `status`, `status_color`, `summary`, `key_demands`, `document_url`, `is_user_uploaded`) VALUES
('let-01', 'VOKAL/LEG/2026/091', 'Mandatory Implementation of ABC Rules 2023 & Closure of Illegal Dog Meat Stalls', 'The Principal Secretary to Government', 'Local Self Government Department (LSGD), Govt of Kerala', 'August 18, 2026', 'Under Scrutiny', 'warning', 'Petition demanding strict compliance with central Animal Birth Control Rules 2023 across all 6 Municipal Corporations and 87 Municipalities in Kerala, with direct funding allocated for humane sterilization rather than unscientific detention.', '["Immediate audit of ABC operating theaters in all 14 districts","Closure of unauthorized breeding mills and illegal meat trades","Designation of clean community feeding spots as per HC directives","Mandatory police registration of cruelty complaints under PCA Act 1960"]', '#', 0),
('let-02', 'VOKAL/POL/2026/084', 'Directive to District Police Chiefs on Non-Registration of Animal Cruelty FIRs', 'State Police Chief & DGP', 'Kerala Police Headquarters, Thiruvananthapuram', 'July 29, 2026', 'Action Initiated', 'success', 'Formal memorandum submitting documented cases where local police stations refused to register FIRs under Section 429 IPC and PCA Act 1960 in canine poisonings, and requesting issuance of a statewide circular to all SHOs.', '["Issuance of DGP executive circular to all Station House Officers","Mandatory forensic post-mortem in all suspected poisonings","Designating dedicated District Animal Welfare Liaison Officers","Zero-tolerance and departmental enquiry against errant officers"]', '#', 0),
('let-03', 'VOKAL/COL/2026/077', 'Prevention of Cruelty to Captive Elephants During Temple Festivities', 'District Collector & Chairman', 'District Committee for Captive Elephants, Thrissur', 'June 15, 2026', 'Resolved / Directive Issued', 'primary', 'Detailed evidence dossier highlighting severe violations of Kerala Captive Elephants Rules, including parading injured and partially blind tuskers in excessive heat without water or mandatory rest intervals.', '["Strict enforcement of 10 AM to 4 PM parading ban during summer","Fitness certification by independent expert veterinary panel","Immediate confiscation of microchip-forged and diseased tuskers","Heavy penalties on festival committees violating statutory space norms"]', '#', 0);

-- ---------------------------------------------------------------------
-- 5. TABLE: citizen_inquiries (Cruelty Reports & Customer Inquiries)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `citizen_inquiries`;
CREATE TABLE `citizen_inquiries` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(128) NOT NULL,
  `email` VARCHAR(128) NOT NULL,
  `district` VARCHAR(64) NOT NULL,
  `type` VARCHAR(64) NOT NULL DEFAULT 'Cruelty Report',
  `message` TEXT NOT NULL,
  `status` ENUM('new', 'in_progress', 'resolved', 'archived') NOT NULL DEFAULT 'new',
  `admin_notes` TEXT NULL,
  `submitted_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_district` (`district`),
  INDEX `idx_type` (`type`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 6. TABLE: tv_display_slides (TV Screen Signage & Slideshow Loop)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `tv_display_slides`;
CREATE TABLE `tv_display_slides` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `slide_type` ENUM('photo', 'video', 'stat', 'quote', 'helpline', 'custom') NOT NULL DEFAULT 'photo',
  `title` VARCHAR(255) NOT NULL,
  `subtitle` VARCHAR(255) NULL,
  `media_url` VARCHAR(512) NOT NULL,
  `caption` TEXT NULL,
  `duration_seconds` INT UNSIGNED NOT NULL DEFAULT 10,
  `sort_order` INT NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_active_order` (`is_active`, `sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `tv_display_slides` (`slide_type`, `title`, `subtitle`, `media_url`, `caption`, `duration_seconds`, `sort_order`, `is_active`) VALUES
('stat', 'Voice of Kerala for Animal Legit', 'Reg. No: 147/2026 • Constitution Article 51A(g)', 'assets/vokal_logo_emblem.png', '4,850+ Rescues • 128 Legal Petitions • 14,200+ Vaccinations Across All 14 Kerala Districts', 12, 1, 1),
('quote', 'Mata Amritanandamayi Devi (Amma)', 'Universal Mother of Compassion • Amritapuri, Kerala', 'assets/masters/mata_amritanandamayi.jpg', 'Nature is our mother. The same divine life force pulses through every creature. Feeding the hungry stray and caring for wounded animals is direct worship of the Divine.', 12, 2, 1),
('photo', 'Anti-Rabies Vaccination & Glow Collar Drive', 'Ernakulam North & Marine Drive, Kochi', 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=1600&q=80', 'Over 320 community dogs vaccinated and fitted with nighttime reflective safety collars.', 10, 3, 1),
('quote', 'Prophet Muhammad', 'Mercy to All Creation (Rahmatan lil-Alamin)', 'assets/masters/prophet_muhammad.jpg', '“There is a reward for serving any living being.” (Sahih al-Bukhari 2363, 6009 & Sahih Muslim 2244). Feeding and giving water to an animal is an act of charity.', 12, 4, 1),
('photo', 'Emergency Flood Rescue Operation: Stray Animals', 'Kuttanad & Alappuzha Waterlogged Wetlands', 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=1600&q=80', 'Mobilized volunteer rescue boats to save 85 trapped cattle, stray dogs, and kittens from submerged wetlands.', 10, 5, 1),
('quote', 'Gautama Buddha', 'Universal Harmlessness (Ahimsa) & Boundless Karuna', 'assets/masters/gautama_buddha.jpg', 'Just as a mother protects her only child with her life, even so let one cultivate a boundless love towards all beings in the entire universe.', 12, 6, 1),
('quote', 'Jesus Christ', 'The Good Shepherd & Guardian of Innocent Life', 'assets/masters/jesus_christ.jpg', 'Are not five sparrows sold for two pennies? Yet not one of them is forgotten in God\'s sight. Blessed are the merciful, for they shall receive mercy.', 12, 7, 1),
('helpline', 'Citizen Cruelty Reporting & Feeder Defense', 'Email: voiceofkerala.legit@gmail.com • Web: vokal.org.in', 'assets/vokal_logo_emblem.png', 'Report illegal poisoning, cruelty, or feeder harassment anywhere in Kerala. Constitutional advocacy under Article 51A(g).', 12, 8, 1);

-- ---------------------------------------------------------------------
-- 7. TABLE: site_settings (Organization Registry & Global Configuration)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `site_settings`;
CREATE TABLE `site_settings` (
  `setting_key` VARCHAR(64) PRIMARY KEY,
  `setting_value` TEXT NOT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `site_settings` (`setting_key`, `setting_value`) VALUES
('org_name', 'VOKAL'),
('org_full_name', 'Voice of Kerala for Animal Legit'),
('org_reg_no', 'Reg. No: 147/2026'),
('org_email', 'voiceofkerala.legit@gmail.com'),
('org_address', 'Building No .21/546, Mankayi Kavala, Udayamperoor Grama Panchayat, Udayamperoor, Kerala, India - 682 307'),
('org_domain', 'vokal.org.in'),
('stat_rescues', '4,850+'),
('stat_petitions', '128'),
('stat_vaccinations', '14,200+'),
('stat_districts', '14');

SET FOREIGN_KEY_CHECKS = 1;
