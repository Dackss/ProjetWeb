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

### Backend

```bash
cp backend/config/.env.example backend/config/.env
# éditer backend/config/.env avec les identifiants MariaDB
php -S localhost:8000 -t backend/
```
Réponds sur http://localhost:8000

Le frontend (port Vite, ex: 5173) appelle le backend PHP (port 8000) en JSON
via `axios`. Le backend appelle les scripts Python via `exec()`/`shell_exec()`
pour les prédictions.
