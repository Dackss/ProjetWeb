# Projet IRVE

Application web de visualisation et de prédiction des infrastructures de recharge pour véhicules électriques (IRVE) en France.

## Besoins clients

Le client souhaitait une plateforme permettant d'explorer les données nationales IRVE et d'obtenir des prédictions IA sur les bornes de recharge :

- **Visualiser** les stations sur une carte interactive et parcourir les points de charge dans un tableau paginé et filtrable
- **Consulter des statistiques** agrégées par département (nombre de stations, de PDC, puissance moyenne, répartition par implantation et condition d'accès)
- **Gérer les points de charge** via une interface CRUD complète (création, modification, suppression)
- **Prédire le type d'implantation** d'un point de charge à partir de ses caractéristiques techniques
- **Prédire la puissance nominale** d'un point de charge à partir de ses caractéristiques
- **Visualiser les clusters géographiques** de l'ensemble des stations via K-Means

---

## Architecture

```mermaid
graph TB
    subgraph Client
        Browser[Navigateur]
    end

    subgraph Docker
        Apache["Apache<br/>(PHP 8.2 + Python 3)"]
        DB[(MariaDB 11)]
    end

    subgraph Image
        Backend[API PHP]
        Scripts["Scripts Python<br/>(scikit-learn)"]
        Models["Modèles .pkl<br/>(K-Means, GB, KNN, LogReg, RF)"]
    end

    Browser -->|"HTTP :80 (prod) / :8001 (dev)"| Apache
    Apache --> Backend
    Backend -->|PDO| DB
    Backend -->|"exec()"| Scripts
    Scripts -->|"joblib.load()"| Models
```

---

## API

```mermaid
graph LR
    subgraph "/api"
        S["stations.php<br/>GET"]
        PDC["points_de_charge.php<br/>GET · POST · PUT · DELETE"]
        CO["communes.php<br/>GET ?q="]
        DE["departements.php<br/>GET"]
        IM["implantations.php<br/>GET"]
        ST["statistiques.php<br/>GET ?departement="]
        PR["predictions.php<br/>POST"]
    end

    subgraph "POST /api/predictions.php"
        CL["type: cluster<br/>→ K-Means sur toutes les stations<br/>Retourne cluster par station"]
        IC["type: implantation<br/>+ features<br/>→ GB / KNN / LogReg<br/>Retourne comparatif + meilleur"]
        PU["type: puissance<br/>+ features<br/>→ GB / KNN / LogReg / RF<br/>Retourne comparatif + meilleur"]
    end

    PR --> CL
    PR --> IC
    PR --> PU
```

Toutes les réponses sont en JSON `{ data: ... }`. Les erreurs retournent `{ error: "..." }` avec le code HTTP approprié (400, 404, 405, 500).

**Points de charge — paramètres GET :**

| Paramètre | Type | Description |
|-----------|------|-------------|
| `id` | string | Fiche d'un PDC précis |
| `page` | int | Page (défaut : 1) |
| `limit` | int | Résultats par page, max 200 (défaut : 50) |
| `commune` | string | Filtre par nom de commune exact |
| `implantation` | string | Filtre par type d'implantation |

---

## Frontend

```mermaid
flowchart TD
    A["/\nAccueil"] --> B

    B["/visualisation\nCarte + tableau PDC"]
    B -->|Sélectionner un PDC + cliquer Prédire| D
    B -->|Cliquer Prédire les clusters| E

    D["/prediction-pdc\nRésultats implantation ou puissance\nTableau comparatif des algorithmes"]
    D -->|Retour| B

    E["/prediction-cluster\nCarte colorée par cluster K-Means"]

    F["/statistiques\nStats par département\nSélecteur → chiffres + répartitions"]
```

---

## Lancer en développement

**Prérequis :** Docker, Node.js, [Git LFS](https://git-lfs.com/) (`git lfs install`).

```bash
cp .env.example .env

# Backend + base de données
docker compose up -d --build

# Frontend (dans un autre terminal)
cd frontend && npm install && npm run dev
```

- Frontend : http://localhost:5173
- API : http://localhost:8001/api

**Commandes utiles :**

```bash
docker compose logs -f apache   # logs PHP en direct
docker compose logs -f db       # logs MariaDB
docker compose down             # arrêter (données conservées)
docker compose down -v          # arrêter + supprimer les données
```

---

## Déploiement en production

**Prérequis :** Docker (`curl -fsSL https://get.docker.com | sh`), Git LFS.

```bash
git clone https://github.com/Dackss/ProjetWeb.git
cd ProjetWeb

cp .env.example .env
# éditer .env avec les identifiants DB

git lfs pull   # télécharger les modèles IA (> 100 Mo)

# Builder le frontend
docker run --rm -v $(pwd)/frontend:/app -w /app node:22-alpine sh -c "npm install && npm run build"

# Lancer (port 80) — les scripts Python et modèles sont baked dans l'image
docker compose -f docker-compose.prod.yml up -d apache db

# Insérer les données
docker compose -f docker-compose.prod.yml run --rm python
```

**Mise à jour :**

```bash
git pull && git lfs pull
docker run --rm -v $(pwd)/frontend:/app -w /app node:22-alpine sh -c "npm install && npm run build"
docker compose -f docker-compose.prod.yml up -d --build apache
```

---

## Structure

```
frontend/   React + Vite + Tailwind CSS
backend/    API PHP (JSON), Apache, Python 3
ia/         Scripts Python (scikit-learn) + modèles .pkl
database/   Schéma SQL + données CSV
```

Les modèles `ia/models/*.pkl` sont stockés via Git LFS. Sans `git lfs pull`, le build Docker échouera.
