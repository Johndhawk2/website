<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

require 'vendor/autoload.php';

$mail = new PHPMailer();

// Settings
$mail->IsSMTP();
$mail->CharSet = 'UTF-8';

$mail->Host       = "smtp.zoho.eu";						// SMTP server example
$mail->SMTPDebug  = 0;									// enables SMTP debug information (for testing)
$mail->SMTPAuth   = true;								// enable SMTP authentication
$mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;		// Enable TLS encryption; `PHPMailer::ENCRYPTION_SMTPS` encouraged
$mail->Port       = 587;								// TCP port to connect to, use 465 for `PHPMailer::ENCRYPTION_SMTPS` above
$mail->Username   = "sending@johnhawk.tech";			// SMTP account username example
$mail->Password   = "CRSKhqw6qm4s4m";					// SMTP account password example

//if(isset($POST['fSubmit'])){
$name = $_POST['fName'];
$email = $_POST['fEmail'];
$message = $_POST['fMessage'];
$header = "You received a message from ".$name;
$text = "You have received a message from ".$name.":\n".$email.".\n\n".$message;

//    mail($sendTo,$subject,$text,$header);
//   header("Location: index.html?mailsend");
//}

// Content
$mail->Subject = $header;
$mail->Body = $text;
$mail->addAddress('contact@johnhawk.tech');
$mail->setFrom('sending@johnhawk.tech');
$mail->send();
?>