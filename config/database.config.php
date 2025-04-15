<?php
// Database Configuration
class DatabaseConfig {
    // Default configuration (will be overridden by environment variables if set)
    private static $config = [
        'host' => 'localhost',
        'dbname' => 'farm_fresh',
        'username' => 'root',
        'password' => '',
        'charset' => 'utf8mb4',
        'options' => [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]
    ];

    // Get database configuration
    public static function getConfig() {
        // Override with environment variables if they exist
        $envConfig = [
            'host' => getenv('DB_HOST') ?: self::$config['host'],
            'dbname' => getenv('DB_NAME') ?: self::$config['dbname'],
            'username' => getenv('DB_USER') ?: self::$config['username'],
            'password' => getenv('DB_PASS') ?: self::$config['password'],
            'charset' => self::$config['charset'],
            'options' => self::$config['options']
        ];

        return $envConfig;
    }

    // Get PDO DSN string
    public static function getDSN() {
        $config = self::getConfig();
        return "mysql:host={$config['host']};dbname={$config['dbname']};charset={$config['charset']}";
    }

    // Create PDO connection
    public static function createConnection() {
        $config = self::getConfig();
        try {
            return new PDO(
                self::getDSN(),
                $config['username'],
                $config['password'],
                $config['options']
            );
        } catch (PDOException $e) {
            // Log error securely
            error_log("Database Connection Error: " . $e->getMessage());
            throw new Exception("Database connection failed. Please check your configuration.");
        }
    }
} 