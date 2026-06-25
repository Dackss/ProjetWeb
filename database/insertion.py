import csv
import os
import sys

import pymysql

# Chemins des fichiers CSV utilisés par le script
CSV_PATH = os.path.join(os.path.dirname(__file__), 'export_IA.csv')
DEPARTEMENTS_PATH = os.path.join(os.path.dirname(__file__), 'departements-france.csv')
COMMUNES_PATH = os.path.join(os.path.dirname(__file__), 'commune_2026.csv')

# Colonnes du CSV qui indiquent la présence d'un type de prise (TRUE/FALSE)
# associées au libellé qu'on insère en base
TYPE_PRISE = {
    'prise_ef': 'EF',
    'prise_type2': 'Type 2',
    'prise_ccs': 'Combo CCS',
    'prise_chademo': 'CHAdeMO',
    'prise_autre': 'Autre',
}


def load_departements():
    # Charge la liste des départements français (code + nom) depuis le CSV de référence
    departements = {}
    with open(DEPARTEMENTS_PATH, newline='', encoding='utf-8') as fichier:
        # DictReader lit chaque ligne du CSV sous forme de dictionnaire colonne -> valeur
        lecteur = csv.DictReader(fichier)
        for ligne in lecteur:
            code = ligne['code_departement']
            nom = ligne['nom_departement']
            departements[code] = nom
    return departements


def load_commune_departements():
    # Construit la correspondance code_insee -> code_departement
    # On garde seulement les lignes de type COM (commune normale) et ARM
    # (arrondissement de Paris/Lyon/Marseille).
    # Les lignes COMD (commune déléguée) ont le même code_insee
    # mais leurs colonnes sont vides, donc on les ignore.
    correspondance = {}
    with open(COMMUNES_PATH, newline='', encoding='utf-8') as fichier:
        lecteur = csv.DictReader(fichier)
        for ligne in lecteur:
            type_commune = ligne['TYPECOM']
            if type_commune == 'COM' or type_commune == 'ARM':
                code_insee = ligne['COM']
                code_departement = ligne['DEP']
                correspondance[code_insee] = code_departement
    return correspondance


def na(valeur):
    # Le CSV utilise '' ou 'NA' pour une valeur manquante
    # MariaDB attend None (NULL) pour ces cas-là
    if valeur is None:
        return None
    if valeur == '':
        return None
    if valeur == 'NA':
        return None
    return valeur


def to_bool(valeur, valeur_par_defaut=None):
    # Le CSV écrit les booléens en texte ('TRUE' / 'FALSE')
    # Les colonnes TINYINT(1) de la base attendent 1 ou 0
    if valeur == 'TRUE':
        return 1
    if valeur == 'FALSE':
        return 0
    return valeur_par_defaut


def to_float(valeur):
    # Convertit un nombre du CSV en float, ou None si la valeur est vide/NA
    valeur = na(valeur)
    if valeur is None:
        return None
    return float(valeur)


def amenageur_key(ligne):
    # Identifie un aménageur par son siren, ou par son nom si le siren est absent
    # (certaines lignes du CSV n'ont pas de siren renseigné)
    siren = na(ligne['siren_amenageur'])
    if siren is not None:
        return siren
    return ('nom', ligne['nom_amenageur'])


def insert_libelle_table(curseur, table, libelles):
    # Insère chaque libellé distinct dans une table de référence à 2 colonnes
    # (id auto-incrémenté + libelle) et renvoie {libelle: id} pour s'en servir ensuite
    requete = f'INSERT INTO {table} (libelle) VALUES (%s)'
    ids = {}
    for libelle in libelles:
        # execute() envoie la requête à MariaDB
        # le %s est remplacé par la valeur du tuple, ça protège contre l'injection SQL
        curseur.execute(requete, (libelle,))
        # lastrowid donne l'id auto-incrémenté que MariaDB vient de générer pour cet INSERT
        ids[libelle] = curseur.lastrowid
    return ids


def connect():
    # pymysql.connect() ouvre la connexion réseau vers le serveur MariaDB
    # les identifiants viennent des variables d'environnement définies dans docker-compose.yml
    # autocommit=False : aucune écriture n'est définitive tant qu'on n'appelle pas commit() nous-mêmes
    return pymysql.connect(
        host=os.environ['DB_HOST'],
        user=os.environ['DB_USER'],
        password=os.environ['DB_PASSWORD'],
        database=os.environ['DB_NAME'],
        charset='utf8mb4',
        autocommit=False,
    )


def load_ref_tables(connexion, lignes, departements, commune_departements):
    # Première passe sur tout le CSV : on repère les valeurs distinctes de chaque
    # table de référence, pour ne pas insérer 100 fois le même opérateur ou la même commune
    amenageurs_vus = {}
    operateurs_vus = {}
    communes_vues = {}
    implantations_vues = set()
    pmr_vus = set()
    raccordements_vus = set()
    types_tarif_vus = set()
    conditions_acces_vues = set()
    departements_vus = set()

    for ligne in lignes:
        # Aménageur : on garde le premier nom/contact rencontré pour chaque clé
        cle_amenageur = amenageur_key(ligne)
        if cle_amenageur not in amenageurs_vus:
            amenageurs_vus[cle_amenageur] = (
                na(ligne['siren_amenageur']),
                ligne['nom_amenageur'],
                ligne['contact_amenageur'],
            )

        # Opérateur : identifié par le couple (code pays, code opérateur)
        cle_operateur = (ligne['code_pays_operateur'], ligne['code_operateur'])
        if cle_operateur not in operateurs_vus:
            operateurs_vus[cle_operateur] = (
                ligne['operateur'],
                ligne['enseigne'],
                ligne['contact_operateur'],
            )

        # Commune et département associé (déduit du fichier commune_2026.csv)
        code_insee = ligne['code_insee']
        if code_insee not in communes_vues:
            communes_vues[code_insee] = ligne['commune']
        departements_vus.add(commune_departements[code_insee])

        # Tables de référence simples : on stocke juste le libellé
        implantations_vues.add(ligne['implantation'])
        pmr_vus.add(ligne['pmr'])
        types_tarif_vus.add(ligne['type_tarif'])
        conditions_acces_vues.add(ligne['condition_acces'])

        # Le raccordement peut être vide (NA) dans le CSV
        # on ne le garde que s'il est renseigné
        if na(ligne['raccordement']) is not None:
            raccordements_vus.add(ligne['raccordement'])

    # cursor() ouvre un curseur : l'objet qui sert à envoyer des requêtes SQL
    # et à récupérer leurs résultats
    curseur = connexion.cursor()

    # Departement doit être inséré avant Commune
    # Commune a une clé étrangère vers Departement, l'ordre compte
    for code in departements_vus:
        nom_departement = departements[code]
        curseur.execute(
            'INSERT INTO Departement (code_departement, nom_departement) VALUES (%s, %s)',
            (code, nom_departement),
        )

    amenageur_ids = {}
    for cle, (siren, nom, contact) in amenageurs_vus.items():
        curseur.execute(
            'INSERT INTO Amenageur (nom_amenageur, siren_amenageur, contact_amenageur) VALUES (%s, %s, %s)',
            (nom, siren, na(contact)),
        )
        amenageur_ids[cle] = curseur.lastrowid

    operateur_ids = {}
    for (pays, code), (nom, enseigne, contact) in operateurs_vus.items():
        curseur.execute(
            'INSERT INTO Operateur (code_pays_operateur, code_operateur, nom_operateur, enseigne, contact_operateur) '
            'VALUES (%s, %s, %s, %s, %s)',
            (pays, code, nom, na(enseigne), na(contact)),
        )
        operateur_ids[(pays, code)] = curseur.lastrowid

    for code_insee, nom_commune in communes_vues.items():
        curseur.execute(
            'INSERT INTO Commune (code_insee, nom_commune, code_departement) VALUES (%s, %s, %s)',
            (code_insee, nom_commune, commune_departements[code_insee]),
        )

    implantation_ids = insert_libelle_table(curseur, 'Implantation', implantations_vues)
    pmr_ids = insert_libelle_table(curseur, 'AccessibilitePMR', pmr_vus)
    raccordement_ids = insert_libelle_table(curseur, 'Raccordement', raccordements_vus)
    type_prise_ids = insert_libelle_table(curseur, 'TypePrise', TYPE_PRISE.values())
    type_tarif_ids = insert_libelle_table(curseur, 'TypeTarif', types_tarif_vus)
    condition_acces_ids = insert_libelle_table(curseur, 'ConditionAcces', conditions_acces_vues)

    # close() libère le curseur, on n'en a plus besoin dans cette fonction
    curseur.close()

    # On renvoie tous les dictionnaires id -> pour faire les clés étrangères
    # dans insert_main_tables
    return {
        'amenageur': amenageur_ids,
        'operateur': operateur_ids,
        'implantation': implantation_ids,
        'pmr': pmr_ids,
        'raccordement': raccordement_ids,
        'type_prise': type_prise_ids,
        'type_tarif': type_tarif_ids,
        'condition_acces': condition_acces_ids,
    }


def insert_main_tables(connexion, lignes, caches):
    # Insère les lignes principales : une Station par station, un PointDeCharge
    # et une Tarification par ligne du CSV, plus les liaisons possede
    curseur = connexion.cursor()
    stations_inserees = set()

    station_sql = (
        'INSERT INTO Station (id_station, nom_station, adresse, longitude, latitude, id_condition_acces, '
        'horaires, date_service, code_postal, id_amenageur, id_operateur, code_insee, id_implantation) '
        'VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)'
    )
    pdc_sql = (
        'INSERT INTO PointDeCharge (id_pdc, puissance, restriction_gabarit, deux_roues, cable_t2_attache, '
        'reservation, id_station, id_raccordement, id_pmr, id_tarification) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)'
    )
    tarif_sql = (
        'INSERT INTO Tarification (id_type_tarif, prix_kwh_norm, prix_min_norm, gratuit, paiement_acte, '
        'paiement_cb, paiement_autre) VALUES (%s, %s, %s, %s, %s, %s, %s)'
    )
    possede_sql = 'INSERT INTO possede (id_type_prise, id_pdc) VALUES (%s, %s)'

    for ligne in lignes:
        # Une station apparaît sur plusieurs lignes du CSV (une par point de charge)
        # on ne l'insère qu'une fois, à la première ligne où on la rencontre
        if ligne['id_station'] not in stations_inserees:
            id_amenageur = caches['amenageur'][amenageur_key(ligne)]
            id_operateur = caches['operateur'][(ligne['code_pays_operateur'], ligne['code_operateur'])]
            id_implantation = caches['implantation'][ligne['implantation']]

            curseur.execute(station_sql, (
                ligne['id_station'],
                ligne['nom_station'],
                ligne['adresse'],
                float(ligne['longitude']),
                float(ligne['latitude']),
                caches['condition_acces'][ligne['condition_acces']],
                na(ligne['horaires']),
                na(ligne['date_service']),
                ligne['code_postal'],
                id_amenageur,
                id_operateur,
                ligne['code_insee'],
                id_implantation,
            ))
            stations_inserees.add(ligne['id_station'])

        id_raccordement = caches['raccordement'].get(ligne['raccordement'])
        id_pmr = caches['pmr'][ligne['pmr']]

        # La Tarification doit être insérée avant le PointDeCharge
        # c'est PointDeCharge qui porte la clé étrangère id_tarification, pas l'inverse
        curseur.execute(tarif_sql, (
            caches['type_tarif'][ligne['type_tarif']],
            to_float(ligne['prix_kwh_norm']),
            to_float(ligne['prix_min_norm']),
            to_bool(ligne['gratuit'], valeur_par_defaut=None),
            to_bool(ligne['paiement_acte'], valeur_par_defaut=0),
            to_bool(ligne['paiement_cb'], valeur_par_defaut=0),
            to_bool(ligne['paiement_autre'], valeur_par_defaut=0),
        ))
        # On vient d'insérer la Tarification, lastrowid donne son id généré
        id_tarification = curseur.lastrowid

        curseur.execute(pdc_sql, (
            ligne['id_pdc'],
            float(ligne['puissance']),
            na(ligne['restriction_gabarit']),
            to_bool(ligne['deux_roues'], valeur_par_defaut=0),
            to_bool(ligne['cable_t2_attache'], valeur_par_defaut=None),
            to_bool(ligne['reservation'], valeur_par_defaut=0),
            ligne['id_station'],
            id_raccordement,
            id_pmr,
            id_tarification,
        ))

        # Un point de charge peut avoir plusieurs types de prise en même temps
        # (par exemple Type 2 et Combo CCS sur la même borne)
        for colonne, libelle in TYPE_PRISE.items():
            if ligne[colonne] == 'TRUE':
                curseur.execute(possede_sql, (caches['type_prise'][libelle], ligne['id_pdc']))

    curseur.close()


def already_loaded(connexion):
    # Vérifie si la base contient déjà des données
    # ça évite de tout réinsérer en double si le conteneur redémarre
    curseur = connexion.cursor()
    curseur.execute('SELECT COUNT(*) FROM Station')
    # fetchone() récupère la première ligne du résultat de la requête
    # ici on a fait un COUNT(*), donc une seule ligne avec une seule colonne
    resultat = curseur.fetchone()
    nombre_stations = resultat[0]
    curseur.close()
    return nombre_stations > 0


def main():
    with open(CSV_PATH, newline='', encoding='utf-8') as fichier:
        lignes = list(csv.DictReader(fichier))

    print(f'{len(lignes)} lignes lues depuis {CSV_PATH}')

    departements = load_departements()
    commune_departements = load_commune_departements()

    # connect() ouvre la connexion, on la garde ouverte pour tout le script
    connexion = connect()
    try:
        if already_loaded(connexion):
            print('Station déjà peuplée, insertion ignorée.')
            return

        caches = load_ref_tables(connexion, lignes, departements, commune_departements)
        print('Tables de référence insérées.')

        insert_main_tables(connexion, lignes, caches)
        print('Station / PointDeCharge / Tarification / possede insérés.')

        # commit() valide tous les inserts faits depuis le début du script
        # rien n'est réellement écrit en base avant cet appel (autocommit=False)
        connexion.commit()
    except Exception:
        # rollback() annule tout ce qui a été fait depuis le dernier commit
        # ça évite de laisser la base à moitié remplie si une erreur survient en cours de route
        connexion.rollback()
        raise
    finally:
        # close() ferme la connexion à la base, qu'il y ait eu une erreur ou pas
        connexion.close()


if __name__ == '__main__':
    sys.exit(main())
