# Choix Techniques

## Modèle de données

### 1. **User**
Le modèle `User` représente un utilisateur avec des informations personnelles, des points et des informations de connexion.

| Champ       | Type     | Description                                        |
|-------------|----------|----------------------------------------------------|
| `uid`       | `string` | Identifiant unique de l'utilisateur.               |
| `createdAt` | `Date`   | Date de création du compte utilisateur.            |
| `updatedAt` | `Date`   | Date de la dernière mise à jour du compte.         |
| `lastLogin` | `Date`   | Date et heure de la dernière connexion.            |
| `username`  | `string` | Nom d'utilisateur.                                |
| `email`     | `string` | Adresse email de l'utilisateur.                   |
| `point`     | `number` | Points accumulés par l'utilisateur.               |

### 2. **Player**
Le modèle `Player` représente un joueur avec une évaluation de performance (rating).

| Champ   | Type     | Description                                  |
|---------|----------|----------------------------------------------|
| `id`    | `string` | Identifiant unique du joueur.                |
| `rating`| `number` | Évaluation du joueur, généralement un score. |

### 3. **Match**
Le modèle `Match` représente une partie entre deux joueurs, avec les joueurs blancs et noirs, le statut de la partie, les cotes (probabilités) et le résultat.

| Champ           | Type           | Description                                                      |
|-----------------|----------------|------------------------------------------------------------------|
| `id`            | `string`       | Identifiant unique du match.                                     |
| `whitePlayer`   | `Player`       | Joueur avec les pièces blanches, de type `Player`.               |
| `blackPlayer`   | `Player`       | Joueur avec les pièces noires, de type `Player`.                 |
| `status`        | `MatchStatus`  | Statut du match : `ONGOING` ou `ENDED`.                          |
| `cote`          | `Cote`         | Cotes de la partie (probabilités de victoire ou égalité).        |
| `result`        | `MatchResult`  | Résultat du match : `WHITE`, `BLACK`, ou `DRAW`, ou `null` si en cours. |

### Remarques
- **Relation entre `Player` et `Match`** : Un `Match` implique deux `Player`, un joueur avec les pièces blanches et un autre avec les pièces noires. Ces joueurs sont représentés par leurs `id` et `rating`.
- **Cotes** : Les cotes sont calculées en fonction des ratings des joueurs, déterminant la probabilité de victoire de chaque joueur et la probabilité d'égalité.
- **Statut et Résultat** : Le statut du match peut être soit `ONGOING` (en cours) ou `ENDED` (terminé), et une fois que le match est terminé, le résultat sera l'un des trois états : `WHITE`, `BLACK` ou `DRAW`.

## Framework : Nest.js

Dans le cadre de ce projet, le choix s’est porté sur le framework Nest.js, car après avoir expérimenté Express, nous souhaitions découvrir une nouvelle approche. Nest.js offre une architecture solide, intégrant l'injection de dépendances et une prise en charge complète de TypeScript. Ce dernier garantit une gestion optimale des types et améliore la qualité du code, tout en facilitant la maintenance du projet. Il facilite aussi la réalisation des tests unitaires et des tests d'intégrations avec jest.

## Services externes

Afin d'alimenter notre base de données de parties d'échecs, nous avons décidé d'utiliser l'API de lichess : https://lichess.org./api. Lichess est une plateforme open-source pour jouer aux échecs, son API est donc très bien documentée. Elle propose notamment un endpoint qui nous convient parfaitement : https://lichess.org/api/tv/channels. Cet endpoint nous donne les id des parties affichées sur la TV Lichess, pour chaque catégorie de partie. En écoutant la catégorie Blitz, nous avons aisni otbtenu un stream sur des parties de haut niveau qui se terminent rapidement, permettant aux utilisateurs de voir rapidement les résultats de leurs paris.

## Base de données : Firebase

Pour le stockage et la gestion des données, noous avons opté pour **Firebase**. Ce choix s’explique par plusieurs raisons :

- **Simplicité d'intégration** : Firebase fournit une API intuitive couvrant à la fois l’authentification et la gestion de la base de données. Cela nous permet de nous concentrer pleinement sur le développement de la logique métier, sans nous soucier des aspects complexes de l'infrastructure.
- **Firestore** : Firebase propose Firestore, une base de données idéale pour des applications nécessitant des mises à jour fréquentes. Dans notre cas, cela permet aux utilisateurs de voir leurs gains en temps réel dans les paris. En utilisant Firestore, une base de données NoSQL, nous bénéficions d’une structure flexible qui nous permet d’ajouter et de modifier des données sans imposer de schémas rigides. Cette approche simplifie la gestion des données tout en offrant une évolutivité adaptée à nos besoins.

## Structure du Code

L’architecture du projet suit les bonnes pratiques du framework Nest.js, avec une organisation en modules, services et contrôleurs. Chaque module est dédié à une fonctionnalité spécifique, facilitant ainsi l'extension et la maintenance de l’application tout en permettant une séparation claire des responsabilités.

## Déploiement

Cloud run : TODO
