<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'status' => 'error',
        'message' => 'Method not allowed. Only POST requests are accepted.'
    ]);
    exit;
}

// Create a log file for debugging
$log_file = '../logs/register_debug.log';
$log_dir = dirname($log_file);
if (!is_dir($log_dir)) {
    mkdir($log_dir, 0777, true);
}

function log_debug($message) {
    global $log_file;
    $timestamp = date('Y-m-d H:i:s');
    file_put_contents($log_file, "[$timestamp] $message" . PHP_EOL, FILE_APPEND);
}

log_debug("Registration request received");

// Get POST data
$input = file_get_contents('php://input');
log_debug("Raw input: $input");

$data = json_decode($input, true);
if (!$data) {
    log_debug("Invalid JSON data received");
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => 'Invalid input data. Please check your form submission.'
    ]);
    exit;
}

log_debug("Parsed data: " . print_r($data, true));

// Validate required fields
$requiredFields = ['email', 'password', 'full_name', 'phone', 'user_type'];
foreach ($requiredFields as $field) {
    if (!isset($data[$field]) || empty($data[$field])) {
        log_debug("Missing required field: $field");
        http_response_code(400);
        echo json_encode([
            'status' => 'error',
            'message' => "Missing required field: {$field}"
        ]);
        exit;
    }
}

// Validate email format
if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
    log_debug("Invalid email format: " . $data['email']);
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => 'Invalid email format'
    ]);
    exit;
}

// Validate password length
if (strlen($data['password']) < 6) {
    log_debug("Password too short");
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => 'Password must be at least 6 characters long'
    ]);
    exit;
}

// Validate user type
if (!in_array($data['user_type'], ['farmer', 'customer'])) {
    log_debug("Invalid user type: " . $data['user_type']);
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => 'Invalid user type. Must be either "farmer" or "customer"'
    ]);
    exit;
}

// Validate user type specific fields
if ($data['user_type'] === 'farmer') {
    // Validate farmer-specific fields
    if (!isset($data['farm_name']) || empty($data['farm_name']) || 
        !isset($data['farm_location']) || empty($data['farm_location'])) {
        log_debug("Missing farmer details");
        http_response_code(400);
        echo json_encode([
            'status' => 'error',
            'message' => 'Missing farmer details. Please provide farm name and location.'
        ]);
        exit;
    }
    
    // Validate product categories
    if (!isset($data['product_categories']) || !is_array($data['product_categories']) || empty($data['product_categories'])) {
        log_debug("Missing product categories");
        http_response_code(400);
        echo json_encode([
            'status' => 'error',
            'message' => 'Please select at least one product category'
        ]);
        exit;
    }
} else if ($data['user_type'] === 'customer') {
    // Validate customer-specific fields
    if (!isset($data['delivery_address']) || empty($data['delivery_address'])) {
        log_debug("Missing delivery address");
        http_response_code(400);
        echo json_encode([
            'status' => 'error',
            'message' => 'Missing delivery address. Please provide your delivery address.'
        ]);
        exit;
    }
}

// For demonstration purposes, we'll simulate a successful registration
// In a real application, you would save this data to a database

// Generate a user ID (in a real app, this would be from the database)
$user_id = rand(1000, 9999);

log_debug("Registration successful for: " . $data['email'] . " (ID: $user_id)");

// Return success response
http_response_code(201); // Created
echo json_encode([
    'status' => 'success',
    'message' => 'Registration successful! You can now login with your email and password.',
    'user_id' => $user_id
]);
?> 