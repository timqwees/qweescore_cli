<?php
require_once __DIR__ . '/../../../vendor/autoload.php';

use App\Controllers\AuthController;
use App\Models\Network\Network;
use App\Models\Network\Message;

// Initialize Network (which will handle session and database)
$network = new Network();

// Check session after initialization
if (isset($_SESSION['user'])) {
 Network::onRedirect(Network::$paths['account']);
 exit();
}

$message = Message::controll();
$authController = new AuthController();

// Handle POST request
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
 try {
  $authController->onLogin();
 } catch (\Exception $e) {
  Message::set('error', $e->getMessage());
 }
}

// Include view
include __DIR__ . '/view/auth.html';
?>