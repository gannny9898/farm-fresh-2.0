<?php
// Set content type to JSON and allow CORS
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

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

// Validate input data
if (!isset($_GET['user_id']) || !isset($_GET['user_type'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Missing required parameters']);
    exit();
}

// Database connection
$db_host = 'localhost';
$db_user = 'root';
$db_pass = '';
$db_name = 'farm_fresh';

$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database connection failed']);
    exit();
}

// Extract data
$user_id = $conn->real_escape_string($_GET['user_id']);
$user_type = $conn->real_escape_string($_GET['user_type']);

// Different queries based on user type
if ($user_type === 'customer') {
    // For customers, get all their orders
    $sql = "SELECT o.id, o.order_date, o.total_amount, o.status, 
                   COUNT(oi.id) as item_count
            FROM orders o
            JOIN order_items oi ON o.id = oi.order_id
            WHERE o.customer_id = (SELECT id FROM customers WHERE user_id = '$user_id')
            GROUP BY o.id
            ORDER BY o.order_date DESC";
} else if ($user_type === 'farmer') {
    // For farmers, get orders that include their products
    $sql = "SELECT o.id, o.order_date, o.status, 
                   SUM(oi.quantity * oi.price) as total_amount,
                   COUNT(oi.id) as item_count
            FROM orders o
            JOIN order_items oi ON o.id = oi.order_id
            JOIN products p ON oi.product_id = p.id
            WHERE p.farmer_id = (SELECT id FROM farmers WHERE user_id = '$user_id')
            GROUP BY o.id
            ORDER BY o.order_date DESC";
} else {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid user type']);
    exit();
}

$result = $conn->query($sql);

if ($result) {
    $orders = [];
    
    while ($row = $result->fetch_assoc()) {
        // Get order items
        $order_id = $row['id'];
        
        if ($user_type === 'customer') {
            // For customers, get all items in their orders
            $items_sql = "SELECT oi.id, oi.quantity, oi.price, 
                                p.name as product_name, p.image_url,
                                f.farm_name
                         FROM order_items oi
                         JOIN products p ON oi.product_id = p.id
                         JOIN farmers f ON p.farmer_id = f.id
                         WHERE oi.order_id = '$order_id'";
        } else {
            // For farmers, get only their products in the orders
            $items_sql = "SELECT oi.id, oi.quantity, oi.price, 
                                p.name as product_name, p.image_url
                         FROM order_items oi
                         JOIN products p ON oi.product_id = p.id
                         WHERE oi.order_id = '$order_id'
                         AND p.farmer_id = (SELECT id FROM farmers WHERE user_id = '$user_id')";
        }
        
        $items_result = $conn->query($items_sql);
        $items = [];
        
        if ($items_result) {
            while ($item = $items_result->fetch_assoc()) {
                $items[] = $item;
            }
        }
        
        // Add items to the order
        $row['items'] = $items;
        $orders[] = $row;
    }
    
    echo json_encode(['success' => true, 'orders' => $orders]);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to fetch orders']);
}

$conn->close();
?> 