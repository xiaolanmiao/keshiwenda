<?php
$host = 'localhost';
$db   = 'dati_chinaxiuli_';
$user = 'dati_chinaxiuli_';
$pass = 'dati';

$dsn = "mysql:host=$host;dbname=$db;charset=utf8mb4";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
    throw new \PDOException($e->getMessage(), (int)$e->getCode());
}

$data = json_decode(file_get_contents('php://input'), true);

$userId = $data['userId'] ?? null;
$score = $data['score'] ?? null;
$totalQuestions = $data['totalQuestions'] ?? null;
$correctAnswers = $data['correctAnswers'] ?? null;
$startTime = $data['startTime'] ?? null;
$endTime = $data['endTime'] ?? null;

if (!$userId || !$score || !$totalQuestions || !$correctAnswers || !$startTime || !$endTime) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Incomplete data']);
    exit;
}

$stmt = $pdo->prepare('INSERT INTO results (user_id, score, total_questions, correct_answers, start_time, end_time) VALUES (?, ?, ?, ?, ?, ?)');
$stmt->execute([$userId, $score, $totalQuestions, $correctAnswers, $startTime, $endTime]);

echo json_encode(['status' => 'success']);
?>
