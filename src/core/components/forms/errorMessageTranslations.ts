type TranslatedMessages = { [key: string]: string }

export const errorMessageTranslations: TranslatedMessages = {
  "Error: Invalid `prisma.contact.create()` invocation:Unique constraint failed on the fields: (`email`)":
    "Diese E-Mail-Adresse wird bereits vergeben. Eine E-Mail-Adresse darf nur einem Kontakt zugewiesen werden.",
  "Error: Invalid `prisma.project.update()` invocation:Unique constraint failed on the fields: (`slug`)":
    "Dieses URL-Segment wird bereits vergeben. Eine URL-Segment darf nur einmalig zugewiesen werden.",
  "Error: Invalid `prisma.section.update()` invocation:Unique constraint failed on the fields: (`projectId`,`order`)":
    "Der Wert für 'Reihenfolge' wird bereits von einer anderen Teilstrecke verwendet. Bitte wählen Sie einen anderen Wert; er kann auch viel höher sein wie beispielweise 50.",
  "Error: Invalid `prisma.subsection.update()` invocation:Unique constraint failed on the fields: (`sectionId`,`order`)":
    "Der Wert für 'Reihenfolge' wird bereits von einem anderen Planungsabschnitt verwendet. Bitte wählen Sie einen anderen Wert; er kann auch viel höher sein wie beispielweise 50.",
  "Error: Invalid `prisma.subsubsection.update()` invocation:Unique constraint failed on the fields: (`subsectionId`,`order`)":
    "Der Wert für 'Reihenfolge' wird bereits von einer anderen Führung verwendet. Bitte wählen Sie einen anderen Wert; er kann auch viel höher sein wie beispielweise 50.",
  // "Dies ist keine gültige E-Mail-Adresse.",
}
