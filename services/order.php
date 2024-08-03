<?php

require "./utilities/post.php";
require "./utilities/database.php";
require_once "./utilities/configuration.php";
require "./utilities/mail.php";

$order = post();

$menu_name = get_menu_name($order["id"]);
$price = calculate_price($order["id"], $order["promotion"], $order["days"], $order["amount"])["price"];

$data = process_balance($order["email"], $price);

if (!$data)
    echo json_encode(["status" => "error"]);
else {
    $id = create_order($order["id"], $order["province"], $order["district"], $order["days"], $order["time"], $order["promotion"], $order["amount"], $order["name"], $order["phone"], $order["email"], $order["address"], $order["gender"], $order["height"], $order["weight"], $order["allergy"], $order["disease"], $order["occupation"], $order["extra"], $price);

    $order["menu_name"] = $menu_name;
    $order["date"] = (new DateTime())->format("Y-m-d");

    send_order_mail($order["email"], "Fit Gelsin Sipariş", "Siparişiniz başarıyla alınmıştır, sipariş ile ilgili detaylı bilgileri aşağıdan görüntüleyebilirsiniz. Faturanız kayıtlı e-posta adresinize iletilecektir.", $order);
    send_order_mail("ekinaslant@gmail.com", "Fit Gelsin Sipariş", "Yeni Sipariş Takibi", $order);

    echo json_encode(["status" => "success", "data" => $data, "id" => $id]);
}

// $hash = base64_encode(hash("sha512", ($id . $price . "TRY" . $menu_name . $order["name"] . $order["phone"] . $order["email"] . $order["address"] . PAYMES_SECRET_KEY)));

// $paymes = curl_init(PAYMES_URL);
// curl_setopt($paymes, CURLOPT_POST, 1);
// curl_setopt(
//     $paymes,
//     CURLOPT_POSTFIELDS,
//     array(
//         "publicKey" => PAYMES_PUBLIC_KEY,
//         "orderId" => $id,
//         "price" => $price,
//         "currency" => "TRY",
//         "productName" => $menu_name,
//         "buyerName" => $order["name"],
//         "buyerPhone" => $order["phone"],
//         "buyerEmail" => $order["email"],
//         "buyerAddress" => $order["address"],
//         "hash" => $hash,
//     )
// );
// curl_setopt($paymes, CURLOPT_RETURNTRANSFER, true);
// $result = curl_exec($paymes);

// if (curl_errno($paymes))
//     echo json_encode(["status" => "error"]);
// else
//     echo json_encode(["status" => "success", "result" => json_decode($result, true)]);

// curl_close($paymes);