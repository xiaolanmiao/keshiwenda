<?php
$dir = 'path/to/';
$files = array_diff(scandir($dir), array('..', '.'));
$imageNames = [];

foreach ($files as $file) {
    if (pathinfo($file, PATHINFO_EXTENSION) === 'jpg') {
        $imageNames[] = pathinfo($file, PATHINFO_FILENAME); // 获取不带扩展名的文件名
    }
}

echo json_encode($imageNames);
?>
