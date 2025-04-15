<?php
// Set content type to JSON and allow CORS
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Return a simple JSON response
echo json_encode([
    'status' => 'success',
    'message' => 'Test successful',
    'time' => date('Y-m-d H:i:s')
]);
?> 