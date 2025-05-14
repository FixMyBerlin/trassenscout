import { fieldValidationEnum } from "@/src/app/beteiligung-neu/_shared/fieldvalidationEnum"
import { FormConfig } from "@/src/app/beteiligung-neu/_shared/types"
import { AnyFieldApi } from "@tanstack/react-form"

export const formConfig = {
  meta: {
    version: 1,
    logoUrl: "https://radschnellweg-frm7.de/logo.png",
    canonicalUrl: "https://radschnellweg-frm7.de/beteiligung/",
    maptilerUrl: "https://api.maptiler.com/maps/a9cd44e7-43f6-4277-8ae0-d910f8162524/style.json",
    primaryColor: "#D60F3D",
    darkColor: "#5F071B",
    lightColor: "#fecdd3",
    geometryCategoryType: "line",
    geometryFallback: [
      [
        [8.82878812, 50.14189326],
        [8.8292039, 50.14189235],
        [8.83053662, 50.14197048],
        [8.83136604, 50.14198122],
        [8.83183396, 50.14200087],
        [8.83321121, 50.1420695],
        [8.83438114, 50.14211875],
        [8.8349587, 50.14211958],
        [8.83543306, 50.14201556],
        [8.83633658, 50.1420073],
        [8.83729905, 50.1420753],
        [8.83755033, 50.14221848],
        [8.83857207, 50.14230552],
        [8.84360413, 50.14253132],
        [8.84693618, 50.14265951],
        [8.84703985, 50.14266918],
        [8.84924653, 50.14276722],
        [8.86088078, 50.14324816],
        [8.86931949, 50.14356258],
        [8.86988238, 50.14356321],
        [8.87014924, 50.14346827],
        [8.87047561, 50.14325926],
        [8.8713067, 50.14266056],
        [8.87181128, 50.14227079],
        [8.87304313, 50.14135837],
        [8.87333999, 50.14108267],
        [8.87382999, 50.14063585],
        [8.8740234, 50.14031246],
        [8.87417228, 50.13999847],
        [8.87439529, 50.13964651],
        [8.87463331, 50.13927559],
        [8.87473775, 50.13899015],
        [8.87485661, 50.13880941],
        [8.87506474, 50.13852408],
        [8.87518399, 50.13824819],
        [8.87539185, 50.13801043],
        [8.87570364, 50.13773475],
        [8.87604485, 50.13749714],
        [8.8762823, 50.13728801],
        [8.87640124, 50.13712625],
        [8.87643764, 50.13690342],
      ],
      [
        [8.89363611, 50.13816366],
        [8.89390092, 50.13814142],
        [8.8942145, 50.13795976],
        [8.8948263, 50.13757484],
        [8.89576791, 50.13699739],
        [8.89675041, 50.13639145],
        [8.89727306, 50.13606121],
        [8.89798119, 50.13562869],
        [8.8985336, 50.1352437],
        [8.89874871, 50.13508919],
        [8.89899848, 50.13495729],
        [8.89924646, 50.13460953],
        [8.89961778, 50.13409226],
        [8.89953503, 50.13385421],
        [8.89983129, 50.13383072],
        [8.90105209, 50.13425412],
        [8.9013873, 50.13427302],
        [8.90180845, 50.13428399],
        [8.90240255, 50.1342952],
        [8.90272464, 50.13430257],
        [8.90294135, 50.13424924],
        [8.90310449, 50.13466957],
        [8.90344826, 50.13496251],
        [8.9036033, 50.13516968],
        [8.90349086, 50.13583351],
        [8.90357873, 50.13632618],
        [8.90439106, 50.13616667],
        [8.90537822, 50.13597528],
        [8.90562319, 50.13592808],
        [8.90598978, 50.13594268],
        [8.906367, 50.13610002],
        [8.9066813, 50.13630875],
        [8.90689557, 50.13642935],
        [8.90726923, 50.13633395],
        [8.90881268, 50.13618003],
        [8.90922382, 50.13616398],
        [8.90978743, 50.13610569],
        [8.90994692, 50.13544819],
        [8.91014238, 50.13485933],
      ],
      [
        [8.87643764, 50.13690342],
        [8.87665604, 50.13669643],
        [8.87702324, 50.1367444],
        [8.87717104, 50.13683971],
        [8.87729531, 50.13689318],
        [8.87738712, 50.13693896],
        [8.87759722, 50.13697156],
        [8.87769501, 50.1369812],
        [8.8777987, 50.13697933],
        [8.87801792, 50.13694727],
        [8.87820166, 50.13688649],
        [8.87919363, 50.13699986],
        [8.88012348, 50.13711504],
        [8.88088742, 50.13720721],
        [8.88225542, 50.13737229],
        [8.88272909, 50.13742988],
        [8.88275282, 50.13745473],
        [8.8828564, 50.13744143],
        [8.88304301, 50.13746833],
        [8.88336574, 50.1375067],
        [8.88369156, 50.13754129],
        [8.88396394, 50.13757205],
        [8.88471008, 50.13768126],
        [8.88527273, 50.13775035],
        [8.88627063, 50.13785602],
        [8.88683919, 50.13791369],
        [8.88704054, 50.13791964],
        [8.8872121, 50.1379216],
        [8.88759129, 50.13793528],
        [8.88824877, 50.13796641],
        [8.88896547, 50.13798994],
        [8.88966144, 50.13801722],
        [8.89034859, 50.13804639],
        [8.89110683, 50.13807948],
        [8.8916784, 50.13810672],
        [8.89240701, 50.13812449],
        [8.8928839, 50.13812871],
        [8.8932155, 50.13814808],
        [8.89343771, 50.13815017],
        [8.89363611, 50.13816366],
      ],
      [
        [8.7803834, 50.13847818],
        [8.78045676, 50.1384944],
        [8.78370821, 50.13917162],
        [8.78506228, 50.13941679],
        [8.78628367, 50.13951186],
        [8.78754994, 50.13952138],
        [8.78767195, 50.1395573],
        [8.78770408, 50.13982142],
        [8.7878259, 50.13990025],
        [8.78920355, 50.13985275],
        [8.78940327, 50.13991023],
        [8.78945756, 50.14016728],
        [8.79039078, 50.14014756],
        [8.79104599, 50.14017734],
        [8.791479, 50.14023523],
        [8.79241195, 50.14024401],
        [8.79290061, 50.14028059],
        [8.79308927, 50.14030952],
        [8.79352253, 50.1403103],
        [8.79381139, 50.14030361],
        [8.79405549, 50.14036116],
        [8.79611005, 50.1404433],
        [8.79664322, 50.14044423],
        [8.79739881, 50.14040274],
        [8.79802076, 50.14042523],
        [8.7985315, 50.14046893],
        [8.79963107, 50.14049233],
        [8.80078617, 50.14052282],
        [8.80164134, 50.14055999],
        [8.80235292, 50.14039698],
        [8.80280838, 50.14037635],
        [8.80360832, 50.14033489],
        [8.80429761, 50.14021473],
        [8.80492059, 50.13994857],
        [8.80557268, 50.13964684],
        [8.80580443, 50.1395402],
        [8.8059342, 50.13949284],
        [8.80636962, 50.13940723],
        [8.80667498, 50.13944047],
        [8.80828543, 50.13946698],
        [8.80873433, 50.13947365],
        [8.81233318, 50.13975321],
        [8.81397672, 50.13984147],
        [8.81753155, 50.13975196],
        [8.81813867, 50.13977198],
        [8.82016762, 50.13956126],
        [8.8213668, 50.1395132],
        [8.82165306, 50.13971591],
        [8.82258674, 50.14005641],
        [8.8240659, 50.14055844],
        [8.8246931, 50.14117808],
        [8.8252649, 50.14175599],
        [8.82821742, 50.14189125],
        [8.82849508, 50.14189166],
        [8.82878812, 50.14189326],
      ],
      [
        [8.77663714, 50.13794447],
        [8.77618316, 50.13816127],
        [8.77264391, 50.13681415],
        [8.77077107, 50.13609591],
        [8.76907979, 50.13573075],
        [8.7673351, 50.13579922],
        [8.76423739, 50.13583916],
        [8.76322429, 50.13561379],
      ],
      [
        [8.76534284, 50.13461958],
        [8.76394244, 50.13577354],
      ],
      [
        [8.70827107, 50.11360366],
        [8.70863619, 50.11364632],
        [8.71108393, 50.11459688],
        [8.71655859, 50.11760985],
        [8.71700797, 50.1180703],
        [8.71758096, 50.11908539],
        [8.71802708, 50.12016766],
        [8.71857897, 50.12054435],
        [8.7187748, 50.12101236],
        [8.7187748, 50.12154885],
        [8.71955813, 50.12311261],
        [8.71962934, 50.12374039],
        [8.72048231, 50.12628046],
        [8.72098796, 50.12636233],
        [8.72378343, 50.12710688],
        [8.72428173, 50.12713951],
        [8.72574595, 50.1275435],
        [8.72684412, 50.12794452],
        [8.7280114, 50.12849765],
        [8.72910185, 50.12932343],
        [8.73017685, 50.13012543],
        [8.73094602, 50.1305195],
        [8.7315804, 50.13073503],
        [8.7321137, 50.13088188],
        [8.7327637, 50.13100904],
        [8.73342117, 50.13108548],
        [8.73569393, 50.13113336],
        [8.736494, 50.13117891],
        [8.73820844, 50.13131752],
        [8.74016691, 50.13158881],
        [8.74130369, 50.13172742],
        [8.74453796, 50.13199276],
        [8.74991295, 50.13235117],
        [8.75309006, 50.13262344],
        [8.75576057, 50.13283878],
        [8.75795304, 50.13301451],
        [8.75992927, 50.13309248],
        [8.7614074, 50.13316674],
        [8.76265268, 50.13335497],
        [8.76366324, 50.13365673],
        [8.76396589, 50.13378796],
        [8.76438797, 50.13366981],
        [8.76559734, 50.13420443],
        [8.76521738, 50.13455193],
        [8.76534284, 50.13461958],
        [8.76754404, 50.13279231],
        [8.76979636, 50.13403902],
        [8.77057968, 50.13425583],
        [8.77276554, 50.13574942],
        [8.77456309, 50.13651241],
        [8.77691308, 50.13719706],
        [8.77663714, 50.13794447],
        [8.77697505, 50.13785574],
        [8.77721907, 50.1378691],
        [8.77830231, 50.13805793],
        [8.78038249, 50.13847755],
      ],
      [
        [8.76396589, 50.13378796],
        [8.7638652, 50.13413031],
        [8.76323031, 50.13561534],
      ],
      [
        [8.76322429, 50.13561379],
        [8.75754515, 50.13474653],
        [8.75364631, 50.13398196],
        [8.75126071, 50.13369667],
        [8.74930239, 50.13357114],
        [8.7495137, 50.13232455],
      ],
      [
        [8.75754515, 50.13474653],
        [8.75807723, 50.13301761],
      ],
    ],
  },
  part1: null,
  part2: {
    progressBarDefinition: 1,
    intro: {
      title: "RSTest 2-3 In dieser Umfrage steigen wir direkt ein: Ihre Hinweise und Wünsche",
      description:
        "Wenn Sie möchten, können Sie nun konkrete Hinweise zum Radschnellweg abgeben.\n\nDabei interessiert uns besonders, wenn sie Probleme an bestimmten Stellen des Radwegs sehen. Zum Beispiel: Gibt es Orte, die verbessert werden könnten? Oder gibt es Bereiche, die zu Problemen oder Konflikten, zum Beispiel mit zu Fußgehenden oder Autos führen könnten?\n\nIhre speziellen Hinweise, Kommentare oder Ideen sind für uns wichtig. Das hilft uns sehr weiter, den Radschnellweg noch besser zu planen.",
      type: "standard",
      buttons: [
        { action: "next", label: "Weiter", position: "right" },
        { action: "end", label: "Beteiligung beenden", position: "right" },
      ],
    },
    buttonLabels: {
      next: "Weiter",
      back: "Zurück",
      submit: "Absenden",
      again: "Ich möchte noch einen Hinweis abgeben",
    },
    pages: [
      {
        id: "feedback",
        fields: [
          {
            name: "titleCategory",
            componentType: "content",
            component: "SurveyPageTitle",
            props: { title: "Wir sind gespannt auf Ihre Hinweise." },
          },
          {
            name: "category",
            component: "SurveyRadiobuttonGroup",
            componentType: "form",
            validation: fieldValidationEnum["requiredString"],
            defaultValue: "",
            props: {
              label: "Zu welchem Thema passt Ihr Hinweis?",
              options: [
                { key: "konflikte", label: "Mögliche Konflikte" },
                { key: "nutzung", label: "Nutzung" },
                { key: "streckenfuehrung", label: "Streckenführung" },
                { key: "umwelt", label: "Umwelt- und Naturschutz" },
                { key: "sonstiges", label: "Sonstiges" },
              ],
            },
          },
        ],
      },
      {
        id: "feedback2",
        fields: [
          {
            name: "titleLocation",
            component: "SurveyPageTitle",
            componentType: "content",
            props: { title: "Was möchten Sie uns mitteilen?" },
          },
          {
            name: "descriptionLocation",
            component: "SurveyMarkdown",
            componentType: "content",
            props: {
              markdown:
                "Beschreiben Sie hier, was Ihnen wichtig ist. Beschreiben Sie die Situation oder das Problem so genau wie möglich. Es ist hilfreich, wenn Ihre Verbesserungsvorschläge leicht nachvollziehbar sind.",
            },
          },
          {
            name: "enableLocation",
            component: "SurveyRadiobuttonGroup",
            componentType: "form",
            validation: fieldValidationEnum["requiredString"],
            defaultValue: "ja",
            props: {
              label: "Bezieht sich Ihr Hinweis auf eine konkrete Stelle entlang der Route?",
              options: [
                { key: "ja", label: "Ja" },
                { key: "nein", label: "Nein" },
              ],
            },
          },
          {
            name: "location",
            componentType: "form",
            condition: {
              fieldName: "enableLocation",
              conditionFn: (fieldValue) => fieldValue === "ja",
            },
            // here we use validators (not superrefine) as we need the isPristine state and as we do not have the pagehaserror problem here as it is the last page of the part tbd
            validators: {
              onSubmit: ({ fieldApi }: { fieldApi: AnyFieldApi }) => {
                if (
                  fieldApi.state.meta.isPristine &&
                  fieldApi.form.getFieldValue("enableLocation") === "ja"
                ) {
                  console.log({ fieldApi })
                  return "Bitte wählen Sie einen Ort auf der Karte oder wählen sie oben, dass Sie keinen Ort angeben möchten."
                }
                return undefined
              },
            },
            component: "SurveySimpleMapWithLegend",
            validation: fieldValidationEnum["requiredLatLng"],
            defaultValue: {
              lat: 50.13115168672226,
              lng: 8.732094920912573,
            },
            props: {
              label: "Bitte markieren Sie den Ort, zu dem Sie etwas sagen möchten.",
              mapProps: {
                // tbd maptiler url per component or (only) in meta
                maptilerUrl:
                  "https://api.maptiler.com/maps/a9cd44e7-43f6-4277-8ae0-d910f8162524/style.json",
                config: {
                  bounds: [8.68495, 50.103212, 8.793869, 50.148444],
                },
              },
              legendProps: {
                Streckenführung: {
                  variant1: {
                    label:
                      "Streckenführung A: Eher an großen Straßen auf Radwegen, getrennt von Autos",
                    color: "bg-[#006EFF]",
                    className: "h-[5px]",
                  },
                  variant2: {
                    label:
                      "Streckenführung B: Eher in ruhigen Wohnstraßen, dafür zusammen mit Autos",
                    color: "bg-[#FFD900]",
                    className: "h-[5px]",
                  },
                  irrelevant: {
                    label: "Bereits beschlossene Strecke (außerhalb von Frankfurt)",
                    color: "bg-[#000]",
                    className: "h-[5px]",
                  },
                  blockedArea: {
                    label: "Gesperrt aus Gründen des Natur- oder Denkmalschutzes",
                    color: "opacity-70 stripe-background",
                    className: "h-5",
                  },
                },
              },
            },
          },
          {
            name: "feedbackText",
            component: "SurveyTextarea",
            componentType: "form",
            validation: fieldValidationEnum["requiredString"],
            defaultValue: "",
            props: {
              label: "Ihr Hinweis",
              // placeholder: "Beantworten Sie hier...",
            },
          },
        ],
      },
    ],
  },
  part3: {
    progressBarDefinition: 3,
    intro: {
      type: "standard",
      title: "Persönliche Angaben",
      description:
        "Der Hinweis Teil der Beteiligung ist abgeschlossen. Bitte beantworten Sie uns noch folgende Fragen.",
      buttons: [
        { action: "next", label: "Weiter", position: "right" },
        { action: "end", label: "Beteiligung beenden", position: "right" },
      ],
    },
    buttonLabels: { next: "Weiter", back: "Zurück", submit: "Absenden" },
    pages: [
      {
        id: "1",
        fields: [
          {
            name: "titlePerson",
            component: "SurveyPageTitle",
            componentType: "content",
            props: {
              title: "Und jetzt noch etwas über Sie",
            },
          },
          {
            name: "firstName",
            component: "SurveyTextfield",
            componentType: "form",
            validation: fieldValidationEnum["optionalString"],
            defaultValue: "",
            props: {
              label: "Vorname",
            },
          },
          {
            name: "lastName",
            component: "SurveyTextfield",
            componentType: "form",
            validation: fieldValidationEnum["requiredString"],
            defaultValue: "",
            props: {
              label: "Nachname",
            },
          },
          {
            name: "isTest",
            component: "SurveyCheckbox",
            componentType: "form",
            validation: fieldValidationEnum["requiredBoolean"],
            defaultValue: false,
            props: {
              label: "Möchten Sie diese Checkbox aktivieren?",
              itemLabel: "Ja, ich möchte zustimmen.",
              description: "Dies ist eine Testcheckbox",
            },
          },
          {
            name: "conditionCase1A",
            component: "SurveyRadiobuttonGroup",
            componentType: "form",
            validation: fieldValidationEnum["requiredString"],
            defaultValue: "nein",
            props: {
              label: "Case 1 A: Fahren Sie Fahrrad?",
              description:
                "Wenn ja, dann erscheint das Textfeld  Case 1 A UND IST REQUIRED. Der Wert des koditionalen Feldes wird gelöscht wenn das Feld abgewählt wird.",
              options: [
                {
                  key: "ja",
                  description: "wenn ja ausgewäht wird erscheint Textfeld Conditional Case 1 A",
                  label: "Ja",
                },
                {
                  key: "nein",
                  description: "wenn nein ausgewäht wird erscheint kein Textfeld",
                  label: "Nein",
                },
              ],
            },
            // this deletes the value of conditionalCase1A if condition is not met
            // there are cases that we want to keep the value of the conditional field even if it the field disappears (see location); we have a workaround for location (we delete the field manually on submit what is easy as location exsits in all survey so far but not ideal)
            listeners: {
              onChange: ({ fieldApi }) => {
                console.log(
                  `${fieldApi.name} has changed to: ${fieldApi.state.value} --> resetting conditionalCase1A`,
                )
                fieldApi.state.value === "nein" &&
                  fieldApi.form.setFieldValue("conditionalCase1A", "") // reset value if condition is not met
              },
            },
          },
          {
            name: "conditionalCase1A",
            component: "SurveyTextfield",
            componentType: "form",
            condition: {
              fieldName: "conditionCase1A",
              conditionFn: (fieldValue) => fieldValue === "ja",
            },
            validators: {
              onChangeListenTo: ["conditionCase1A"],
              onSubmit: ({ fieldApi }: { fieldApi: AnyFieldApi }) => {
                if (
                  fieldApi.form.getFieldValue("conditionCase1A") === "ja" &&
                  fieldApi.state.value.trim() === ""
                ) {
                  return "Bitte antworten Sie auf diese Frage oder sagen Sie oben NEIN."
                }
                return undefined
              },
            },
            validation: fieldValidationEnum["requiredString"],
            // example for superrefine - works exacly like the field validator
            // maybe we delete superrefine option in config as for now it does not add functionality tbd
            // zodSuperRefine: (data: any, ctx: z.RefinementCtx) => {
            //   if (data.conditionCase1A === "ja" && data.conditionalCase1A.trim() === "") {
            //     ctx.addIssue({
            //       path: ["conditionalCase1A"],
            //       code: z.ZodIssueCode.custom,
            //       message: "Pflichtfeld wenn 'ja' gewählt wurde.",
            //     })
            //   }
            // },
            defaultValue: "",
            props: {
              label: "Case 1 A: Welches Fahrrad fahren Sie?",
            },
          },
          {
            name: "conditionCase1B",
            component: "SurveyRadiobuttonGroup",
            componentType: "form",
            validation: fieldValidationEnum["requiredString"],
            defaultValue: "nein",
            props: {
              label: "Case 1 B: Fahren Sie Auto?",
              description:
                "Wenn ja, dann erscheint das Textfeld  Case 1 B, ist aber optional. Der Wert des koditionalen Feldes wird gespeichert, auch wenn das Feld abgewählt wird.",
              options: [
                {
                  key: "ja",
                  description: "wenn ja ausgewäht wird erscheint Textfeld Conditional Case 1 B",
                  label: "Ja",
                },
                {
                  key: "nein",
                  description: "wenn nein ausgewäht wird erscheint kein Textfeld",
                  label: "Nein",
                },
              ],
            },
          },
          {
            name: "conditionalCase1B",
            component: "SurveyTextfield",
            componentType: "form",
            condition: {
              fieldName: "conditionCase1B",
              conditionFn: (fieldValue) => fieldValue === "ja",
            },
            validation: fieldValidationEnum["optionalString"],
            defaultValue: "",
            props: {
              label: "Case 1 B: Welches Auto fahren Sie?",
            },
          },
          {
            name: "conditionCase2",
            component: "SurveyCheckboxGroup",
            componentType: "form",
            validation: fieldValidationEnum["requiredArrayOfString"],
            defaultValue: [],
            props: {
              label: "Case 2: Was trifft auf Sie zu?",
              description:
                "Wenn Feld nihct im UI erscheint, also Kondition nicht erfüllt ist, wird 'nicht sicher' im konditionalen Feld gespeichert",
              options: [
                {
                  key: "manchmal",
                  label: "Ich fahre manchmal Fahrrad",
                  description:
                    "wenn min. eins von den ersten 3 ausgewäht wird, erscheint Textfeld Conditional Case 2",
                },
                {
                  key: "oft",
                  label: "Ich fahre oft Fahrrad",
                  description:
                    "wenn min. eins von den ersten 3 ausgewäht wird, erscheint Textfeld Conditional Case 2",
                },
                {
                  key: "sehr_oft",
                  description:
                    "wenn min. eins von den ersten 3 ausgewäht wird, erscheint Textfeld Conditional Case 2",
                  label: "Ich fahre sehr oft Fahrrad",
                },
                {
                  key: "nie",
                  label: "Ich fahre nie Fahrrad",
                },
              ],
            },
            listeners: {
              onChange: ({ fieldApi }) => {
                console.log(
                  `${fieldApi.name} has changed to: ${fieldApi.state.value} --> sets conditionalCase2 to specific value`,
                )
                if (
                  !["manchmal", "oft", "sehr_oft"].some((key) =>
                    fieldApi.state.value?.includes(key),
                  )
                ) {
                  fieldApi.form.setFieldValue("conditionalCase2", "nicht sicher")
                } else {
                  fieldApi.form.setFieldValue("conditionalCase2", "")
                } // reset value if condition is not met
              },
            },
          },
          {
            name: "conditionalCase2",
            component: "SurveyTextfield",
            componentType: "form",
            condition: {
              fieldName: "conditionCase2",
              conditionFn: (fieldValue) => {
                // @ts-expect-error we know value is an array
                return ["manchmal", "oft", "sehr_oft"].some((key) => fieldValue?.includes(key))
              },
            },
            validation: fieldValidationEnum["optionalString"],
            defaultValue: "",
            props: {
              label: "Case 2: Wie sicher fühlen Sie sich beim Radfahren?",
            },
          },
          {
            name: "conditionCase3",
            component: "SurveyRadiobuttonGroup",
            componentType: "form",
            validation: fieldValidationEnum["requiredString"],
            defaultValue: "nein",
            props: {
              label: "Case 3: Fahren Sie Fahrrad oder Auto?",
              options: [
                {
                  key: "fahrrad",
                  label: "Fahrrad",
                },
                {
                  key: "auto",
                  label: "Auto",
                },
              ],
            },
          },
          {
            name: "conditionalCase3",
            component: "SurveyTextfield",
            componentType: "form",
            condition: {
              fieldName: "conditionCase3",
              conditionFn: (fieldValue) => fieldValue === "fahrrad",
            },

            validation: fieldValidationEnum["optionalString"],
            defaultValue: "",
            props: {
              label: "Welches Fahrrad fahren Sie?",
            },
          },
          {
            name: "conditionalSecondCase3",
            component: "SurveyTextfield",
            componentType: "form",
            condition: {
              fieldName: "conditionCase3",
              conditionFn: (fieldValue) => fieldValue === "auto",
            },

            validation: fieldValidationEnum["optionalString"],
            defaultValue: "",
            props: {
              label: "Welches Auto fahren Sie?",
            },
          },
        ],
      },
      {
        id: "2",
        fields: [
          {
            name: "titlePerson2",
            component: "SurveyPageTitle",
            componentType: "content",
            props: { title: "Nutzung und Gestaltung FRM7" },
          },
          {
            name: "descriptionPerson2",
            component: "SurveyMarkdown",
            componentType: "content",
            props: {
              markdown:
                "In diesem Teil geht es um den Radschnellweg. Wir möchten von Ihnen wissen, ob und wie Sie den Radweg nutzen würden und wie dieser gestaltet sein soll.",
            },
          },
          {
            name: "nutzen2",
            component: "SurveyRadiobuttonGroup",
            componentType: "form",
            validation: fieldValidationEnum["requiredString"],
            defaultValue: "",
            props: {
              label: "Würden Sie den FRM7 nutzen?",
              options: [
                { key: "ja", label: "Ja" },
                { key: "nein", label: "Nein" },
                {
                  key: "irrelevant",
                  label: "Ich bin ohnehin nicht zwischen Frankfurt und Hanau unterwegs.",
                },
              ],
            },
          },
          {
            name: "oftNutzen2",
            component: "SurveyRadiobuttonGroup",
            componentType: "form",
            validation: fieldValidationEnum["requiredString"],
            defaultValue: "",
            props: {
              label: "Wie oft würden Sie den FRM7 nutzen?",
              options: [
                { key: "täglich", label: "Täglich oder fast täglich" },
                { key: "mehrmals_pro_woche", label: "Mehrmals pro Woche" },
                { key: "mehrmals_pro_monat", label: "Mehrmals im Monat" },
                { key: "nie", label: "Seltener oder Nie" },
              ],
            },
          },
        ],
      },
    ],
  },
  end: {
    progressBarDefinition: 5,
    title: "Vielen Dank für Ihre Teilnahme!",
    description:
      "## Was passiert als Nächstes?\n\n\n\nNach Abschluss der Beteiligung (31.03.2024) werden Ihre Anregungen vom Planungsteam ausgewertet. Dabei wird geprüft, ob und inwieweit Ihre Hinweise in die weitere Planung einbezogen werden können. Bitte haben Sie Verständnis dafür, dass wir nicht jeden Hinweis kommentieren können. Nach der Auswertung werden wir zusammenfassend zu den genannten Themen Rückmeldung geben.\n\n ## Möchten Sie uns noch etwas mit auf den Weg geben?\n\nWenn Sie noch weiteres Feedback zur Online-Beteiligung haben, können Sie dies gerne an [info@radschnellverbindungen.info](info@radschnellverbindungen.info) senden.\n\n***Transparenzhinweis:** Die Befragung wurde um die Fragen („Sind Sie bzw. Ihre Eltern in Deutschland geboren“) gekürzt, da diese bei Teilnehmenden zu Irritationen geführt haben. Ziel der Fragen im Rahmen des Forschungsprojekts war die Ermittlung, welche Zielgruppen in zukünftigen Beteiligungen ggf. noch gezielter angesprochen werden müssen. Nach eingängiger Diskussion wurde entschieden, die beiden Fragen zu entfernen.*",
    mailjetWidgetUrl: "https://7p8q.mjt.lu/wgt/7p8q/xwjs/form?c=84250207",
    homeUrl: "https://radschnellweg-frm7.de/",
    button: {
      label: "Zurück zur Startseite",
      color: "white",
    },
  },
} satisfies FormConfig
