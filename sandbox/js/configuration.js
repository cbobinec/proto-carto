const tiles_url = [`https://insee-odl-tiles.netlify.app/filosofi-2017-200m/{z}/{x}/{y}.pbf`]

const indicateur_par_defaut = "niveau_vie_moyen";

const palette_jaune_rouge = ["#FFFFCC", 
                            "#FFE6B4",
                            "#FFC696",
                            "#FFA176",
                            "#FF7755",
                            "#E05544",
                            "#cc3333",
                            "#990000", 
                            "#660000"]

const configuration_indicateurs = {
    nb_individus: {
        libelle: 'Nombre d\'individus au sens fiscal',
        numerateur: 'Ind',
        denominateur: '1',
        pourcentage: false,
        classes: [10, 20, 50, 300, 1300, 3200, 6300, 12000, 23600],
        palette: palette_jaune_rouge,
    },
    niveau_vie_moyen: {
        libelle: 'Niveau de vie winsorisé des individus, y compris valeurs modifiées',
        numerateur: 'Ind_snv',
        denominateur: 'Ind',
        pourcentage: false,
    },
    part_fam_monop: {
        libelle: 'Part des familles monoparentales',
        numerateur: 'Men_fmp',
        denominateur: 'Men',
        pourcentage: true,
    },
    part_logts_sociaux: {
        libelle: 'Part des logements sociaux',
        numerateur: 'Log_soc',
        denominateur: 'Log',
        pourcentage: true,
    },
    part_men_pauv: {
        libelle: 'Part des ménages pauvres',
        numerateur: 'Men_pauv',
        denominateur: 'Men',
        pourcentage: true,
    },
    part_men_prop: {
        libelle: 'Part des ménages propriétaires',
        numerateur: 'Men_prop',
        denominateur: 'Men',
        pourcentage: true,
    },
    part_menages_1pers: {
        libelle: 'Part des ménages d\'une seule personne',
        numerateur: 'Men_1ind',
        denominateur: 'Men',
        pourcentage: true,
    },
    part_menages_5pers: {
        libelle: 'Part des ménages de 5 personnes ou plus',
        numerateur: 'Men_5ind',
        denominateur: 'Men',
        pourcentage: true,
    },
    part_moins_18_ans: {
        libelle: 'Part des personnes âgées de moins de 18 ans, y compris valeurs modifiées',
        numerateur: 'Ind_0_17',
        denominateur: 'Ind',
        pourcentage: true,
    },
    part_plus_65_ans: {
        libelle: 'Part des personnes âgées de 65 ans ou plus, y compris valeurs modifiées',
        numerateur: 'Ind_65p',
        denominateur: 'Ind',
        pourcentage: true,
    },
    surf_moyenne: {
        libelle: 'Surface moyenne des logements',
        numerateur: 'Men_surf',
        denominateur: 'Men',
        pourcentage: false,
    },
}