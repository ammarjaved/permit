<?php
// Database connection configuration for PostgreSQL
$host = "192.168.1.34";
$port = "5432";
$dbname = "permit_tracking";
$username = "postgres";
$password = "Admin123";

// Set headers to allow cross-origin requests (CORS)
header("Access-Control-Allow-Origin: *"); // Replace * with your actual frontend domain in production
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    // Just exit with 200 OK status
    exit(0);
}

// Check if the request is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); // Method Not Allowed
    echo json_encode(['error' => 'Only POST method is allowed']);
    exit;
}

// Get JSON data from the request body
$json_data = file_get_contents('php://input');
$data = json_decode($json_data, true);

// Check if JSON is valid
if ($data === null && json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400); // Bad Request
    echo json_encode(['error' => 'Invalid JSON data']);
    exit;
}

// Connect to PostgreSQL database
try {
    $conn_string = "pgsql:host=$host;port=$port;dbname=$dbname;user=$username;password=$password";
    $conn = new PDO($conn_string);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    http_response_code(500); // Server Error
    echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
    exit;
}

// Determine if this is an insert or update operation
$isUpdate = isset($data['id']) && !empty($data['id']);

$isGeoJSON = false;

// Check if data looks like GeoJSON (starts with { and contains "type" field)
if (substr(trim($data['geom']), 0, 1) === '{' && strpos($data['geom'], '"type"') !== false) {
    $isGeoJSON = true;
}


try {
    if ($isUpdate) {
        // UPDATE operation
        $sql = "UPDATE permit_records SET 
                type = :type,
                ba = :ba, 
                tahun = :tahun, 
                sn = :sn, 
                tarikh_csp = :tarikh_csp, 
                jenis_kerja = :jenis_kerja, 
                nama_jalan = :nama_jalan, 
                tarikh_lulus_opa_tnb = :tarikh_lulus_opa_tnb,
                tarikh_fail_mo = :tarikh_fail_mo, 
                pic_dbkl = :pic_dbkl, 
                file_no = :file_no, 
                pbt = :pbt,
                jenis_bayaran = :jenis_bayaran, 
                rm = :rm, 
                status_permit = :status_permit, 
                tarikh_permit = :tarikh_permit, 
                tarikh_tamat_kerja = :tarikh_tamat_kerja,
                tarikh_hantar_cbr_test = :tarikh_hantar_cbr_test, 
                tarikh_siap_milling = :tarikh_siap_milling, 
                tarikh_hantar_report = :tarikh_hantar_report, 
                status_permit_teikini = :status_permit_teikini,
                catatan = :catatan,
                geom = " . ($isGeoJSON ? "ST_GeomFromGeoJSON(:geom)" : "ST_GeomFromText(:geom, 4326)") . "
            WHERE id = :id
            RETURNING id";
    } else {
        // INSERT operation
        $sql = "INSERT INTO permit_records (
                type,
                ba, 
                tahun, 
                sn, 
                tarikh_csp, 
                jenis_kerja, 
                nama_jalan, 
                tarikh_lulus_opa_tnb,
                tarikh_fail_mo, 
                pic_dbkl, 
                file_no, 
                pbt,
                jenis_bayaran, 
                rm, 
                status_permit, 
                tarikh_permit, 
                tarikh_tamat_kerja,
                tarikh_hantar_cbr_test, 
                tarikh_siap_milling, 
                tarikh_hantar_report, 
                status_permit_teikini,
                catatan,
                geom, -- This is the geometry column
                created_at,
                updated_at
            ) VALUES (
                :type,
                :ba, 
                :tahun, 
                :sn, 
                :tarikh_csp, 
                :jenis_kerja, 
                :nama_jalan, 
                :tarikh_lulus_opa_tnb,
                :tarikh_fail_mo, 
                :pic_dbkl, 
                :file_no, 
                :pbt,
                :jenis_bayaran, 
                :rm, 
                :status_permit, 
                :tarikh_permit, 
                :tarikh_tamat_kerja,
                :tarikh_hantar_cbr_test, 
                :tarikh_siap_milling, 
                :tarikh_hantar_report, 
                :status_permit_teikini,
                :catatan,
                ST_GeomFromGeoJSON(:geom), -- Use ST_GeomFromGeoJSON here
                CURRENT_TIMESTAMP,
                CURRENT_TIMESTAMP
            ) RETURNING id";
    }
    
    $stmt = $conn->prepare($sql);
    
    // Bind parameters
    $stmt->bindValue(':type', $data['type']);
    $stmt->bindValue(':ba', $data['ba']);
    $stmt->bindValue(':tahun', $data['tahun']);
    $stmt->bindValue(':sn', $data['sn']);
    $stmt->bindValue(':tarikh_csp', $data['tarikh_csp']);
    $stmt->bindValue(':jenis_kerja', $data['jenis_kerja']);
    $stmt->bindValue(':nama_jalan', $data['nama_jalan']);
    $stmt->bindValue(':tarikh_lulus_opa_tnb', $data['tarikh_lulus_opa_tnb'] ?: null);
    $stmt->bindValue(':tarikh_fail_mo', $data['tarikh_fail_mo'] ?: null);
    $stmt->bindValue(':pic_dbkl', $data['pic_dbkl'] ?: null);
    $stmt->bindValue(':file_no', $data['file_no'] ?: null);
    $stmt->bindValue(':pbt', $data['pbt'] ?: null);
    $stmt->bindValue(':jenis_bayaran', $data['jenis_bayaran'] ?: null);
    $stmt->bindValue(':rm', $data['rm'] ?: null);
    $stmt->bindValue(':status_permit', $data['status_permit'] ?: null);
    $stmt->bindValue(':tarikh_permit', $data['tarikh_permit'] ?: null);
    $stmt->bindValue(':tarikh_tamat_kerja', $data['tarikh_tamat_kerja'] ?: null);
    $stmt->bindValue(':tarikh_hantar_cbr_test', $data['tarikh_hantar_cbr_test'] ?: null);
    $stmt->bindValue(':tarikh_siap_milling', $data['tarikh_siap_milling'] ?: null);
    $stmt->bindValue(':tarikh_hantar_report', $data['tarikh_hantar_report'] ?: null);
    $stmt->bindValue(':status_permit_teikini', $data['status_permit_teikini'] ?: null);
    $stmt->bindValue(':catatan', $data['catatan'] ?: null);
    $stmt->bindValue(':geom', $data['geom']?:null); // Pass the raw GeoJSON string
    
    // For update operation, bind the ID
    if ($isUpdate) {
        $stmt->bindValue(':id', $data['id']);
    }
    
    // Execute the query
    $stmt->execute();
    
    // Get the ID of the inserted/updated record
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    $recordId = $result['id'];
    
    // Send success response
    http_response_code(200); // OK
    echo json_encode([
        'success' => true, 
        'message' => $isUpdate ? 'Permit data updated successfully' : 'Permit data saved successfully', 
        'id' => $recordId
    ]);
    
} catch (PDOException $e) {
    http_response_code(500); // Server Error
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}

// Close the connection
$conn = null;
?>