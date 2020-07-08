<?php

if(isset($POST['fSubmit'])){
    $name = $_POST['fName'];
    $email = $_POST['fEmail'];
    $message = $_POST['fMessage'];

    $sendTo = "contact@johnhawk.tech";
    $header = "From: ".$email;
    $subject = "Website contact form";
    $text = "You have received a message from ".$name.".\n\n".$message;

    mail($sendTo,$subject,$text,$header);
    header("Location: index.html?mailsend");
}