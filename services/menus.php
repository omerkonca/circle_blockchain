<?php

require "./utilities/database.php";

if ($_SERVER["REQUEST_METHOD"] != "GET")
    die("Hata");

echo json_encode(get_menus());