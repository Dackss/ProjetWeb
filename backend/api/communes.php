<?php

require_once __DIR__ . '/../utils/response.php';
require_once __DIR__ . '/../config/database.php';

// Autocomplétion : renvoie les communes dont le nom commence par ce qui est tapé
// utilisé par le champ de filtre commune du tableau des points de charge
$recherche = $_GET['q'] ?? '';

if ($recherche === '') {
    return json_response(['data' => []]);
}

$pdo = get_db_connection();

$sql = 'SELECT nom_commune FROM Commune
    WHERE nom_commune LIKE :prefixe
    ORDER BY nom_commune
    LIMIT 10';

$requete = $pdo->prepare($sql);
// bindValue() pour ajouter le '%' au préfixe avant d'envoyer la valeur
// (execute() ne permet pas de modifier la valeur, juste de la passer telle quelle)
$requete->bindValue('prefixe', $recherche . '%');
$requete->execute();

// Sans FETCH_COLUMN, fetchAll() renverrait [['nom_commune' => 'Bayonne'], ...]
// (un tableau par ligne). Avec FETCH_COLUMN : ['Bayonne', 'Bayeux', ...]
// directement, plus simple à utiliser côté frontend
$communes = $requete->fetchAll(PDO::FETCH_COLUMN);

json_response(['data' => $communes]);
