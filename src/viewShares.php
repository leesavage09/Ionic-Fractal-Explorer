<?php
//ini_set('display_errors', 1);

$servername = $_ENV['dbserver'];
$dbname = $_ENV['dbname'];
$username = $_ENV['dbuser'];
$password = $_ENV['dbpass'];
$from = $_GET["from"];
$limit = $_GET["limit"];


// Create connection
$conn = mysqli_connect($servername, $username, $password, $dbname);
// Check connection
if (!$conn) {
    die("Connection failed: " . mysqli_connect_error());
}

$sql = "SELECT * FROM `share` LIMIT ".$from.",".$limit.";";
$result = $conn->query($sql);

if ($result->num_rows > 0) { 
    while($row = $result->fetch_assoc()) {
        echo "<a href='https://fractal-explorer-leesavage.herokuapp.com/".$row['url']."' ><img width='300px' height='200' src='data:image/jpeg;base64,".$row['base64']."' /></a>";
    }
} else {
    echo "0 results =";
}
$conn->close();
