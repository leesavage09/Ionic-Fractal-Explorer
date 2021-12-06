<?php
//ini_set('display_errors', 1);

$servername = $_ENV['dbserver'];
$dbname = $_ENV['dbname'];
$username = $_ENV['dbuser'];
$password = $_ENV['dbpass'];

$id = $_GET["id"];

// Create connection
$conn = mysqli_connect($servername, $username, $password, $dbname);
// Check connection
if (!$conn) {
    die("Connection failed: " . mysqli_connect_error());
}

$sql = "SELECT `base64` FROM `share` WHERE `id`=".$id;
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    $src = $result->fetch_assoc()['base64'];
    header("Content-type: image/jpeg");
    echo base64_decode($src);
} else {
    header("Content-type: image/jpeg");
}
$conn->close();
