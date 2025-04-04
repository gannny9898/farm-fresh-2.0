<?php
// Set content type to JSON and allow CORS
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Ensure the request method is GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

// Check if user_id is provided
if (!isset($_GET['user_id']) || !isset($_GET['user_type'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Missing required parameters']);
    exit();
}

$user_id = $_GET['user_id'];
$user_type = $_GET['user_type'];

// Include database configuration
require_once '../config/database.php';

try {
    // Create a database connection
    $conn = new PDO("mysql:host=$host;dbname=$db", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Different queries based on user type
    if ($user_type === 'customer') {
        // Get customer orders
        $stmt = $conn->prepare("
            SELECT o.id, o.order_date, o.total_amount, o.status, o.payment_method,
                   COUNT(oi.id) as item_count
            FROM orders o
            JOIN order_items oi ON o.id = oi.order_id
            WHERE o.customer_id = :user_id
            GROUP BY o.id
            ORDER BY o.order_date DESC
        ");
        $stmt->bindParam(':user_id', $user_id);
        $stmt->execute();
        $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Get order items for each order
        foreach ($orders as &$order) {
            $stmt = $conn->prepare("
                SELECT oi.id, oi.product_id, oi.quantity, oi.price, oi.subtotal,
                       p.name as product_name, p.image as product_image,
                       f.farm_name, u.full_name as farmer_name
                FROM order_items oi
                JOIN products p ON oi.product_id = p.id
                JOIN farmers f ON p.farmer_id = f.id
                JOIN users u ON f.user_id = u.id
                WHERE oi.order_id = :order_id
            ");
            $stmt->bindParam(':order_id', $order['id']);
            $stmt->execute();
            $order['items'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
        }
    } else if ($user_type === 'farmer') {
        // Get farmer sales (orders containing their products)
        $stmt = $conn->prepare("
            SELECT o.id, o.order_date, o.status, c.full_name as customer_name,
                   SUM(oi.subtotal) as total_amount,
                   COUNT(oi.id) as item_count
            FROM orders o
            JOIN order_items oi ON o.id = oi.order_id
            JOIN products p ON oi.product_id = p.id
            JOIN farmers f ON p.farmer_id = f.id
            JOIN users c ON o.customer_id = c.id
            WHERE f.user_id = :user_id
            GROUP BY o.id
            ORDER BY o.order_date DESC
        ");
        $stmt->bindParam(':user_id', $user_id);
        $stmt->execute();
        $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Get order items for each order (only this farmer's products)
        foreach ($orders as &$order) {
            $stmt = $conn->prepare("
                SELECT oi.id, oi.product_id, oi.quantity, oi.price, oi.subtotal,
                       p.name as product_name, p.image as product_image
                FROM order_items oi
                JOIN products p ON oi.product_id = p.id
                JOIN farmers f ON p.farmer_id = f.id
                WHERE oi.order_id = :order_id AND f.user_id = :user_id
            ");
            $stmt->bindParam(':order_id', $order['id']);
            $stmt->bindParam(':user_id', $user_id);
            $stmt->execute();
            $order['items'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
        }
    } else {
        // Invalid user type
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid user type']);
        exit();
    }
    
    // Return orders
    echo json_encode([
        'success' => true,
        'orders' => $orders
    ]);
    
} catch (PDOException $e) {
    // Return error response
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?> 