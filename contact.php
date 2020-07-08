<?php
// Import PHPMailer classes into the global namespace
// These must be at the top of your script, not inside a function
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

// Load Composer's autoloader
require 'vendor/autoload.php';

$mail = new PHPMailer();

//if(isset($POST['fSubmit'])){
    $name = $_POST['fName'];
    $email = $_POST['fEmail'];
    $message = $_POST['fMessage'];

    $sendTo = "contact@johnhawk.tech";
    $header = "From: ".$email;
    $subject = "Website contact form";
    $text = "You have received a message from ".$name.".\n\n".$message;

//    mail($sendTo,$subject,$text,$header);
//   header("Location: index.html?mailsend");
//}

// Settings
$mail->IsSMTP();
$mail->CharSet = 'UTF-8';

$mail->Host       = "smtp.zoho.eu"; // SMTP server example
$mail->SMTPDebug  = 1;                     // enables SMTP debug information (for testing)
$mail->SMTPAuth   = true;                  // enable SMTP authentication
$mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;         // Enable TLS encryption; `PHPMailer::ENCRYPTION_SMTPS` encouraged
$mail->Port       = 587;                                    // TCP port to connect to, use 465 for `PHPMailer::ENCRYPTION_SMTPS` above
$mail->Username   = "sending@johnhawk.tech"; // SMTP account username example
$mail->Password   = "CRSKhqw6qm4s4m";        // SMTP account password example

// Content
$mail->isHTML(true);                                  // Set email format to HTML
$mail->Subject = 'Here is the subject';
//$mail->Body    = 'This is the HTML message body <b>in bold!</b>';
$mail->Body = $message;
$mail->addAddress('contact@johnhawk.tech');
$mail->setFrom('sending@johnhawk.tech');
$mail->send();
?>