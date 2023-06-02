const configuration_indicateurs = {
    niveau_vie_moyen: {
        libelle: 'Part des ménages pauvres',
        expression_mapbox: [
            "*",
            100,
            [
                "/",
                ["get", "Men_pauv"],
                ["get", "Men"]
            ]
        ]
    },
    part_fam_monop: {
        libelle: 'Part des familles monoparentales',
        expression_mapbox: [
            "*",
            100,
            [
                "/",
                ["get", "Men_fmp"],
                ["get", "Men"]
            ]
        ]
    }
}