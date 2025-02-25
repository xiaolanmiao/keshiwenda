<?php
try {
    $department = $_GET['department']; // 从请求参数获取科室名称

    $pdo = new PDO('mysql:host=localhost;dbname=dati_chinaxiuli_', 'dati_chinaxiuli_', 'dati', [
        PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
    ]);

    // 根据科室获取对应的姓名列表
    $stmt = $pdo->prepare("SELECT name FROM names WHERE department = ?");
    $stmt->execute([$department]);
    $nameList = $stmt->fetchAll(PDO::FETCH_COLUMN);

    echo json_encode($nameList);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
