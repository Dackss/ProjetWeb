<?php

require_once __DIR__ . '/../utils/response.php';
require_once __DIR__ . '/../config/database.php';

$pdo = get_db_connection();

// Jointure complète : une station avec toutes ses infos d'affichage
// (aménageur, opérateur, commune+département, implantation, condition d'accès)
$sql = "SELECT
        s.id_station, s.nom_station, s.adresse, s.longitude, s.latitude,
        s.horaires, s.date_service, s.code_postal,
        ca.libelle AS condition_acces,
        a.nom_amenageur,
        o.nom_operateur, o.enseigne,
        c.code_insee, c.nom_commune,
        d.code_departement, d.nom_departement,
        i.libelle AS implantation
    FROM Station s
    JOIN Amenageur a ON a.id_amenageur = s.id_amenageur
    JOIN Operateur o ON o.id_operateur = s.id_operateur
    JOIN Commune c ON c.code_insee = s.code_insee
    JOIN Departement d ON d.code_departement = c.code_departement
    JOIN Implantation i ON i.id_implantation = s.id_implantation
    JOIN ConditionAcces ca ON ca.id_condition_acces = s.id_condition_acces
    ORDER BY s.nom_station";

// query() exécute direct, sans placeholder : pas de valeur variable à protéger ici
// fetchAll() récupère toutes les lignes du résultat
$stations = $pdo->query($sql)->fetchAll();

json_response(['data' => $stations]);
