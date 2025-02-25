<?php
try {
    // 获取传入的 JSON 数据并解析
    $data = json_decode(file_get_contents('php://input'), true);

    // 获取科室名称
    $department = $data['department'];

    if (!$department) {
        throw new Exception('Department is not defined');
    }

    $pdo = new PDO('mysql:host=localhost;dbname=dati_chinaxiuli_', 'dati_chinaxiuli_', 'dati', [
        PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
    ]);

    $questions = $data['questions'];

    // 根据科室名称选择不同的表保存数据
    $tableName = 'questions_' . $department;

    // 如果表不存在，创建新表
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS $tableName (
            id INT AUTO_INCREMENT PRIMARY KEY,
            image VARCHAR(255) NOT NULL,
            correctAnswer VARCHAR(255) NOT NULL,
            options TEXT NOT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ");

    // 清空现有问题
    $pdo->exec("TRUNCATE TABLE $tableName");

    // 插入新问题
    $stmt = $pdo->prepare("INSERT INTO $tableName (image, correctAnswer, options) VALUES (?, ?, ?)");
    foreach ($questions as $question) {
        $stmt->execute([
            $question['image'],
            $question['correctAnswer'],
            json_encode($question['options'])
        ]);
    }

    echo json_encode(['status' => 'success']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
