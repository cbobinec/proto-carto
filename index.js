// Couches
// Fond de carte
const style_url = "https://wxs.ign.fr/essentiels/static/vectorTiles/styles/PLAN.IGN/standard.json";
// Tuiles carreaux+données Insee
// Couches les plus fines pour zoom élevé
const data_url_200m = "https://insee-proto-tiles.netlify.app/filosofi-2017-200m/{z}/{x}/{y}.pbf";
// Nom de la layer du fond de carte par dessus laquelle "glisser"/intercaler la couche data
// Permet : fond de carte < couche data insee < libellés du fond de carte
const layer_insertion = "toponyme - bornes postales haute - chemins";

// Indicateur représenté 
// TODO Généraliser avec plusieurs et le menu déroulant...
const indicateur_titre = "Part des ménages pauvres"



// Légende
const classes_names = [
  "Moins de 3%",
  "De 4 à 8%",
  "De 9 à 14%",
  "De 15 à 19%",
  "De 20 à 27%",
  "De 28 à 39%",
  "Plus de 40%",
];
const classes_colors = [
  "#FFFFCC",
  "#FFE6B4",
  "#FFC696",
  "#FFA176",
  "#FF7755",
  "#E05544",
  "#cc3333",
];

// Zoom par défaut
// Région parisienne
//const default_center = [2.37, 48.881];
//const default_zoom = 11;
// Gros zoom moins consommateur pour les tests
const default_center = [-1.546, 47.204];
const default_zoom = 15;
// Niveau de zoom associé à la recherche par adresse 
const default_zoom_search = 14;

const source_text = `
                  <a href='https://www.insee.fr/fr/statistiques/6215138?sommaire=6215217' target='_blank'>
                    © IGN, Insee - Filosofi 2017 - Carreau 200m
                  </a>`;
const performance_text = "Pour des raisons de performances merci de sélectionner moins de 10 000 carreaux"
const export_text = "Télécharger la sélection (.geojson)"
const export_filename = "export_filosofi_2017_insee.geojson";

// Fonction générartion de tableau pour key/value
const makeTable = (obj) => `<table>
${Object.entries(obj)
  .map(([key, value]) => `<tr><th>${key}</th><td>${value}</td></tr>`)
  .join("\n")}
</table>`;

// Exporte la section préalablement stockée dans le localstorage
const export_data = function export_data() {  
  data = localStorage.getItem("json_selected_data");

  let content = "data:application/json;charset=utf-8," 
    + data;

  var element = document.createElement('a');
  element.setAttribute('href', content);
  element.setAttribute('download', export_filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

fetch(style_url)
  .then((res) => res.json())
  .then((style) => {
    // Patch tms scheme to xyz to make it compatible for Maplibre GL JS / Mapbox GL JS
    // https://guides.etalab.gouv.fr/apis-geo/3-tuiles-vecteur.html#l-alternative-des-tuiles-vecteur-de-l-ign
    style.sources.plan_ign.scheme = "xyz";
    style.sources.plan_ign.attribution = source_text;

    const map = new maplibregl.Map({
      style: style,
      center: default_center,
      zoom: default_zoom,
      container: document.querySelector(".map"),
      minZoom: 10, // on bloque au niveau 10 TODO voir ce qui peut être restitué niveaux supérieurs (généralisation, carreau 1km...)
    });

    // Suppression du zoom par sélection pour le remplacer par notre selection de carreaux avec Maj
    map.boxZoom.disable();

    map.on("load", () => {
      // On désactive le compass
      map.addControl(new maplibregl.NavigationControl({
        showCompass: false
      }));
      // Mode plein écran
      map.addControl(new maplibregl.FullscreenControl());

      map.addSource("insee200m", {
        type: "vector",
        tiles: [
          data_url_200m,
        ],
        minzoom: 10,
        maxzoom: 10,
      });

      const layerOptions200m = {
        id: "insee_carroyage200m_fill",
        source: "insee200m",
        type: "fill",
        minzoom: 10,
        "source-layer": "custom",
        paint: {
          //"fill-opacity": 0.7,
          // opacité différente si selection multiple
          "fill-opacity": [
            "case",
            ["boolean", ["feature-state", "hover"], false],
            1,
            0.7,
          ],
          "fill-color": [
            "interpolate", // function
            ["linear"],
            // Restitution basique
            // ['get', 'Men_1ind'],
            // Avec formule (pas simple) https://github.com/mapbox/mapbox-gl-js/issues/5685
            // Formule 100* (men_1ind/ men)
            indicateur_expression,
            0,
            "#FFFFCC",
            4,
            "#FFE6B4",
            9,
            "#FFC696",
            14,
            "#FFA176",
            20,
            "#FF7755",
            28,
            "#E05544",
            39,
            "#cc3333",
          ],
        },      
        
      };

      // On glisse les carreaux entre le fond, et la couche de son choix (pour afficher les libellés de commune par dessus notamment)
      map.addLayer(
        layerOptions200m,
        layer_insertion
      );

      // Layer pour les carreaux sélectionnés
      map.addLayer(
        {
          source: "insee200m",
          id: "insee_carroyage200m_highlight",
          type: "fill",
          "source-layer": "custom",
          paint: {
            "fill-opacity": 0.5,
            "fill-color": "#3887be",
          },
          filter: ["in", "Idcar_200m", ""],
        },
        layer_insertion
      );      
    });

    // Change layer paint according configuration object
    const indicatorsSelect = document.querySelector('#indicators');
    indicatorsSelect.addEventListener('change', event => {
      const value = event.target.value;

      const indicatorSettings = indicateurs[value];
      const paint = indicatorSettings.paint;

      for (property in paint) {
        const propertyValue = paint[property];
        map.setPaintProperty('insee_carroyage200m_fill', property, propertyValue);
      }
    });

    // Change layer opacity with range slider
    const opacitySlider = document.querySelector('#opacitySlider');
    opacitySlider.addEventListener('change', event => {
      map.setPaintProperty('insee_carroyage200m_fill', 'fill-opacity', Number(event.target.value));
    });

    // Affichage de la valeur de l'indicateur dans le volet gauche
    const donnees = document.getElementById("donnees");

    let hoveredSquareId = null;
    map.on("click", "insee_carroyage200m_fill", (event) => {
      // On reset une éventuelle sélection multiple qui aurait été fait auparavant
      map.setFilter("insee_carroyage200m_highlight", [
        "in",
        "Idcar_200m",
        "",
      ]);


      if (event.features.length > 0) {
        map.getCanvas().style.cursor = "pointer";
        if (hoveredSquareId) {
          map.setFeatureState(
            { source: "insee200m", sourceLayer: "custom", id: hoveredSquareId },
            { hover: false }
          );
        }

        hoveredSquareId = event.features[0].id;
        map.setFeatureState(
          { source: "insee200m", sourceLayer: "custom", id: hoveredSquareId },
          { hover: true }
        );
        var properties = event.features[0].properties;
        var data = {
          "Nombre de ménages": properties["Men"].toLocaleString(),
          "Part des ménages pauvres":
            Math.round((100 * properties["Men_pauv"]) / properties["Men"]) +
            " %",
        };
        donnees.innerHTML = makeTable(data);
      }
    });
    // Fin affichage de la valeur de l'indicateur dans le volet gauche

    // Affichage de la légende
    const legend = document.getElementById("legend");

    // Titre
    const item = document.createElement("div");
    const value = document.createElement("span");
    value.innerHTML = `<b>${indicateur_titre}</b>`;
    legend.appendChild(value);
    legend.appendChild(item);

    classes_names.forEach((layer, i) => {
      const color = classes_colors[i];
      const item = document.createElement("div");
      const key = document.createElement("span");
      key.className = "legend-key";
      key.style.backgroundColor = color;

      const value = document.createElement("span");
      value.innerHTML = `${layer}`;
      item.appendChild(key);
      item.appendChild(value);
      legend.appendChild(item);
    });
    // Fin affichage de la légende









    // Sélection multiple
    const canvas = map.getCanvasContainer();

    // Variable to hold the starting xy coordinates
    // when `mousedown` occured.
    let start;

    // Variable to hold the current xy coordinates
    // when `mousemove` or `mouseup` occurs.
    let current;

    // Variable for the draw box element.
    let box;

    // Return the xy coordinates of the mouse position
    const mousePos = (e) => {
      const rect = canvas.getBoundingClientRect();
      return new maplibregl.Point(
        e.clientX - rect.left - canvas.clientLeft,
        e.clientY - rect.top - canvas.clientTop
      );
    };

    const mouseDown = (e) => {
      // Continue the rest of the function if the shiftkey is pressed.
      if (!(e.shiftKey && e.button === 0)) return;

      // Disable default drag zooming when the shift key is held down.
      map.dragPan.disable();

      // Call functions for the following events
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
      document.addEventListener("keydown", onKeyDown);

      // Capture the first xy coordinates
      start = mousePos(e);
    };

    const onMouseMove = (e) => {
      // Capture the ongoing xy coordinates
      current = mousePos(e);

      // Append the box element if it doesnt exist
      if (!box) {
        box = document.createElement("div");
        box.classList.add("boxdraw");
        canvas.appendChild(box);
      }

      const minX = Math.min(start.x, current.x),
        maxX = Math.max(start.x, current.x),
        minY = Math.min(start.y, current.y),
        maxY = Math.max(start.y, current.y);

      // Adjust width and xy position of the box element ongoing
      const pos = `translate(${minX}px, ${minY}px)`;
      box.style.transform = pos;
      box.style.width = maxX - minX + "px";
      box.style.height = maxY - minY + "px";
    };

    // Capture xy coordinates
    const onMouseUp = (e) => {
      finish([start, mousePos(e)]);
    };

    // If the ESC key is pressed
    const onKeyDown = (e) => {
      if (e.keyCode === 27) finish();
    };

    const finish = (bbox) => {
      // Remove these events now that finish has been called.
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mouseup", onMouseUp);

      if (box) {
        box.parentNode.removeChild(box);
        box = null;
      }

      // If bbox exists. use this value as the argument for `queryRenderedFeatures`
      if (bbox) {
        const features = map.queryRenderedFeatures(bbox, {
          layers: ["insee_carroyage200m_fill"],
        });

        if (features.length >= 10000) {
          return window.alert(
            performance_text
          );
        }

        // Run through the selected features and set a filter
        // to match features with unique featureIds codes to activate
        // the `insee_carroyage200m_highlight` layer.
        const featureIds = features.map(
          (feature) => feature.properties.Idcar_200m
        );
        map.setFilter("insee_carroyage200m_highlight", [
          "in",
          "Idcar_200m",
          ...featureIds,
        ]);

        const add = (v1 = 0, v2 = 0) => v1 + v2;

        const NaNproperties = new Set();

        const data = features.reduce((acc, curr) => {
          const { properties = {} } = curr;

          return Object.fromEntries(
            Object.entries(properties).map((curr) => {
              const [key, value] = curr;

              if (typeof value !== "number") {
                NaNproperties.add(key);
              }

              if (typeof value === "number") {
                return [key, Math.round(add(acc[key], value) * 1000) / 1000];
              }

              if (typeof acc[key] === "undefined") {
                return [key, 1];
              }

              return [key, acc[key] + 1];
            })
          );
        }, {});

        const dataPresentation = {
          "Nombre de carreaux": data.Idcar_200m.toLocaleString(),
          "Nombre de ménages": data.Men.toLocaleString(),
          "Part des ménages pauvres":
            Math.round((100 * data.Men_pauv) / data.Men) + " %",
        };
        donnees.innerHTML = makeTable(dataPresentation);
        localStorage.setItem("json_selected_data",  JSON.stringify(features));
        donnees.innerHTML += "<br><button onclick='export_data()' id='download_button'>" +
                              export_text +
                            "</button>";
      }

      map.dragPan.enable();
    };

    // Set `true` to dispatch the event before other functions
    // call it. This is necessary for disabling the default map
    // dragging behaviour.
    canvas.addEventListener("mousedown", mouseDown, true);
    // Fin sélection multiple

    // Recherche par API BAN
    const input = document.querySelector('input');
    const resultsWrapper = document.querySelector('.geocoding-results');

        const debounce = (context, func, delay) => {
          let timeout;

          return (...arguments) => {
            if (timeout) {
              clearTimeout(timeout);
            }

            timeout = setTimeout(() => {
              func.apply(context, arguments);
            }, delay);
          };
        };

        // https://adresse.data.gouv.fr/api-doc/adresse

        const renderOptions = (items, str) => {
          console.log(items);

          resultsWrapper.innerHTML = '';

          const results = document.createDocumentFragment();

          items.forEach(feature => {
            const result = document.createElement('button');
            result.type = 'button';
            result.classList.add('list-group-item');
            result.classList.add('list-group-item-action');
            result.textContent = feature.properties.label;
            result.dataset.location = JSON.stringify(feature.geometry.coordinates);
            results.appendChild(result);
          });

          resultsWrapper.appendChild(results);
        };

        const handleInputKeydown = async event => {
          const search = event?.target?.value;
          if (!search || search.length < 3) {
            return;
          }

          if (!event.code.match(/Key/)) {
            return;
          }

          const raw = await fetch(
            `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(search)}`,
          );

          const result = await raw.json();

          const items = result.features
          renderOptions(items, search);
        };

        const handleResultClick = event => {
          try {
            const coords = JSON.parse(event.target?.dataset?.location);
            // On passe à un niveau de zoom assez global
            map.setZoom(default_zoom_search);
            map.flyTo({ center: coords });
            // Ajout d'un marqueur à l'adresse
            var marker = new maplibregl.Marker()
              .setLngLat(coords)
              .addTo(map);
            // On reset tout le formulaire
            resultsWrapper.innerHTML = '';
            input.value = '';
          } catch (err) {
            console.error(err);
          }
        };

        input.addEventListener('keydown', debounce(this, handleInputKeydown, 200));
        resultsWrapper.addEventListener('click', handleResultClick);
    // Fin recherche API BAN

    // Filtre des données en fonction du formulaire
    const filter_button = document.querySelector('#filter_button');
    filter_button.addEventListener('click', function filtrer() {
      indicateur_valeur_min = Number(document.querySelector('#indicateur_min').value);
      indicateur_valeur_max = Number(document.querySelector('#indicateur_max').value);
      map.setFilter("insee_carroyage200m_fill", [
        "all",
        [">=", indicateur_expression, indicateur_valeur_min],
        ["<=", indicateur_expression, indicateur_valeur_max]
      ]);
    }
    );
    
  });
