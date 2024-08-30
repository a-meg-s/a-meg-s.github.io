<?php
// Create a PDO connection to your database (replace these values with your actual database credentials)
$host = "localhost";
$username = "root";
$password = "";
$database = "webt_db";

$pdo = new PDO("mysql:host=$host;dbname=$database", $username, $password);
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// Function to submit a new recommendation
function submitRecommendation($pdo, $first_name, $last_name, $recommendation, $cookieValue)
{
    try {

        // Insert data into the database 
        $sql = "INSERT INTO recommendations (first_name, last_name, recommendation) VALUES (:first_name, :last_name, :recommendation)";
        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(':first_name', $first_name);
        $stmt->bindParam(':last_name', $last_name);
        $stmt->bindParam(':recommendation', $recommendation);
        $stmt->execute();

        // Set the cookie with the combined value
        setcookie("_recommend", $cookieValue, time() + 3600, '/');

        // Get the last inserted ID
        $lastInsertId = $pdo->lastInsertId();

        // Fetch the inserted data for the response
        $fetchSql = "SELECT first_name, last_name, recommendation FROM recommendations WHERE id = :lastInsertId";
        $fetchStmt = $pdo->prepare($fetchSql);
        $fetchStmt->bindParam(':lastInsertId', $lastInsertId, PDO::PARAM_INT);
        $fetchStmt->execute();

        $result = $fetchStmt->fetch(PDO::FETCH_ASSOC);

        // Create a JSON response
        $response = [
            'status' => 'success',
            'message' => 'Recommendation for ' . $first_name . ' ' . $last_name . ' submitted successfully!',
            'data' => $result
        ];

        return $response;
    } catch (PDOException $e) {
        // Create an error JSON response
        $errorResponse = [
            'status' => 'error',
            'message' => 'Error submitting recommendation',
            'error' => $e->getMessage()
        ];

        echo json_encode($errorResponse);
    }
   
}

// Function to fetch all recommendations
function fetchRecommendations($pdo)
{
    try {
        // Fetch all recommendations from the database
        $stmt = $pdo->query("SELECT * FROM recommendations");
        $recommendations = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Check if there are recommendations
        if (!empty($recommendations)) {
            // Encode recommendations as JSON
            $jsonRecommendations = json_encode($recommendations);

            // Output JSON response
            header('Content-Type: application/json');
            echo $jsonRecommendations;
        } else {
            // Output a message indicating no recommendations
            header('Content-Type: application/json');
            echo json_encode(['message' => 'No recommendations found.']);
        }
    } catch (PDOException $e) {
        // Output an error message
        header('Content-Type: application/json');
        echo json_encode(['error' => 'Error fetching recommendations: ' . $e->getMessage()]);
    }
}

// Check the request method
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Retrieve form data
    $first_name = $_POST["first_name"];
    $last_name = $_POST["last_name"];
    $recommendation = $_POST["recommendation"];
    $cookieName = "_recommend";
    $cookieValue = $first_name . ' ' . $last_name;

    if (isset($_COOKIE[$cookieName]) && $_COOKIE[$cookieName] === $cookieValue) {
        // Recommendation already entered
        $response = [
            'status' => 'cookieExists',
            'message' => 'Dear ' . $first_name . ' ' . $last_name . ', you already entered your recommendation.'
        ];

        // Set the Content-Type header to application/json
        header('Content-Type: application/json');

        // Output the JSON response
        echo json_encode($response);

        // Exit the script
        exit();
    }

    // Call the function to submit a new recommendation
    $response = submitRecommendation($pdo, $first_name, $last_name, $recommendation, $cookieValue);

    // Output the response
    header('Content-Type: application/json');
    echo json_encode($response);
} else {
    // If it's not a POST request, fetch all recommendations
    fetchRecommendations($pdo);
}

?>