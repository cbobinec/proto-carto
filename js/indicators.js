// Expression mapbox pour Ind
const indicateur_expression_1 = [
  "*",
  100,
  [
    "/",
    ["get", "Men_pauv"],
    ["get", "Men"]
  ]
];

const classes_1 = [
  0, "#FFFFCC",
  4, "#FFE6B4",
  9, "#FFC696",
  14, "#FFA176",
  20, "#FF7755",
  28, "#E05544",
  39, "#cc3333",
];

// Expression mapbox pour 100 * Men_pauv/Men
const indicateur_expression_2 = ["get", "Ind"];

const classes_2 = [
  0, "#FFFFCC",
  10, "#FFE6B4",
  20, "#FFC696",
  50, "#FFA176",
  300, "#FF7755",
  1300, "#E05544",
  3200, "#cc3333",
  6300, "#cc3333",
  12000, "#cc3333",
  23600, "#cc3333",
];

const indicateurs = {
  ind_1: {
    title: 'Part des ménages pauvres',
    paint: {
      'fill-color': [
        'step',
        indicateur_expression_1,
        ...classes_1,
      ],
      'fill-opacity': 0.5,
    },
  },
  ind_2: {
    title: 'Nombre d\'individus au sens fiscal',
    paint: {
      'fill-color': [
        'step',
        indicateur_expression_2,
        ...classes_2,
      ],
      'fill-opacity': 0.5,
    },
  },
  test_hachures: {
    title: 'Titre de mon indicateur 3',
    paint: {
      'fill-color': '#000000',
      'fill-opacity': 1,
      'fill_pattern': 'grille',      
    },
    filter: ["==", "I_est_200", "0"],
  },
};
