<?php

require "./utilities/post.php";
require "./utilities/database.php";

$login = post();

$information = login_user($login["email"], $login["password"]);

if (empty($information["email"])) {
    echo json_encode(["status" => "user_invalid"]);
} else {
    echo json_encode(["information" => $information, "status" => "success", "balance" => getUserBalance($information["wallet"], API_KEY)]);
}