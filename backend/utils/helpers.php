<?php

require_once __DIR__ . '/response.php';

// Retrouve l'id d'une ligne de référence (Raccordement, AccessibilitePMR, TypeTarif...)
// à partir de son libelle. Renvoie null si le libelle est vide, lève une erreur s'il
// est renseigné mais introuvable en base.
function find_id_by_libelle($pdo, $table, $id_column, $libelle)
{
    if ($libelle === null || $libelle === '') {
        return null;
    }

    // prepare() compile la requête, execute() injecte $libelle dans le placeholder
    // :libelle (protège contre l'injection SQL, contrairement à $table/$id_column
    // qui sont interpolés directement car ils viennent du code, pas de l'utilisateur)
    $requete = $pdo->prepare("SELECT $id_column FROM $table WHERE libelle = :libelle");
    $requete->execute(['libelle' => $libelle]);
    // fetchColumn() récupère une seule valeur (la 1ère colonne de la 1ère ligne)
    // false si aucune ligne ne correspond
    $id = $requete->fetchColumn();

    if ($id === false) {
        return json_response(['error' => "Valeur inconnue pour $table : $libelle"], 400);
    }

    return $id;
}

// Lit le body JSON envoyé par le client (POST/PUT). Renvoie un tableau vide
// si le JSON est invalide ou si ce n'est pas un objet/tableau (ex: juste un nombre)
function read_json_body()
{
    $body = json_decode(file_get_contents('php://input'), true);
    return is_array($body) ? $body : [];
}

// Lit un champ booléen du body JSON (true/false) et le convertit en 0/1
// pour les colonnes TINYINT, avec une valeur par défaut si absent
function to_int($body, $champ, $defaut = 0)
{
    return isset($body[$champ]) ? (int) $body[$champ] : $defaut;
}
