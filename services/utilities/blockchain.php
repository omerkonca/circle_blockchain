<?php

function circle_get($url, $key)
{
    $curl = curl_init();

    curl_setopt_array(
        $curl,
        array(
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => array(
                "Content-Type: application/json",
                "Authorization: Bearer $key"
            ),
        )
    );

    $response = curl_exec($curl);

    if (curl_errno($curl)) {
        echo 'Error:' . curl_error($curl);
        curl_close($curl);
        return null;
    }

    curl_close($curl);
    return json_decode($response, true);
}

function circle_post($url, $data, $key, $headers = [])
{
    $curl = curl_init();

    $defaultHeaders = [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $key
    ];

    foreach ($headers as $header => $value) {
        $defaultHeaders[] = $header . ': ' . $value;
    }

    curl_setopt_array($curl, [
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_HTTPHEADER => $defaultHeaders,
        CURLOPT_POSTFIELDS => json_encode($data)
    ]);

    $response = curl_exec($curl);

    if (curl_errno($curl)) {
        echo 'Curl error: ' . curl_error($curl);
        curl_close($curl);
        return null;
    }

    curl_close($curl);
    return json_decode($response, true);
}

function uuid()
{
    return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex(random_bytes(16)), 4));
}

/* ==================================================================================================== */

function getAppId($key)
{
    return circle_get("https://api.circle.com/v1/w3s/config/entity", $key)['data']['appId'];
}

function createUser($key)
{
    $userId = uuid();

    $response = circle_post("https://api.circle.com/v1/w3s/users", ['userId' => $userId], $key);

    return [
        'userId' => $userId,
        'status' => $response['data']['status'] ?? null
    ];
}

function acquireSessionToken($userId, $key)
{
    $response = circle_post("https://api.circle.com/v1/w3s/users/token", ['userId' => $userId], $key);

    return $response['data'] ?? null;
}

function initializeUser($token, $key)
{
    $response = circle_post("https://api.circle.com/v1/w3s/user/initialize", [
        'idempotencyKey' => uuid(),
        'blockchains' => ['MATIC-AMOY']
    ], $key, [
        'X-User-Token' => $token
    ]);

    return $response['data']['challengeId'] ?? null;
}

function getUserBalance($walletId, $key)
{
    $balance = circle_get("https://api.circle.com/v1/w3s/wallets/" . $walletId . "/balances", $key);

    if (isset($balance["data"]["tokenBalances"][1]["amount"]))
        return $balance["data"]["tokenBalances"][1]["amount"];
    else
        return 0;
}

function getWalletTokenId($walletId, $key)
{
    return circle_get("https://api.circle.com/v1/w3s/wallets/" . $walletId . "/balances", $key)["data"]["tokenBalances"][1]["token"]["id"];
}

/* !!! IT DOES NOT WORK FOR USER CONTROLLED WALLETS !!! */

// function getUserWallet($userId, $key)
// {
//     $response = circle_get("https://api.circle.com/v1/w3s/walletSets", $key);

//     foreach ($response["data"]["walletSets"] as $walletSet) {
//         if ($userId == $walletSet["userId"]) {
//             return $walletSet["id"];
//         }
//     }
// }

function makeTransaction($price, $userId, $userToken, $encryptionKey, $walletId, $tokenId, $destinationAddress, $key)
{
    $idempotencyKey = uuid();

    $response = circle_post("https://api.circle.com/v1/w3s/user/transactions/transfer", [
        'idempotencyKey' => $idempotencyKey,
        'userId' => $userId,
        'destinationAddress' => $destinationAddress,
        'refId' => '',
        'amounts' => ["$price"],
        'feeLevel' => 'HIGH',
        'tokenId' => $tokenId,
        'walletId' => $walletId
    ], $key, [
        'X-User-Token' => $userToken
    ]);

    return [
        "appId" => APP_ID,
        'userToken' => $userToken,
        'encryptionKey' => $encryptionKey,
        'challengeId' => $response['data']['challengeId']
        // 'idempotencyKey' => $idempotencyKey,
    ];


    // return [
    //     "appId" => APP_ID,
    //     "userToken" => $session["userToken"],
    //     "encryptionKey" => $session["encryptionKey"],
    //     "challengeId" => $challenge
    // ];
}

function getWalletAddress($walletId)
{
    return circle_get("https://api.circle.com/v1/w3s/wallets/$walletId", API_KEY)["data"]["wallet"]["address"];
}

function getTransactionList()
{
    return circle_get("https://api.circle.com/v1/w3s/transactions?destinationAddress=0x7c5dae7f89c522faa3324aea7a3cf412a896d0cf", API_KEY)["data"]["transactions"];
}