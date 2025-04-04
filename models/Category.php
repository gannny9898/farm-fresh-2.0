<?php
require_once __DIR__ . '/../config/database.php';

class Category {
    private $conn;
    private $table_name = "categories";

    public $category_id;
    public $name;
    public $description;

    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }

    // Get all categories
    public function getAll() {
        $query = "SELECT * FROM " . $this->table_name . " ORDER BY name ASC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    // Get farmer's selected categories
    public function getFarmerCategories($farmer_id) {
        $query = "SELECT DISTINCT c.* 
                 FROM " . $this->table_name . " c
                 INNER JOIN farmer_product_categories fpc ON c.category_id = fpc.category_id
                 WHERE fpc.farmer_id = :farmer_id
                 ORDER BY c.name ASC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':farmer_id', $farmer_id);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    // Save farmer's product categories
    public function saveFarmerCategories($farmer_id, $category_ids) {
        try {
            // Begin transaction
            $this->conn->beginTransaction();

            // Delete existing categories for this farmer
            $delete_query = "DELETE FROM farmer_product_categories WHERE farmer_id = :farmer_id";
            $delete_stmt = $this->conn->prepare($delete_query);
            $delete_stmt->bindParam(':farmer_id', $farmer_id);
            $delete_stmt->execute();

            // Insert new categories
            $insert_query = "INSERT INTO farmer_product_categories (farmer_id, category_id) VALUES (:farmer_id, :category_id)";
            $insert_stmt = $this->conn->prepare($insert_query);

            foreach ($category_ids as $category_id) {
                $insert_stmt->bindParam(':farmer_id', $farmer_id);
                $insert_stmt->bindParam(':category_id', $category_id);
                $insert_stmt->execute();
            }

            // Commit transaction
            $this->conn->commit();
            return true;
        } catch (Exception $e) {
            // Rollback transaction on error
            $this->conn->rollBack();
            return false;
        }
    }
}
?> 