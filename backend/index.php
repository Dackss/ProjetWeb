<?php

require_once __DIR__ . '/utils/response.php';

// Healthcheck : confirme juste que l'API répond
json_response(['status' => 'ok', 'service' => 'Backend API Ok']);
