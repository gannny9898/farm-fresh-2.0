<?php
// Set content type to JSON and allow CORS
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Ensure the request method is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

// Get JSON data from the request
$json_data = file_get_contents('php://input');
$data = json_decode($json_data, true);

// For debugging
file_put_contents('update_profile_log.txt', date('Y-m-d H:i:s') . " - Request: " . $json_data . PHP_EOL, FILE_APPEND);

// Check if data is valid JSON
if ($data === null) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid JSON data']);
    exit();
}

// Validate required fields
if (!isset($data['user_id']) || !isset($data['user_type']) || !isset($data['full_name']) || !isset($data['phone'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit();
}

// Include database configuration
require_once '../config/database.php';

try {
    // Create a database connection
    $conn = new PDO("mysql:host=$host;dbname=$db", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Start transaction
    $conn->beginTransaction();
    
    // Update common user information
    $stmt = $conn->prepare("UPDATE users SET full_name = :full_name, phone = :phone WHERE id = :user_id");
    $stmt->bindParam(':full_name', $data['full_name']);
    $stmt->bindParam(':phone', $data['phone']);
    $stmt->bindParam(':user_id', $data['user_id']);
    $stmt->execute();
    
    // Update user type specific information
    if ($data['user_type'] === 'farmer') {
        // Check if farmer details exist
        $stmt = $conn->prepare("SELECT * FROM farmers WHERE user_id = :user_id");
        $stmt->bindParam(':user_id', $data['user_id']);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            // Update existing farmer details
            $stmt = $conn->prepare("UPDATE farmers SET farm_name = :farm_name, farm_location = :farm_location WHERE user_id = :user_id");
        } else {
            // Insert new farmer details
            $stmt = $conn->prepare("INSERT INTO farmers (user_id, farm_name, farm_location) VALUES (:user_id, :farm_name, :farm_location)");
        }
        
        $stmt->bindParam(':user_id', $data['user_id']);
        $stmt->bindParam(':farm_name', $data['farm_name']);
        $stmt->bindParam(':farm_location', $data['farm_location']);
        $stmt->execute();
        
        // Handle product categories if provided
        if (isset($data['product_categories']) && is_array($data['product_categories'])) {
            // Delete existing categories
            $stmt = $conn->prepare("DELETE FROM farmer_categories WHERE farmer_id = :user_id");
            $stmt->bindParam(':user_id', $data['user_id']);
            $stmt->execute();
            
            // Insert new categories
            foreach ($data['product_categories'] as $category_id) {
                $stmt = $conn->prepare("INSERT INTO farmer_categories (farmer_id, category_id) VALUES (:farmer_id, :category_id)");
                $stmt->bindParam(':farmer_id', $data['user_id']);
                $stmt->bindParam(':category_id', $category_id);
                $stmt->execute();
            }
        }
    } else if ($data['user_type'] === 'customer') {
        // Check if customer details exist
        $stmt = $conn->prepare("SELECT * FROM customers WHERE user_id = :user_id");
        $stmt->bindParam(':user_id', $data['user_id']);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            // Update existing customer details
            $stmt = $conn->prepare("UPDATE customers SET delivery_address = :delivery_address WHERE user_id = :user_id");
        } else {
            // Insert new customer details
            $stmt = $conn->prepare("INSERT INTO customers (user_id, delivery_address) VALUES (:user_id, :delivery_address)");
        }
        
        $stmt->bindParam(':user_id', $data['user_id']);
        $stmt->bindParam(':delivery_address', $data['delivery_address']);
        $stmt->execute();
    }
    
    // Commit transaction
    $conn->commit();
    
    // Get updated user data
    $user_data = getUserData($conn, $data['user_id'], $data['user_type']);
    
    // Return success response
    echo json_encode([
        'success' => true, 
        'message' => 'Profile updated successfully',
        'user' => $user_data
    ]);
    
} catch (PDOException $e) {
    // Rollback transaction on error
    if ($conn->inTransaction()) {
        $conn->rollBack();
    }
    
    // Log error
    file_put_contents('update_profile_log.txt', date('Y-m-d H:i:s') . " - Error: " . $e->getMessage() . PHP_EOL, FILE_APPEND);
    
    // Return error response
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}

// Function to get user data
function getUserData($conn, $user_id, $user_type) {
    // Get basic user data
    $stmt = $conn->prepare("SELECT id, email, full_name, phone FROM users WHERE id = :user_id");
    $stmt->bindParam(':user_id', $user_id);
    $stmt->execute();
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        return null;
    }
    
    // Add user type
    $user['user_type'] = $user_type;
    
    // Get user type specific data
    if ($user_type === 'farmer') {
        $stmt = $conn->prepare("SELECT farm_name, farm_location FROM farmers WHERE user_id = :user_id");
        $stmt->bindParam(':user_id', $user_id);
        $stmt->execute();
        $farmer = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($farmer) {
            $user = array_merge($user, $farmer);
        }
        
        // Get farmer categories
        $stmt = $conn->prepare("
            SELECT fc.category_id, c.name 
            FROM farmer_categories fc
            JOIN categories c ON fc.category_id = c.id
            WHERE fc.farmer_id = :user_id
        ");
        $stmt->bindParam(':user_id', $user_id);
        $stmt->execute();
        $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        $user['product_categories'] = $categories;
    } else if ($user_type === 'customer') {
        $stmt = $conn->prepare("SELECT delivery_address FROM customers WHERE user_id = :user_id");
        $stmt->bindParam(':user_id', $user_id);
        $stmt->execute();
        $customer = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($customer) {
            $user = array_merge($user, $customer);
        }
    }
    
    return $user;
}
?> 