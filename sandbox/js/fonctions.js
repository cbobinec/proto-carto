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
}

/*
* Génère l'expression step mapbox permettant de répresenter les classes par couleur
* https://stackoverflow.com/a/53506912
* https://docs.mapbox.com/mapbox-gl-js/style-spec/expressions/#step
*/
function genererStepMapbox(classes,palette) {
      if (classes.length > palette.length) {
        alert("La palette est trop petite pour le nombre de classes à représenter !");
      }
      // Le premier élement est la première valeur de la palette, celle par défaut avant les seuils de classe
      resultat = [ palette_jaune_rouge[0] ]
    
      // Ensuite on alterne borne de classe, et couleur associée
      // Ce qui induit un décalage d'indice : la classe 1 a pour couleur la 2eme couleur de la palette
      classes.forEach((classe, index) => {
          resultat.push(classe, palette_jaune_rouge[index+1])
      });
      return resultat;
    }