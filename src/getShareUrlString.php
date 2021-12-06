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

$sql = "SELECT `url` FROM `share` WHERE `id`=".$id;
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    $url =  $result->fetch_assoc()['url'];
} else {
    $url = "error";
}
$conn->close();

?>


<?php echo $url; ?>

