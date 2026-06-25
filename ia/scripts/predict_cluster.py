import sys
import os
import json

import joblib

"""
Contrat JSON (sys.argv[1]):
  Requis : latitude (float), longitude (float)
  Sortie : {"cluster": <int>}
"""

MODELS_DIR = os.path.join(os.path.dirname(__file__), '..', 'models')


def predire_cluster(payload):
    model = joblib.load(os.path.join(MODELS_DIR, 'kmeans_irve_model.pkl'))
    latitude = float(payload['latitude'])
    longitude = float(payload['longitude'])
    cluster = model.predict([[latitude, longitude]])[0]
    return int(cluster)


def main():
    payload = json.loads(sys.argv[1]) if len(sys.argv) > 1 else {}
    print(json.dumps({'cluster': predire_cluster(payload)}))


if __name__ == '__main__':
    main()
