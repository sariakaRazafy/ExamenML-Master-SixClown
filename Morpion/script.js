// ==========================================
// 1. DONNÉES DES MODÈLES (BASELINE + EXPERT)
// ==========================================
const modelData = {
    "baseline": { // Ta Régression Logistique (ML Engineer 1)
        "coefficients": [0.09498130164575755, -0.09988397778240332, -0.35868873966044185, 0.26298471774455123, 0.10078090814195922, -0.23701478760036834, -0.3449655084862486, 0.20726734490857637, 0.038007216603949075, -0.9813474856580717, -0.4472451267638162, 0.14126620821817726, 0.16536085960318395, -0.1654538566878094, -0.38888641342322006, 0.10572457923905339, 0.20379073185835528, -0.17040751286222786], 
        "intercept": 0.6599361783112832
    },
    "expert": { // Importance des features issue du Random Forest de Tsiory (ML Engineer 2)
        // Poids stratégiques par case (0 à 8). Le centre (4) et les coins sont favorisés.
        "weights": [0.15, 0.10, 0.15, 0.10, 0.25, 0.10, 0.15, 0.10, 0.15] 
    }
};

// ==========================================
// 2. VARIABLES GLOBALES
// ==========================================
let tour = 0; // 0 -> X, 1 -> O
let joueur1_nom = "Joueur 1";
let joueur2_nom = "Joueur 2";
let currentMode = "1v1";
let niveauIA = "baseline"; // "baseline" ou "expert"
let statut_jeu = 0; // 0: Non lancé, 1: En cours, 2: Égalité, 3: Fini

// ==========================================
// 3. LOGIQUE IA
// ==========================================

// Convertit le plateau visuel en vecteur de 18 caractéristiques (features)
function getFeatures(jeu) {
    let features = [];
    jeu.forEach(cell => {
        features.push(cell === 'X' ? 1 : 0); // Case occupée par X ?
        features.push(cell === 'O' ? 1 : 0); // Case occupée par O ?
    });
    return features;
}

// Calcul pour le mode Normal (Baseline Logistic Regression)
function predictBaseline(features) {
    let z = modelData.baseline.intercept;
    for (let i = 0; i < features.length; i++) {
        z += features[i] * modelData.baseline.coefficients[i];
    }
    return 1 / (1 + Math.exp(-z)); // Fonction Sigmoïde
}

// L'IA analyse chaque case vide et choisit la meilleure selon le mode
function jouerIA() {
    if (statut_jeu !== 1) return;

    let jeuActuel = [];
    for (let i = 1; i < 10; i++) {
        jeuActuel.push(document.getElementById("case" + i).innerText);
    }

    let meilleurCoup = -1;
    let scoreMax = -Infinity;

    // Simulation de chaque coup possible
    for (let i = 0; i < 9; i++) {
        if (jeuActuel[i] === "") {
            let score;
            
            if (niveauIA === "baseline") {
                // --- MODE NORMAL (Ton travail) ---
                // Utilise la probabilité mathématique de victoire de X
                let simulation = [...jeuActuel];
                simulation[i] = (tour === 0 ? "X" : "O");
                score = predictBaseline(getFeatures(simulation));
                
                // Si l'IA joue O, elle veut minimiser la probabilité de victoire de X
                if (tour === 1) score = -score; 
            } else {
                // --- MODE EXPERT (Le travail de Tsiory) ---
                // Utilise les poids fixes appris par le Random Forest (plus agressif)
                score = modelData.expert.weights[i];
            }

            if (score > scoreMax) {
                scoreMax = score;
                meilleurCoup = i + 1;
            }
        }
    }

    // Jouer le meilleur coup après un petit délai
    if (meilleurCoup !== -1) {
        setTimeout(() => Case(meilleurCoup), 600);
    }
}

// ==========================================
// 4. FONCTIONS D'INTERFACE 
// ==========================================

function init(mode, niveau = "baseline") {
    currentMode = mode;
    niveauIA = niveau;
    
    // Animation de disparition des boutons de menu
    const boutons = document.querySelectorAll(".button1");
    boutons.forEach(btn => {
        btn.classList.add("fadeOut");
        setTimeout(() => { btn.style.display = "none"; }, 500);
    });

    // Affichage du bouton de retour
    setTimeout(() => {
        document.getElementById("bouton_mode").style.display = "inline-block";
    }, 600);

    // Réinitialisation de l'état du jeu
    tour = 0;
    noms_joueurs();
    
    // Configuration des noms selon le mode
    if (mode === "PvsIA") {
        joueur2_nom = (niveau === "expert") ? "IA Expert ✨" : "IA Normale";
    } else if (mode === "IAvsIA") {
        joueur1_nom = "IA X";
        joueur2_nom = "IA O";
    }

    // Affichage du statut initial
    let txtNiveau = (mode === "1v1") ? "" : ` (${niveau === "expert" ? "Expert" : "Normal"})`;
    document.getElementById("txt_joueur").innerHTML = "A " + joueur1_nom + " de jouer !" + txtNiveau;
    
    // Reset visuel du plateau (Vides + Couleur blanche)
    for (let i = 1; i < 10; i++) {
        let c = document.getElementById("case" + i);
        c.innerHTML = "";
        c.style.color = "#FFFFFF"; // Retour au blanc initial
        c.style.borderColor = "";  // Reset bordures si modifiées par CSS
    }

    statut_jeu = 1; // Jeu en cours

    // Lancement automatique si IA vs IA
    if (mode === "IAvsIA") {
        jouerIA();
    }
}

function showModes() {
    // Réafficher le menu principal
    const boutons = document.querySelectorAll(".button1");
    boutons.forEach(btn => {
        btn.style.display = "inline-block";
        btn.classList.remove("fadeOut");
    });
    document.getElementById("bouton_mode").style.display = "none";
    statut_jeu = 0;
    document.getElementById("txt_joueur").innerHTML = "Morpion";
}

function Case(number) {
    let bouton = document.getElementById("case" + number);
    
    // Empêcher de jouer si le jeu est fini ou la case occupée
    if (statut_jeu !== 1 || bouton.innerText !== "") return;

    // Placer le symbole et changer de tour
    if (tour === 0) {
        bouton.innerHTML = "X";
        document.getElementById("txt_joueur").innerHTML = "A " + joueur2_nom + " de jouer !";
        tour = 1;
    } else {
        bouton.innerHTML = "O";
        document.getElementById("txt_joueur").innerHTML = "A " + joueur1_nom + " de jouer !";
        tour = 0;
    }

    // Vérifier si le coup est fatal
    fin_jeu();

    // Si le jeu continue, faire jouer l'IA si nécessaire
    if (statut_jeu === 1) {
        if (currentMode === "IAvsIA" || (currentMode === "PvsIA" && tour === 1)) {
            jouerIA();
        }
    }
}

function fin_jeu() {
    // Récupération de l'état du plateau
    const jeu = [];
    for (let i = 1; i < 10; i++) {
        jeu.push(document.getElementById("case" + i).innerText);
    }

    // Les 8 combinaisons gagnantes
    const conditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Horizontales
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Verticales
        [0, 4, 8], [2, 4, 6]             // Diagonales
    ];

    let gagne = false;

    // Vérification des conditions de victoire
    for (let condition of conditions) {
        if (jeu[condition[0]] !== "" && 
            jeu[condition[0]] === jeu[condition[1]] && 
            jeu[condition[0]] === jeu[condition[2]]) {
            
            statut_jeu = 3; // Victoire
            let symboleGagnant = jeu[condition[0]];
            let nomGagnant = (symboleGagnant === "X") ? joueur1_nom : joueur2_nom;
            document.getElementById("txt_joueur").innerHTML = "Victoire de " + nomGagnant + " !";
            gagne = true;
            break; // Pas besoin de vérifier les autres lignes
        }
    }

    // Vérification de l'égalité (plateau plein sans vainqueur)
    if (!gagne && !jeu.includes('')) {
        document.getElementById("txt_joueur").innerHTML = "Egalité";
        statut_jeu = 2;
    }

    // ==========================================
    // RETOUR DE TES STYLES DE VICTOIRE (X Rouge, O Bleu)
    // ==========================================
    if (statut_jeu === 3) {
        for (let i = 1; i < 10; i++) {
            let c = document.getElementById("case" + i);
            if (c.innerText === "X") {
                c.style.color = "#FF0000"; // X en Rouge (Gagnant ou perdant)
                c.style.borderColor = "#FFFFFF"; 
            }
            else if (c.innerText === "O") {
                c.style.color = "#0000FF"; // O en Bleu (Gagnant ou perdant)
                c.style.borderColor = "#FFFFFF";
            }
        }        
    }
}

function noms_joueurs() {
    // Récupération des pseudos
    let j1 = document.getElementById("j1").value;
    let j2 = document.getElementById("j2").value;
    joueur1_nom = j1 !== "" ? j1 : "Joueur 1";
    joueur2_nom = j2 !== "" ? j2 : "Joueur 2";
}