// Eén AVG-bron. ST-102 levert de notitie-instructie; ST-103 vult hier de
// verboden-veldenlijst aan en ST-202 hergebruikt die voor de chat-guardrails.
// Zo staat de AVG-discipline op één plek (hardstop 1).

export const AVG_NOTE_INSTRUCTION =
  'Alleen feitelijk en cursusgericht. Geen gezondheid of privéomstandigheden. Schrijf alsof de cliënt meeleest.'

// Velden die volgens het AVG-veldenadvies (specs/research-avg-privacy-clientgegevens)
// NOOIT over een cliënt worden vastgelegd: hard verboden (art. 9 AVG / art. 46 UAVG)
// of te vermijden omdat ze niet nodig zijn en het risicoprofiel verhogen. Eén bron,
// hergebruikt door de Zod-.strict()-borging + AVG-test (ST-103) en de chat-guardrails
// (ST-202). De .strict()-schema's weigeren sowieso élk onbekend veld; deze lijst maakt
// de AVG-intentie expliciet en toetsbaar.
export const VERBODEN_VELDEN = [
  'bsn',
  'geboortedatum',
  'leeftijd',
  'adres',
  'postcode',
  'woonplaats',
  'pasnummer',
  'bibliotheekpasnummer',
  'gezondheid',
  'diagnose',
  'medisch',
  'afkomst',
  'etniciteit',
  'nationaliteit',
  'religie',
  'politiek',
  'niveau',
  'taalniveau',
  'diginiveau',
  'laaggeletterd',
] as const

export type VerbodenVeld = (typeof VERBODEN_VELDEN)[number]
