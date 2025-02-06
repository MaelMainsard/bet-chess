# Bet Chess - API de paris échiquéens

## Contexte

Ce projet consiste en une API permettant de parier sur des parties d'échecs en temps réel.

L'API est construite avec le framework **Nest.js**, Le backend utilise **Firebase** pour backend, et utilise des données provenant de **Lichess**.

Elle permet aux utilisateurs de se connecter, suivre des matchs en direct, placer des paris et de suivre leurs gains.

## Configuration de l'Environnement de Développement

### Prérequis

Avant de pouvoir développer ou tester l'API, vous devez installer les outils suivants sur votre machine :

- **Node.js** (version 16 ou supérieure)
- **npm**
- **Firebase CLI** pour interagir avec Firebase
- **Nest CLI** pour générer et gérer les projets Nest.js

### Installation

1. Clonez ce dépôt sur votre machine locale :

```bash
git clone https://github.com/MaelMainsard/bet-chess.git
cd bet-chess
```

2. Installez les dépendances du projet :

```bash
npm install
```

3. Configurez Firebase pour le projet :

- Ajoutez à la racine `firebase-service-account.json` et `.env`

4. Lancez l'API :

```bash
npm run dev
```

## Déploiement

Le déploiement de l'API est automatisé via **Cloud Run**, un service de Google Cloud permettant de déployer des applications conteneurisées. À chaque mise à jour de la branch main, un pipeline CI/CD se déclenche pour construire une image Docker et la déployer.

#

Vous êtes maintenant prêts à commencer à développer ou à tester l'API ! Si vous avez des questions, n'hésitez pas à consulter la documentation ou à demander de l'aide.

## Vidéo présentation API

La vidéo a été déposé sur moodle sur le cours "Projet final - Conception et développement d'une API en Node.js".
