<?php

require "./utilities/post.php";
require "./utilities/database.php";

if (promotion_control(post()["code"]))
    echo json_encode(["status" => "success"]);
else
    echo json_encode(["status" => "error"]);