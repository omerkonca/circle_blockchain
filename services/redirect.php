<?php

require "./utilities/post.php";

header("Location: https://fitgelsin.com?payment=" . post(true)["paymesOrderId"]);