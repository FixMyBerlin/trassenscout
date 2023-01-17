type TranslatedMessages = { [key: string]: string }

export const errorMessageTranslations: TranslatedMessages = {
  "Error: Invalid `prisma.contact.create()` invocation:Unique constraint failed on the fields: (`email`)":
    "Diese E-Mail-Adresse wird bereits vergeben. Eine E-Mail-Adresse darf nur einem Kontakt zugewiesen werden.",
  "Error: Invalid `prisma.project.update()` invocation:Unique constraint failed on the fields: (`slug`)":
    "Dieses URL-Segment wird bereits vergeben. Eine URL-Segment darf nur einmalig zugewiesen werden.",
  // "Dies ist keine gültige E-Mail-Adresse.",
}
