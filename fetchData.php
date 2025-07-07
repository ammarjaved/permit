<?php
header("Access-Control-Allow-Origin: *"); // Allow requests from any origin (for development)
header("Content-Type: application/json; charset=UTF-8");

// Database connection
$host = "192.168.1.34";
$db = "permit_tracking";
$user = "postgres";
$pass = "Admin123";

$conn = new PDO("pgsql:host=$host;dbname=$db", $user, $pass);
$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// Fetch data from permit_records table
$query = "SELECT id, type, ba, tahun, sn, tarikh_csp, jenis_kerja, nama_jalan, tarikh_lulus_opa_tnb, tarikh_fail_mo, pic_dbkl, file_no, pbt, jenis_bayaran, rm, status_permit, tarikh_permit, tarikh_tamat_kerja, tarikh_hantar_cbr_test, tarikh_siap_milling, tarikh_hantar_report, status_permit_teikini, catatan, ST_AsText(geom) as geom FROM public.permit_records";
$stmt = $conn->prepare($query);
$stmt->execute();
$data = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Return JSON response
echo json_encode($data);
?>