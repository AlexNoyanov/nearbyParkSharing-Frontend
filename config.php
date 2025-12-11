<?php
/**
 * Feature Toggle API Endpoint
 * 
 * This script handles feature toggle requests from the ParkSharing app.
 * 
 * Usage:
 * GET /Apps/ParkShare/config.php?feature=<feature_key>
 * 
 * Response:
 * {
 *   "enabled": true|false,
 *   "message": "Optional message"
 * }
 * 
 * To deploy:
 * 1. Upload this file to noyanov.com/Apps/ParkShare/config.php
 * 2. Ensure PHP is enabled on your server
 * 3. Set proper file permissions (644)
 * 4. Ensure the Apps/ParkShare directory exists
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Only allow GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Get feature key from query parameter
$feature = $_GET['feature'] ?? '';

// Validate feature key
$validFeatures = [
    'onboarding1',
    'onboarding2',
    'onboarding-final',
    'login',
    'registration',
    'code-verification',
    'home',
    'search',
    'details',
    'summary',
    'active',
    'rent',
    'profile',
    'chat',
];

if (empty($feature) || !in_array($feature, $validFeatures)) {
    http_response_code(400);
    echo json_encode([
        'error' => 'Invalid feature key',
        'validFeatures' => $validFeatures,
    ]);
    exit;
}

/**
 * Feature Toggle Configuration
 * 
 * Set each feature to true (enabled) or false (disabled)
 * You can also use environment variables or database lookups here
 */
$featureToggles = [
    // Onboarding features
    'onboarding1' => true,
    'onboarding2' => true,
    'onboarding-final' => true,
    
    // Authentication features
    'login' => true,
    'registration' => true,
    'code-verification' => true,
    
    // Main app features
    'home' => true,
    'search' => true,
    'details' => true,
    'summary' => true,
    'active' => true,
    
    // Optional features (can be disabled)
    'rent' => true,       // Enabled - доступно через "Найти парковку"
    'profile' => false,    // Disabled by default
    'chat' => true,
];

/**
 * Alternative: Load from environment variables
 * Uncomment to use environment variables instead
 */
/*
$envFile = __DIR__ . '/.env';
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos($line, '=') !== false && strpos($line, '#') !== 0) {
            list($key, $value) = explode('=', $line, 2);
            $key = trim($key);
            $value = trim($value);
            if (isset($featureToggles[$key])) {
                $featureToggles[$key] = filter_var($value, FILTER_VALIDATE_BOOLEAN);
            }
        }
    }
}
*/

/**
 * Alternative: Load from database
 * Uncomment and configure your database connection
 */
/*
try {
    $pdo = new PDO(
        'mysql:host=localhost;dbname=your_database',
        'username',
        'password',
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
    
    $stmt = $pdo->prepare('SELECT enabled FROM feature_toggles WHERE feature_key = ?');
    $stmt->execute([$feature]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($result) {
        $featureToggles[$feature] = (bool)$result['enabled'];
    }
} catch (PDOException $e) {
    // Fall back to default configuration
    error_log('Database error: ' . $e->getMessage());
}
*/

// Get the toggle state for the requested feature
$enabled = $featureToggles[$feature] ?? false;

// Optional: Add custom messages for specific features
$messages = [
    'rent' => 'Раздел арендатора скоро появится',
    'profile' => 'Профиль в разработке',
    'chat' => 'Чаты запускаем позже',
];

$response = [
    'enabled' => $enabled,
];

if (isset($messages[$feature])) {
    $response['message'] = $messages[$feature];
}

// Return JSON response
http_response_code(200);
echo json_encode($response, JSON_UNESCAPED_UNICODE);
exit;
?>

