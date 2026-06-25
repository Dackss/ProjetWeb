<?php

require_once __DIR__ . '/../utils/response.php';
require_once __DIR__ . '/../utils/helpers.php';
require_once __DIR__ . '/../config/database.php';

// Jointure complète : un point de charge avec sa station, sa tarification,
// son raccordement, son accessibilité PMR, et la liste de ses types de prise.
// Partagée entre la liste paginée et la fiche d'un seul point de charge.
const SELECT_PDC = "SELECT
        pdc.id_pdc, pdc.puissance, pdc.restriction_gabarit, pdc.deux_roues,
        pdc.cable_t2_attache, pdc.reservation,
        s.id_station, s.nom_station, s.adresse, s.latitude, s.longitude,
        i.libelle AS implantation,
        ca.libelle AS condition_acces,
        c.nom_commune, d.code_departement, d.nom_departement,
        r.libelle AS raccordement,
        pmr.libelle AS accessibilite_pmr,
        o.nom_operateur, o.enseigne,
        nbp.nb_pdc,
        tt.libelle AS type_tarif, t.prix_kwh_norm, t.prix_min_norm, t.gratuit,
        t.paiement_acte, t.paiement_cb, t.paiement_autre,
        GROUP_CONCAT(DISTINCT tp.libelle) AS types_prise
    FROM PointDeCharge pdc
    JOIN Station s ON s.id_station = pdc.id_station
    JOIN Implantation i ON i.id_implantation = s.id_implantation
    JOIN ConditionAcces ca ON ca.id_condition_acces = s.id_condition_acces
    JOIN Commune c ON c.code_insee = s.code_insee
    JOIN Departement d ON d.code_departement = c.code_departement
    JOIN Operateur o ON o.id_operateur = s.id_operateur
    LEFT JOIN Raccordement r ON r.id_raccordement = pdc.id_raccordement
    LEFT JOIN AccessibilitePMR pmr ON pmr.id_pmr = pdc.id_pmr
    LEFT JOIN Tarification t ON t.id_tarification = pdc.id_tarification
    LEFT JOIN TypeTarif tt ON tt.id_type_tarif = t.id_type_tarif
    LEFT JOIN possede po ON po.id_pdc = pdc.id_pdc
    LEFT JOIN TypePrise tp ON tp.id_type_prise = po.id_type_prise
    -- nb_pdc : nombre de points de charge sur la station. Sous-requête à part parce
    -- que le GROUP BY pdc.id_pdc plus bas compte les pdc un par un, un COUNT(*) direct
    -- donnerait toujours 1
    LEFT JOIN (SELECT id_station, COUNT(*) AS nb_pdc FROM PointDeCharge GROUP BY id_station) nbp
        ON nbp.id_station = s.id_station";

switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        handle_get();
        break;
    case 'POST':
        handle_post();
        break;
    case 'PUT':
        handle_put();
        break;
    case 'DELETE':
        handle_delete();
        break;
    default:
        return json_response(['error' => 'Méthode non supportée'], 405);
}

// Construit le tableau de paramètres pour Tarification, commun à la création
// et à la modification d'un point de charge
function tarif_params($body)
{
    return [
        'prix_kwh_norm' => $body['prix_kwh_norm'] ?? null,
        'prix_min_norm' => $body['prix_min_norm'] ?? null,
        'gratuit' => to_int($body, 'gratuit', null),
        'paiement_acte' => to_int($body, 'paiement_acte'),
        'paiement_cb' => to_int($body, 'paiement_cb'),
        'paiement_autre' => to_int($body, 'paiement_autre'),
    ];
}

function handle_get()
{
    $pdo = get_db_connection();

    // REST : un id en query string identifie UN point de charge précis,
    // son absence renvoie la liste paginée
    $id = $_GET['id'] ?? null;

    if ($id !== null && $id !== '') {
        handle_get_single($pdo, $id);
        return;
    }

    handle_get_list($pdo);
}

function handle_get_single($pdo, $id)
{
    $sql = SELECT_PDC . ' WHERE pdc.id_pdc = :id GROUP BY pdc.id_pdc';

    $requete = $pdo->prepare($sql);
    $requete->execute(['id' => $id]);
    // fetch() : une seule ligne (id_pdc est la clé primaire, donc 0 ou 1 résultat)
    // false si aucune ligne ne correspond
    $point_de_charge = $requete->fetch();

    if ($point_de_charge === false) {
        return json_response(['error' => 'Point de charge introuvable'], 404);
    }

    return json_response(['data' => $point_de_charge]);
}

function handle_get_list($pdo)
{
    // Pagination : page commence à 1, limite bornée pour éviter qu'on demande
    // toute la table en une fois
    $page = max(1, (int) ($_GET['page'] ?? 1));
    $limit = (int) ($_GET['limit'] ?? 50);
    if ($limit < 1) {
        $limit = 1;
    }
    if ($limit > 200) {
        $limit = 200;
    }
    $offset = ($page - 1) * $limit;

    // Filtres optionnels : commune (autocomplete) et implantation (dropdown)
    $commune = $_GET['commune'] ?? null;
    $implantation = $_GET['implantation'] ?? null;

    $conditions = [];
    $params = [];

    if ($commune !== null && $commune !== '') {
        $conditions[] = 'c.nom_commune = :commune';
        $params['commune'] = $commune;
    }

    if ($implantation !== null && $implantation !== '') {
        $conditions[] = 'i.libelle = :implantation';
        $params['implantation'] = $implantation;
    }

    $where = count($conditions) > 0 ? 'WHERE ' . implode(' AND ', $conditions) : '';

    // On compte le nombre total de points de charge correspondant aux filtres,
    // pour que le frontend sache combien de pages afficher
    $sql_total = "SELECT COUNT(*) FROM PointDeCharge pdc
        JOIN Station s ON s.id_station = pdc.id_station
        JOIN Implantation i ON i.id_implantation = s.id_implantation
        JOIN Commune c ON c.code_insee = s.code_insee
        $where";

    $requete_total = $pdo->prepare($sql_total);
    $requete_total->execute($params);
    // fetchColumn() : une seule valeur (le COUNT), pas besoin d'un tableau de lignes
    $total = (int) $requete_total->fetchColumn();

    // $limit et $offset sont déjà des entiers (castés plus haut), pas besoin
    // de placeholder PDO pour eux : on peut les coller direct dans le SQL
    $sql = SELECT_PDC . "
        $where
        GROUP BY pdc.id_pdc
        ORDER BY pdc.id_pdc
        LIMIT $limit OFFSET $offset";

    $requete = $pdo->prepare($sql);
    $requete->execute($params);
    // fetchAll() : toutes les lignes du résultat (la page demandée, grâce au LIMIT)
    $points_de_charge = $requete->fetchAll();

    return json_response([
        'data' => $points_de_charge,
        'page' => $page,
        'limit' => $limit,
        'total' => $total,
    ]);
}

function handle_post()
{
    $pdo = get_db_connection();
    $body = read_json_body();

    // Champs obligatoires pour créer un point de charge
    foreach (['id_pdc', 'id_station', 'puissance', 'type_tarif'] as $champ) {
        if (!isset($body[$champ]) || $body[$champ] === '') {
            return json_response(['error' => "Champ obligatoire manquant : $champ"], 400);
        }
    }

    $id_type_tarif = find_id_by_libelle($pdo, 'TypeTarif', 'id_type_tarif', $body['type_tarif']);
    $id_raccordement = find_id_by_libelle($pdo, 'Raccordement', 'id_raccordement', $body['raccordement'] ?? null);
    $id_pmr = find_id_by_libelle($pdo, 'AccessibilitePMR', 'id_pmr', $body['pmr'] ?? null);

    // beginTransaction() : les 3 écritures qui suivent (Tarification, PointDeCharge,
    // possede) doivent toutes réussir ensemble, sinon la DB se retrouve à moitié
    // écrite (ex: un PointDeCharge sans Tarification valide)
    $pdo->beginTransaction();
    try {
        // La Tarification est créée avant le PointDeCharge : c'est PointDeCharge
        // qui porte la clé étrangère id_tarification
        $requete_tarif = $pdo->prepare('INSERT INTO Tarification
            (id_type_tarif, prix_kwh_norm, prix_min_norm, gratuit, paiement_acte, paiement_cb, paiement_autre)
            VALUES (:id_type_tarif, :prix_kwh_norm, :prix_min_norm, :gratuit, :paiement_acte, :paiement_cb, :paiement_autre)');
        $requete_tarif->execute(array_merge(tarif_params($body), ['id_type_tarif' => $id_type_tarif]));
        // lastInsertId() : l'id auto-incrémenté que MariaDB vient de générer
        // pour la Tarification qu'on vient d'insérer
        $id_tarification = $pdo->lastInsertId();

        $requete_pdc = $pdo->prepare('INSERT INTO PointDeCharge
            (id_pdc, puissance, restriction_gabarit, deux_roues, cable_t2_attache, reservation, id_station, id_raccordement, id_pmr, id_tarification)
            VALUES (:id_pdc, :puissance, :restriction_gabarit, :deux_roues, :cable_t2_attache, :reservation, :id_station, :id_raccordement, :id_pmr, :id_tarification)');
        $requete_pdc->execute([
            'id_pdc' => $body['id_pdc'],
            'puissance' => $body['puissance'],
            'restriction_gabarit' => $body['restriction_gabarit'] ?? null,
            'deux_roues' => to_int($body, 'deux_roues'),
            'cable_t2_attache' => to_int($body, 'cable_t2_attache', null),
            'reservation' => to_int($body, 'reservation'),
            'id_station' => $body['id_station'],
            'id_raccordement' => $id_raccordement,
            'id_pmr' => $id_pmr,
            'id_tarification' => $id_tarification,
        ]);

        inserer_types_prise($pdo, $body['id_pdc'], $body['types_prise'] ?? []);

        // commit() valide les 3 écritures d'un coup, rien n'était définitif avant
        $pdo->commit();
    } catch (PDOException $e) {
        // rollBack() annule tout ce qui a été fait depuis beginTransaction()
        // (ex: la Tarification déjà créée) si une étape suivante échoue
        $pdo->rollBack();
        return json_response(['error' => 'Création impossible', 'message' => $e->getMessage()], 400);
    }

    return json_response(['data' => ['id_pdc' => $body['id_pdc']]], 201);
}

function handle_put()
{
    $pdo = get_db_connection();
    $body = read_json_body();

    // REST : l'id de la ressource à modifier vient de la query string,
    // le body ne contient que les champs à mettre à jour
    $id_pdc = $_GET['id'] ?? null;

    if ($id_pdc === null || $id_pdc === '') {
        return json_response(['error' => 'Paramètre obligatoire manquant : id'], 400);
    }

    $requete_existe = $pdo->prepare('SELECT id_tarification FROM PointDeCharge WHERE id_pdc = :id_pdc');
    $requete_existe->execute(['id_pdc' => $id_pdc]);
    $id_tarification = $requete_existe->fetchColumn();

    if ($id_tarification === false) {
        return json_response(['error' => 'Point de charge introuvable'], 404);
    }

    $id_raccordement = find_id_by_libelle($pdo, 'Raccordement', 'id_raccordement', $body['raccordement'] ?? null);
    $id_pmr = find_id_by_libelle($pdo, 'AccessibilitePMR', 'id_pmr', $body['pmr'] ?? null);
    $id_type_tarif = isset($body['type_tarif'])
        ? find_id_by_libelle($pdo, 'TypeTarif', 'id_type_tarif', $body['type_tarif'])
        : null;

    $pdo->beginTransaction();
    try {
        $requete_pdc = $pdo->prepare('UPDATE PointDeCharge SET
            puissance = :puissance,
            restriction_gabarit = :restriction_gabarit,
            deux_roues = :deux_roues,
            cable_t2_attache = :cable_t2_attache,
            reservation = :reservation,
            id_raccordement = :id_raccordement,
            id_pmr = :id_pmr
            WHERE id_pdc = :id_pdc');
        $requete_pdc->execute([
            'puissance' => $body['puissance'],
            'restriction_gabarit' => $body['restriction_gabarit'] ?? null,
            'deux_roues' => to_int($body, 'deux_roues'),
            'cable_t2_attache' => to_int($body, 'cable_t2_attache', null),
            'reservation' => to_int($body, 'reservation'),
            'id_raccordement' => $id_raccordement,
            'id_pmr' => $id_pmr,
            'id_pdc' => $id_pdc,
        ]);

        if ($id_type_tarif !== null) {
            $requete_tarif = $pdo->prepare('UPDATE Tarification SET
                id_type_tarif = :id_type_tarif,
                prix_kwh_norm = :prix_kwh_norm,
                prix_min_norm = :prix_min_norm,
                gratuit = :gratuit,
                paiement_acte = :paiement_acte,
                paiement_cb = :paiement_cb,
                paiement_autre = :paiement_autre
                WHERE id_tarification = :id_tarification');
            $requete_tarif->execute(array_merge(tarif_params($body), [
                'id_type_tarif' => $id_type_tarif,
                'id_tarification' => $id_tarification,
            ]));
        }

        // Si la liste des types de prise est fournie, on remplace entièrement
        // les anciennes lignes possede par les nouvelles
        if (isset($body['types_prise'])) {
            $requete_suppr = $pdo->prepare('DELETE FROM possede WHERE id_pdc = :id_pdc');
            $requete_suppr->execute(['id_pdc' => $id_pdc]);
            inserer_types_prise($pdo, $id_pdc, $body['types_prise']);
        }

        $pdo->commit();
    } catch (PDOException $e) {
        $pdo->rollBack();
        return json_response(['error' => 'Modification impossible', 'message' => $e->getMessage()], 400);
    }

    return json_response(['data' => ['id_pdc' => $id_pdc]]);
}

function handle_delete()
{
    $pdo = get_db_connection();

    // L'id est passé en query string (?id=...), pas dans un body :
    // une suppression n'a pas besoin de transporter de données
    $id_pdc = $_GET['id'] ?? null;

    if ($id_pdc === null || $id_pdc === '') {
        return json_response(['error' => 'Paramètre obligatoire manquant : id'], 400);
    }

    $requete_existe = $pdo->prepare('SELECT id_tarification FROM PointDeCharge WHERE id_pdc = :id_pdc');
    $requete_existe->execute(['id_pdc' => $id_pdc]);
    $id_tarification = $requete_existe->fetchColumn();

    if ($id_tarification === false) {
        return json_response(['error' => 'Point de charge introuvable'], 404);
    }

    $pdo->beginTransaction();
    try {
        // Ordre imposé par les clés étrangères : possede puis PointDeCharge puis Tarification
        $pdo->prepare('DELETE FROM possede WHERE id_pdc = :id_pdc')->execute(['id_pdc' => $id_pdc]);
        $pdo->prepare('DELETE FROM PointDeCharge WHERE id_pdc = :id_pdc')->execute(['id_pdc' => $id_pdc]);
        $pdo->prepare('DELETE FROM Tarification WHERE id_tarification = :id_tarification')
            ->execute(['id_tarification' => $id_tarification]);

        $pdo->commit();
    } catch (PDOException $e) {
        $pdo->rollBack();
        return json_response(['error' => 'Suppression impossible', 'message' => $e->getMessage()], 400);
    }

    return json_response(['data' => ['id_pdc' => $id_pdc]]);
}

// Insère les liaisons possede pour une liste de libellés de type de prise
// (ex: ['Type 2', 'Combo CCS']) sur un point de charge donné
function inserer_types_prise($pdo, $id_pdc, $libelles_types_prise)
{
    foreach ($libelles_types_prise as $libelle) {
        $id_type_prise = find_id_by_libelle($pdo, 'TypePrise', 'id_type_prise', $libelle);
        $pdo->prepare('INSERT INTO possede (id_type_prise, id_pdc) VALUES (:id_type_prise, :id_pdc)')
            ->execute(['id_type_prise' => $id_type_prise, 'id_pdc' => $id_pdc]);
    }
}
