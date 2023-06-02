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