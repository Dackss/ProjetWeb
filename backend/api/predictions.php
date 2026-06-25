<?php

require_once __DIR__ . '/../utils/response.php';

// Un type = un script Python dans ia/scripts/
// implantation/puissance renvoient aussi un "comparatif" : un résultat par algo entraîné
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

// cluster prédit toutes les stations d'un coup, les autres un seul point
if ($type === 'cluster') {
    handle_cluster($script);
} else {
    json_response(['data' => executer_script($script, $input['features'] ?? [])]);
}

function handle_cluster($script)
{
    require_once __DIR__ . '/../config/database.php';
    $pdo = get_db_connection();

    $stations = $pdo->query('SELECT id_station, nom_station, latitude, longitude FROM Station')->fetchAll();

    $points = array_map(fn($s) => ['latitude' => $s['latitude'], 'longitude' => $s['longitude']], $stations);

    // 40k+ stations en JSON, ça dépasse la taille max d'un argument shell et exec()
    // plante (fork échoue). On écrit dans un fichier temp et on passe son chemin à la place.
    $fichier_temp = tempnam(sys_get_temp_dir(), 'cluster_');
    file_put_contents($fichier_temp, json_encode($points));

    $resultat = executer_script($script, $fichier_temp);
    unlink($fichier_temp);

    $clusters = $resultat['clusters'] ?? [];

    // recolle par index : $clusters[$i] correspond à $points[$i], donc à $stations[$i]
    foreach ($stations as $i => &$station) {
        $station['cluster'] = $clusters[$i] ?? null;
    }

    json_response(['data' => $stations]);
}

// $payload string = chemin de fichier déjà prêt (cluster), sinon des features qu'on encode en JSON
function executer_script($script, $payload)
{
    $argument = is_string($payload) ? $payload : json_encode($payload);
    $commande = 'python3 ' . escapeshellarg($script) . ' ' . escapeshellarg($argument);

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

    return $resultat;
}
