type TranslatedMessages = { [key: string]: string }

export const errorMessageTranslations: TranslatedMessages = {
  // INVITATION
  "PrismaClientKnownRequestError: Invalid `prisma.invite.create()` invocation:Unique constraint failed on the fields: (`email`)":
    "Diese E-Mail-Adresse ist bereits eingeladen.",
  // SIGNUP
  "PrismaClientKnownRequestError: Invalid `prisma.user.create()` invocation:Unique constraint failed on the fields: (`email`)":
    "Diese E-Mail-Adresse ist bereits registriert.",
  // CONTACT
  "PrismaClientKnownRequestError: Invalid `prisma.contact.create()` invocation:Unique constraint failed on the fields: (`projectId`,`email`)":
    "Diese E-Mail-Adresse ist bereits vergeben. Eine E-Mail-Adresse darf nur einem Kontakt zugewiesen werden.",
  "PrismaClientKnownRequestError: Invalid `prisma.contact.update()` invocation:Unique constraint failed on the fields: (`projectId`,`email`)":
    "Diese E-Mail-Adresse ist bereits vergeben. Eine E-Mail-Adresse darf nur einem Kontakt zugewiesen werden.",
  // PROJECT
  "PrismaClientKnownRequestError: Invalid `prisma.project.create()` invocation:Unique constraint failed on the fields: (`slug`)":
    "Dieses URL-Segment ist bereits für eine andere Trasse vergeben. Ein URL-Segment darf nur einmalig zugewiesen werden.",
  // SUBSECTION
  "PrismaClientKnownRequestError: Invalid `prisma.subsection.update()` invocation:Unique constraint failed on the fields: (`projectId`,`order`)":
    "Der Wert für 'Reihenfolge' wird bereits von einer anderen Teilstrecke verwendet. Bitte wählen Sie einen anderen Wert; er kann auch viel höher sein wie beispielweise 50.",
  "PrismaClientKnownRequestError: Invalid `prisma.subsection.create()` invocation:Unique constraint failed on the fields: (`projectId`,`order`)":
    "Der Wert für 'Reihenfolge' wird bereits von einer anderen Teilstrecke verwendet. Bitte wählen Sie einen anderen Wert; er kann auch viel höher sein wie beispielweise 50.",
  "PrismaClientKnownRequestError: Invalid `prisma.subsection.create()` invocation:Unique constraint failed on the fields: (`projectId`,`slug`)":
    "Dieses URL-Segment ist bereits vergeben. Ein URL-Segment darf nur einmalig pro Trasse zugewiesen werden.",
  "PrismaClientKnownRequestError: Invalid `prisma.subsection.update()` invocation:Unique constraint failed on the fields: (`projectId`,`slug`)":
    "Dieses URL-Segment ist bereits vergeben. Ein URL-Segment darf nur einmalig pro Trasse zugewiesen werden.",
  // SUBSUBSECTION
  "PrismaClientKnownRequestError: Invalid `prisma.subsubsection.create()` invocation:Unique constraint failed on the fields: (`subsectionId`,`slug`)":
    "Dieses URL-Segment ist bereits vergeben. Ein URL-Segment darf nur einmalig pro Planungsabschnitt zugewiesen werden.",
  "PrismaClientKnownRequestError: Invalid `prisma.subsubsection.update()` invocation:Unique constraint failed on the fields: (`subsectionId`,`slug`)":
    "Dieses URL-Segment ist bereits vergeben. Ein URL-Segment darf nur einmalig pro Planungsabschnitt zugewiesen werden.",
  // OPERATOR
  "PrismaClientKnownRequestError: Invalid `prisma.operator.create()` invocation:Unique constraint failed on the fields: (`projectId`,`slug`)":
    "Dieses URL-Segment ist bereits für eine anderen Baulastträger vergeben. Ein URL-Segment darf nur einmalig zugewiesen werden.",
  "PrismaClientKnownRequestError: Invalid `prisma.operator.update()` invocation:Unique constraint failed on the fields: (`projectId`,`slug`)":
    "Dieses URL-Segment ist bereits für eine anderen Baulastträger vergeben. Ein URL-Segment darf nur einmalig zugewiesen werden.",
  // QULAITYLEVEL
  "PrismaClientKnownRequestError: Invalid `prisma.qualityLevel.create()` invocation:Unique constraint failed on the fields: (`projectId`,`slug`)":
    "Dieses URL-Segment ist bereits für einen anderen Ausbaustandard vergeben. Ein URL-Segment darf nur einmalig zugewiesen werden.",
  "PrismaClientKnownRequestError: Invalid `prisma.qualityLevel.update()` invocation:Unique constraint failed on the fields: (`projectId`,`slug`)":
    "Dieses URL-Segment ist bereits für einen anderen Ausbaustandard vergeben. Ein URL-Segment darf nur einmalig zugewiesen werden.",
  //SUBSUBSECTIONSTATUS
  "PrismaClientKnownRequestError: Invalid `prisma.subsubsectionStatus.create()` invocation:Unique constraint failed on the fields: (`projectId`,`slug`)":
    "Dieses URL-Segment ist bereits für einen anderen Status vergeben. Ein URL-Segment darf nur einmalig zugewiesen werden.",
  "PrismaClientKnownRequestError: Invalid `prisma.subsubsectionStatus.update()` invocation:Unique constraint failed on the fields: (`projectId`,`slug`)":
    "Dieses URL-Segment ist bereits für einen anderen Status vergeben. Ein URL-Segment darf nur einmalig zugewiesen werden.",
  // "Dies ist keine gültige E-Mail-Adresse.",
}
