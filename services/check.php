<?php

require "./utilities/database.php";

$address = getWalletAddress(get_user_wallet_id($_GET["email"]));

$flag = false;
foreach (getTransactionList() as $transaction) {
    if ($transaction["sourceAddress"] == $address && $transaction["amounts"][0] == $_GET["price"]) {

        $date = new DateTime($transaction["updateDate"], new DateTimeZone('UTC'));
        $date = $date->getTimestamp() * 1000;

        if (($date - $_GET["date"]) / (1000 * 60 * 60) < 12) { // 12 is for easying time zone check.
            $flag = true;
            echo json_encode(["status" => "success"]);

            process_order($_GET["email"], $_GET["price"], $_GET["date"]);
            break;
        }

    }
}

if (!$flag)
    echo json_encode(["status" => "error"]);


// $check = check($address, $_GET["price"], $_GET["date"]);

// if ($check) {

//     foreach (getTransactionList() as $transaction) {
//         if ($transaction["sourceAddress"] == $address && )
//         echo $transaction . "\n";
//     }

//     echo json_encode(["status" => "success"]);

// } else
//     