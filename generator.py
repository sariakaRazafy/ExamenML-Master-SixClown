"""
generator.py — Étape 0 : Génération du dataset Morpion
======================================================
ISPM Hackathon ML · Groupe [NOM DU GROUPE]

Algorithme : Minimax avec élagage Alpha-Bêta
Génère tous les états valides où c'est au tour de X,
les labellise (x_wins, is_draw) et exporte en CSV.

Usage :
    python generator.py

Sortie : ressources/dataset.csv
"""

import os
import pandas as pd

# ──────────────────────────────────────────────
# 1. CONSTANTES
# ──────────────────────────────────────────────
X, O, EMPTY = 1, -1, 0

WINNING_LINES = [
    (0, 1, 2), (3, 4, 5), (6, 7, 8),   # lignes
    (0, 3, 6), (1, 4, 7), (2, 5, 8),   # colonnes
    (0, 4, 8), (2, 4, 6),              # diagonales
]


# ──────────────────────────────────────────────
# 2. FONCTIONS UTILITAIRES
# ──────────────────────────────────────────────

def check_winner(board):
    """Retourne X(1), O(-1) si victoire, 0 sinon."""
    for a, b, c in WINNING_LINES:
        if board[a] == board[b] == board[c] != EMPTY:
            return board[a]
    return 0


def is_full(board):
    """Vrai si aucune case vide."""
    return EMPTY not in board


def get_valid_moves(board):
    """Liste des indices des cases vides."""
    return [i for i, v in enumerate(board) if v == EMPTY]


def is_valid_state(board):
    """
    Vérifie qu'un plateau est valide :
    - count(X) == count(O) ou count(X) == count(O) + 1
    - Un seul gagnant possible
    """
    nx = board.count(X)
    no = board.count(O)
    if nx not in (no, no + 1):
        return False
    wx = sum(1 for a, b, c in WINNING_LINES
             if board[a] == board[b] == board[c] == X)
    wo = sum(1 for a, b, c in WINNING_LINES
             if board[a] == board[b] == board[c] == O)
    # On ne peut pas avoir les deux qui gagnent en même temps
    if wx > 0 and wo > 0:
        return False
    # Si X a gagné, c'était le dernier coup de X donc nx == no + 1
    if wx > 0 and nx != no + 1:
        return False
    # Si O a gagné, c'était le dernier coup de O donc nx == no
    if wo > 0 and nx != no:
        return False
    return True


# ──────────────────────────────────────────────
# 3. MINIMAX AVEC ALPHA-BÊTA
# ──────────────────────────────────────────────

def minimax(board, is_maximizing, alpha, beta):
    """
    Minimax avec élagage Alpha-Bêta.

    Paramètres
    ----------
    board          : list[int] — plateau courant (9 cases)
    is_maximizing  : bool — True si c'est au tour de X (maximiseur)
    alpha          : float — meilleur score garanti pour X
    beta           : float — meilleur score garanti pour O

    Retourne
    --------
    int : +1 (X gagne), -1 (O gagne), 0 (nulle) en jeu parfait
    """
    winner = check_winner(board)
    if winner == X:
        return 1
    if winner == O:
        return -1
    if is_full(board):
        return 0

    moves = get_valid_moves(board)

    if is_maximizing:
        best = -2
        for move in moves:
            board[move] = X
            score = minimax(board, False, alpha, beta)
            board[move] = EMPTY
            best = max(best, score)
            alpha = max(alpha, best)
            if beta <= alpha:
                break   # élagage bêta
        return best
    else:
        best = 2
        for move in moves:
            board[move] = O
            score = minimax(board, True, alpha, beta)
            board[move] = EMPTY
            best = min(best, score)
            beta = min(beta, best)
            if beta <= alpha:
                break   # élagage alpha
        return best


# ──────────────────────────────────────────────
# 4. ENCODAGE → 18 FEATURES
# ──────────────────────────────────────────────

def encode_board(board):
    """
    Encode un plateau en 18 features binaires.

    Pour chaque case i :
      ci_x = 1 si X occupe la case i, sinon 0
      ci_o = 1 si O occupe la case i, sinon 0

    Retourne un dict avec clés c0_x, c0_o, ..., c8_x, c8_o
    """
    row = {}
    for i, val in enumerate(board):
        row[f"c{i}_x"] = 1 if val == X else 0
        row[f"c{i}_o"] = 1 if val == O else 0
    return row


# ──────────────────────────────────────────────
# 5. EXPLORATION RÉCURSIVE DE TOUS LES ÉTATS
# ──────────────────────────────────────────────

def generate_all_states(board, current_player, seen, records):
    """
    Parcourt récursivement tous les états valides du morpion.
    Enregistre uniquement les états où c'est au tour de X.

    Paramètres
    ----------
    board          : list[int] — état courant
    current_player : int — X ou O (joueur dont c'est le tour)
    seen           : set — états déjà traités (évite les doublons)
    records        : list — accumule les lignes du dataset
    """
    key = tuple(board)

    # Éviter les doublons
    if key in seen:
        return
    seen.add(key)

    winner = check_winner(board)

    # Si c'est le tour de X et que la partie n'est pas terminée
    if current_player == X and winner == 0 and not is_full(board):
        # Appel Minimax depuis cet état (X est le maximiseur)
        outcome = minimax(board, True, -2, 2)

        row = encode_board(board)
        row["x_wins"] = 1 if outcome == 1 else 0
        row["is_draw"] = 1 if outcome == 0 else 0
        records.append(row)

    # Continuer l'exploration si la partie n'est pas finie
    if winner == 0 and not is_full(board):
        for move in get_valid_moves(board):
            board[move] = current_player
            next_player = O if current_player == X else X
            generate_all_states(board, next_player, seen, records)
            board[move] = EMPTY


# ──────────────────────────────────────────────
# 6. MAIN — GÉNÉRATION ET EXPORT
# ──────────────────────────────────────────────

def main():
    print("=" * 50)
    print("  Générateur Dataset Morpion — ISPM Hackathon")
    print("=" * 50)

    records = []
    seen    = set()
    board   = [EMPTY] * 9

    print("\n⏳ Exploration de tous les états valides...")
    generate_all_states(board, X, seen, records)

    print(f"✅ {len(records)} états générés (tour de X, partie non terminée)")

    # Créer le dossier ressources si besoin
    os.makedirs("ressources", exist_ok=True)

    # Construire le DataFrame dans le bon ordre de colonnes
    columns = (
        [f"c{i}_x" for i in range(9)] +
        [f"c{i}_o" for i in range(9)] +
        ["x_wins", "is_draw"]
    )
    # Réordonner : c0_x, c0_o, c1_x, c1_o, ... c8_x, c8_o, x_wins, is_draw
    interleaved = []
    for i in range(9):
        interleaved += [f"c{i}_x", f"c{i}_o"]
    interleaved += ["x_wins", "is_draw"]

    df = pd.DataFrame(records, columns=interleaved)

    # Export CSV
    output_path = os.path.join("ressources", "dataset.csv")
    df.to_csv(output_path, index=False)

    print(f"💾 Dataset exporté → {output_path}")
    print(f"\n📊 Aperçu des statistiques :")
    print(f"   Nombre total d'états  : {len(df)}")
    print(f"   X gagne (x_wins=1)    : {df['x_wins'].sum()} "
          f"({df['x_wins'].mean()*100:.1f}%)")
    print(f"   Nulle   (is_draw=1)   : {df['is_draw'].sum()} "
          f"({df['is_draw'].mean()*100:.1f}%)")
    print(f"   O gagne (les deux=0)  : "
          f"{(~df['x_wins'].astype(bool) & ~df['is_draw'].astype(bool)).sum()}")
    print(f"\n   Colonnes : {list(df.columns)}")
    print(f"   Shape    : {df.shape}")
    print("\n🎉 Génération terminée avec succès !")


if __name__ == "__main__":
    main()
