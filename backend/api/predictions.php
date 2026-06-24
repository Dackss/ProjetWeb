<?php

require_once __DIR__ . '/../utils/response.php';

// Un type de prédiction = un script Python dans ia/scripts/
$scripts_par_type = [
    'cluster' => __DIR__ . '/../ia/scripts/predict_cluster.py',
    'implantation' => __DIR__ . '/../ia/scripts/predict_implantation.py',
    'puissance' => __DIR__ . '/../ia/scripts/predict_puissance.py',
];

$input = json_decode(file_get_contents('php://input'), true) ?? [];
$type = $input['type'] ?? null;

if ($type === null || !isset($scripts_par_type[$type])) {
    json_response(['error' => "type doit être l'un de : " . implode(', ', array_keys($scripts_par_type))], 400);
}

$script = $scripts_par_type[$type];
$features = $input['features'] ?? [];

// Les features sont passées au script Python en JSON, comme seul argument
// le script fait json.loads(sys.argv[1]) de son côté pour les récupérer
// escapeshellarg() protège contre l'injection de commande (échappe les guillemets/espaces)
$commande = 'python3 ' . escapeshellarg($script) . ' ' . escapeshellarg(json_encode($features));

// exec() lance la commande, récupère sa sortie ligne par ligne dans $sortie
// et son code de retour (0 = succès) dans $code_retour
exec($commande, $sortie, $code_retour);

if ($code_retour !== 0) {
    json_response(['error' => 'Le script de prédiction a échoué', 'sortie' => $sortie], 500);
}

$resultat = json_decode(implode("\n", $sortie), true);

if ($resultat === null) {
    json_response(['error' => 'Réponse du script de prédiction illisible', 'sortie' => $sortie], 500);
}

json_response(['data' => $resultat]);
