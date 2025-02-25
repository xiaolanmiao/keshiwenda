<?php
// 启用错误报告
error_reporting(E_ALL);
ini_set('display_errors', 1);

try {
    // 数据库连接
    $pdo = new PDO('mysql:host=localhost;dbname=dati_chinaxiuli_', 'dati_chinaxiuli_', 'dati', [
        PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
    ]);

    // 获取传入的用户信息
    $data = json_decode(file_get_contents('php://input'), true);
    $phone = $data['phone'];
    $name = $data['name'];
    $score = $data['score'];
    $totalQuestions = $data['totalQuestions'];
    $correctAnswers = $data['correctAnswers'];
    $startTime = $data['startTime'];
    $endTime = $data['endTime'];

    // 检查数据库中是否已经存在该手机号
    $stmt = $pdo->prepare('SELECT id FROM users WHERE phone = ?');
    $stmt->execute([$phone]);
    $existingUser = $stmt->fetch();

    if ($existingUser) {
        // 如果用户已经存在，更新其信息
        $userId = $existingUser['id'];
        $stmt = $pdo->prepare('UPDATE users SET name = ? WHERE phone = ?');
        $stmt->execute([$name, $phone]);
    } else {
        // 如果用户不存在，插入新记录
        $stmt = $pdo->prepare('INSERT INTO users (phone, name) VALUES (?, ?)');
        $stmt->execute([$phone, $name]);
        $userId = $pdo->lastInsertId();
    }

    // 插入答题结果到results表
    $stmt = $pdo->prepare('INSERT INTO results (user_id, score, total_questions, correct_answers, start_time, end_time) VALUES (?, ?, ?, ?, ?, ?)');
    $stmt->execute([$userId, $score, $totalQuestions, $correctAnswers, $startTime, $endTime]);

    echo json_encode(['status' => 'success']);
} catch (\Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
