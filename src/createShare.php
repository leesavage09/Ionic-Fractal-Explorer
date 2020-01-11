<?php
header("Access-Control-Allow-Origin: *");

$servername = "servername";
$dbname = "dbname";
$username = "username";
$password = "password";


$base64 = $_POST["base64Data"];
$url = $_POST["urlData"];

// Create connection
$conn = mysqli_connect($servername, $username, $password, $dbname);
// Check connection
if (!$conn) {
    die("Connection failed: " . mysqli_connect_error());
}
 
$sql = "INSERT INTO `share` (`base64`, `url`) VALUES ('".$base64."', '".$url."')";

if (mysqli_query($conn, $sql)) {
    $last_id = mysqli_insert_id($conn);
    echo $last_id;
} else {
    echo "Error: " . $sql . "<br>" . mysqli_error($conn);
}

mysqli_close($conn);
?>
