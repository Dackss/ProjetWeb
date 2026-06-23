<?php

require_once __DIR__ . '/../utils/response.php';

$input = json_decode(file_get_contents('php://input'), true) ?? [];

// TODO: appeler le script Python adéquat via exec() selon $input['type']
json_response(['status' => 'ok', 'endpoint' => 'predictions', 'received' => $input]);
