# Projet IRVE

Application de visualisation et prédiction de données IRVE (infrastructures de
recharge pour véhicules électriques).

## Structure

```
frontend/   React + Vite + Tailwind (interface)
backend/    API PHP (JSON pur, pas de logique métier en HTML)
ia/         Scripts Python (prédictions, appelés par le backend via exec())
database/   Script(s) SQL de la base
```

## Installation

### Frontend

```bash
cd frontend
npm install
npm run dev
```
Réponds sur http://localhost:5174

### Backend + base de données (Docker)

**Prérequis** : Docker + Docker Compose installés et lancés, [Git LFS](https://git-lfs.com/) installé (`git lfs install`) pour récupérer les modèles IA (`ia/models/*.pkl`, certains > 100 Mo).

```bash
cp .env.example .env
# éditer .env si besoin (identifiants DB)
docker compose up -d --build
```

Commandes utiles :

```bash
docker compose ps               # statut des conteneurs
docker compose logs -f apache   # logs backend en direct
docker compose logs -f db       # logs DB en direct
docker compose down             # arrêter (garde les données)
docker compose down -v          # arrêter + supprimer les données
```

- API dispo sur `http://localhost:8001`
- MariaDB dispo sur `localhost:3307`
- `database/*.sql` est importé automatiquement au premier démarrage du conteneur `db`
- `docker compose down` pour arrêter, `docker compose down -v` pour repartir de zéro (supprime les données)

### Voir les tables MariaDB dans WebStorm

1. Database tool window → `+` → Data Source → **MariaDB**
2. Host `localhost`, Port `3307`, User/Password/Database = valeurs du `.env`
3. Télécharger le driver si demandé, puis **Test Connection**
4. Les tables apparaissent dans l'arbre Database

Le frontend (port Vite, ex: 5173) appelle le backend PHP (port 8001) en JSON
via `fetch`. Le backend appelle les scripts Python via `exec()`/`shell_exec()`
pour les prédictions.
