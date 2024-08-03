<?php

function post($raw = false)
{
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Headers: Content-Type");
    header('Content-Type: application/json');

    if ($_SERVER["REQUEST_METHOD"] != "POST")
        die("Hata");

    return $raw ? $_POST : json_decode(file_get_contents("php://input"), true);
}