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

    // On change la représentation
    map.setPaintProperty('insee_carroyage200m_fill', 
                        'fill-color', 
                        ['step', // function
                        expressionMapbox, // value
                        '#FFFFCC',
                        10, '#FFFFCC',
                        20, '#FFE6B4',
                        50, '#FFC696',
                        300, '#FFA176',
                        1300, '#FF7755',
                        3200, '#E05544',
                        6300, '#cc3333',
                        12000, '#990000',
                        23600, '#660000',
    ]);
}