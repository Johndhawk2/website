<?php

/*if(isset($POST['submit'])){*/
    $name = $_POST['name'];
    $subject = $_POST['subject'];
    $mailFrom = $_POST['email'];
    $message = $_POST['message'];

    $mailTo = "contact@johnhawk.tech";
    $headers = "From: ".$mailFrom;
    $txt = "You have received a message from ".$name.".\n\n".$message;

    mail($mailTo,$subject,$txt,$headers);
    header("Location: index.php?mailsend");
/*}*/
?>