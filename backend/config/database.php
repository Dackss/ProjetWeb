<?php

require_once __DIR__ . '/../utils/response.php';

// Ouvre une connexion PDO vers MariaDB. Les identifiants viennent des variables
// d'environnement injectées par docker-compose.yml, avec un fallback local
// (utile si le script tourne un jour hors Docker).
function get_db_connection()
{
    $host = getenv('DB_HOST') ?: 'localhost';
    $dbname = getenv('DB_NAME') ?: 'irve';
    $user = getenv('DB_USER') ?: 'irve';
    $password = getenv('DB_PASSWORD') ?: '';

    try {
        $dsn = "mysql:host={$host};dbname={$dbname};charset=utf8mb4";
        // ATTR_ERRMODE EXCEPTION : une requête en erreur lève une PDOException
        // au lieu de juste renvoyer false silencieusement
        // FETCH_ASSOC : les résultats arrivent en tableaux associatifs (colonne => valeur)
        return new PDO($dsn, $user, $password, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);
    } catch (PDOException $e) {
        return json_response(['error' => 'Connexion base de données échouée', 'message' => $e->getMessage()], 500);
    }
}
