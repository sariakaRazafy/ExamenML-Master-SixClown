Q2 : Déséquilibre des classes

Le dataset présente un déséquilibre marqué, particulièrement pour la cible is_draw où la classe minoritaire (match nul) ne représente que environ 17% des données (84 sur 485 dans le test set). Pour x_wins, la classe 1 est majoritaire (77%).

En conséquence, nous privilégions le F1-Score plutôt que l'Accuracy. L'Accuracy est ici trompeuse : un modèle qui prédirait 'pas de nul' systématiquement obtiendrait 83% d'accuracy tout en étant totalement inutile pour le jeu. Le F1-score nous permet de mesurer la capacité réelle du modèle à détecter les cas rares.

Q3 : Comparaison des deux modèles

Le modèle x_wins (F1-score de 0.69) est plus performant que le modèle is_draw (F1-score de 0.29).

Pourquoi cette différence ? Prédire une victoire est plus 'linéaire' : il suffit souvent de repérer un alignement de symboles ou une domination spatiale. En revanche, un match nul est le résultat d'une opposition parfaite où aucune configuration gagnante n'émerge. C'est une condition beaucoup plus complexe et subtile à capturer pour une simple Régression Logistique.

Erreurs types : Le modèle a tendance à être trop 'hésitant' sur les matchs nuls (Précision de 0.20), ce qui signifie qu'il voit des opportunités de nulle là où il n'y en a pas encore.