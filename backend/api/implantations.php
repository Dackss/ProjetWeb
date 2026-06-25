<?php

require_once __DIR__ . '/../utils/response.php';
require_once __DIR__ . '/../config/database.php';

// Liste fixe des types d'implantation (5 valeurs), pour le menu déroulant
// du filtre implantation du tableau des points de charge
$pdo = get_db_connection();

$sql = 'SELECT libelle FROM Implantation ORDER BY libelle';
// Sans FETCH_COLUMN, fetchAll() renverrait [['libelle' => 'Voirie'], ...]
// (un tableau par ligne). Avec FETCH_COLUMN : ['Voirie', 'Parking public', ...]
// directement, plus simple à utiliser côté frontend
$implantations = $pdo->query($sql)->fetchAll(PDO::FETCH_COLUMN);

json_response(['data' => $implantations]);
