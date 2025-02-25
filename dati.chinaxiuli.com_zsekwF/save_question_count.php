<?php
try {
    $pdo = new PDO('mysql:host=localhost;dbname=dati_chinaxiuli_', 'dati_chinaxiuli_', 'dati', [
        PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
    ]);

    $data = json_decode(file_get_contents('php://input'), true);
    $questionCount = $data['questionCount'];
    $questionCountKey = $data['questionCountKey'];

    // 更新题目数量
    $stmt = $pdo->prepare('UPDATE settings SET value = ? WHERE name = ?');
    $stmt->execute([$questionCount, $questionCountKey]);

    echo json_encode(['status' => 'success']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
