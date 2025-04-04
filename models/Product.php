<?php
require_once __DIR__ . '/../config/database.php';

class Product {
    private $conn;
    private $table_name = "products";

    // Product properties
    public $product_id;
    public $farmer_id;
    public $category_id;
    public $name;
    public $description;
    public $price;
    public $unit;
    public $stock_quantity;
    public $is_organic;
    public $image_url;
    public $status;

    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }

    // Get all products
    public function getAll($page = 1, $limit = 10) {
        $offset = ($page - 1) * $limit;
        
        $query = "SELECT p.*, c.name as category_name, u.full_name as farmer_name 
                 FROM " . $this->table_name . " p
                 LEFT JOIN categories c ON p.category_id = c.category_id
                 LEFT JOIN users u ON p.farmer_id = u.user_id
                 WHERE p.status = 'available'
                 ORDER BY p.created_at DESC
                 LIMIT :limit OFFSET :offset";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetchAll();
    }

    // Get product by ID
    public function getById($id) {
        $query = "SELECT p.*, c.name as category_name, u.full_name as farmer_name 
                 FROM " . $this->table_name . " p
                 LEFT JOIN categories c ON p.category_id = c.category_id
                 LEFT JOIN users u ON p.farmer_id = u.user_id
                 WHERE p.product_id = :id";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->execute();

        return $stmt->fetch();
    }

    // Search products
    public function search($term) {
        $term = "%{$term}%";
        
        $query = "SELECT p.*, c.name as category_name, u.full_name as farmer_name 
                 FROM " . $this->table_name . " p
                 LEFT JOIN categories c ON p.category_id = c.category_id
                 LEFT JOIN users u ON p.farmer_id = u.user_id
                 WHERE (p.name LIKE :term OR p.description LIKE :term OR u.full_name LIKE :term)
                 AND p.status = 'available'
                 ORDER BY p.created_at DESC";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':term', $term);
        $stmt->execute();

        return $stmt->fetchAll();
    }

    // Create new product
    public function create() {
        $query = "INSERT INTO " . $this->table_name . "
                 (farmer_id, category_id, name, description, price, unit, 
                  stock_quantity, is_organic, image_url)
                 VALUES
                 (:farmer_id, :category_id, :name, :description, :price, :unit,
                  :stock_quantity, :is_organic, :image_url)";

        $stmt = $this->conn->prepare($query);

        // Sanitize and bind values
        $stmt->bindParam(':farmer_id', $this->farmer_id);
        $stmt->bindParam(':category_id', $this->category_id);
        $stmt->bindParam(':name', htmlspecialchars(strip_tags($this->name)));
        $stmt->bindParam(':description', htmlspecialchars(strip_tags($this->description)));
        $stmt->bindParam(':price', $this->price);
        $stmt->bindParam(':unit', htmlspecialchars(strip_tags($this->unit)));
        $stmt->bindParam(':stock_quantity', $this->stock_quantity);
        $stmt->bindParam(':is_organic', $this->is_organic);
        $stmt->bindParam(':image_url', htmlspecialchars(strip_tags($this->image_url)));

        if($stmt->execute()) {
            return $this->conn->lastInsertId();
        }
        return false;
    }

    // Update product
    public function update() {
        $query = "UPDATE " . $this->table_name . "
                 SET category_id = :category_id,
                     name = :name,
                     description = :description,
                     price = :price,
                     unit = :unit,
                     stock_quantity = :stock_quantity,
                     is_organic = :is_organic,
                     image_url = :image_url,
                     status = :status
                 WHERE product_id = :product_id
                 AND farmer_id = :farmer_id";

        $stmt = $this->conn->prepare($query);

        // Sanitize and bind values
        $stmt->bindParam(':product_id', $this->product_id);
        $stmt->bindParam(':farmer_id', $this->farmer_id);
        $stmt->bindParam(':category_id', $this->category_id);
        $stmt->bindParam(':name', htmlspecialchars(strip_tags($this->name)));
        $stmt->bindParam(':description', htmlspecialchars(strip_tags($this->description)));
        $stmt->bindParam(':price', $this->price);
        $stmt->bindParam(':unit', htmlspecialchars(strip_tags($this->unit)));
        $stmt->bindParam(':stock_quantity', $this->stock_quantity);
        $stmt->bindParam(':is_organic', $this->is_organic);
        $stmt->bindParam(':image_url', htmlspecialchars(strip_tags($this->image_url)));
        $stmt->bindParam(':status', $this->status);

        return $stmt->execute();
    }

    // Delete product
    public function delete($product_id, $farmer_id) {
        $query = "DELETE FROM " . $this->table_name . "
                 WHERE product_id = :product_id AND farmer_id = :farmer_id";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':product_id', $product_id);
        $stmt->bindParam(':farmer_id', $farmer_id);

        return $stmt->execute();
    }

    // Filter products by category
    public function filterByCategory($category_id, $page = 1, $limit = 10) {
        $offset = ($page - 1) * $limit;
        
        $query = "SELECT p.*, c.name as category_name, u.full_name as farmer_name 
                 FROM " . $this->table_name . " p
                 LEFT JOIN categories c ON p.category_id = c.category_id
                 LEFT JOIN users u ON p.farmer_id = u.user_id
                 WHERE p.category_id = :category_id AND p.status = 'available'
                 ORDER BY p.created_at DESC
                 LIMIT :limit OFFSET :offset";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':category_id', $category_id);
        $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetchAll();
    }
}
?> 