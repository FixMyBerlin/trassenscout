import { TFeedback } from "../../components/types"

// todo refs readme

export const feedbackDefinition: TFeedback = {
  part: 2,
  pages: [
    {
      id: 1,
      title: { de: "Wir sind gespannt auf Ihre Anmerkungen." },
      description: {
        de: "Hier können Sie dem Planungsteam konkrete Ideen, Anregungen und Hinweise zum RS 8 mit auf den Weg geben. Sie können mehrere Anmerkungen abgeben, bitte geben Sie diese einzeln ab.",
      },
      questions: [
        {
          id: 21,
          label: { de: "Zu welchem Thema passt Ihr Feedback?" },
          evaluationRef: "feedback-category",
          component: "singleResponse",
          props: {
            responses: [
              { id: 1, text: { de: "Nutzung" } },
              { id: 2, text: { de: "Streckenführung" } },
              { id: 3, text: { de: "Zubringer" } },
              { id: 4, text: { de: "Mögliche Konflikte" } },
              { id: 5, text: { de: "Umwelt- und Naturschutz" } },
              { id: 6, text: { de: "Sonstiges" } },
            ],
          },
        },
        {
          id: 22,
          label: {
            de: "Bezieht sich Ihr Feedback auf eine konkrete Stelle entlang der Route?",
          },
          component: "singleResponse",
          evaluationRef: "is-feedback-location",
          props: {
            responses: [
              { id: 1, text: { de: "Ja" } },
              { id: 2, text: { de: "Nein" } },
            ],
          },
        },
        {
          id: 23,
          evaluationRef: "feedback-location",
          label: { de: "Markieren Sie die Stelle, zu der Sie etwas sagen möchten." },
          component: "map",
          props: {
            maptilerStyleUrl:
              "https://api.maptiler.com/maps/a4824657-3edd-4fbd-925e-1af40ab06e9c/style.json",
            marker: {
              lat: 48.87405710508672,
              lng: 9.271044583540359,
            },
            layerStyles: [
              {
                id: "RS8--allsections-luecke-copy",
                type: "line",

                layout: { visibility: "visible" },
                paint: {
                  "line-color": "#2C62A9",
                  "line-width": 3,
                  "line-dasharray": [2, 2],
                },
                filter: ["all", ["==", "planungsabschnitt", "2A"]],
              },
              {
                id: "RS8--allsections",
                type: "line",

                layout: { visibility: "visible" },
                paint: { "line-color": "#2C62A9", "line-width": 3 },
                filter: ["all", ["!=", "planungsabschnitt", "2A"]],
              },
              {
                id: "RS8--section4",
                type: "line",

                layout: { visibility: "none" },
                paint: {
                  "line-color": "#2C62A9",
                  "line-width": 7,
                  "line-opacity": 1,
                },
                filter: ["all", ["==", "teilstrecke", 4]],
              },
              {
                id: "RS8--section3",
                type: "line",

                layout: { visibility: "none" },
                paint: { "line-color": "#2C62A9", "line-width": 5 },
                filter: ["all", ["==", "teilstrecke", 3]],
              },
              {
                id: "RS8--section1",
                type: "line",

                layout: { visibility: "none" },
                paint: { "line-color": "#2C62A9", "line-width": 5 },
                filter: ["any", ["==", "teilstrecke", 1], ["==", "planungsabschnitt", "2B"]],
              },
              {
                id: "RS8--section1-luecke",
                type: "line",

                layout: { visibility: "none" },
                paint: {
                  "line-color": "#2c62a9",
                  "line-width": 7,
                  "line-dasharray": [2, 2],
                },
                filter: ["all", ["==", "planungsabschnitt", "2A"]],
              },
              {
                id: "RS8--section2",
                type: "line",

                layout: { visibility: "none" },
                paint: { "line-color": "#2c62a9", "line-width": 5 },
                filter: ["all", ["==", "teilstrecke", 2], ["!=", "planungsabschnitt", "2A"]],
              },
            ],
            projectGeometry: {
              type: "FeatureCollection",
              features: [
                {
                  type: "Feature",
                  geometry: {
                    type: "MultiLineString",
                    coordinates: [
                      [
                        [9.194367, 48.893241],
                        [9.204387, 48.893397],
                        [9.20694, 48.892932],
                        [9.207345, 48.892804],
                        [9.207572, 48.892527],
                        [9.209643, 48.892222],
                        [9.209518, 48.891871],
                        [9.211302, 48.891544],
                        [9.213306, 48.891336],
                        [9.214959, 48.891126],
                        [9.215124, 48.891105],
                        [9.215157, 48.891101],
                        [9.215175, 48.891098],
                      ],
                    ],
                  },
                  id: "b52d5fa5-56ee-40de-b854-575f66edcd93",
                  properties: {
                    stroke: "#C93535",
                    gemeinde: "(1:Ludwigsburg)",
                    variante: "Trasse 2",
                    teilstrecke: 1,
                    baulasttraeger: "Stadt Ludwigsburg",
                    planungsabschnitt: "1B",
                  },
                },
                {
                  type: "Feature",
                  geometry: {
                    type: "LineString",
                    coordinates: [
                      [9.240035, 48.887679],
                      [9.240504, 48.887561],
                      [9.243368, 48.886582],
                      [9.243368, 48.886582],
                      [9.243407, 48.88657],
                      [9.243447, 48.886559],
                      [9.243488, 48.88655],
                      [9.243529, 48.886543],
                      [9.243572, 48.886538],
                      [9.243615, 48.886534],
                      [9.243658, 48.886532],
                      [9.244556, 48.886511],
                      [9.244556, 48.886511],
                      [9.244647, 48.886508],
                      [9.244737, 48.886502],
                      [9.245701, 48.886422],
                      [9.245701, 48.886422],
                      [9.245719, 48.886421],
                      [9.245737, 48.886418],
                      [9.245754, 48.886414],
                      [9.245771, 48.88641],
                      [9.245788, 48.886405],
                      [9.245804, 48.8864],
                      [9.24582, 48.886393],
                      [9.245834, 48.886386],
                      [9.245848, 48.886378],
                      [9.245862, 48.88637],
                      [9.245874, 48.886361],
                      [9.245885, 48.886352],
                      [9.245896, 48.886342],
                      [9.245905, 48.886332],
                      [9.245914, 48.886321],
                      [9.245921, 48.88631],
                      [9.245927, 48.886299],
                      [9.245932, 48.886287],
                      [9.245936, 48.886275],
                      [9.245938, 48.886263],
                      [9.24594, 48.886251],
                      [9.24594, 48.886239],
                      [9.245939, 48.886227],
                      [9.245914, 48.886049],
                      [9.245914, 48.886049],
                      [9.245913, 48.886037],
                      [9.245913, 48.886024],
                      [9.245915, 48.886012],
                      [9.245917, 48.885999],
                      [9.245922, 48.885987],
                      [9.245927, 48.885975],
                      [9.245934, 48.885963],
                      [9.245942, 48.885952],
                      [9.245951, 48.885941],
                      [9.245961, 48.88593],
                      [9.245972, 48.88592],
                      [9.245984, 48.885911],
                      [9.245998, 48.885902],
                      [9.246012, 48.885894],
                      [9.246027, 48.885886],
                      [9.246043, 48.885879],
                      [9.246059, 48.885873],
                      [9.246076, 48.885868],
                      [9.246613, 48.885713],
                      [9.246613, 48.885713],
                      [9.246649, 48.885702],
                      [9.246684, 48.88569],
                      [9.246718, 48.885676],
                      [9.24675, 48.885661],
                      [9.246781, 48.885644],
                      [9.246811, 48.885627],
                      [9.246811, 48.885627],
                      [9.24684, 48.885609],
                      [9.246872, 48.885593],
                      [9.246904, 48.885578],
                      [9.246938, 48.885564],
                      [9.246941, 48.885563],
                    ],
                  },
                  id: "99b232e7-3c50-44ba-90ac-0f755c5b1836",
                  properties: {
                    stroke: "#C93535",
                    gemeinde: "(1:Remseck am Neckar)",
                    variante: "Trasse 2",
                    teilstrecke: 2,
                    baulasttraeger: "Kreis Ludwigsburg",
                    planungsabschnitt: "2C",
                  },
                },
                {
                  type: "Feature",
                  geometry: {
                    type: "LineString",
                    coordinates: [
                      [9.305, 48.838441],
                      [9.304997, 48.838436],
                      [9.304601, 48.838093],
                      [9.304812, 48.837885],
                      [9.304872, 48.83786],
                      [9.304872, 48.83786],
                      [9.304889, 48.837856],
                      [9.304906, 48.837851],
                      [9.304922, 48.837846],
                      [9.304937, 48.837839],
                      [9.304952, 48.837833],
                      [9.304967, 48.837825],
                      [9.30498, 48.837817],
                      [9.304993, 48.837809],
                      [9.305005, 48.837799],
                      [9.305015, 48.83779],
                      [9.305025, 48.83778],
                      [9.305034, 48.837769],
                      [9.305042, 48.837759],
                      [9.305048, 48.837747],
                      [9.305054, 48.837736],
                      [9.305058, 48.837724],
                      [9.305307, 48.837136],
                      [9.304794, 48.835689],
                      [9.304766, 48.835575],
                    ],
                  },
                  id: "695f87f5-80b6-498f-8de1-f9c86c62533f",
                  properties: {
                    stroke: "#C93535",
                    gemeinde: "(2:Fellbach,Waiblingen)",
                    variante: "Trasse 2",
                    teilstrecke: 3,
                    baulasttraeger: "Rems-Murr-Kreis",
                    planungsabschnitt: "3E",
                  },
                },
                {
                  type: "Feature",
                  geometry: {
                    type: "LineString",
                    coordinates: [
                      [9.267748, 48.878676],
                      [9.267825, 48.878569],
                      [9.268451, 48.877303],
                      [9.268517, 48.877032],
                      [9.268549, 48.876969],
                      [9.268691, 48.876831],
                      [9.268874, 48.876524],
                      [9.26915, 48.876158],
                      [9.269494, 48.875819],
                      [9.270131, 48.875271],
                      [9.270266, 48.875088],
                      [9.270296, 48.875005],
                      [9.270308, 48.874878],
                      [9.270241, 48.874672],
                      [9.270179, 48.87461],
                      [9.270085, 48.87457],
                      [9.269849, 48.87457],
                      [9.26978, 48.874544],
                      [9.269759, 48.874484],
                      [9.269839, 48.87434],
                      [9.270497, 48.874157],
                      [9.270955, 48.874057],
                      [9.271077, 48.874053],
                      [9.271311, 48.873734],
                      [9.271428, 48.873611],
                      [9.271868, 48.873704],
                    ],
                  },
                  id: "3cfc8c2d-e6ee-43f2-ac1d-e22e8833c9b0",
                  properties: {
                    stroke: "#C93535",
                    gemeinde: "(1:Remseck am Neckar)",
                    variante: "Trasse 2",
                    teilstrecke: 2,
                    baulasttraeger: "Kreis Ludwigsburg",
                    planungsabschnitt: "2E",
                  },
                },
                {
                  type: "Feature",
                  geometry: {
                    type: "MultiLineString",
                    coordinates: [
                      [
                        [9.29207, 48.858252],
                        [9.292078, 48.858219],
                        [9.291812, 48.858175],
                        [9.291812, 48.858175],
                        [9.292473, 48.856699],
                        [9.292982, 48.856188],
                        [9.293174, 48.855993],
                        [9.293184, 48.855969],
                        [9.293181, 48.855934],
                        [9.293181, 48.855934],
                        [9.293169, 48.855902],
                        [9.293154, 48.855871],
                        [9.293135, 48.855841],
                        [9.293114, 48.855811],
                        [9.29309, 48.855783],
                        [9.293064, 48.855755],
                        [9.293034, 48.855729],
                        [9.293003, 48.855704],
                        [9.292969, 48.85568],
                        [9.292871, 48.855605],
                        [9.293147, 48.855463],
                        [9.29311, 48.855429],
                        [9.29311, 48.855429],
                        [9.292896, 48.855241],
                        [9.292699, 48.855044],
                        [9.29252, 48.85484],
                        [9.29236, 48.85463],
                        [9.292219, 48.854413],
                        [9.291977, 48.854032],
                        [9.292263, 48.853953],
                        [9.291678, 48.853146],
                        [9.291121, 48.85261],
                      ],
                    ],
                  },
                  id: "075e7bea-cf2e-4f36-aa30-8ea2a4ea1949",
                  properties: {
                    stroke: "#C93535",
                    gemeinde: "(2:Fellbach,Waiblingen)",
                    variante: "Trasse 2",
                    teilstrecke: 3,
                    baulasttraeger: "Rems-Murr-Kreis",
                    planungsabschnitt: "3B",
                  },
                },
                {
                  type: "Feature",
                  geometry: {
                    type: "MultiLineString",
                    coordinates: [
                      [
                        [9.215175, 48.891098],
                        [9.237414, 48.889564],
                        [9.237415, 48.889563],
                      ],
                    ],
                  },
                  id: "89b36de1-a801-467c-adfb-221a444ffe1c",
                  properties: {
                    stroke: "#E8B500",
                    gemeinde: "(1:Ludwigsburg)",
                    variante: "Trasse 2",
                    teilstrecke: "1",
                    baulasttraeger: "Kreis Ludwigsburg",
                    planungsabschnitt: "2A",
                  },
                },
                {
                  type: "Feature",
                  geometry: {
                    type: "LineString",
                    coordinates: [
                      [9.291121, 48.85261],
                      [9.293172, 48.851867],
                      [9.294817, 48.851281],
                      [9.298633, 48.850979],
                      [9.298644, 48.850966],
                    ],
                  },
                  id: "9e8a0353-84db-475c-a7ad-06c5d0f72ddd",
                  properties: {
                    stroke: "#C93535",
                    gemeinde: "(2:Fellbach,Waiblingen)",
                    variante: "Trasse 2",
                    teilstrecke: 3,
                    baulasttraeger: "Rems-Murr-Kreis",
                    planungsabschnitt: "3C",
                  },
                },
                {
                  type: "Feature",
                  geometry: {
                    type: "MultiLineString",
                    coordinates: [
                      [
                        [9.274665, 48.869429],
                        [9.274703, 48.86932],
                        [9.274746, 48.869152],
                        [9.274791, 48.868943],
                        [9.274809, 48.868783],
                        [9.274816, 48.868538],
                        [9.27481, 48.868336],
                        [9.274812, 48.868237],
                        [9.274825, 48.86811],
                        [9.274838, 48.868006],
                        [9.274863, 48.867903],
                        [9.274888, 48.867825],
                        [9.274923, 48.867734],
                        [9.274959, 48.867654],
                        [9.275009, 48.867559],
                        [9.275061, 48.86747],
                        [9.275154, 48.867324],
                        [9.275197, 48.867258],
                        [9.275258, 48.867174],
                        [9.275335, 48.867075],
                        [9.275409, 48.866986],
                        [9.275484, 48.866897],
                        [9.275548, 48.866831],
                        [9.275638, 48.86674],
                        [9.275746, 48.866631],
                        [9.275908, 48.866484],
                        [9.27604, 48.866377],
                        [9.276142, 48.866304],
                        [9.276242, 48.866237],
                        [9.276363, 48.866166],
                        [9.276498, 48.866093],
                        [9.276662, 48.866017],
                        [9.276886, 48.865926],
                        [9.277058, 48.865868],
                        [9.277234, 48.865816],
                        [9.277393, 48.865779],
                        [9.277628, 48.865725],
                        [9.277837, 48.86568],
                        [9.278076, 48.865629],
                        [9.278266, 48.865585],
                        [9.278439, 48.865546],
                        [9.278489, 48.865533],
                        [9.279574, 48.865193],
                        [9.280329, 48.864946],
                        [9.280836, 48.86482],
                        [9.281998, 48.864604],
                        [9.281998, 48.864604],
                        [9.282559, 48.864482],
                        [9.283109, 48.864338],
                        [9.283645, 48.864173],
                        [9.284165, 48.863988],
                        [9.284668, 48.863783],
                        [9.285767, 48.863323],
                        [9.285943, 48.863261],
                      ],
                    ],
                  },
                  id: "cc9ad2e2-d826-4e6a-a0ac-e4470efa0946",
                  properties: {
                    stroke: "#C93535",
                    gemeinde: "(1:Remseck am Neckar)",
                    variante: "Trasse 2",
                    teilstrecke: 2,
                    baulasttraeger: "Kreis Ludwigsburg",
                    planungsabschnitt: "2G",
                  },
                },
                {
                  type: "Feature",
                  geometry: {
                    type: "MultiLineString",
                    coordinates: [
                      [
                        [9.285943, 48.863261],
                        [9.286104, 48.863205],
                        [9.288148, 48.862564],
                        [9.288722, 48.862285],
                        [9.28939, 48.861891],
                        [9.28939, 48.861891],
                        [9.28968, 48.861722],
                        [9.289953, 48.861542],
                        [9.29021, 48.861352],
                        [9.290448, 48.861151],
                        [9.290666, 48.860941],
                        [9.290865, 48.860722],
                        [9.290865, 48.860722],
                        [9.291225, 48.860269],
                        [9.291541, 48.859801],
                        [9.291541, 48.859801],
                        [9.29174, 48.859372],
                        [9.291896, 48.858934],
                        [9.29207, 48.858252],
                      ],
                    ],
                  },
                  id: "8a1fdd42-4c5a-4499-a5ce-974913f69b60",
                  properties: {
                    stroke: "#C93535",
                    gemeinde: "(2:Fellbach,Waiblingen)",
                    variante: "Trasse 2",
                    teilstrecke: 3,
                    baulasttraeger: "Rems-Murr-Kreis",
                    planungsabschnitt: "3A",
                  },
                },
                {
                  type: "Feature",
                  geometry: {
                    type: "MultiLineString",
                    coordinates: [
                      [
                        [9.304766, 48.835575],
                        [9.304411, 48.834146],
                        [9.304069, 48.833158],
                        [9.303748, 48.832294],
                        [9.303352, 48.831367],
                        [9.302921, 48.830521],
                        [9.302641, 48.829937],
                        [9.302641, 48.829937],
                        [9.302638, 48.82992],
                        [9.302637, 48.829903],
                        [9.302637, 48.829886],
                        [9.30264, 48.829868],
                        [9.302644, 48.829851],
                        [9.30265, 48.829834],
                        [9.302657, 48.829818],
                        [9.302666, 48.829802],
                        [9.302677, 48.829786],
                        [9.30269, 48.829771],
                        [9.302704, 48.829756],
                        [9.30272, 48.829742],
                        [9.302737, 48.829729],
                        [9.302755, 48.829717],
                        [9.302774, 48.829705],
                        [9.302795, 48.829694],
                        [9.302817, 48.829685],
                        [9.302877, 48.829676],
                      ],
                    ],
                  },
                  id: "54c7093b-189d-4f11-b85d-3fc46575040c",
                  properties: {
                    stroke: "#C93535",
                    gemeinde: "(2:,Waiblingen)",
                    variante: "Trasse 2",
                    teilstrecke: 4,
                    baulasttraeger: "Stadt Waiblingen",
                    planungsabschnitt: "4A",
                  },
                },
                {
                  type: "Feature",
                  geometry: {
                    type: "LineString",
                    coordinates: [
                      [9.302877, 48.829676],
                      [9.303212, 48.829625],
                      [9.303391, 48.829587],
                      [9.303589, 48.829502],
                      [9.303551, 48.829457],
                      [9.303368, 48.829264],
                      [9.303407, 48.828815],
                      [9.303313, 48.828644],
                      [9.303157, 48.82844],
                      [9.30268, 48.827772],
                      [9.302113, 48.827112],
                      [9.302117, 48.82691],
                      [9.301908, 48.826901],
                      [9.301908, 48.826901],
                      [9.301818, 48.826891],
                      [9.30173, 48.826878],
                      [9.301643, 48.826861],
                      [9.301558, 48.826841],
                      [9.301474, 48.826817],
                    ],
                  },
                  id: "82bf2e20-18d2-49eb-a5c9-efa633d8ea32",
                  properties: {
                    stroke: "#C93535",
                    gemeinde: "(2:,Waiblingen)",
                    variante: "Trasse 2",
                    teilstrecke: 4,
                    baulasttraeger: "Stadt Waiblingen",
                    planungsabschnitt: "4B",
                  },
                },
                {
                  type: "Feature",
                  geometry: {
                    type: "MultiLineString",
                    coordinates: [
                      [
                        [9.298644, 48.850966],
                        [9.29891, 48.85067],
                        [9.299765, 48.849653],
                        [9.299765, 48.849653],
                        [9.301855, 48.846488],
                        [9.302465, 48.84551],
                        [9.302635, 48.844779],
                        [9.302836, 48.844115],
                        [9.302836, 48.844115],
                        [9.302973, 48.843063],
                        [9.302928, 48.842601],
                        [9.302928, 48.842601],
                        [9.302921, 48.842538],
                        [9.302921, 48.842474],
                        [9.302927, 48.842411],
                        [9.302939, 48.842348],
                        [9.302957, 48.842286],
                        [9.302982, 48.842225],
                        [9.303012, 48.842165],
                        [9.303049, 48.842107],
                        [9.303091, 48.84205],
                        [9.303139, 48.841995],
                        [9.303192, 48.841942],
                        [9.303876, 48.841324],
                        [9.304183, 48.841047],
                        [9.304614, 48.840707],
                        [9.304879, 48.84046],
                        [9.304879, 48.84046],
                        [9.30494, 48.840398],
                        [9.304994, 48.840333],
                        [9.305041, 48.840265],
                        [9.305081, 48.840196],
                        [9.305114, 48.840125],
                        [9.305139, 48.840053],
                        [9.305157, 48.83998],
                        [9.305167, 48.839906],
                        [9.30517, 48.839831],
                        [9.305165, 48.839757],
                        [9.305141, 48.83916],
                        [9.305064, 48.83856],
                        [9.305, 48.838441],
                      ],
                    ],
                  },
                  id: "af5c5de7-20aa-4fbd-9bd9-39aeba3b2720",
                  properties: {
                    stroke: "#C93535",
                    gemeinde: "(2:Fellbach,Waiblingen)",
                    variante: "Trasse 2",
                    teilstrecke: 3,
                    baulasttraeger: "Rems-Murr-Kreis",
                    planungsabschnitt: "3D",
                  },
                },
                {
                  type: "Feature",
                  geometry: {
                    type: "MultiLineString",
                    coordinates: [
                      [
                        [9.271868, 48.873704],
                        [9.271879, 48.873707],
                        [9.272178, 48.873722],
                        [9.272465, 48.873753],
                        [9.272751, 48.873838],
                        [9.273848, 48.873071],
                        [9.274021, 48.872894],
                        [9.274076, 48.872669],
                        [9.274175, 48.872363],
                        [9.274243, 48.872168],
                        [9.274268, 48.872066],
                        [9.274362, 48.871616],
                        [9.274372, 48.871411],
                        [9.274362, 48.871017],
                        [9.274364, 48.870515],
                        [9.274371, 48.870443],
                        [9.274388, 48.870406],
                        [9.274412, 48.870101],
                        [9.274459, 48.869897],
                        [9.274517, 48.869772],
                        [9.27462, 48.869535],
                        [9.27465, 48.869474],
                        [9.274665, 48.869429],
                      ],
                    ],
                  },
                  id: "696da69b-f626-4837-8aa0-cc247e1c73c6",
                  properties: {
                    stroke: "#C93535",
                    gemeinde: "(1:Remseck am Neckar)",
                    variante: "Trasse 2",
                    teilstrecke: 2,
                    baulasttraeger: "Kreis Ludwigsburg",
                    planungsabschnitt: "2F",
                  },
                },
                {
                  type: "Feature",
                  geometry: {
                    type: "MultiLineString",
                    coordinates: [
                      [
                        [9.237415, 48.889563],
                        [9.237619, 48.889472],
                        [9.237941, 48.889298],
                        [9.238162, 48.889179],
                        [9.238432, 48.889015],
                        [9.238708, 48.88883],
                        [9.238913, 48.888682],
                        [9.239225, 48.888451],
                        [9.239484, 48.888282],
                        [9.239682, 48.888117],
                        [9.239889, 48.8879],
                        [9.240031, 48.88768],
                        [9.240035, 48.887679],
                      ],
                    ],
                  },
                  id: "6b895f43-e6cb-4aa2-a9c0-288dab27bd4c",
                  properties: {
                    stroke: "#C93535",
                    gemeinde: "(1:Ludwigsburg)",
                    variante: "Trasse 2",
                    teilstrecke: "1",
                    baulasttraeger: "Kreis Ludwigsburg",
                    planungsabschnitt: "2B",
                  },
                },
                {
                  type: "Feature",
                  geometry: {
                    type: "MultiLineString",
                    coordinates: [
                      [
                        [9.246941, 48.885563],
                        [9.250006, 48.884619],
                        [9.252178, 48.884047],
                        [9.253776, 48.883445],
                        [9.256257, 48.882745],
                        [9.2574, 48.882486],
                        [9.25941, 48.882146],
                        [9.261844, 48.881599],
                        [9.261892, 48.881523],
                        [9.261685, 48.881258],
                        [9.261708, 48.881195],
                        [9.263049, 48.880817],
                        [9.263601, 48.880592],
                        [9.26394, 48.880341],
                        [9.263889, 48.878882],
                        [9.264032, 48.87873],
                        [9.267549, 48.878743],
                        [9.267748, 48.878676],
                      ],
                    ],
                  },
                  id: "10689c70-20f2-492b-879d-5ff6c80376d0",
                  properties: {
                    stroke: "#C93535",
                    gemeinde: "(1:Remseck am Neckar)",
                    variante: "Trasse 2",
                    teilstrecke: 2,
                    baulasttraeger: "Kreis Ludwigsburg",
                    planungsabschnitt: "2D",
                  },
                },
                {
                  type: "Feature",
                  geometry: {
                    type: "LineString",
                    coordinates: [
                      [9.185953, 48.892557],
                      [9.186506, 48.893118],
                      [9.194367, 48.893241],
                    ],
                  },
                  id: "adc65867-7da3-4015-aab3-af60a859e963",
                  properties: {
                    stroke: "#C93535",
                    gemeinde: "(1:Ludwigsburg)",
                    variante: "Trasse 2",
                    teilstrecke: 1,
                    baulasttraeger: "Stadt Ludwigsburg",
                    planungsabschnitt: "1A",
                  },
                },
              ],
            },
            config: {
              zoom: 2,
              bounds: [9.387312714501604, 48.90390202531458, 9.103949029818097, 48.81629635563661],
              longitude: 13.5,
              latitude: 52.5,
              boundsPadding: 20,
            },
          },
        },
      ],
      buttons: [
        { label: { de: "Weiter" }, color: "pink", onClick: { action: "nextPage" } },
        { label: { de: "Zurück" }, color: "white", onClick: { action: "previousPage" } },
      ],
    },
    {
      id: 2,
      title: { de: "Ihr Hinweis" },
      description: {
        de: "Formulieren Sie hier Ihre Gedanken, Ideen, Anregungen oder Wünsche",
      },
      questions: [
        {
          id: 31,
          label: { de: "Kategorie" },
          component: "custom",
        },
        {
          id: 32,
          label: { de: "Ausgewählte Stelle" },
          component: "custom",
        },
        {
          id: 33,
          label: { de: "Wählen Sie die Stelle für Ihr Feedback" },
          component: "custom",
        },
        {
          id: 34,
          label: { de: "Was gefällt Ihnen hier besonders?" },
          component: "text",
          evaluationRef: "feedback-usertext-1",
          props: {
            placeholder: { de: "Beantworten Sie hier..." },
            caption: { de: "Max. 2000 Zeichen" },
          },
        },
        {
          id: 35,
          label: { de: "Was wünschen Sie sich?" },
          component: "text",
          evaluationRef: "feedback-usertext-2",
          props: {
            placeholder: { de: "Beantworten Sie hier..." },
            caption: { de: "Max. 2000 Zeichen" },
          },
        },
      ],
      buttons: [
        {
          label: { de: "Absenden & Beteiligung abschließen" },
          color: "pink",
          onClick: { action: "submit" },
        },
        {
          label: { de: "Absenden &  weiteren Hinweis geben" },
          color: "white",
          onClick: { action: "submit" },
        },
      ],
    },
  ],
}
