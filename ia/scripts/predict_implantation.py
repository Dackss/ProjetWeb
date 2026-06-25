import sys
import os
import json

import joblib
import numpy as np
import pandas as pd

"""
Contrat JSON (sys.argv[1]):
  Requis : puissance (float), nb_pdc (int), latitude (float), longitude (float)
  Optionnels (bool, défaut false) : gratuit, deux_roues, prise_ccs, prise_type2,
    prise_chademo, prise_ef, paiement_acte, paiement_cb, paiement_autre
  Optionnel : type_tarif (str, défaut "inconnu", un de
    composite/gratuit/inconnu/kwh/temps)
  Sortie : {
    "implantation": <str>,           # prédiction du meilleur modèle (cv_score le plus haut)
    "comparatif": [                  # un par algorithme entraîné (Besoin_Client_3), trié par cv_score desc
      {"algorithme": <str>, "prediction": <str>, "cv_score": <float>,
       "accuracy_test": <float>, "precision_macro": <float>, "recall_macro": <float>,
       "f1_macro": <float>, "meilleur": <bool>},
      ...
    ]
  }
  Classes d'implantation possibles : Voirie / Parking public /
    Parking privé à usage public / Parking privé réservé à la clientèle /
    Station dédiée à la recharge rapide
"""

MODELS_DIR = os.path.join(os.path.dirname(__file__), '..', 'models')

BOOL_MAPPING = {'TRUE': 1, 'FALSE': 0, '1': 1, '0': 0, 'OUI': 1, 'NON': 0}


def to_bool_int(valeur):
    if isinstance(valeur, bool):
        return 1 if valeur else 0
    return BOOL_MAPPING.get(str(valeur).upper(), 0)


def predire_implantation(payload):
    scaler = joblib.load(os.path.join(MODELS_DIR, 'scaler_pretraitement_b3.pkl'))
    ohe = joblib.load(os.path.join(MODELS_DIR, 'onehot_type_tarif_b3.pkl'))
    metriques = json.load(open(os.path.join(MODELS_DIR, 'metriques_b3.json'), encoding='utf-8'))

    colonnes_numeriques = ['puissance', 'nb_pdc', 'latitude', 'longitude']
    colonnes_booleennes = ['gratuit', 'deux_roues', 'prise_ccs', 'prise_type2', 'prise_chademo', 'prise_ef',
                            'paiement_acte', 'paiement_cb', 'paiement_autre']

    donnees_brutes = {
        'puissance': float(payload['puissance']),
        'nb_pdc': int(payload['nb_pdc']),
        'latitude': float(payload['latitude']),
        'longitude': float(payload['longitude']),
        'gratuit': to_bool_int(payload.get('gratuit', False)),
        'deux_roues': to_bool_int(payload.get('deux_roues', False)),
        'prise_ccs': to_bool_int(payload.get('prise_ccs', False)),
        'prise_type2': to_bool_int(payload.get('prise_type2', False)),
        'prise_chademo': to_bool_int(payload.get('prise_chademo', False)),
        'prise_ef': to_bool_int(payload.get('prise_ef', False)),
        'paiement_acte': to_bool_int(payload.get('paiement_acte', False)),
        'paiement_cb': to_bool_int(payload.get('paiement_cb', False)),
        'paiement_autre': to_bool_int(payload.get('paiement_autre', False)),
    }

    donnee_borne = pd.DataFrame([donnees_brutes])
    donnee_borne_scaled = scaler.transform(donnee_borne[colonnes_numeriques + colonnes_booleennes])

    donnee_tarif = pd.DataFrame([{'type_tarif': payload.get('type_tarif', 'inconnu')}])
    donnee_tarif_ohe = ohe.transform(donnee_tarif)

    # scaler/OHE pas refit par modèle : les 4 ont été entraînés sur le même X_train,
    # donc même prétraitement pour tous, seul le classifieur change ensuite
    donnee_finale = np.hstack([donnee_borne_scaled, donnee_tarif_ohe])

    # recharge les 4 modèles à chaque appel (modele_rf_b3.pkl fait 250 Mo) : lent,
    # mais le process tourne une seule fois par requête donc pas de cache à gérer
    comparatif = []
    for nom, info in metriques.items():
        modele = joblib.load(os.path.join(MODELS_DIR, f"modele_{info['slug']}_b3.pkl"))
        comparatif.append({
            'algorithme': nom,
            'prediction': str(modele.predict(donnee_finale)[0]),
            'cv_score': info['cv_score'],
            'accuracy_test': info['accuracy_test'],
            'precision_macro': info['precision_macro'],
            'recall_macro': info['recall_macro'],
            'f1_macro': info['f1_macro'],
        })

    comparatif.sort(key=lambda r: r['cv_score'], reverse=True)
    for i, resultat in enumerate(comparatif):
        resultat['meilleur'] = (i == 0)

    return comparatif[0]['prediction'], comparatif


def main():
    payload = json.loads(sys.argv[1]) if len(sys.argv) > 1 else {}
    implantation, comparatif = predire_implantation(payload)
    print(json.dumps({'implantation': implantation, 'comparatif': comparatif}))


if __name__ == '__main__':
    main()
