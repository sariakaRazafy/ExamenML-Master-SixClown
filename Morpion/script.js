// ==========================================
// 1. DONNÉES DU MODÈLE (TA BASELINE)
// ==========================================
const modelData = {
    "x_wins": {
        "coefficients": [0.09498130164575755, -0.09988397778240332, -0.35868873966044185, 0.26298471774455123, 0.10078090814195922, -0.23701478760036834, -0.3449655084862486, 0.20726734490857637, 0.038007216603949075, -0.9813474856580717, -0.4472451267638162, 0.14126620821817726, 0.16536085960318395, -0.1654538566878094, -0.38888641342322006, 0.10572457923905339, 0.20379073185835528, -0.17040751286222786], 
        "intercept": 0.6599361783112832
    }
};

// ==========================================
// 2. VARIABLES GLOBALES
// ==========================================
let tour = 0; // 0 -> X, 1 -> O
let joueur1_nom = "Joueur 1";
let joueur2_nom = "Joueur 2";
let currentMode = "1v1";
let statut_jeu = 0; // 0: Non lancé, 1: En cours, 2: Égalité, 3: Fini

// ==========================================
// 3. LOGIQUE IA (TON TRAVAIL DE ML ENGINEER)
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

// Calcule la probabilité de victoire selon la formule de Régression Logistique
function predictWin(features) {
    let z = modelData.x_wins.intercept;
    for (let i = 0; i < features.length; i++) {
        z += features[i] * modelData.x_wins.coefficients[i];
    }
    return 1 / (1 + Math.exp(-z)); // Fonction Sigmoïde
}

// L'IA analyse chaque case vide et choisit celle qui maximise ses chances
function jouerIA() {
    if (statut_jeu !== 1) return;

    let jeuActuel = [];
    for (let i = 1; i < 10; i++) {
        jeuActuel.push(document.getElementById("case" + i).innerText);
    }

    let meilleurCoup = -1;
    let scoreMax = -Infinity;

    for (let i = 0; i < 9; i++) {
        if (jeuActuel[i] === "") {
            let simulation = [...jeuActuel];
            simulation[i] = (tour === 0 ? "X" : "O");
            let score = predictWin(getFeatures(simulation));
            
            // Si c'est le tour de X, on maximise. Si c'est O, on cherche à minimiser la victoire de X
            if (tour === 0) {
                if (score > scoreMax) { scoreMax = score; meilleurCoup = i + 1; }
            } else {
                // Pour O, on cherche le coup qui donne la plus faible probabilité de victoire à X
                if (-score > scoreMax) { scoreMax = -score; meilleurCoup = i + 1; }
            }
        }
    }

    if (meilleurCoup !== -1) {
        setTimeout(() => Case(meilleurCoup), 600); // Délai de réflexion "humain"
    }
}

// ==========================================
// 4. FONCTIONS D'INTERFACE 
// ==========================================

function init(mode) {
    currentMode = mode;
    
    // Animation des boutons
    const boutons = document.querySelectorAll(".button1");
    boutons.forEach(btn => {
        btn.classList.add("fadeOut");
        setTimeout(() => { btn.style.display = "none"; }, 500);
    });

    setTimeout(() => {
        document.getElementById("bouton_mode").style.display = "inline-block";
    }, 600);

    // Reset du plateau
    tour = 0;
    noms_joueurs();
    
    if (mode === "PvsIA") {
        joueur2_nom = "IA (Baseline)";
    } else if (mode === "IAvsIA") {
        joueur1_nom = "IA X";
        joueur2_nom = "IA O";
    }

    document.getElementById("txt_joueur").innerHTML = "A " + joueur1_nom + " de jouer !";
    
    for (let i = 1; i < 10; i++) {
        let c = document.getElementById("case" + i);
        c.innerHTML = "";
        c.style.color = "#FFFFFF";
        c.style.borderColor = ""; 
    }

    statut_jeu = 1;

    // Si l'IA commence (IAvsIA)
    if (mode === "IAvsIA") {
        jouerIA();
    }
}

function showModes() {
    const boutons = document.querySelectorAll(".button1");
    boutons.forEach(btn => {
        btn.style.display = "inline-block";
        btn.classList.remove("fadeOut");
        btn.innerHTML = btn.id === "bouton_jouer" ? "Jouer en 1v1" : 
                        btn.id === "bouton_IA" ? "Jouer VS IA" : "IA VS IA";
    });
    document.getElementById("bouton_mode").style.display = "none";
    statut_jeu = 0;
    document.getElementById("txt_joueur").innerHTML = "Morpion";
}

function Case(number) {
    let bouton = document.getElementById("case" + number);
    
    if (statut_jeu !== 1 || bouton.innerText !== "") return;

    if (tour === 0) {
        bouton.innerHTML = "X";
        document.getElementById("txt_joueur").innerHTML = "A " + joueur2_nom + " de jouer !";
        tour = 1;
    } else {
        bouton.innerHTML = "O";
        document.getElementById("txt_joueur").innerHTML = "A " + joueur1_nom + " de jouer !";
        tour = 0;
    }

    fin_jeu();

    // Lancement automatique de l'IA si nécessaire
    if (statut_jeu === 1) {
        if (currentMode === "IAvsIA" || (currentMode === "PvsIA" && tour === 1)) {
            jouerIA();
        }
    }
}

function fin_jeu() {
    const jeu = [];
    for (let i = 1; i < 10; i++) {
        jeu.push(document.getElementById("case" + i).innerText);
    }

    const conditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Horizontales
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Verticales
        [0, 4, 8], [2, 4, 6]             // Diagonales
    ];

    let gagne = false;

    for (let condition of conditions) {
        if (jeu[condition[0]] !== "" && 
            jeu[condition[0]] === jeu[condition[1]] && 
            jeu[condition[0]] === jeu[condition[2]]) {
            
            statut_jeu = 3;
            let gagnant = (jeu[condition[0]] === "X") ? joueur1_nom : joueur2_nom;
            document.getElementById("txt_joueur").innerHTML = "Victoire de " + gagnant + " !";
            gagne = true;
            break;
        }
    }

    if (!gagne && !jeu.includes('')) {
        document.getElementById("txt_joueur").innerHTML = "Egalité";
        statut_jeu = 2;
    }

    if (statut_jeu === 3) {
        for (let i = 1; i < 10; i++) {
            let c = document.getElementById("case" + i);
            if (c.innerText === "X") c.style.color = "#FF0000";
            if (c.innerText === "O") c.style.color = "#0000FF";
        }
    }
}

function noms_joueurs() {
    let j1 = document.getElementById("j1").value;
    let j2 = document.getElementById("j2").value;
    joueur1_nom = j1 !== "" ? j1 : "Joueur 1";
    joueur2_nom = j2 !== "" ? j2 : "Joueur 2";
}