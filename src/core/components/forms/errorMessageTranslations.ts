type TranslatedMessages = { [key: string]: string }

export const errorMessageTranslations: TranslatedMessages = {
  "PrismaClientKnownRequestError: Invalid `prisma.contact.create()` invocation:Unique constraint failed on the fields: (`projectId`,`email`)":
    "Diese E-Mail-Adresse ist bereits vergeben. Eine E-Mail-Adresse darf nur einem Kontakt zugewiesen werden",
  "PrismaClientKnownRequestError: Invalid `prisma.project.create()` invocation:Unique constraint failed on the fields: (`slug`)":
    "Dieses URL-Segment ist bereits für eine andere Trasse vergeben. Ein URL-Segment darf nur einmalig zugewiesen werden.",
  "PrismaClientKnownRequestError: Invalid `prisma.subsection.update()` invocation:Unique constraint failed on the fields: (`projectId`,`order`)":
    "Der Wert für 'Reihenfolge' wird bereits von einer anderen Teilstrecke verwendet. Bitte wählen Sie einen anderen Wert; er kann auch viel höher sein wie beispielweise 50.",
  "PrismaClientKnownRequestError: Invalid `prisma.subsubsection.create()` invocation:Unique constraint failed on the fields: (`subsectionId`,`slug`)":
    "Dieses URL-Segment ist bereits vergeben. Ein URL-Segment darf nur einmalig pro Planungsabschnitt zugewiesen werden.",
  "PrismaClientKnownRequestError: Invalid `prisma.subsubsection.update()` invocation:Unique constraint failed on the fields: (`subsectionId`,`slug`)":
    "Dieses URL-Segment ist bereits vergeben. Ein URL-Segment darf nur einmalig pro Planungsabschnitt zugewiesen werden.",

  // "Dies ist keine gültige E-Mail-Adresse.",
}
