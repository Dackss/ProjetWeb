<?php

// Réponse JSON standard de l'API. Tous les endpoints passent par là,
// succès comme erreurs (juste avec un $statusCode différent).
function json_response($data, $statusCode = 200)
{
    header('Content-Type: application/json; charset=utf-8');
    // CORS ouvert : le frontend tourne sur un autre port en dev
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    http_response_code($statusCode);
    // UNESCAPED_UNICODE : garde les accents lisibles (pas de è) dans la réponse
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    // exit obligatoire : sans ça le script appelant continuerait après
    exit;
}
