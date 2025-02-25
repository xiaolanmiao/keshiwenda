<?php
try {
    $pdo = new PDO('mysql:host=localhost;dbname=dati_chinaxiuli_', 'dati_chinaxiuli_', 'dati', [
        PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
    ]);

    $data = json_decode(file_get_contents('php://input'), true);
    $settings = $data['settings'];

    // 开始事务
    $pdo->beginTransaction();

    // 更新每个科室的设置
    $stmt = $pdo->prepare('UPDATE settings SET value = ? WHERE name = ?');
    foreach ($settings as $setting) {
        $stmt->execute([$setting['questionCount'], $setting['questionCountKey']]);
        $stmt->execute([$setting['imagePath'], $setting['imagePathKey']]);
    }

    // 提交事务
    $pdo->commit();

    echo json_encode(['status' => 'success']);
} catch (Exception $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
