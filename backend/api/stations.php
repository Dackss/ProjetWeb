<?php

require_once __DIR__ . '/../utils/response.php';
require_once __DIR__ . '/../config/database.php';

// TODO: jointure Amenageur/Operateur/Commune/Implantation
json_response(['status' => 'ok', 'endpoint' => 'stations']);
