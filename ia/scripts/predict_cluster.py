import sys
import os
import json

import joblib

"""
Contrat (sys.argv[1]) :
  Requis : chemin d'un fichier JSON, liste de points [{"latitude": float, "longitude": float}, ...]
    (un fichier et pas un argument inline comme les autres scripts : ici on traite
    toutes les stations d'un coup, et le JSON est trop gros pour une ligne de commande)
  Sortie : {"clusters": [<int>, ...]}, un cluster par point, même ordre
"""

MODELS_DIR = os.path.join(os.path.dirname(__file__), '..', 'models')


def predire_clusters(points):
    model = joblib.load(os.path.join(MODELS_DIR, 'kmeans_irve_model.pkl'))
    coords = [[float(p['latitude']), float(p['longitude'])] for p in points]
    if not coords:
        return []
    return [int(c) for c in model.predict(coords)]


def main():
    if len(sys.argv) > 1:
        with open(sys.argv[1], encoding='utf-8') as f:
            payload = json.load(f)
    else:
        payload = []
    print(json.dumps({'clusters': predire_clusters(payload)}))


if __name__ == '__main__':
    main()
