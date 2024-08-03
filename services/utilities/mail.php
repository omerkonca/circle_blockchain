<?php

function send_mail($target, $subject, $mail)
{
    mail($target, $subject, $mail, [
        "From" => "Fit Gelsin <no-reply@fitgelsin.com>",
        "MIME-Version" => "1.0",
        "Content-Type" => "text/html; charset=UTF-8"
    ]);
}

function send_announcement_mail($target, $subject, $message, $name = "")
{
    $mail = file_get_contents("./utilities/mails/message.html");
    $mail = str_replace('${name}', empty($name) ? "" : " " . $name, $mail);
    $mail = str_replace('${message}', $message, $mail);

    send_mail($target, $subject, $mail);
}

function send_order_mail($target, $subject, $message, $order)
{
    $mail = file_get_contents("https://fitgelsin.com/services/utilities/mails/order.html");
    $mail = str_replace('${name}', empty($order["name"]) ? "" : " " . $order["name"], $mail);
    $mail = str_replace('${message}', $message, $mail);

    $order = "<tr><td style='text-align: right; font-weight: bold'>İsim:</td><td>{$order["name"]}</td></tr><tr><td style='text-align: right; font-weight: bold'>Telefon:</td><td>{$order["phone"]}</td></tr><tr><td style='text-align: right; font-weight: bold'>Menü:</td><td>{$order["menu_name"]}</td></tr><tr><td style='text-align: right; font-weight: bold'>Sipariş Tarihi:</td><td>{$order["date"]}</td></tr><tr><td style='text-align: right; font-weight: bold'>Gün Sayısı:</td><td>{$order["days"]}</td></tr><tr><td style='text-align: right; font-weight: bold'>Saat Aralığı:</td><td>{$order["time"]}</td></tr><tr><td style='text-align: right; font-weight: bold'>Adet:</td><td>{$order["amount"]}</td></tr><tr><td style='text-align: right; font-weight: bold'>İl:</td><td>{$order["province"]}</td></tr><tr><td style='text-align: right; font-weight: bold'>İlçe:</td><td>{$order["district"]}</td></tr><tr><td style='text-align: right; font-weight: bold'>Adres:</td><td>{$order["address"]}</td></tr>";

    $mail = str_replace('${order}', $order, $mail);

    send_mail($target, $subject, $mail);
}