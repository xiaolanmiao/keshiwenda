<?php
try {
    // 数据库连接
    $pdo = new PDO('mysql:host=localhost;dbname=dati_chinaxiuli_', 'dati_chinaxiuli_', 'dati', [
        PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
    ]);

    // 获取前端传递的 department 参数
    $department = $_GET['department'];

    // 根据科室选择相应的表
    $tableName = "questions_" . $department;

    // 查询题目数据
    $stmt = $pdo->query("SELECT * FROM {$tableName}");
    $questions = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 返回问题数据作为 JSON 响应
    echo json_encode(['questions' => $questions]);
} catch (Exception $e) {
    // 返回 HTTP 500 错误，并在 JSON 中包含错误消息
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
