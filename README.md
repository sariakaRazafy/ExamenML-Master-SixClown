# Morpion IA — ISPM Hackathon Machine Learning

**[Institut Supérieur Polytechnique de Madagascar](https://www.ispm-edu.com)**
Master 1 · Semestre 1 · Machine Learning · Examen Final

---

## Groupe

| Nom  | Rôle |
|-----|------|
| Sariaka | Data Engineer — Générateur Minimax + Alpha-Bêta |
| Henintsoa | Data Analyst — EDA & visualisations |
| Tsito | ML Engineer 1 — Régression Logistique (baseline) |
| Nathalie | ML Engineer 2 — Modèles avancés |
| Yowan | Dev Interface — Interface HTML/CSS/JS jouable |
| Tsiory | Tech Lead — Intégration, README, vidéo |

---

## Description du projet

Pipeline Machine Learning complet autour du jeu de **Morpion (Tic-Tac-Toe)**.

L'objectif est de :
1. Générer un dataset de positions de morpion labellisées via l'algorithme **Minimax + Alpha-Bêta**
2. Entraîner des modèles ML pour prédire l'issue d'une position en jeu parfait
3. Intégrer ces modèles dans une **interface jouable** en Python (HTML/CSS/JS) supportant 3 modes: vs Human, vs IA(ML), vs IA(Hybride).

---

## Structure du repository

```
├── generator.py                  # Étape 0 — Générateur Minimax + Alpha-Bêta
├── notebook.ipynb                # Étapes 1, 2, 3 — EDA + Modèles ML
├── ressources/
    ├── model_data.json 
│   └── dataset.csv               # Dataset généré (2423 états, 20 colonnes)
├── models/
│   ├── lr_draw.joblib
    ├── lr_wins.joblib
    ├── lr_xwins.joblib  
    ├── mlp_draw.joblib         
│   └── mlp_xwins.joblib       
├── interface/
│   ├── index.html
    ├── script.js
    ├── style.css                   
│   └── README-jeu.md             # Instructions de lancement
└── README.md                     # Ce fichier
```

---

##  Lancer l'interface

Cliquer directement sur index.html

---


## Réponses aux questions (Q1–Q4)

### Q1 — Analyse des coefficients

L'analyse du modèle, la baseline montre que la case centrale (n°4) et les coins ont les coefficients les plus élevés. Cela confirme statistiquement que le centre est la position la plus avantageuse pour gagner.

- **`c4_x` (X occupe le centre)** a le coefficient le plus fort positivement : occuper le centre maximise les menaces sur 4 lignes gagnantes simultanément.
- **`c4_o` (O occupe le centre)** a un coefficient fortement négatif pour `x_wins` : cela réduit significativement les chances de X.
- **Les coins (`c0_x`, `c2_x`, `c6_x`, `c8_x`)** ont des coefficients positifs modérés : ils participent à 3 lignes gagnantes chacun.

C'est **cohérent avec la stratégie humaine** : tout joueur expérimenté sait que prendre le centre au premier coup est optimal, et que les coins offrent plus de flexibilité que les bords.

Pour `is_draw`, les coefficients sont plus équilibrés — une nulle nécessite que les deux joueurs occupent des positions stratégiques équivalentes, donc ni X ni O ne domine clairement.

---

### Q2 — Déséquilibre des classes

Le dataset est **fortement déséquilibré** :

- `x_wins` : 75.5% de 1 → la classe majoritaire est "X gagne"
- `is_draw` : 18.2% de 1 → la classe minoritaire est "nulle"

Un modèle naïf qui prédit toujours `x_wins=1` obtiendrait déjà 75.5% d'Accuracy sans rien apprendre — ce qui rend l'**Accuracy trompeuse**.

**Métrique privilégiée : F1-score** (moyenne harmonique précision/rappel), car il pénalise les modèles qui ignorent la classe minoritaire. Pour `is_draw` (18.2%), on pourra aussi utiliser l'**AUC-ROC** qui mesure la capacité de discrimination indépendamment du seuil.

---

### Q3 — Comparaison des deux modèles

Le modèle `x_wins` est **plus facile à apprendre** que `is_draw` pour plusieurs raisons :

1. **Classe majoritaire** : avec 75.5% de positifs, il y a plus d'exemples pour apprendre les patterns de victoire de X.
2. **Signal plus fort** : les positions gagnantes ont des patterns géométriques clairs (centre + coins) que les features binaires capturent bien.
3. **`is_draw` est plus subtil** : une nulle exige que les deux joueurs aient joué "presque parfaitement" — le signal est dilué dans des configurations variées sans pattern dominant.

Les modèles se trompent le plus dans les **positions de milieu de partie** (3–4 coups joués), où l'issue n'est pas encore claire et dépend de nombreux coups futurs — exactement là où une représentation plate de 18 features binaires perd de l'information structurelle (relations entre cases).

---

### Q4 — Mode hybride

En mode **Hybride** (Minimax profondeur 3 + ML aux feuilles), on observe qualitativement :

- **Meilleure anticipation des pièges** : Minimax explore 3 coups à l'avance, ce qui lui permet d'éviter les "forks" (double menace) que l'IA ML pure ne détecte pas systématiquement.
- **Plus robuste en début de partie** : les premières décisions sont guidées par la recherche arborescente, évitant les erreurs grossières des modèles sur des positions rares.
- **Légèrement moins optimal en fin de partie** : à profondeur 3, Minimax ne voit pas toujours jusqu'à la fin — les modèles ML peuvent alors introduire une imprécision si la position n'est pas bien représentée dans le dataset.

En résumé, le mode Hybride **combine le meilleur des deux** : la rigueur tactique à court terme de Minimax et la généralisation statistique des modèles ML.

---

## Vidéo de présentation
  
🔗 [Lien vers la vidéo — à compléter]

---

## Hackathon

- **Date** : Semestre 1
- **Durée** : 9 heures (07h30 – 16h30)
- **Mode** : Distanciel complet
- **Deadline** : Dernier commit GitHub à 16h30 précises
