# Projet de Nettoyage de Données - Global Cost of Living

Ce dossier contient les scripts et les données nécessaires à la préparation du dataset final pour la visualisation.

## Structure du Dossier

*   **`process_data.py`** : Script initial de fusion des sources de données disparates (v2, education, index). Génère le fichier brut `master_city_data_final.csv`.
*   **`polish_data.py`** : Script de nettoyage avancé et de feature engineering. Génère le fichier final `master_city_data_polished.csv`.
*   **`master_city_data_polished.csv`** : Le fichier final nettoyé, prêt à l'emploi.
*   **`README.md`** : Ce fichier de documentation.

## Instructions d'Exécution

Pour régénérer les données depuis le début :

1.  Lancer la fusion des données (si nécessaire) :
    ```bash
    python process_data.py
    ```
2.  Lancer le nettoyage et le polissage :
    ```bash
    python polish_data.py
    ```

---

## Rapport de Nettoyage et de Préparation des Données

Les étapes suivantes sont appliquées automatiquement par le script `polish_data.py`.

### 1. Objectifs du Nettoyage
L'objectif principal est d'éliminer les incohérences statistiques (outliers), de combler les données manquantes de manière logique et de créer de nouvelles variables explicatives pour l'étude du coût de la vie (étudiants vs touristes).

### 2. Méthodologie Appliquée

#### 2.1 Détection et Traitement des Valeurs Aberrantes (Outliers)
Pour éviter que des erreurs de saisie ou des valeurs extrêmes ne faussent les moyennes, nous avons appliqué la méthode de l'**Écart Interquartile (IQR)** par pays.

*   **Méthode** :
    1.  Calcul du 1er quartile (Q1) et du 3ème quartile (Q3) pour chaque pays.
    2.  Définition des bornes : `[Q1 - 1.5*IQR, Q3 + 1.5*IQR]`.
    3.  Remplacement des valeurs hors bornes par la **médiane** du pays.
*   **Résultats** :
    *   **Loyer (Studio Centre)** : 49 valeurs aberrantes corrigées.
    *   **Repas (Restaurant bon marché)** : 77 valeurs aberrantes corrigées.
    *   **Salaire Net Mensuel** : 48 valeurs aberrantes corrigées.

#### 2.2 Gestion des Valeurs Manquantes (Imputation)
*   **Prix (Café, Bière, Repas, etc.)** : Les valeurs manquantes sont remplacées par la **moyenne du pays** correspondant. Si un pays n'a aucune donnée, la moyenne globale est utilisée.
*   **Universités** : Les cellules vides sont remplies par la mention *"No University Listed"*.

#### 2.3 Gestion des Doublons Géographiques
Le jeu de données original contient plusieurs lignes pour une même ville (une ligne par université).
*   **Action** : Création d'une colonne booléenne `City_Is_Unique`.
*   **Logique** : La valeur `True` est attribuée uniquement à la première occurrence de chaque couple Ville/Pays.
*   **Utilité** : Permet d'afficher chaque ville une seule fois sur une carte sans superposition.

### 3. Feature Engineering (Création de Variables)
De nouvelles métriques ont été créées :
1.  **Rent_to_Income_Ratio (%)** : `(Loyer Studio / Salaire Net) * 100`.
2.  **Daily_Survival_Budget ($)** : `Repas Pas Cher + (2 * Ticket Transport) + Cappuccino`.

### 4. Standardisation
*   Conversion de toutes les colonnes numériques au format `Float`.
*   Arrondi à **2 décimales**.

### 5. Résultat Final
Le fichier **`master_city_data_polished.csv`** est propre, standardisé et prêt pour la visualisation.
