<?php

require "./utilities/post.php";
require "./utilities/database.php";
require_once "./utilities/configuration.php";

$order = post();

$id = "C" . create_company_order_request($order["id"], $order["province"], $order["district"], $order["days"], $order["time"], $order["promotion"], $order["amount"], $order["name"], $order["phone"], $order["email"], $order["address"], $order["allergy"], $order["disease"], $order["extra"], $order["taxNumber"], $order["companyName"], $order["taxAdministration"], $order["taxMethod"], $order["companyAddress"]);

if (!$id)
    echo json_encode(["status" => "error"]);
else {
    $price = calculate_price($order["id"], $order["promotion"], $order["days"], $order["amount"])["price"];
    $menu_name = get_menu_name($order["id"]);
    $hash = base64_encode(hash("sha512", ($id . $price . "TRY" . $menu_name . $order["name"] . $order["phone"] . $order["email"] . $order["address"] . PAYMES_SECRET_KEY)));

    $paymes = curl_init(PAYMES_URL);
    curl_setopt($paymes, CURLOPT_POST, 1);
    curl_setopt(
        $paymes,
        CURLOPT_POSTFIELDS,
        array(
            "publicKey" => PAYMES_PUBLIC_KEY,
            "orderId" => $id,
            "price" => $price,
            "currency" => "TRY",
            "productName" => $menu_name,
            "buyerName" => $order["name"],
            "buyerPhone" => $order["phone"],
            "buyerEmail" => $order["email"],
            "buyerAddress" => $order["address"],
            "hash" => $hash,
        )
    );
    curl_setopt($paymes, CURLOPT_RETURNTRANSFER, true);
    $result = curl_exec($paymes);

    if (curl_errno($paymes))
        echo json_encode(["status" => "error"]);
    else
        echo json_encode(["status" => "success", "result" => json_decode($result, true)]);

    curl_close($paymes);
}