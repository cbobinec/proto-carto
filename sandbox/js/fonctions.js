// Génère l'expression mapbox https://docs.mapbox.com/mapbox-gl-js/style-spec/expressions/
// A partir du nom du numérateur et dénominateur à représenter
function genererExpressionMapbox(numerateur, 
    denominateur = 1,
    pourcentage = false
    ) {
      if (pourcentage) {
        return [
                "*",
                100,
                [
                    "/",
                    ["get", numerateur],
                    ["get", denominateur]
                ]
            ]
      }
      else {
        return [
                  "/",
                  ["get", numerateur],
                  ["get", denominateur]
            ]
      }  
    }

function mettreAJourRepresentationIndicateur(map, indicateur_choisi) {
    const configuration = configuration_indicateurs[indicateur_choisi];

    document.getElementById("titre_indicateur").innerHTML=configuration.libelle;

    expressionMapbox = genererExpressionMapbox(configuration.numerateur,
        configuration.denominateur,
        configuration.pourcentage)

    stepMapbox = genererStepMapbox(configuration.classes, configuration.palette)

    fillColorValue = ['step', // function
                            expressionMapbox, // value
                            ...stepMapbox
                        ]

    // On change la représentation
    map.setPaintProperty('insee_carroyage200m_fill', 
                        'fill-color', 
                        fillColorValue);

    genereLegende(indicateur_choisi);
}

/*
* Génère l'expression step mapbox permettant de répresenter les classes par couleur
* https://stackoverflow.com/a/53506912
* https://docs.mapbox.com/mapbox-gl-js/style-spec/expressions/#step
*/
function genererStepMapbox(classes,palette) {
      if (classes.length + 1 != palette.length) {
        console.error("La palette utilisée doit comprendre le nombre de classes + 1");
      }
      // Le premier élement est la première valeur de la palette, celle par défaut avant les seuils de classe
      resultat = [ palette[0] ]
    
      // Ensuite on alterne borne de classe, et couleur associée
      // Ce qui induit un décalage d'indice : la classe 1 a pour couleur la 2eme couleur de la palette
      classes.forEach((classe, index) => {
          resultat.push(classe, palette[index+1])
      });
      return resultat;
    }

function genereLegende(indicateur_choisi) {    
    const configuration = configuration_indicateurs[indicateur_choisi];

    // Infos de l'indicateur
    const classes = configuration.classes;
    const palette = configuration.palette;
    const libelle = configuration.libelle;
    const pourcentage = configuration.pourcentage;
    
    // Espace où insérer la légende
    const legende = document.getElementById("legende");
    // On supprime la légende éventuellement déjà présente pour un autre indicateur
    legende.replaceChildren(); 

    // Titre de l'indicateur
    const item = document.createElement("div");
    const value = document.createElement("span");
    value.innerHTML = `<b>${libelle}</b>`;
    legende.appendChild(value);
    legende.appendChild(item);

    // On créée les couleurs/textes un par un
    let seuil_precedent = null;

    classes.forEach((seuil, i) => {
        const couleur = palette[i];
        let item = genererLigneLegende(seuil, seuil_precedent, couleur, pourcentage);
        legende.appendChild(item);
        seuil_precedent = seuil;      
    });

    // On n'oublie pas la dernière couleur, le "plus de"
    // .slice(-1) permet de récupérer le dernier element
    const derniereLigneLegende = genererLigneLegende(null, classes.slice(-1), palette.slice(-1), pourcentage);
    legende.appendChild(derniereLigneLegende);
}

function genererLigneLegende(seuil, seuil_precedent, couleur, pourcentage) {    
    const item = document.createElement("div");
    const key = document.createElement("span");
    key.className = "legend-key";
    key.style.backgroundColor = couleur;

    const value = document.createElement("span");
    value.innerHTML = genererTexteLegende(seuil, seuil_precedent, pourcentage);
    item.appendChild(key);
    item.appendChild(value);
    return item;
}

function genererTexteLegende(seuil, seuil_precedent, pourcentage) {
    // .toLocaleString() permet d'ajouter les séparateur de millier
    if (seuil_precedent && seuil) {
        return `De ${valeurToString(seuil_precedent, pourcentage)} à moins de ${valeurToString(seuil, pourcentage)}`
    } else if (seuil) {
        return `Moins de ${valeurToString(seuil, pourcentage)}`;
    } else if (seuil_precedent) {
        return `Plus de ${valeurToString(seuil_precedent, pourcentage)}`;
    }
}

function valeurToString(valeur, pourcentage) {
    if (pourcentage) {
        return `${valeur.toLocaleString()}%`;
    }
    else {
        return `${valeur.toLocaleString()}`;
    }
}