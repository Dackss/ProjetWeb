<?php

require_once __DIR__ . '/../utils/response.php';
require_once __DIR__ . '/../config/database.php';

// Liste des départements, pour le menu déroulant de la page Statistiques
$pdo = get_db_connection();

$sql = 'SELECT code_departement, nom_departement FROM Departement ORDER BY code_departement';
$departements = $pdo->query($sql)->fetchAll();

json_response(['data' => $departements]);
