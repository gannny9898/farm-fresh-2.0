<?php
class Database {
    private $host = "localhost";
    private $db_name = "farm_fresh";
    private $username = "root";
    private $password = "";
    private $conn = null;
    private $log_file = null;

    public function __construct() {
        // Set up logging
        $log_dir = __DIR__ . '/../logs';
        if (!is_dir($log_dir)) {
            mkdir($log_dir, 0777, true);
        }
        $this->log_file = $log_dir . '/database_debug.log';
        $this->log("Database class initialized");
    }

    private function log($message) {
        $timestamp = date('Y-m-d H:i:s');
        file_put_contents($this->log_file, "[$timestamp] $message" . PHP_EOL, FILE_APPEND);
    }

    // Get database connection
    public function getConnection() {
        try {
            $this->log("Attempting to connect to database");
            
            // Check if database exists, if not create it
            $this->createDatabaseIfNotExists();
            
            // Connect to the database
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name,
                $this->username,
                $this->password
            );
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
            
            $this->log("Connected to database successfully");
            
            // Check if tables exist, if not create them
            $this->createTablesIfNotExist();
            
            return $this->conn;
        } catch(PDOException $e) {
            $this->log("Database Connection Error: " . $e->getMessage());
            error_log("Database Connection Error: " . $e->getMessage());
            throw new Exception("Database connection failed: " . $e->getMessage());
        }
    }
    
    // Create database if it doesn't exist
    private function createDatabaseIfNotExists() {
        try {
            $this->log("Checking if database exists: " . $this->db_name);
            
            $conn = new PDO(
                "mysql:host=" . $this->host,
                $this->username,
                $this->password
            );
            $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            
            // Create database if it doesn't exist
            $conn->exec("CREATE DATABASE IF NOT EXISTS " . $this->db_name);
            $this->log("Database created or already exists: " . $this->db_name);
        } catch(PDOException $e) {
            $this->log("Database Creation Error: " . $e->getMessage());
            error_log("Database Creation Error: " . $e->getMessage());
            throw new Exception("Failed to create database: " . $e->getMessage());
        }
    }
    
    // Create tables if they don't exist
    private function createTablesIfNotExist() {
        try {
            $this->log("Checking if tables exist");
            
            // Check if users table exists
            $stmt = $this->conn->query("SHOW TABLES LIKE 'users'");
            if ($stmt->rowCount() == 0) {
                $this->log("Tables don't exist, creating them");
                // Tables don't exist, create them
                $this->createTables();
            } else {
                $this->log("Tables already exist");
            }
        } catch(PDOException $e) {
            $this->log("Table Check Error: " . $e->getMessage());
            error_log("Table Check Error: " . $e->getMessage());
            throw new Exception("Failed to check database tables: " . $e->getMessage());
        }
    }
    
    // Create all necessary tables
    private function createTables() {
        try {
            $this->log("Creating tables");
            
            // Users table
            $this->conn->exec("
                CREATE TABLE users (
                    user_id INT PRIMARY KEY AUTO_INCREMENT,
                    email VARCHAR(100) NOT NULL UNIQUE,
                    password VARCHAR(255) NOT NULL,
                    full_name VARCHAR(100) NOT NULL,
                    phone VARCHAR(20) NOT NULL,
                    user_type ENUM('farmer', 'customer') NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ");
            $this->log("Created users table");
            
            // Farmer profiles
            $this->conn->exec("
                CREATE TABLE farmer_profiles (
                    user_id INT PRIMARY KEY,
                    farm_name VARCHAR(100) NOT NULL,
                    farm_location VARCHAR(255) NOT NULL,
                    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
                )
            ");
            $this->log("Created farmer_profiles table");
            
            // Customer profiles
            $this->conn->exec("
                CREATE TABLE customer_profiles (
                    user_id INT PRIMARY KEY,
                    delivery_address TEXT NOT NULL,
                    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
                )
            ");
            $this->log("Created customer_profiles table");
            
            // Categories
            $this->conn->exec("
                CREATE TABLE categories (
                    category_id INT PRIMARY KEY AUTO_INCREMENT,
                    name VARCHAR(50) NOT NULL UNIQUE
                )
            ");
            $this->log("Created categories table");
            
            // Insert default categories
            $this->conn->exec("
                INSERT INTO categories (name) VALUES
                ('vegetables'),
                ('fruits'),
                ('dairy'),
                ('grains'),
                ('herbs')
            ");
            $this->log("Inserted default categories");
            
            // Farmer product categories
            $this->conn->exec("
                CREATE TABLE farmer_product_categories (
                    farmer_id INT NOT NULL,
                    category_id INT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    PRIMARY KEY (farmer_id, category_id),
                    FOREIGN KEY (farmer_id) REFERENCES users(user_id) ON DELETE CASCADE,
                    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE CASCADE
                )
            ");
            $this->log("Created farmer_product_categories table");
            
            // Insert test users for demonstration
            $this->createTestUsers();
            
        } catch(PDOException $e) {
            $this->log("Table Creation Error: " . $e->getMessage());
            error_log("Table Creation Error: " . $e->getMessage());
            throw new Exception("Failed to create database tables: " . $e->getMessage());
        }
    }
    
    // Create test users for demonstration
    private function createTestUsers() {
        try {
            $this->log("Creating test users");
            
            // Create test customer
            $stmt = $this->conn->prepare("
                INSERT INTO users (email, password, full_name, phone, user_type)
                VALUES (:email, :password, :full_name, :phone, :user_type)
            ");
            
            $stmt->execute([
                ':email' => 'customer@example.com',
                ':password' => 'password123',
                ':full_name' => 'Test Customer',
                ':phone' => '1234567890',
                ':user_type' => 'customer'
            ]);
            
            $customerId = $this->conn->lastInsertId();
            
            // Create customer profile
            $stmt = $this->conn->prepare("
                INSERT INTO customer_profiles (user_id, delivery_address)
                VALUES (:user_id, :delivery_address)
            ");
            
            $stmt->execute([
                ':user_id' => $customerId,
                ':delivery_address' => '123 Main St, City, Country'
            ]);
            
            $this->log("Created test customer with ID: $customerId");
            
            // Create test farmer
            $stmt = $this->conn->prepare("
                INSERT INTO users (email, password, full_name, phone, user_type)
                VALUES (:email, :password, :full_name, :phone, :user_type)
            ");
            
            $stmt->execute([
                ':email' => 'farmer@example.com',
                ':password' => 'password123',
                ':full_name' => 'Test Farmer',
                ':phone' => '0987654321',
                ':user_type' => 'farmer'
            ]);
            
            $farmerId = $this->conn->lastInsertId();
            
            // Create farmer profile
            $stmt = $this->conn->prepare("
                INSERT INTO farmer_profiles (user_id, farm_name, farm_location)
                VALUES (:user_id, :farm_name, :farm_location)
            ");
            
            $stmt->execute([
                ':user_id' => $farmerId,
                ':farm_name' => 'Green Acres Farm',
                ':farm_location' => 'Rural Road, Farmville'
            ]);
            
            // Add product categories for farmer
            $stmt = $this->conn->prepare("
                INSERT INTO farmer_product_categories (farmer_id, category_id)
                VALUES (:farmer_id, :category_id)
            ");
            
            // Add vegetables category
            $stmt->execute([
                ':farmer_id' => $farmerId,
                ':category_id' => 1
            ]);
            
            // Add fruits category
            $stmt->execute([
                ':farmer_id' => $farmerId,
                ':category_id' => 2
            ]);
            
            $this->log("Created test farmer with ID: $farmerId");
            
        } catch(PDOException $e) {
            $this->log("Test User Creation Error: " . $e->getMessage());
            error_log("Test User Creation Error: " . $e->getMessage());
            // Don't throw exception here, just log the error
            // This is not critical for the application to work
        }
    }

    // Close database connection
    public function closeConnection() {
        $this->log("Closing database connection");
        $this->conn = null;
    }
}

// Example usage:
/*
$database = new Database();
$db = $database->getConnection();

// Use the connection
$query = "SELECT * FROM products";
$stmt = $db->prepare($query);
$stmt->execute();
$products = $stmt->fetchAll();

// Close the connection when done
$database->closeConnection();
*/
?> 