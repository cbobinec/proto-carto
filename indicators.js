// Expression mapbox pour 100 * Men_pauv/Men
const indicateur_expression = [
  "*",
  100,
  [
    "/",
    ["get", "Men_pauv"],
    ["get", "Men"]
  ]
];

const indicateurs = {
  nb_individus: {
    title: 'Titre de mon indicateur 1',
    paint: {
      'fill-color': [
        'step',
        indicateur_expression,
        'red',
        50, 'blue',
      ],
      'fill-opacity': 0.5,
    },
  },
  niveau_vie_moyen: {
    title: 'Titre de mon indicateur 2',
    paint: {
      'fill-color': 'orange',
      'fill-opacity': 1,
    },
  },
  test_hachures: {
    title: 'Titre de mon indicateur 3',
    paint: {
      'fill-color': 'rgba(0, 0, 0, 0)',
      'fill-opacity': 1,
      'fill-pattern': 'grille',
    },
  },
};
