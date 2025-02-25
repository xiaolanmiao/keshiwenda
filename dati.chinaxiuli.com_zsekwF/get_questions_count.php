<?php
try {
    // 数据库连接
    $pdo = new PDO('mysql:host=localhost;dbname=dati_chinaxiuli_', 'dati_chinaxiuli_', 'dati', [
        PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
    ]);

    // 获取前端传递的 department 参数
    $department = $_GET['department'];

    // 根据科室选择相应的表
    $questionCountKey = "questionCount_" . $department;

    // 查询 settings 表中的题目数量
    $stmt = $pdo->prepare('SELECT value FROM settings WHERE name = ?');
    $stmt->execute([$questionCountKey]);
    $questionCount = $stmt->fetchColumn();

    if ($questionCount === false) {
        throw new Exception("Failed to retrieve question count");
    }

    // 返回题目数量作为 JSON 响应
    echo json_encode(['questionCount' => $questionCount]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
