<?php
// Prevent any output before headers
error_reporting(E_ALL);
ini_set('display_errors', 0);

// Set headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Create logs directory if it doesn't exist
$log_dir = __DIR__ . '/../logs';
if (!is_dir($log_dir)) {
    mkdir($log_dir, 0777, true);
}

$log_file = $log_dir . '/login_debug.log';

function log_debug($message) {
    global $log_file;
    $timestamp = date('Y-m-d H:i:s');
    file_put_contents($log_file, "[$timestamp] $message" . PHP_EOL, FILE_APPEND);
}

// Log the start of the request
log_debug("Login request received");
log_debug("Request method: " . $_SERVER['REQUEST_METHOD']);

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    echo json_encode(['status' => 'success', 'message' => 'Preflight request successful']);
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

// Get POST data
$input = file_get_contents('php://input');
log_debug("Raw input: $input");

// Check if input is empty
if (empty($input)) {
    log_debug("Empty input received");
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => 'No input data received. Please check your form submission.'
    ]);
    exit;
}

// Try to decode JSON
$data = json_decode($input, true);
if (json_last_error() !== JSON_ERROR_NONE) {
    log_debug("JSON decode error: " . json_last_error_msg());
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => 'Invalid JSON data: ' . json_last_error_msg()
    ]);
    exit;
}

log_debug("Parsed data: " . print_r($data, true));

// Validate required fields
if (!isset($data['email']) || empty($data['email'])) {
    log_debug("Missing email field");
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => 'Email is required'
    ]);
    exit;
}

if (!isset($data['password']) || empty($data['password'])) {
    log_debug("Missing password field");
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => 'Password is required'
    ]);
    exit;
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

// For simplicity, use test users directly
// In a real application, you would connect to a database
log_debug("Using test users for login");

// Test users (for demonstration purposes only)
$test_users = [
    'customer@example.com' => [
        'password' => 'password123',
        'user_id' => 1,
        'full_name' => 'Test Customer',
        'user_type' => 'customer',
        'delivery_address' => '123 Main St, City, Country'
    ],
    'farmer@example.com' => [
        'password' => 'password123',
        'user_id' => 2,
        'full_name' => 'Test Farmer',
        'user_type' => 'farmer',
        'farm_name' => 'Green Acres Farm',
        'farm_location' => 'Rural Road, Farmville',
        'product_categories' => [
            ['category_id' => 1, 'name' => 'vegetables'],
            ['category_id' => 2, 'name' => 'fruits']
        ]
    ]
];

$email = $data['email'];
$password = $data['password'];

log_debug("Checking credentials for email: $email");

// Check if user exists and password matches
if (isset($test_users[$email]) && $test_users[$email]['password'] === $password) {
    $user = $test_users[$email];
    
    // Remove password from user data
    unset($user['password']);
    
    // Create a session token
    $token = bin2hex(random_bytes(16));
    
    log_debug("Login successful for user: " . $user['full_name']);
    
    // Return success response
    http_response_code(200);
    echo json_encode([
        'status' => 'success',
        'message' => 'Login successful',
        'token' => $token,
        'user' => $user
    ]);
} else {
    log_debug("Invalid credentials for email: $email");
    
    // Return error response
    http_response_code(401);
    echo json_encode([
        'status' => 'error',
        'message' => 'Invalid email or password'
    ]);
}
?> 