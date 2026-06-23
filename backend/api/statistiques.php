<?php

require_once __DIR__ . '/../utils/response.php';
require_once __DIR__ . '/../config/database.php';

$departement = $_GET['departement'] ?? null;

// TODO: agréger les stats par département
json_response(['status' => 'ok', 'endpoint' => 'statistiques', 'departement' => $departement]);
