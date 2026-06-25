import sys
import os
import json

import joblib
import pandas as pd

"""
Contrat JSON (sys.argv[1]):
  Requis : nb_pdc (int)
  Optionnels : implantation (str, défaut ""), prise_ccs/prise_chademo/prise_type2/
    prise_ef/reservation (bool, défaut false), condition_acces (str, défaut ""),
    type_tarif (str, défaut "inconnu", un de composite/gratuit/inconnu/kwh/temps),
    raccordement (str, défaut "inconnu"), operateur (str, défaut "")
  Sortie : {
    "puissance": <str>,              # prédiction du meilleur modèle (cv_score le plus haut)
    "comparatif": [                  # un par algorithme entraîné (Besoin_Client_4), trié par cv_score desc
      {"algorithme": <str>, "prediction": <str>, "cv_score_f1_macro": <float>,
       "accuracy_test": <float>, "f1_macro_test": <float>, "f1_weighted_test": <float>,
       "meilleur": <bool>},
      ...
    ]
  }
  Classes de puissance possibles : Lente (<= 7.4 kW) / Normale (7.4 - 22 kW) /
    Acceleree (22 - 50 kW) / Rapide (50 - 150 kW) / Ultra-rapide (> 150 kW)
"""

MODELS_DIR = os.path.join(os.path.dirname(__file__), '..', 'models')


def to_bool_int(valeur):
    if isinstance(valeur, bool):
        return 1 if valeur else 0
    return 1 if str(valeur).strip().upper() in ('TRUE', '1', 'OUI', 'YES') else 0


def predire_puissance(payload):
    scaler = joblib.load(os.path.join(MODELS_DIR, 'scaler_pretraitement_b4.pkl'))
    ohe_implantation = joblib.load(os.path.join(MODELS_DIR, 'onehot_implantation_b4.pkl'))
    ohe_acces = joblib.load(os.path.join(MODELS_DIR, 'onehot_acces_b4.pkl'))
    ohe_tarif = joblib.load(os.path.join(MODELS_DIR, 'onehot_tarif_b4.pkl'))
    ohe_raccordement = joblib.load(os.path.join(MODELS_DIR, 'onehot_raccordement_b4.pkl'))
    enc_operateur = joblib.load(os.path.join(MODELS_DIR, 'encodage_operateur_b4.pkl'))
    features = joblib.load(os.path.join(MODELS_DIR, 'features_b4.pkl'))
    metriques = json.load(open(os.path.join(MODELS_DIR, 'metriques_b4.json'), encoding='utf-8'))

    impl_df = pd.DataFrame([[str(payload.get('implantation', '')).strip()]], columns=['implantation'])
    impl_encoded = ohe_implantation.transform(impl_df)
    impl_cols = [f'implantation_{c}' for c in ohe_implantation.categories_[0]]

    acces_df = pd.DataFrame([[str(payload.get('condition_acces', '')).strip()]], columns=['condition_acces'])
    acces_encoded = ohe_acces.transform(acces_df)
    acces_cols = [f'acces_{c}' for c in ohe_acces.categories_[0]]

    tarif_df = pd.DataFrame([[str(payload.get('type_tarif', 'inconnu')).lower()]], columns=['type_tarif'])
    tarif_encoded = ohe_tarif.transform(tarif_df)
    tarif_cols = [f'tarif_{c}' for c in ohe_tarif.categories_[0]]

    raccordement_df = pd.DataFrame([[str(payload.get('raccordement', 'inconnu')).strip()]], columns=['raccordement'])
    raccordement_encoded = ohe_raccordement.transform(raccordement_df)
    raccordement_cols = [f'raccordement_{c}' for c in ohe_raccordement.categories_[0]]

    # encodage_operateur_b4.pkl = {'table': proba historique par opérateur/classe,
    # 'prior': moyenne globale (fallback opérateur inconnu), 'ordre': liste des classes}
    operateur_str = str(payload.get('operateur', '')).strip().lower()
    table_operateur = enc_operateur['table']
    prior_global = enc_operateur['prior']
    ordre_classes = enc_operateur['ordre']
    if operateur_str in table_operateur.index:
        proba_operateur = table_operateur.loc[operateur_str, ordre_classes].values
    else:
        proba_operateur = prior_global[ordre_classes].values
    operateur_cols = [f'operateur_proba_{c}' for c in ordre_classes]

    bool_num = pd.DataFrame(
        [[int(payload['nb_pdc']),
          to_bool_int(payload.get('prise_ccs', False)),
          to_bool_int(payload.get('prise_chademo', False)),
          to_bool_int(payload.get('prise_type2', False)),
          to_bool_int(payload.get('prise_ef', False)),
          to_bool_int(payload.get('reservation', False))]],
        columns=['nb_pdc', 'prise_ccs', 'prise_chademo', 'prise_type2', 'prise_ef', 'reservation']
    )

    df_impl = pd.DataFrame(impl_encoded, columns=impl_cols)
    df_acces = pd.DataFrame(acces_encoded, columns=acces_cols)
    df_tarif = pd.DataFrame(tarif_encoded, columns=tarif_cols)
    df_raccordement = pd.DataFrame(raccordement_encoded, columns=raccordement_cols)
    df_operateur = pd.DataFrame([proba_operateur], columns=operateur_cols)
    donnee_borne = pd.concat([bool_num, df_impl, df_acces, df_tarif, df_raccordement, df_operateur], axis=1)
    donnee_borne = donnee_borne.reindex(columns=features, fill_value=0)

    # scaler pas refit par modèle : les 4 ont été entraînés sur le même X_train,
    # donc même prétraitement pour tous, seul le classifieur change ensuite
    donnee_scaled = scaler.transform(donnee_borne.astype(float))

    # recharge les 4 modèles à chaque appel, comme predict_implantation.py
    comparatif = []
    for nom, info in metriques.items():
        modele = joblib.load(os.path.join(MODELS_DIR, f"modele_{info['slug']}_b4.pkl"))
        comparatif.append({
            'algorithme': nom,
            'prediction': str(modele.predict(donnee_scaled)[0]),
            'cv_score_f1_macro': info['cv_score_f1_macro'],
            'accuracy_test': info['accuracy_test'],
            'f1_macro_test': info['f1_macro_test'],
            'f1_weighted_test': info['f1_weighted_test'],
        })

    comparatif.sort(key=lambda r: r['cv_score_f1_macro'], reverse=True)
    for i, resultat in enumerate(comparatif):
        resultat['meilleur'] = (i == 0)

    return comparatif[0]['prediction'], comparatif


def main():
    payload = json.loads(sys.argv[1]) if len(sys.argv) > 1 else {}
    puissance, comparatif = predire_puissance(payload)
    print(json.dumps({'puissance': puissance, 'comparatif': comparatif}))


if __name__ == '__main__':
    main()
