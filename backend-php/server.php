<?php
use Ratchet\MessageComponentInterface;
use Ratchet\ConnectionInterface;
use Ratchet\Server\IoServer;
use Ratchet\WebSocket\WsServer;
use Ratchet\Http\HttpServer;

require 'vendor/autoload.php';

class Chat implements MessageComponentInterface {
    protected $clients;
    protected $chatFile = 'chat.txt';

    public function __construct() {
        $this->clients = new \SplObjectStorage;
        $this->ensureChatFileExists();
    }

    private function ensureChatFileExists() {
        if (!file_exists($this->chatFile)) {
            touch($this->chatFile);
            chmod($this->chatFile, 0666);
        }
    }

    public function onOpen(ConnectionInterface $conn) {
        $this->clients->attach($conn);
        $this->log("New connection: {$conn->resourceId}");
        $this->sendHistory($conn);
    }

    public function onMessage(ConnectionInterface $from, $msg) {
        try {
            $data = json_decode($msg, true, 512, JSON_THROW_ON_ERROR);
            
            if (isset($data['action']) && $data['action'] === 'send') {
                $this->handleMessage($data);
            }
        } catch (\JsonException $e) {
            $this->log("Invalid JSON received: " . $e->getMessage());
        }
    }

    public function onClose(ConnectionInterface $conn) {
        $this->clients->detach($conn);
        $this->log("Connection closed: {$conn->resourceId}");
    }

    public function onError(ConnectionInterface $conn, \Exception $e) {
        $this->log("Error: {$e->getMessage()}");
        $conn->close();
    }

    private function handleMessage(array $message) {
        if (empty($message['nickname']) || empty($message['message'])) {
            $this->log("Invalid message format received");
            return;
        }

        $timestamp = round(microtime(true) * 1000);
        $nickname = htmlspecialchars($message['nickname'], ENT_QUOTES, 'UTF-8');
        $messageText = htmlspecialchars($message['message'], ENT_QUOTES, 'UTF-8');
        
        $line = "$timestamp|$nickname|$messageText\n";
        
        if (file_put_contents($this->chatFile, $line, FILE_APPEND | LOCK_EX) === false) {
            $this->log("Failed to write to chat file");
            return;
        }

        $response = json_encode([
            'timestamp' => $timestamp,
            'nickname' => $nickname,
            'message' => $messageText
        ]);

        foreach ($this->clients as $client) {
            try {
                $client->send($response);
            } catch (\Exception $e) {
                $this->log("Failed to send message to client: {$e->getMessage()}");
            }
        }
    }

    private function sendHistory(ConnectionInterface $conn) {
        if (!file_exists($this->chatFile) || !is_readable($this->chatFile)) {
            $this->log("Chat file not readable");
            return;
        }

        $lines = @file($this->chatFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        if ($lines === false) {
            $this->log("Failed to read chat file");
            return;
        }

        foreach ($lines as $line) {
            $parts = explode('|', $line, 3);
            if (count($parts) === 3) {
                try {
                    $conn->send(json_encode([
                        'timestamp' => $parts[0],
                        'nickname' => $parts[1],
                        'message' => $parts[2]
                    ], JSON_THROW_ON_ERROR));
                } catch (\JsonException $e) {
                    $this->log("Failed to encode history message: " . $e->getMessage());
                }
            }
        }
    }

    private function log(string $message) {
        echo "[" . date('Y-m-d H:i:s') . "] " . $message . PHP_EOL;
    }
}

// Create server with HttpServer wrapper to prevent null request errors
$server = IoServer::factory(
    new HttpServer(
        new WsServer(
            new Chat()
        )
    ),
    8081, // Using port 8081 as requested
    '0.0.0.0' // Listen on all interfaces
);

// Add server start log
echo "Starting WebSocket server on ws://0.0.0.0:8081 at " . date('Y-m-d H:i:s') . PHP_EOL;
echo "Press Ctrl+C to stop the server" . PHP_EOL;

$server->run();