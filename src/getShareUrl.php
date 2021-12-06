<?php
//ini_set('display_errors', 1);

$servername = '$_ENV["dbserver"]';
$dbname = '$_ENV["dbname"]';
$username = '$_ENV["dbuser"]';
$password = '$_ENV["dbpass"]';
$id = $_GET["id"];

// Create connection
$conn = mysqli_connect($servername, $username, $password, $dbname);
// Check connection
if (!$conn) {
    die("Connection failed: " . mysqli_connect_error());
}

$sql = "SELECT * FROM `share` WHERE `id`=".$id;
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    $url =  $row['url'];
    $base64 =  $row['base64'];
} else {
    $url = "";
}
$conn->close();

?>
<!DOCTYPE html>
<html lang="en" dir="ltr">

<head>
  <meta charset="UTF-8">
  <title>Fractic</title>
  <meta name="viewport" content="viewport-fit=cover, width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <meta name="format-detection" content="telephone=no">
  <meta name="msapplication-tap-highlight" content="no">

  <meta property="og:image:width" content="512px">
  <meta property="og:image:height" content="512px">
  <meta property="og:description" content="Explore beautiful fractal images">
  <meta name="description" content="Explore beautiful fractal images" />
  <meta property="og:title" content="Fractic">
  <meta property="og:image" content="https://fractic.leesavage.co.uk/getShareJpg.php?id=<?php echo $id; ?>">
  <meta property="og:url" content="https://fractic.leesavage.co.uk">

<link rel="apple-touch-icon" sizes="180x180" href="assets/icon/apple-touch-icon.png?v=rMlmQWy2dM">
  <link rel="icon" type="image/png" sizes="32x32" href="assets/icon/favicon-32x32.png?v=rMlmQWy2dM">
  <link rel="icon" type="image/png" sizes="16x16" href="assets/icon/favicon-16x16.png?v=rMlmQWy2dM">
  <link rel="manifest" href="assets/icon/site.webmanifest?v=rMlmQWy2dM">
  <link rel="mask-icon" href="assets/icon/safari-pinned-tab.svg?v=rMlmQWy2dM" color="#474e8f">
  <link rel="shortcut icon" href="assets/icon/favicon.ico?v=rMlmQWy2dM">

<script>
    window.location.replace("https://fractic.leesavage.co.uk/<?php echo $url; ?>");
</script>
 
</head>

<body>
</body>

</html>

