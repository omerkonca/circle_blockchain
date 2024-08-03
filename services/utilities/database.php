<?php

require "configuration.php";
require "blockchain.php";

function connect()
{
    $connection = mysqli_connect(DATABASE_HOST, DATABASE_USERNAME, DATABASE_PASSWORD, DATABASE);

    mysqli_set_charset($connection, "UTF8");

    if (mysqli_connect_errno() > 0)
        die("Hata");

    return $connection;
}

function register_email_control($email)
{
    $connection = connect();

    $query = "SELECT EXISTS(SELECT * FROM users WHERE email = ?)";
    $result = mysqli_prepare($connection, $query);
    mysqli_stmt_bind_param($result, "s", $email);
    mysqli_stmt_execute($result);
    mysqli_stmt_bind_result($result, $exists);
    mysqli_stmt_fetch($result);
    mysqli_stmt_close($result);

    mysqli_close($connection);

    return !$exists;
}

function register_user($name, $phone, $address, $password)
{
    $blockchain = createUser(API_KEY)["userId"];
    $session = acquireSessionToken($blockchain, API_KEY);
    $challenge = initializeUser($session["userToken"], API_KEY);

    $connection = connect();

    $query = "INSERT INTO users(email, name, phone, address, picture, salt, hash, blockchain) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    $result = mysqli_prepare($connection, $query);
    $picture = "-";
    $salt = bin2hex(random_bytes(16));
    $hash = md5($password . $salt);
    mysqli_stmt_bind_param($result, "ssssssss", $_SESSION["email"], $name, $phone, $address, $picture, $salt, $hash, $blockchain);
    mysqli_stmt_execute($result);
    mysqli_stmt_close($result);

    mysqli_close($connection);

    return [
        "appId" => APP_ID,
        "userToken" => $session["userToken"],
        "encryptionKey" => $session["encryptionKey"],
        "challengeId" => $challenge
    ];
}

function login_user($email, $password)
{
    $connection = connect();

    $query = "SELECT id, email, name, phone, address, picture, blockchain, wallet FROM users WHERE email = ? AND hash = MD5(CONCAT(?, salt))";
    $result = mysqli_prepare($connection, $query);
    mysqli_stmt_bind_param($result, "ss", $email, $password);
    mysqli_stmt_execute($result);
    mysqli_stmt_bind_result($result, $id, $email, $name, $phone, $address, $picture, $blockchain, $wallet);
    mysqli_stmt_fetch($result);
    mysqli_stmt_close($result);

    $orders = ["individual" => [], "company" => []];

    // $query = "SELECT menu_id, date, province_id, district_id, days, time, address FROM orders, order_requests WHERE request_id = order_requests.id AND email = ?";
    // $result = mysqli_prepare($connection, $query);
    // mysqli_stmt_bind_param($result, "s", $email);
    // mysqli_stmt_execute($result);
    // mysqli_stmt_bind_result($result, $menu_id, $date, $province_id, $district_id, $days, $time, $order_address);
    // while (mysqli_stmt_fetch($result)) {
    //     $orders["individual"][] = array(
    //         'menu_id' => $menu_id,
    //         'date' => $date,
    //         'province_id' => $province_id,
    //         'district_id' => $district_id,
    //         'days' => $days,
    //         'time' => $time,
    //         'address' => $order_address
    //     );
    // }
    // mysqli_stmt_close($result);

    // $query = "SELECT menu_id, date, province_id, district_id, days, time, address, allergy, disease, extra, company_name FROM company_orders, company_order_requests WHERE SUBSTRING(request_id, 2) = company_order_requests.id AND email = ?";
    // $result = mysqli_prepare($connection, $query);
    // mysqli_stmt_bind_param($result, "s", $email);
    // mysqli_stmt_execute($result);
    // mysqli_stmt_bind_result($result, $menu_id, $date, $province_id, $district_id, $days, $time, $order_address, $allergy, $disease, $extra, $company_name);
    // while (mysqli_stmt_fetch($result)) {
    //     $orders["company"][] = array(
    //         'menu_id' => $menu_id,
    //         'date' => $date,
    //         'province_id' => $province_id,
    //         'district_id' => $district_id,
    //         'days' => $days,
    //         'time' => $time,
    //         'address' => $order_address,
    //         'allergy' => $allergy,
    //         'disease' => $disease,
    //         'extra' => $extra,
    //         'company_name' => $company_name,
    //     );
    // }
    // mysqli_stmt_close($result);

    mysqli_close($connection);

    if (!empty($id)) {
        return ["email" => $email, "name" => $name, "phone" => $phone, "address" => $address, "picture" => $picture, "orders" => $orders, "blockchain" => $blockchain, "wallet" => $wallet];
    }
}

function get_menus()
{
    $connection = connect();

    $query = "SELECT id, name, picture, description, content, price, discount FROM menus";
    $result = mysqli_prepare($connection, $query);
    mysqli_stmt_execute($result);
    mysqli_stmt_bind_result($result, $id, $name, $picture, $description, $content, $price, $discount);

    while (mysqli_stmt_fetch($result)) {
        $menus[] = array(
            'id' => $id,
            'name' => $name,
            'picture' => $picture,
            'description' => $description,
            'content' => $content,
            'price' => $price,
            'discount' => $discount
        );
    }

    mysqli_stmt_close($result);

    mysqli_close($connection);

    return $menus;
}

function get_contents()
{
    $connection = connect();

    $query = "SELECT id, title, picture, description, content FROM contents";
    $result = mysqli_prepare($connection, $query);
    mysqli_stmt_execute($result);
    mysqli_stmt_bind_result($result, $id, $title, $picture, $description, $content);

    while (mysqli_stmt_fetch($result)) {
        $contents[] = array(
            'id' => $id,
            'title' => $title,
            'picture' => $picture,
            'description' => $description,
            'content' => $content
        );
    }

    mysqli_stmt_close($result);

    mysqli_close($connection);

    return $contents;
}

function get_locations()
{
    $connection = connect();

    $query = "SELECT id, name FROM provinces";
    $result = mysqli_prepare($connection, $query);
    mysqli_stmt_execute($result);
    mysqli_stmt_bind_result($result, $id, $name);
    while (mysqli_stmt_fetch($result)) {
        $provinces[] = array(
            'id' => $id,
            'name' => $name,
        );
    }
    mysqli_stmt_close($result);

    $query = "SELECT id, name, province_id FROM districts";
    $result = mysqli_prepare($connection, $query);
    mysqli_stmt_execute($result);
    mysqli_stmt_bind_result($result, $id, $name, $province_id);
    while (mysqli_stmt_fetch($result)) {
        $districts[] = array(
            'id' => $id,
            'name' => $name,
            'province_id' => $province_id
        );
    }
    mysqli_stmt_close($result);

    mysqli_close($connection);

    return ['provinces' => $provinces, 'districts' => $districts];
}

function promotion_control($code)
{
    $connection = connect();

    $query = "SELECT EXISTS(SELECT * FROM promotions WHERE code = ?)";
    $result = mysqli_prepare($connection, $query);
    mysqli_stmt_bind_param($result, "s", $code);
    mysqli_stmt_execute($result);
    mysqli_stmt_bind_result($result, $exists);
    mysqli_stmt_fetch($result);
    mysqli_stmt_close($result);

    mysqli_close($connection);

    return $exists;
}

function calculate_price($id, $promotion, $days, $amount)
{
    $connection = connect();

    $query = "SELECT price, discount FROM menus WHERE id = ?";
    $result = mysqli_prepare($connection, $query);
    mysqli_stmt_bind_param($result, "s", $id);
    mysqli_stmt_execute($result);
    mysqli_stmt_bind_result($result, $original, $discount);
    mysqli_stmt_fetch($result);
    mysqli_stmt_close($result);

    $query = "SELECT discount FROM promotions WHERE code = ?";
    $result = mysqli_prepare($connection, $query);
    mysqli_stmt_bind_param($result, "s", $promotion);
    mysqli_stmt_execute($result);
    mysqli_stmt_bind_result($result, $promotion_discount);
    mysqli_stmt_fetch($result);
    mysqli_stmt_close($result);

    mysqli_close($connection);

    if (empty($original)) {
        return ["status" => "error"];
    }

    $price = empty($promotion_discount) ? $original * ((100 - $discount) / 100) : $original * ((100 - ($discount + $promotion_discount)) / 100);

    switch ($days) {
        case 10:
            $price *= 0.96;
            break;
        case 20:
            $price *= 0.92;
            break;
        case 60:
            $price *= 0.866;
            break;
    }

    $price = ceil($price) * $days * $amount;

    return ["status" => "success", "original" => $original * $days * $amount, "price" => $price];

}

function get_menu_name($id)
{
    $connection = connect();

    $query = "SELECT name FROM menus WHERE id = ?";
    $result = mysqli_prepare($connection, $query);
    mysqli_stmt_bind_param($result, "s", $id);
    mysqli_stmt_execute($result);
    mysqli_stmt_bind_result($result, $name);
    mysqli_stmt_fetch($result);
    mysqli_stmt_close($result);

    mysqli_close($connection);

    return $name;
}

function process_balance($email, $price)
{
    $connection = connect();

    $query = "SELECT blockchain, wallet FROM users WHERE email = ?";
    $result = mysqli_prepare($connection, $query);
    mysqli_stmt_bind_param($result, "s", $email);
    mysqli_stmt_execute($result);
    mysqli_stmt_bind_result($result, $blockchain, $wallet);
    mysqli_stmt_fetch($result);
    mysqli_stmt_close($result);

    mysqli_close($connection);

    $balance = getUserBalance($wallet, API_KEY);

    if ($price > $balance)
        return false;
    else {
        $session = acquireSessionToken($blockchain, API_KEY);

        $tokenId = getWalletTokenId($wallet, API_KEY);

        $data = makeTransaction($price, $blockchain, $session["userToken"], $session["encryptionKey"], $wallet, $tokenId, DESTINATION_ADDRESS, API_KEY);

        return $data;
    }
}


function create_order($menu_id, $province_id, $district_id, $days, $time, $promotion, $amount, $name, $phone, $email, $address, $gender, $height, $weight, $allergy, $disease, $occupation, $extra, $price)
{
    $connection = connect();

    $query = "INSERT INTO orders(menu_id, date, province_id, district_id, days, time, promotion, amount, name, phone, email, address, gender, height, weight, allergy, disease, occupation, extra, price) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    $result = mysqli_prepare($connection, $query);
    date_default_timezone_set("Europe/Istanbul");
    $date = date('Y-m-d H:i:s');
    $allergy = empty($allergy) ? "-" : $allergy;
    $disease = empty($disease) ? "-" : $disease;
    $occupation = empty($occupation) ? "-" : $occupation;
    $extra = empty($extra) ? "-" : $extra;
    mysqli_stmt_bind_param($result, "ssssssssssssssssssss", $menu_id, $date, $province_id, $district_id, $days, $time, $promotion, $amount, $name, $phone, $email, $address, $gender, $height, $weight, $allergy, $disease, $occupation, $extra, $price);
    mysqli_stmt_execute($result);
    $id = mysqli_insert_id($connection);
    mysqli_stmt_close($result);

    mysqli_close($connection);

    return $id;
}

function get_user_wallet_id($email)
{
    $connection = connect();

    $query = "SELECT wallet FROM users WHERE email = ?";
    $result = mysqli_prepare($connection, $query);
    mysqli_stmt_bind_param($result, "s", $email);
    mysqli_stmt_execute($result);
    mysqli_stmt_bind_result($result, $wallet);
    mysqli_stmt_fetch($result);
    mysqli_stmt_close($result);

    mysqli_close($connection);

    return $wallet;
}

function process_order($email, $price, $date) // Use "date"!
{
    $connection = connect();

    $query = "UPDATE orders SET completed = TRUE WHERE email = ? AND price = ?";
    $result = mysqli_prepare($connection, $query);
    mysqli_stmt_bind_param($result, "ss", $email, $price);
    mysqli_stmt_execute($result);

    // $success = mysqli_stmt_affected_rows($result) > 0;

    mysqli_stmt_close($result);
    mysqli_close($connection);
}

function create_company_order_request($menu_id, $province_id, $district_id, $days, $time, $promotion, $amount, $name, $phone, $email, $address, $allergy, $disease, $extra, $tax_number, $company_name, $tax_administration, $tax_method, $company_address)
{
    if (!in_array($days, [5, 10, 20, 60]))
        return 0;

    $connection = connect();

    $query = "INSERT INTO company_order_requests(menu_id, date, province_id, district_id, days, time, promotion, amount, name, phone, email, address, allergy, disease, extra, tax_number, company_name, tax_administration, tax_method, company_address) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    $result = mysqli_prepare($connection, $query);
    date_default_timezone_set("Europe/Istanbul");
    $date = date('Y-m-d H:i:s');
    $allergy = empty($allergy) ? "-" : $allergy;
    $disease = empty($disease) ? "-" : $disease;
    $occupation = empty($occupation) ? "-" : $occupation;
    $extra = empty($extra) ? "-" : $extra;
    mysqli_stmt_bind_param($result, "ssssssssssssssssssss", $menu_id, $date, $province_id, $district_id, $days, $time, $promotion, $amount, $name, $phone, $email, $address, $allergy, $disease, $extra, $tax_number, $company_name, $tax_administration, $tax_method, $company_address);
    mysqli_stmt_execute($result);
    $id = mysqli_insert_id($connection);
    mysqli_stmt_close($result);

    mysqli_close($connection);

    return $id;
}



// function get_order($id)
// {
//     $connection = connect();

//     $table = ($id[0] == "C" ? "company_order_requests" : "order_requests");

//     $query = "SELECT menus.name, date, provinces.name, districts.name, days, time, promotion, amount, $table.name, phone, email, address FROM $table INNER JOIN menus ON $table.menu_id = menus.id INNER JOIN provinces ON $table.province_id = provinces.id INNER JOIN districts ON $table.district_id = districts.id WHERE $table.id = ?";
//     $result = mysqli_prepare($connection, $query);

//     if ($id[0] == "C")
//         $id = substr($id, 1);

//     mysqli_stmt_bind_param($result, "s", $id);
//     mysqli_stmt_execute($result);
//     mysqli_stmt_bind_result($result, $menu_name, $date, $province, $district, $days, $time, $promotion, $amount, $name, $phone, $email, $address);
//     mysqli_stmt_fetch($result);
//     mysqli_stmt_close($result);

//     mysqli_close($connection);

//     return [
//         "menu_name" => $menu_name,
//         "date" => $date,
//         "province" => $province,
//         "district" => $district,
//         "days" => $days,
//         "time" => $time,
//         "promotion" => $promotion,
//         "amount" => $amount,
//         "name" => $name,
//         "phone" => $phone,
//         "email" => $email,
//         "address" => $address,
//     ];
// }