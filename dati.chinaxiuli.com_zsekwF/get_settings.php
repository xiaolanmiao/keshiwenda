<?php
try {
    $pdo = new PDO('mysql:host=localhost;dbname=dati_chinaxiuli_', 'dati_chinaxiuli_', 'dati', [
        PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
    ]);

    $questionCountKey = $_GET['questionCountKey'];
    $imagePathKey = $_GET['imagePathKey'];

    // 查询题目数量
    $stmt = $pdo->prepare('SELECT value FROM settings WHERE name = ?');
    $stmt->execute([$questionCountKey]);
    $questionCount = $stmt->fetchColumn();

    // 查询图片路径
    $stmt = $pdo->prepare('SELECT value FROM settings WHERE name = ?');
    $stmt->execute([$imagePathKey]);
    $imagePath = $stmt->fetchColumn();

    // 返回设置数据
    echo json_encode(['status' => 'success', 'questionCount' => $questionCount, 'imagePath' => $imagePath]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
