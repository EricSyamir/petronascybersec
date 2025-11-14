<?php
// Language management for bilingual support (English/Bahasa Malaysia)

function loadLanguage($lang = 'en') {
    $translations = [
        'en' => [
            // Navigation
            'platform_title' => 'PETRONAS Cybercrime Platform',
            'dashboard' => 'Dashboard',
            'deepfake_scanner' => 'Deepfake Scanner',
            'osint_monitor' => 'OSINT Monitor',
            'report_incident' => 'Report Incident',
            'login' => 'Login',
            'logout' => 'Logout',
            
            // Home page
            'welcome_title' => 'Protecting Malaysia\'s Digital Future',
            'welcome_subtitle' => 'Report cybercrime incidents, detect deepfakes, and monitor threats with our comprehensive security platform.',
            'report_now' => 'Report Now',
            'scan_media' => 'Scan Media',
            'total_reports' => 'Total Reports',
            'deepfakes_detected' => 'Deepfakes Detected',
            'active_threats' => 'Active Threats',
            
            // External links
            'escalate_to' => 'Escalate To',
            'pdrm_reporting' => 'PDRM e-Reporting',
            'resources' => 'Resources',
            'petronas_cobe' => 'PETRONAS Code of Business Ethics',
            'cyber_awareness' => 'Cybersecurity Awareness',
            
            // Footer
            'footer_text' => 'All rights reserved. Committed to cybersecurity excellence.',
            'privacy_policy' => 'Privacy Policy',
            'terms_service' => 'Terms of Service',
            'contact' => 'Contact',
            
            // Forms
            'username' => 'Username',
            'email' => 'Email',
            'password' => 'Password',
            'confirm_password' => 'Confirm Password',
            'organization' => 'Organization',
            'phone' => 'Phone Number',
            'submit' => 'Submit',
            'cancel' => 'Cancel',
            'register' => 'Register',
            
            // Incident reporting
            'incident_type' => 'Incident Type',
            'phishing' => 'Phishing',
            'scam' => 'Scam',
            'deepfake' => 'Deepfake/AI Generated Content',
            'identity_theft' => 'Identity Theft',
            'malware' => 'Malware',
            'other' => 'Other',
            'incident_title' => 'Incident Title',
            'incident_description' => 'Incident Description',
            'upload_evidence' => 'Upload Evidence',
            'location' => 'Location',
            
            // Deepfake detection
            'upload_media' => 'Upload Media',
            'drag_drop_files' => 'Drag and drop files here or click to select',
            'analyzing' => 'Analyzing...',
            'analysis_complete' => 'Analysis Complete',
            'confidence_score' => 'Confidence Score',
            'ai_generated' => 'AI Generated Content Detected',
            'authentic' => 'Content Appears Authentic',
            'deepfake_warning' => 'Warning: This content may be artificially generated. Exercise caution when sharing or believing this content.',
            'deepfake_education' => 'Learn more about protecting yourself from deepfakes and AI-generated misinformation.',
            
            // OSINT Dashboard
            'threat_monitoring' => 'Threat Monitoring',
            'malaysian_sources' => 'Malaysian Sources',
            'keyword_filter' => 'Keyword Filter',
            'threat_level' => 'Threat Level',
            'low' => 'Low',
            'medium' => 'Medium',
            'high' => 'High',
            'critical' => 'Critical',
            'last_updated' => 'Last Updated',
            'view_details' => 'View Details',
            
            // Investigation
            'case_management' => 'Case Management',
            'assigned_investigator' => 'Assigned Investigator',
            'case_status' => 'Case Status',
            'priority' => 'Priority',
            'submitted' => 'Submitted',
            'under_review' => 'Under Review',
            'investigating' => 'Investigating',
            'resolved' => 'Resolved',
            'closed' => 'Closed',
            
            // Messages
            'upload_success' => 'File uploaded successfully',
            'upload_error' => 'Upload failed. Please try again.',
            'report_submitted' => 'Report submitted successfully',
            'invalid_file_type' => 'Invalid file type. Please upload images or videos only.',
            'file_too_large' => 'File too large. Maximum size is 50MB.',
            'login_required' => 'Please login to access this feature.',
            'access_denied' => 'Access denied. Insufficient privileges.',
            
            // Security
            'security_notice' => 'Security Notice',
            'data_protection' => 'Your data is protected according to Malaysia\'s Personal Data Protection Act (PDPA) and PETRONAS data governance policies.',
            'encrypted_transmission' => 'All data transmission is encrypted and secure.',
        ],
        
        'bm' => [
            // Navigation
            'platform_title' => 'Platform Jenayah Siber PETRONAS',
            'dashboard' => 'Papan Pemuka',
            'deepfake_scanner' => 'Pengimbas Deepfake',
            'osint_monitor' => 'Monitor OSINT',
            'report_incident' => 'Lapor Insiden',
            'login' => 'Log Masuk',
            'logout' => 'Log Keluar',
            
            // Home page
            'welcome_title' => 'Melindungi Masa Depan Digital Malaysia',
            'welcome_subtitle' => 'Laporkan insiden jenayah siber, kesan deepfake, dan pantau ancaman dengan platform keselamatan komprehensif kami.',
            'report_now' => 'Lapor Sekarang',
            'scan_media' => 'Imbas Media',
            'total_reports' => 'Jumlah Laporan',
            'deepfakes_detected' => 'Deepfake Dikesan',
            'active_threats' => 'Ancaman Aktif',
            
            // External links
            'escalate_to' => 'Rujuk Kepada',
            'pdrm_reporting' => 'e-Pelaporan PDRM',
            'resources' => 'Sumber',
            'petronas_cobe' => 'Kod Etika Perniagaan PETRONAS',
            'cyber_awareness' => 'Kesedaran Keselamatan Siber',
            
            // Footer
            'footer_text' => 'Hak cipta terpelihara. Komited kepada kecemerlangan keselamatan siber.',
            'privacy_policy' => 'Dasar Privasi',
            'terms_service' => 'Terma Perkhidmatan',
            'contact' => 'Hubungi',
            
            // Forms
            'username' => 'Nama Pengguna',
            'email' => 'E-mel',
            'password' => 'Kata Laluan',
            'confirm_password' => 'Sahkan Kata Laluan',
            'organization' => 'Organisasi',
            'phone' => 'Nombor Telefon',
            'submit' => 'Hantar',
            'cancel' => 'Batal',
            'register' => 'Daftar',
            
            // Incident reporting
            'incident_type' => 'Jenis Insiden',
            'phishing' => 'Pancingan Data',
            'scam' => 'Penipuan',
            'deepfake' => 'Deepfake/Kandungan Dijana AI',
            'identity_theft' => 'Kecurian Identiti',
            'malware' => 'Perisian Hasad',
            'other' => 'Lain-lain',
            'incident_title' => 'Tajuk Insiden',
            'incident_description' => 'Penerangan Insiden',
            'upload_evidence' => 'Muat Naik Bukti',
            'location' => 'Lokasi',
            
            // Deepfake detection
            'upload_media' => 'Muat Naik Media',
            'drag_drop_files' => 'Seret dan lepas fail di sini atau klik untuk memilih',
            'analyzing' => 'Menganalisis...',
            'analysis_complete' => 'Analisis Selesai',
            'confidence_score' => 'Skor Keyakinan',
            'ai_generated' => 'Kandungan Dijana AI Dikesan',
            'authentic' => 'Kandungan Kelihatan Asli',
            'deepfake_warning' => 'Amaran: Kandungan ini mungkin dijana secara buatan. Berhati-hati semasa berkongsi atau mempercayai kandungan ini.',
            'deepfake_education' => 'Ketahui lebih lanjut tentang melindungi diri daripada deepfake dan maklumat salah yang dijana AI.',
            
            // OSINT Dashboard
            'threat_monitoring' => 'Pemantauan Ancaman',
            'malaysian_sources' => 'Sumber Malaysia',
            'keyword_filter' => 'Penapis Kata Kunci',
            'threat_level' => 'Tahap Ancaman',
            'low' => 'Rendah',
            'medium' => 'Sederhana',
            'high' => 'Tinggi',
            'critical' => 'Kritikal',
            'last_updated' => 'Dikemas Kini Terakhir',
            'view_details' => 'Lihat Butiran',
            
            // Investigation
            'case_management' => 'Pengurusan Kes',
            'assigned_investigator' => 'Penyiasat Ditugaskan',
            'case_status' => 'Status Kes',
            'priority' => 'Keutamaan',
            'submitted' => 'Dihantar',
            'under_review' => 'Dalam Semakan',
            'investigating' => 'Menyiasat',
            'resolved' => 'Diselesaikan',
            'closed' => 'Ditutup',
            
            // Messages
            'upload_success' => 'Fail berjaya dimuat naik',
            'upload_error' => 'Muat naik gagal. Sila cuba lagi.',
            'report_submitted' => 'Laporan berjaya dihantar',
            'invalid_file_type' => 'Jenis fail tidak sah. Sila muat naik imej atau video sahaja.',
            'file_too_large' => 'Fail terlalu besar. Saiz maksimum ialah 50MB.',
            'login_required' => 'Sila log masuk untuk mengakses ciri ini.',
            'access_denied' => 'Akses ditolak. Keistimewaan tidak mencukupi.',
            
            // Security
            'security_notice' => 'Notis Keselamatan',
            'data_protection' => 'Data anda dilindungi mengikut Akta Perlindungan Data Peribadi Malaysia (PDPA) dan dasar tadbir urus data PETRONAS.',
            'encrypted_transmission' => 'Semua penghantaran data disulitkan dan selamat.',
        ]
    ];
    
    return $translations[$lang] ?? $translations['en'];
}

function getCurrentLanguage() {
    return $_SESSION['language'] ?? 'en';
}

function translateText($key, $lang = null) {
    if ($lang === null) {
        $lang = getCurrentLanguage();
    }
    
    $translations = loadLanguage($lang);
    return $translations[$key] ?? $key;
}

function getLanguageOptions() {
    return [
        'en' => 'English',
        'bm' => 'Bahasa Malaysia'
    ];
}
?>
