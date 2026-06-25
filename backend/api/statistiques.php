<?php

require_once __DIR__ . '/../utils/response.php';
require_once __DIR__ . '/../config/database.php';

$departement = $_GET['departement'] ?? null;

if ($departement === null || $departement === '') {
    return json_response(['error' => 'Le paramètre departement est obligatoire'], 400);
}

$pdo = get_db_connection();

// Nombre de stations dans ce département
$sql_stations = "SELECT COUNT(*) AS nb_stations
    FROM Station s
    JOIN Commune c ON c.code_insee = s.code_insee
    WHERE c.code_departement = :departement";
$requete_stations = $pdo->prepare($sql_stations);
$requete_stations->execute(['departement' => $departement]);
// fetchColumn() : une seule valeur (ici le COUNT), pas besoin d'un tableau de lignes
$nb_stations = (int) $requete_stations->fetchColumn();

// Nombre de points de charge et puissance moyenne pour ce département
$sql_pdc = "SELECT COUNT(*) AS nb_pdc, AVG(pdc.puissance) AS puissance_moyenne
    FROM PointDeCharge pdc
    JOIN Station s ON s.id_station = pdc.id_station
    JOIN Commune c ON c.code_insee = s.code_insee
    WHERE c.code_departement = :departement";
$requete_pdc = $pdo->prepare($sql_pdc);
$requete_pdc->execute(['departement' => $departement]);
// fetch() : une seule ligne complète (ici COUNT et AVG sur la même ligne)
$resultat_pdc = $requete_pdc->fetch();
$nb_pdc = (int) $resultat_pdc['nb_pdc'];
$puissance_moyenne = $resultat_pdc['puissance_moyenne'] !== null
    ? round((float) $resultat_pdc['puissance_moyenne'], 2)
    : null;

// Répartition des stations par type d'implantation
$sql_implantation = "SELECT i.libelle, COUNT(*) AS nombre
    FROM Station s
    JOIN Commune c ON c.code_insee = s.code_insee
    JOIN Implantation i ON i.id_implantation = s.id_implantation
    WHERE c.code_departement = :departement
    GROUP BY i.libelle
    ORDER BY nombre DESC";
$requete_implantation = $pdo->prepare($sql_implantation);
$requete_implantation->execute(['departement' => $departement]);
$repartition_implantation = $requete_implantation->fetchAll();

// Répartition des stations par condition d'accès
$sql_acces = "SELECT ca.libelle, COUNT(*) AS nombre
    FROM Station s
    JOIN Commune c ON c.code_insee = s.code_insee
    JOIN ConditionAcces ca ON ca.id_condition_acces = s.id_condition_acces
    WHERE c.code_departement = :departement
    GROUP BY ca.libelle
    ORDER BY nombre DESC";
$requete_acces = $pdo->prepare($sql_acces);
$requete_acces->execute(['departement' => $departement]);
$repartition_condition_acces = $requete_acces->fetchAll();

json_response([
    'departement' => $departement,
    'nb_stations' => $nb_stations,
    'nb_pdc' => $nb_pdc,
    'puissance_moyenne' => $puissance_moyenne,
    'repartition_implantation' => $repartition_implantation,
    'repartition_condition_acces' => $repartition_condition_acces,
]);
