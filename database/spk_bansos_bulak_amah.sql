-- =============================================================================
-- BASIS DATA SPK PENENTUAN PENERIMA BANTUAN SOSIAL KAMPUNG BULAK AMAH
-- Metode: Simple Additive Weighting (SAW) & Integrasi Desil DTKS Kemensos RI
-- Skrip DDL & DML (Struktur Tabel & Data Dummy Lengkap)
-- Kompatibel: MySQL 5.7+ / MySQL 8.0+ / MariaDB 10.3+ (phpMyAdmin / Laragon / XAMPP)
-- =============================================================================

CREATE DATABASE IF NOT EXISTS `spk_bansos_bulak_amah`
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE `spk_bansos_bulak_amah`;

-- Nonaktifkan pengecekan foreign key sementara saat inisialisasi tabel
SET FOREIGN_KEY_CHECKS = 0;

-- =============================================================================
-- 1. TABEL PENGGUNA & HAK AKSES (USERS & RBAC)
-- =============================================================================
DROP TABLE IF EXISTS `user_permissions`;
DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `id` VARCHAR(64) NOT NULL,
  `email` VARCHAR(128) NOT NULL,
  `display_name` VARCHAR(128) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('SUPER_ADMIN', 'OPERATOR', 'VERIFIER', 'APPROVER', 'AUDITOR') NOT NULL DEFAULT 'OPERATOR',
  `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
  `last_login_at` DATETIME NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `user_permissions` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `user_id` VARCHAR(64) NOT NULL,
  `permission_key` VARCHAR(64) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_user_perm` (`user_id`, `permission_key`),
  CONSTRAINT `fk_perm_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 2. TABEL MASTER WARGA (RESIDENTS & DTKS DESIL)
-- =============================================================================
DROP TABLE IF EXISTS `resident_documents`;
DROP TABLE IF EXISTS `residents`;

CREATE TABLE `residents` (
  `id` VARCHAR(64) NOT NULL,
  `nik_masked` VARCHAR(20) NOT NULL COMMENT 'NIK disamarkan demi privasi data kependudukan (SOT AGENTS.md)',
  `nik_lookup_hash` VARCHAR(64) NOT NULL COMMENT 'Hash pencarian cepat tanpa membocorkan NIK asli',
  `name` VARCHAR(128) NOT NULL,
  `birth_date` DATE NOT NULL,
  `address_street` VARCHAR(255) NOT NULL,
  `address_rt_rw` VARCHAR(20) NOT NULL DEFAULT '001/003',
  `phone` VARCHAR(30) NULL,
  `document_count` INT NOT NULL DEFAULT 0,
  `desil` INT NOT NULL DEFAULT 1 COMMENT 'Tingkat Desil DTKS (1=Sangat Miskin s.d 10=Sangat Mampu)',
  `desil_label` VARCHAR(64) NOT NULL,
  `dtks_status` ENUM('TERDAFTAR', 'DALAM_PROSES', 'BELUM_TERDAFTAR') NOT NULL DEFAULT 'TERDAFTAR',
  `poverty_index` DECIMAL(5,2) NOT NULL DEFAULT 0.00 COMMENT 'Indeks Kemiskinan Objektif (0-100)',
  `income_per_capita` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `social_aid_eligibility` ENUM('PRIORITAS_UTAMA', 'PRIORITAS_SEDANG', 'CADANGAN', 'TIDAK_LAYAK') NOT NULL DEFAULT 'PRIORITAS_UTAMA',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_residents_desil` (`desil`),
  INDEX `idx_residents_rt_rw` (`address_rt_rw`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `resident_documents` (
  `id` VARCHAR(64) NOT NULL,
  `resident_id` VARCHAR(64) NOT NULL,
  `doc_type` ENUM('KK', 'KTP', 'RUMAH', 'SURAT_RT') NOT NULL,
  `file_name` VARCHAR(255) NOT NULL,
  `file_size_bytes` INT NOT NULL DEFAULT 0,
  `mime_type` VARCHAR(64) NOT NULL DEFAULT 'application/pdf',
  `status` ENUM('TERVERIFIKASI', 'REVISI', 'PENDING') NOT NULL DEFAULT 'PENDING',
  `storage_url` VARCHAR(255) NULL,
  `uploaded_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_docs_resident` FOREIGN KEY (`resident_id`) REFERENCES `residents` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 3. TABEL PERIODE SELEKSI BANSOS & PAGU KUOTA
-- =============================================================================
DROP TABLE IF EXISTS `selection_periods`;

CREATE TABLE `selection_periods` (
  `id` VARCHAR(64) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `start_date` DATE NOT NULL,
  `end_date` DATE NOT NULL,
  `status` ENUM('ACTIVE', 'CLOSED', 'DRAFT') NOT NULL DEFAULT 'DRAFT',
  `quota` INT NOT NULL DEFAULT 3 COMMENT 'Total kapasitas kuota penerima',
  `quota_sembako` INT NOT NULL DEFAULT 1,
  `quota_pkh` INT NOT NULL DEFAULT 1,
  `quota_pbijk` INT NOT NULL DEFAULT 1,
  `criteria_version_id` VARCHAR(64) NOT NULL DEFAULT 'cv-2026-v1',
  `created_by` VARCHAR(64) NOT NULL,
  `activated_at` DATETIME NULL,
  `locked_at` DATETIME NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_period_user` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 4. TABEL PENDAFTARAN CALON PENERIMA (CANDIDATES & VERIFICATION)
-- =============================================================================
DROP TABLE IF EXISTS `candidate_applications`;

CREATE TABLE `candidate_applications` (
  `id` VARCHAR(64) NOT NULL,
  `resident_id` VARCHAR(64) NOT NULL,
  `period_id` VARCHAR(64) NOT NULL,
  `application_status` ENUM('APPLIED', 'PROCESSED', 'WITHDRAWN') NOT NULL DEFAULT 'APPLIED',
  `verification_status` ENUM('VERIFIED', 'PENDING', 'REVISION_REQUIRED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
  `verification_notes` TEXT NULL,
  `verified_by` VARCHAR(64) NULL,
  `verified_at` DATETIME NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_candidate_period` (`resident_id`, `period_id`),
  CONSTRAINT `fk_cand_resident` FOREIGN KEY (`resident_id`) REFERENCES `residents` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cand_period` FOREIGN KEY (`period_id`) REFERENCES `selection_periods` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cand_verifier` FOREIGN KEY (`verified_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 5. TABEL KRITERIA DAN SUBKRITERIA METODE SAW
-- =============================================================================
DROP TABLE IF EXISTS `subcriteria_rules`;
DROP TABLE IF EXISTS `criteria`;

CREATE TABLE `criteria` (
  `id` VARCHAR(64) NOT NULL,
  `code` VARCHAR(10) NOT NULL COMMENT 'Kode kriteria: C1, C2, C3, C4, C5, C6',
  `name` VARCHAR(128) NOT NULL,
  `type` ENUM('BENEFIT', 'COST') NOT NULL,
  `weight` DECIMAL(4,2) NOT NULL COMMENT 'Bobot preferensi (Total W = 1.00)',
  `unit` VARCHAR(64) NOT NULL DEFAULT 'skor',
  `scale_min` INT NULL,
  `scale_max` INT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_criteria_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `subcriteria_rules` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `criterion_code` VARCHAR(10) NOT NULL,
  `category` VARCHAR(255) NOT NULL,
  `raw_score` VARCHAR(64) NOT NULL,
  `priority_impact` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_subcrit_criteria` FOREIGN KEY (`criterion_code`) REFERENCES `criteria` (`code`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 6. TABEL INPUT PENILAIAN ALTERNATIF (ASSESSMENTS MATRIX)
-- =============================================================================
DROP TABLE IF EXISTS `assessments`;

CREATE TABLE `assessments` (
  `id` VARCHAR(64) NOT NULL,
  `candidate_id` VARCHAR(64) NOT NULL,
  `criterion_code` VARCHAR(10) NOT NULL,
  `raw_value` VARCHAR(64) NOT NULL COMMENT 'Nilai aktual inputan warga sebelum normalisasi',
  `status` ENUM('VALID', 'DRAFT', 'INVALID') NOT NULL DEFAULT 'VALID',
  `author_id` VARCHAR(64) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_cand_criteria` (`candidate_id`, `criterion_code`),
  CONSTRAINT `fk_ass_candidate` FOREIGN KEY (`candidate_id`) REFERENCES `candidate_applications` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ass_author` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 7. TABEL RUN KALKULASI SAW (SNAPSHOT IMMUTABLE & HASIL PERANGKINGAN)
-- =============================================================================
DROP TABLE IF EXISTS `approval_decisions`;
DROP TABLE IF EXISTS `calculation_results`;
DROP TABLE IF EXISTS `calculation_runs`;

CREATE TABLE `calculation_runs` (
  `id` VARCHAR(64) NOT NULL,
  `period_id` VARCHAR(64) NOT NULL,
  `criteria_version_label` VARCHAR(128) NOT NULL DEFAULT 'Bobot Resmi v1.0',
  `algorithm_version` VARCHAR(32) NOT NULL DEFAULT 'SAW-Exact-v1',
  `status` ENUM('CALCULATED', 'FAILED', 'RUNNING') NOT NULL DEFAULT 'CALCULATED',
  `executed_by` VARCHAR(64) NOT NULL,
  `executed_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_run_period` FOREIGN KEY (`period_id`) REFERENCES `selection_periods` (`id`),
  CONSTRAINT `fk_run_executor` FOREIGN KEY (`executed_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `calculation_results` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `run_id` VARCHAR(64) NOT NULL,
  `candidate_id` VARCHAR(64) NOT NULL,
  `preference_value` DECIMAL(10,6) NOT NULL COMMENT 'Nilai preferensi akhir Vi (SAW)',
  `preference_fraction` VARCHAR(32) NOT NULL COMMENT 'Nilai eksak rasional fraksi',
  `rank_position` INT NOT NULL COMMENT 'Urutan ranking hasil perhitungan',
  `is_within_quota` TINYINT(1) NOT NULL DEFAULT 0,
  `allocated_program` VARCHAR(64) NOT NULL DEFAULT 'Cadangan',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_run_candidate` (`run_id`, `candidate_id`),
  CONSTRAINT `fk_res_run` FOREIGN KEY (`run_id`) REFERENCES `calculation_runs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_res_candidate` FOREIGN KEY (`candidate_id`) REFERENCES `candidate_applications` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `approval_decisions` (
  `id` VARCHAR(64) NOT NULL,
  `run_id` VARCHAR(64) NOT NULL,
  `candidate_id` VARCHAR(64) NOT NULL,
  `outcome` ENUM('APPROVED', 'REJECTED', 'PENDING') NOT NULL DEFAULT 'APPROVED',
  `reason` TEXT NOT NULL,
  `decided_by` VARCHAR(64) NOT NULL,
  `decided_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_dec_run` FOREIGN KEY (`run_id`) REFERENCES `calculation_runs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_dec_candidate` FOREIGN KEY (`candidate_id`) REFERENCES `candidate_applications` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_dec_user` FOREIGN KEY (`decided_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 8. TABEL AUDIT TRAIL & BACKUP JOBS
-- =============================================================================
DROP TABLE IF EXISTS `audit_logs`;
DROP TABLE IF EXISTS `backup_jobs`;

CREATE TABLE `audit_logs` (
  `id` VARCHAR(64) NOT NULL,
  `actor_id` VARCHAR(64) NOT NULL,
  `actor_name` VARCHAR(128) NOT NULL,
  `role` VARCHAR(32) NOT NULL,
  `action` VARCHAR(64) NOT NULL,
  `target_type` VARCHAR(64) NOT NULL,
  `target_id` VARCHAR(64) NOT NULL,
  `outcome` ENUM('SUCCESS', 'FAILED') NOT NULL DEFAULT 'SUCCESS',
  `request_summary` TEXT NOT NULL,
  `occurred_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_audit_occurred` (`occurred_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `backup_jobs` (
  `id` VARCHAR(64) NOT NULL,
  `requested_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `started_at` DATETIME NOT NULL,
  `completed_at` DATETIME NOT NULL,
  `status` ENUM('SUCCEEDED', 'RESTORE_TESTED', 'FAILED') NOT NULL DEFAULT 'SUCCEEDED',
  `storage_key` VARCHAR(255) NOT NULL,
  `checksum` VARCHAR(128) NOT NULL,
  `byte_size` BIGINT NOT NULL,
  `retention_days` INT NOT NULL DEFAULT 30,
  `restore_test_result` TEXT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Aktifkan kembali pengecekan foreign key
SET FOREIGN_KEY_CHECKS = 1;


-- =============================================================================
-- =============================================================================
-- DML: INSERT DATA DUMMY SISTEM SPK BANSOS KAMPUNG BULAK AMAH
-- (Data sintetis resmi sesuai mockData.js & PRD)
-- =============================================================================
-- =============================================================================

-- 1. DATA PENGGUNA (USERS)
-- Password default demo: Admin@BulakAmah2026 (bcrypt hash)
INSERT INTO `users` (`id`, `email`, `display_name`, `password_hash`, `role`, `status`, `created_at`, `last_login_at`) VALUES
('usr-admin', 'admin@bulakamah.desa.id', 'Bambang Irawan (Super Admin)', '$2y$10$Qj2zF0gY38k8G4U4T4z2eeM09C4K9d3.1xP5M/7o9Z8h3W9vY9vC2', 'SUPER_ADMIN', 'ACTIVE', '2026-01-01 08:00:00', '2026-01-17 09:00:00'),
('usr-operator', 'operator@bulakamah.desa.id', 'Siti Aminah (Operator Data)', '$2y$10$Qj2zF0gY38k8G4U4T4z2eeM09C4K9d3.1xP5M/7o9Z8h3W9vY9vC2', 'OPERATOR', 'ACTIVE', '2026-01-01 08:30:00', '2026-01-17 08:45:00'),
('usr-verifier', 'verifikator@bulakamah.desa.id', 'Hendra Wijaya (Verifikator)', '$2y$10$Qj2zF0gY38k8G4U4T4z2eeM09C4K9d3.1xP5M/7o9Z8h3W9vY9vC2', 'VERIFIER', 'ACTIVE', '2026-01-01 09:00:00', '2026-01-16 14:00:00'),
('usr-approver', 'lurah@bulakamah.desa.id', 'Drs. H. Mulyadi (Kepala Desa / Penyetuju)', '$2y$10$Qj2zF0gY38k8G4U4T4z2eeM09C4K9d3.1xP5M/7o9Z8h3W9vY9vC2', 'APPROVER', 'ACTIVE', '2026-01-01 09:30:00', '2026-01-17 11:00:00'),
('usr-auditor', 'auditor@bulakamah.desa.id', 'Rina Kusuma (Auditor Independen)', '$2y$10$Qj2zF0gY38k8G4U4T4z2eeM09C4K9d3.1xP5M/7o9Z8h3W9vY9vC2', 'AUDITOR', 'ACTIVE', '2026-01-01 10:00:00', '2026-01-17 10:30:00');

-- 2. DATA PERMISSIONS PER PENGGUNA
INSERT INTO `user_permissions` (`user_id`, `permission_key`) VALUES
('usr-admin', 'all'),
('usr-admin', 'decision.approve'),
('usr-admin', 'decision.reject'),
('usr-admin', 'criteria.edit'),
('usr-admin', 'backup.trigger'),
('usr-admin', 'user.manage'),
('usr-operator', 'resident.manage'),
('usr-operator', 'candidate.manage'),
('usr-operator', 'assessment.input'),
('usr-operator', 'saw.run'),
('usr-verifier', 'verification.review'),
('usr-verifier', 'resident.read'),
('usr-verifier', 'candidate.read'),
('usr-approver', 'decision.approve'),
('usr-approver', 'decision.reject'),
('usr-approver', 'report.read'),
('usr-auditor', 'audit.read'),
('usr-auditor', 'report.read'),
('usr-auditor', 'history.read');

-- 3. DATA MASTER WARGA (10 WARGA DEMO LENGKAP INTEGRASI DESIL DTKS)
INSERT INTO `residents` (`id`, `nik_masked`, `nik_lookup_hash`, `name`, `birth_date`, `address_street`, `address_rt_rw`, `phone`, `document_count`, `desil`, `desil_label`, `dtks_status`, `poverty_index`, `income_per_capita`, `social_aid_eligibility`, `created_at`) VALUES
('res-001', '320101******0001', 'hash-res-001', 'Kuswanto (Keluarga Prasejahtera)', '1974-03-15', 'Kampung Bulak Amah RT 01/RW 03', '001/003', '0812-****-1101', 3, 1, 'Desil 1 (Sangat Miskin)', 'TERDAFTAR', 94.20, 250000.00, 'PRIORITAS_UTAMA', '2026-01-11 09:00:00'),
('res-002', '320101******0002', 'hash-res-002', 'Marni binti Sanusi (Lansia Mandiri)', '1958-11-20', 'Kampung Bulak Amah RT 02/RW 03', '002/003', '0813-****-2202', 2, 2, 'Desil 2 (Miskin)', 'TERDAFTAR', 82.50, 480000.00, 'PRIORITAS_UTAMA', '2026-01-11 09:30:00'),
('res-003', '320101******0003', 'hash-res-003', 'Supardi (Buruh Harian Lepas)', '1982-07-04', 'Kampung Bulak Amah RT 01/RW 04', '001/004', '0856-****-3303', 3, 1, 'Desil 1 (Sangat Miskin)', 'TERDAFTAR', 91.80, 300000.00, 'PRIORITAS_UTAMA', '2026-01-11 10:00:00'),
('res-004', '320101******0004', 'hash-res-004', 'Endang Suhartini (Kepala Keluarga Perempuan)', '1979-01-28', 'Kampung Bulak Amah RT 03/RW 03', '003/003', '0878-****-4404', 3, 3, 'Desil 3 (Hampir Miskin)', 'TERDAFTAR', 71.30, 620000.00, 'PRIORITAS_SEDANG', '2026-01-11 10:30:00'),
('res-005', '320101******0005', 'hash-res-005', 'Rahmat Hidayat (Pedagang Gerobak)', '1985-09-12', 'Kampung Bulak Amah RT 02/RW 04', '002/004', '0896-****-5505', 1, 4, 'Desil 4 (Rentan Miskin)', 'DALAM_PROSES', 58.00, 900000.00, 'CADANGAN', '2026-01-12 08:00:00'),
('res-006', '320101******0006', 'hash-res-006', 'Zaenal Arifin (Disabilitas Fisik)', '1990-04-18', 'Kampung Bulak Amah RT 03/RW 04', '003/004', '0812-****-6606', 2, 2, 'Desil 2 (Miskin)', 'TERDAFTAR', 85.00, 420000.00, 'PRIORITAS_UTAMA', '2026-01-12 08:30:00'),
('res-007', '320101******0007', 'hash-res-007', 'Maryati (Pedagang Jamu Gendong)', '1983-05-10', 'Kampung Bulak Amah RT 01/RW 03', '001/003', '0821-****-7707', 2, 3, 'Desil 3 (Hampir Miskin)', 'TERDAFTAR', 65.40, 750000.00, 'PRIORITAS_SEDANG', '2026-01-13 09:00:00'),
('res-008', '320101******0008', 'hash-res-008', 'Bambang Wahyudi (Keluarga Menengah)', '1975-12-05', 'Kampung Bulak Amah RT 02/RW 03', '002/003', '0815-****-8808', 1, 5, 'Desil 5 (Menengah Bawah)', 'TERDAFTAR', 45.00, 2800000.00, 'TIDAK_LAYAK', '2026-01-13 10:00:00'),
('res-009', '320101******0009', 'hash-res-009', 'Ir. H. Gunawan (Warga Menengah Atas)', '1972-06-14', 'Kampung Bulak Amah RT 01/RW 04', '001/004', '0811-****-9909', 1, 8, 'Desil 8 (Menengah Atas)', 'BELUM_TERDAFTAR', 22.00, 6500000.00, 'TIDAK_LAYAK', '2026-01-13 11:00:00'),
('res-010', '320101******0010', 'hash-res-010', 'dr. Farah Anggraini (Warga Sangat Mampu)', '1988-02-22', 'Kampung Bulak Amah RT 03/RW 03', '003/003', '0812-****-1010', 1, 10, 'Desil 10 (Sangat Mampu)', 'BELUM_TERDAFTAR', 6.00, 12000000.00, 'TIDAK_LAYAK', '2026-01-13 11:30:00');

-- 4. DATA DOKUMEN PERSYARATAN RESMI WARGA (KK, KTP, FOTO RUMAH, SURAT RT)
INSERT INTO `resident_documents` (`id`, `resident_id`, `doc_type`, `file_name`, `file_size_bytes`, `mime_type`, `status`, `storage_url`, `uploaded_at`) VALUES
('doc-001-kk', 'res-001', 'KK', 'KK_3201010001_Kuswanto.pdf', 1420000, 'application/pdf', 'TERVERIFIKASI', '/storage/docs/kk_res001.pdf', '2026-01-11 09:10:00'),
('doc-001-ktp', 'res-001', 'KTP', 'KTP_3201010001_Kuswanto.jpg', 840000, 'image/jpeg', 'TERVERIFIKASI', '/storage/docs/ktp_res001.jpg', '2026-01-11 09:12:00'),
('doc-001-rumah', 'res-001', 'RUMAH', 'Foto_Kondisi_Rumah_Kuswanto.jpg', 2150000, 'image/jpeg', 'TERVERIFIKASI', '/storage/docs/rumah_res001.jpg', '2026-01-11 09:15:00'),
('doc-001-srt', 'res-001', 'SURAT_RT', 'Surat_Pengantar_RT001_BulakAmah.pdf', 620000, 'application/pdf', 'TERVERIFIKASI', '/storage/docs/sktm_res001.pdf', '2026-01-11 09:18:00'),
('doc-002-kk', 'res-002', 'KK', 'KK_3201010002_Marni.pdf', 1380000, 'application/pdf', 'TERVERIFIKASI', '/storage/docs/kk_res002.pdf', '2026-01-11 09:35:00'),
('doc-002-ktp', 'res-002', 'KTP', 'KTP_3201010002_Marni.jpg', 790000, 'image/jpeg', 'TERVERIFIKASI', '/storage/docs/ktp_res002.jpg', '2026-01-11 09:36:00'),
('doc-003-kk', 'res-003', 'KK', 'KK_3201010003_Supardi.pdf', 1450000, 'application/pdf', 'TERVERIFIKASI', '/storage/docs/kk_res003.pdf', '2026-01-11 10:10:00'),
('doc-003-rumah', 'res-003', 'RUMAH', 'Foto_Rumah_Supardi.jpg', 1980000, 'image/jpeg', 'TERVERIFIKASI', '/storage/docs/rumah_res003.jpg', '2026-01-11 10:12:00'),
('doc-004-kk', 'res-004', 'KK', 'KK_3201010004_Endang.pdf', 1510000, 'application/pdf', 'TERVERIFIKASI', '/storage/docs/kk_res004.pdf', '2026-01-11 10:35:00'),
('doc-004-srt', 'res-004', 'SURAT_RT', 'Surat_Keterangan_RT003_Endang.pdf', 640000, 'application/pdf', 'TERVERIFIKASI', '/storage/docs/sktm_res004.pdf', '2026-01-11 10:40:00');

-- 5. DATA PERIODE SELEKSI BANSOS
INSERT INTO `selection_periods` (`id`, `name`, `start_date`, `end_date`, `status`, `quota`, `quota_sembako`, `quota_pkh`, `quota_pbijk`, `criteria_version_id`, `created_by`, `activated_at`, `locked_at`, `created_at`) VALUES
('period-2026-t1', 'Bantuan Sosial Pangan & Tunai Tahap I T.A. 2026', '2026-01-10', '2026-03-31', 'ACTIVE', 3, 1, 1, 1, 'cv-2026-v1', 'usr-admin', '2026-01-10 08:00:00', NULL, '2026-01-10 08:00:00'),
('period-2025-t4', 'Bantuan Sosial Tunai Dampak Inflasi Tahap IV T.A. 2025', '2025-10-01', '2025-12-20', 'CLOSED', 3, 1, 1, 1, 'cv-2025-v4', 'usr-admin', '2025-10-01 08:00:00', '2025-12-20 17:00:00', '2025-10-01 08:00:00');

-- 6. DATA CALON PENERIMA BANSOS (CANDIDATE APPLICATIONS)
INSERT INTO `candidate_applications` (`id`, `resident_id`, `period_id`, `application_status`, `verification_status`, `verification_notes`, `verified_by`, `verified_at`, `created_at`) VALUES
('cand-001', 'res-001', 'period-2026-t1', 'PROCESSED', 'VERIFIED', 'KK, KTP, dan surat keterangan penghasilan RT lengkap & valid.', 'usr-verifier', '2026-01-15 11:00:00', '2026-01-12 10:00:00'),
('cand-002', 'res-002', 'period-2026-t1', 'PROCESSED', 'VERIFIED', 'Survei lapangan kondisi rumah terverifikasi sesuai foto.', 'usr-verifier', '2026-01-15 11:30:00', '2026-01-12 10:15:00'),
('cand-003', 'res-003', 'period-2026-t1', 'PROCESSED', 'VERIFIED', 'Dokumen lengkap, anggota keluarga rentan balita terkonfirmasi.', 'usr-verifier', '2026-01-15 13:00:00', '2026-01-12 10:30:00'),
('cand-004', 'res-004', 'period-2026-t1', 'PROCESSED', 'VERIFIED', 'Dokumen sah, pendapatan di bawah upah minimum regional.', 'usr-verifier', '2026-01-15 13:30:00', '2026-01-12 11:00:00'),
('cand-005', 'res-005', 'period-2026-t1', 'APPLIED', 'REVISION_REQUIRED', 'Foto KK buram dan slip pendapatan belum ada cap basah RT.', 'usr-verifier', '2026-01-15 14:00:00', '2026-01-12 11:30:00'),
('cand-006', 'res-006', 'period-2026-t1', 'APPLIED', 'PENDING', 'Menunggu jadwal kunjungan verifikator lapangan.', NULL, NULL, '2026-01-12 12:00:00');

-- 7. DATA KRITERIA SAW (6 KRITERIA UTAMA: C1 S.D C6)
INSERT INTO `criteria` (`id`, `code`, `name`, `type`, `weight`, `unit`, `scale_min`, `scale_max`, `created_at`) VALUES
('crit-001', 'C1', 'Pendapatan per bulan', 'COST', 0.25, 'Rupiah', 0, NULL, '2026-01-01 08:00:00'),
('crit-002', 'C2', 'Jumlah tanggungan keluarga', 'BENEFIT', 0.20, 'orang', 0, NULL, '2026-01-01 08:00:00'),
('crit-003', 'C3', 'Kerentanan kondisi fisik rumah', 'BENEFIT', 0.15, 'skor', 1, 5, '2026-01-01 08:00:00'),
('crit-004', 'C4', 'Anggota keluarga rentan (Lansia/Balita/Disabilitas)', 'BENEFIT', 0.15, 'skor', 0, 2, '2026-01-01 08:00:00'),
('crit-005', 'C5', 'Skor kepemilikan aset produktif', 'COST', 0.10, 'skor', 1, 3, '2026-01-01 08:00:00'),
('crit-006', 'C6', 'Tingkat Desil Kesejahteraan DTKS Kemensos', 'COST', 0.15, 'Tingkat Desil (1-10)', 1, 10, '2026-01-01 08:00:00');

-- 8. DATA SUBKRITERIA & KATEGORI PENILAIAN
INSERT INTO `subcriteria_rules` (`criterion_code`, `category`, `raw_score`, `priority_impact`) VALUES
('C1', 'Pendapatan <= Rp 1.000.000', '1000000', 'Tertinggi (Prioritas Utama)'),
('C1', 'Rp 1.000.001 - Rp 1.500.000', '1500000', 'Tinggi'),
('C1', 'Rp 1.500.001 - Rp 2.000.000', '2000000', 'Sedang'),
('C1', 'Pendapatan > Rp 2.000.000', '2500000+', 'Rendah (Cost: nilai besar memperkecil prioritas)'),
('C2', 'Tanggungan >= 5 orang', '5', 'Sangat Tinggi'),
('C2', 'Tanggungan 4 orang', '4', 'Tinggi'),
('C2', 'Tanggungan 3 orang', '3', 'Sedang'),
('C2', 'Tanggungan 1-2 orang', '1-2', 'Rendah'),
('C3', 'Rumah Tidak Layak Huni Parah (Dinding bambu/lantai tanah)', '5', 'Sangat Rentan (Skor 5)'),
('C3', 'Kondisi Rumah Rusak Sedang (Atap bocor/semi permanen)', '4', 'Rentan (Skor 4)'),
('C3', 'Kondisi Rusak Ringan', '3', 'Cukup Rentan (Skor 3)'),
('C3', 'Permanen Layak Huni', '1-2', 'Tidak Rentan (Skor 1-2)'),
('C4', 'Terdapat Lansia + Balita / Disabilitas Berat', '2', 'Kebutuhan Mendesak (Skor 2)'),
('C4', 'Terdapat salah satu (Lansia saja / Balita saja)', '1', 'Kebutuhan Sedang (Skor 1)'),
('C4', 'Tidak ada anggota keluarga rentan', '0', 'Tanpa Kategori Khusus (Skor 0)'),
('C5', 'Tidak memiliki aset produktif / kendaraan usaha', '1', 'Paling Prioritas (Cost: min / x)'),
('C5', 'Memiliki 1 unit alat kerja / motor tua operasional', '2', 'Prioritas Sedang (Skor 2)'),
('C5', 'Memiliki >= 2 unit aset produktif / kendaraan bermotor', '3', 'Prioritas Rendah (Skor 3)'),
('C6', 'Desil 1 - Rumah Tangga Sangat Miskin (10% Terbawah)', '1', 'Prioritas Paling Utama Bansos (Cost: min 1)'),
('C6', 'Desil 2 - Rumah Tangga Miskin (11% - 20%)', '2', 'Prioritas Tinggi Bansos (Skor 2)'),
('C6', 'Desil 3 - Rumah Tangga Hampir Miskin (21% - 30%)', '3', 'Prioritas Sedang (Skor 3)'),
('C6', 'Desil 4 - Rumah Tangga Rentan Miskin (31% - 40%)', '4', 'Prioritas Cadangan / PBI-JK (Skor 4)'),
('C6', 'Desil 5 - Rumah Tangga Menengah Bawah (41% - 50%)', '5', 'Non-Bansos Reguler (Skor 5)');

-- 9. DATA NILAI PENILAIAN ALTERNATIF (ASSESSMENTS MATRIX X)
INSERT INTO `assessments` (`id`, `candidate_id`, `criterion_code`, `raw_value`, `status`, `author_id`, `created_at`) VALUES
-- cand-001 (Kuswanto)
('ass-101', 'cand-001', 'C1', '1000000', 'VALID', 'usr-operator', '2026-01-16 09:00:00'),
('ass-102', 'cand-001', 'C2', '4', 'VALID', 'usr-operator', '2026-01-16 09:00:00'),
('ass-103', 'cand-001', 'C3', '5', 'VALID', 'usr-operator', '2026-01-16 09:00:00'),
('ass-104', 'cand-001', 'C4', '2', 'VALID', 'usr-operator', '2026-01-16 09:00:00'),
('ass-105', 'cand-001', 'C5', '1', 'VALID', 'usr-operator', '2026-01-16 09:00:00'),
('ass-106', 'cand-001', 'C6', '1', 'VALID', 'usr-operator', '2026-01-16 09:00:00'),

-- cand-002 (Marni)
('ass-201', 'cand-002', 'C1', '2000000', 'VALID', 'usr-operator', '2026-01-16 09:30:00'),
('ass-202', 'cand-002', 'C2', '2', 'VALID', 'usr-operator', '2026-01-16 09:30:00'),
('ass-203', 'cand-002', 'C3', '3', 'VALID', 'usr-operator', '2026-01-16 09:30:00'),
('ass-204', 'cand-002', 'C4', '1', 'VALID', 'usr-operator', '2026-01-16 09:30:00'),
('ass-205', 'cand-002', 'C5', '2', 'VALID', 'usr-operator', '2026-01-16 09:30:00'),
('ass-206', 'cand-002', 'C6', '2', 'VALID', 'usr-operator', '2026-01-16 09:30:00'),

-- cand-003 (Supardi)
('ass-301', 'cand-003', 'C1', '1500000', 'VALID', 'usr-operator', '2026-01-16 10:00:00'),
('ass-302', 'cand-003', 'C2', '5', 'VALID', 'usr-operator', '2026-01-16 10:00:00'),
('ass-303', 'cand-003', 'C3', '4', 'VALID', 'usr-operator', '2026-01-16 10:00:00'),
('ass-304', 'cand-003', 'C4', '0', 'VALID', 'usr-operator', '2026-01-16 10:00:00'),
('ass-305', 'cand-003', 'C5', '3', 'VALID', 'usr-operator', '2026-01-16 10:00:00'),
('ass-306', 'cand-003', 'C6', '1', 'VALID', 'usr-operator', '2026-01-16 10:00:00'),

-- cand-004 (Endang)
('ass-401', 'cand-004', 'C1', '2500000', 'VALID', 'usr-operator', '2026-01-16 10:30:00'),
('ass-402', 'cand-004', 'C2', '3', 'VALID', 'usr-operator', '2026-01-16 10:30:00'),
('ass-403', 'cand-004', 'C3', '2', 'VALID', 'usr-operator', '2026-01-16 10:30:00'),
('ass-404', 'cand-004', 'C4', '1', 'VALID', 'usr-operator', '2026-01-16 10:30:00'),
('ass-405', 'cand-004', 'C5', '1', 'VALID', 'usr-operator', '2026-01-16 10:30:00'),
('ass-406', 'cand-004', 'C6', '3', 'VALID', 'usr-operator', '2026-01-16 10:30:00'),

-- cand-005 (Parsial / draft)
('ass-501', 'cand-005', 'C1', '1800000', 'DRAFT', 'usr-operator', '2026-01-16 11:00:00');

-- 10. DATA RUN PERHITUNGAN SAW (IMMUTABLE SNAPSHOT)
INSERT INTO `calculation_runs` (`id`, `period_id`, `criteria_version_label`, `algorithm_version`, `status`, `executed_by`, `executed_at`) VALUES
('run-demo-001', 'period-2026-t1', 'Kriteria & Bobot Resmi T.A. 2026', 'SAW-Exact-Fraction-v1', 'CALCULATED', 'usr-operator', '2026-01-17 09:30:00');

-- 11. DATA HASIL PERANGKINGAN SAW & ALOKASI KUOTA
INSERT INTO `calculation_results` (`run_id`, `candidate_id`, `preference_value`, `preference_fraction`, `rank_position`, `is_within_quota`, `allocated_program`) VALUES
('run-demo-001', 'cand-001', 0.950000, '19/20', 1, 1, 'Bantuan Sembako (BPNT)'),
('run-demo-001', 'cand-003', 0.643333, '193/300', 2, 1, 'Bantuan PKH'),
('run-demo-001', 'cand-004', 0.525000, '21/40', 3, 1, 'Bantuan PBI-JK'),
('run-demo-001', 'cand-002', 0.485000, '97/200', 4, 0, 'Cadangan');

-- 12. DATA PENGESAHAN KEPUTUSAN FINAL OLEH KEPALA DESA
INSERT INTO `approval_decisions` (`id`, `run_id`, `candidate_id`, `outcome`, `reason`, `decided_by`, `decided_at`) VALUES
('dec-001', 'run-demo-001', 'cand-001', 'APPROVED', 'Memenuhi syarat mutlak prioritas Desil 1 & nilai SAW tertinggi (Peringkat 1).', 'usr-approver', '2026-01-17 11:30:00'),
('dec-002', 'run-demo-001', 'cand-003', 'APPROVED', 'Kondisi buruh harian lepas dengan tanggungan terbanyak (Peringkat 2).', 'usr-approver', '2026-01-17 11:35:00'),
('dec-003', 'run-demo-001', 'cand-004', 'APPROVED', 'Kepala keluarga perempuan dengan anggota keluarga rentan (Peringkat 3).', 'usr-approver', '2026-01-17 11:40:00'),
('dec-004', 'run-demo-001', 'cand-002', 'APPROVED', 'Ditetapkan sebagai cadangan prioritas bila terjadi kendala data.', 'usr-approver', '2026-01-17 11:45:00');

-- 13. DATA JEJAK AUDIT SISTEM (AUDIT TRAIL)
INSERT INTO `audit_logs` (`id`, `actor_id`, `actor_name`, `role`, `action`, `target_type`, `target_id`, `outcome`, `request_summary`, `occurred_at`) VALUES
('aud-001', 'usr-admin', 'Bambang Irawan', 'SUPER_ADMIN', 'PERIOD_ACTIVATED', 'SelectionPeriod', 'period-2026-t1', 'SUCCESS', 'Aktivasi periode seleksi Tahap 1 2026 dengan pagu kuota 3.', '2026-01-10 08:00:00'),
('aud-002', 'usr-verifier', 'Hendra Wijaya', 'VERIFIER', 'CANDIDATE_VERIFIED', 'Candidate', 'cand-001', 'SUCCESS', 'Verifikasi dokumen warga Kuswanto disetujui (lengkap dan valid).', '2026-01-15 11:00:00'),
('aud-003', 'usr-operator', 'Siti Aminah', 'OPERATOR', 'CALCULATION_RUN_CREATED', 'CalculationRun', 'run-demo-001', 'SUCCESS', 'Eksekusi kalkulasi SAW atas 4 alternatif calon terverifikasi.', '2026-01-17 09:30:00'),
('aud-004', 'usr-approver', 'Drs. H. Mulyadi', 'APPROVER', 'DECISION_APPROVED', 'ApprovalDecision', 'dec-001', 'SUCCESS', 'Pengesahan surat penetapan dan berita acara penerima bansos.', '2026-01-17 11:45:00');

-- 14. DATA RIWAYAT PENCADANGAN BASIS DATA (BACKUP JOBS)
INSERT INTO `backup_jobs` (`id`, `requested_at`, `started_at`, `completed_at`, `status`, `storage_key`, `checksum`, `byte_size`, `retention_days`, `restore_test_result`) VALUES
('bkp-20260117-01', '2026-01-17 03:00:00', '2026-01-17 03:00:05', '2026-01-17 03:01:20', 'RESTORE_TESTED', 'backups/2026/01/spk-bulakamah-snapshot-20260117.enc', 'sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069', 1482910, 30, 'Uji restore terisolasi sukses pada PostgreSQL test-instance pada 2026-01-17 04:00 UTC.'),
('bkp-20260110-01', '2026-01-10 03:00:00', '2026-01-10 03:00:04', '2026-01-10 03:01:15', 'SUCCEEDED', 'backups/2026/01/spk-bulakamah-snapshot-20260110.enc', 'sha256:6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b', 1245192, 30, NULL);

-- =============================================================================
-- QUERY CONTOH: VIEW REKAPITULASI LAPORAN RESMI SAW KEMENSOS RI
-- =============================================================================
CREATE OR REPLACE VIEW `v_laporan_resmi_penerima_bansos` AS
SELECT
  cr.rank_position AS `peringkat`,
  r.name AS `nama_warga`,
  r.nik_masked AS `nik_tersembunyi`,
  r.address_rt_rw AS `rt_rw`,
  r.desil_label AS `tingkat_desil`,
  cr.preference_value AS `nilai_saw_v`,
  cr.allocated_program AS `alokasi_bantuan`,
  CASE WHEN cr.is_within_quota = 1 THEN 'DALAM KUOTA' ELSE 'CADANGAN' END AS `status_kuota`,
  ad.outcome AS `status_pengesahan`,
  ad.decided_at AS `tanggal_pengesahan`
FROM `calculation_results` cr
JOIN `candidate_applications` ca ON cr.candidate_id = ca.id
JOIN `residents` r ON ca.resident_id = r.id
LEFT JOIN `approval_decisions` ad ON cr.run_id = ad.run_id AND cr.candidate_id = ad.candidate_id
ORDER BY cr.rank_position ASC;
