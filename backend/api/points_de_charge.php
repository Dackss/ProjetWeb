<?php

require_once __DIR__ . '/../utils/response.php';
require_once __DIR__ . '/../config/database.php';

$method = $_SERVER['REQUEST_METHOD'];

// TODO: brancher les requêtes PDO par méthode (GET/POST/PUT/DELETE) sur PointDeCharge
json_response(['status' => 'ok', 'endpoint' => 'points_de_charge', 'method' => $method]);
