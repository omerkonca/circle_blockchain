<?php

require "./utilities/post.php";
require "./utilities/database.php";

$price = post();

if (empty($price["id"]))
    echo json_encode(["status" => "error"]);
else
    echo json_encode(calculate_price($price["id"], $price["promotion"], $price["days"], $price["amount"]));