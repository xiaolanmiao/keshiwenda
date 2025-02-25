<?php
$department = $_GET['department'] ?? '';
$dir = "path/to/$department/"; // 按照科室读取目录

$files = array_diff(scandir($dir), array('..', '.'));
$imageNames = [];

foreach ($files as $file) {
    if (pathinfo($file, PATHINFO_EXTENSION) === 'jpg') {
        $imageNames[] = pathinfo($file, PATHINFO_FILENAME); // 获取不带扩展名的文件名
    }
}

try {
    $pdo = new PDO('mysql:host=localhost;dbname=dati_chinaxiuli_', 'dati_chinaxiuli_', 'dati', [
        PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
    ]);

    // 清空科室对应的 names 表记录
    $stmt = $pdo->prepare("DELETE FROM names WHERE department = ?");
    if (!$stmt->execute([$department])) {
        throw new Exception('Failed to delete existing names');
    }

    // 插入新的姓名记录
    $stmt = $pdo->prepare("INSERT INTO names (name, department) VALUES (?, ?)");
    $insertedCount = 0;
    foreach ($imageNames as $name) {
        if ($stmt->execute([$name, $department])) {
            $insertedCount++;
        } else {
            throw new Exception('Failed to insert name: ' . $name);
        }
    }

    echo json_encode(['status' => 'success', 'namesInserted' => $insertedCount]);
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
