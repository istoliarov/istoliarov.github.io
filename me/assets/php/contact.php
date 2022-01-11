<?php

if(isset($_POST['message'])){

	$name = $_POST['name'];
	$email = $_POST['email'];
	$message = $_POST['message'];
    
	
	$to      = 'marina23_new@mail.ru';
	$subject = 'Контактная форма сайта';

	$headers = 'From: '. $email . "\r\n" .
    'Reply-To: '. $email . "\r\n" .
    'X-Mailer: PHP/' . phpversion();

	$status = mail($to, $subject, $message, $headers);

	if($status == TRUE){	
		$res['sendstatus'] = 'done';
	
		//Edit your message here
		$res['message'] = 'Сообщение успешно отправлено!';
    }
	else{
		$res['message'] = 'Ошибка при отправке сообщения!';
	}
	
	
	echo json_encode($res);
}

?>