import { responseConfig as radnetzBrandenburgResponseConfig } from "@/src/components/beteiligung/surveys/radnetz-brandenbrug/response-config"
import {
  ProjectRecordEditingState,
  ProjectRecordReviewState,
  ProjectRecordType,
  SystemLogLevelEnum,
} from "@/src/prisma/generated/client"
import db from "@/src/server/db.server"
import { emailTemplateKeys, getEmailTemplateDefinition } from "@/src/shared/emailTemplates/registry"

const SEED_UPLOAD_URL =
  "https://trassenscout.s3.eu-central-1.amazonaws.com/rose-used-in-seed-data-do-not-delete.jpg"

function rawEmailText({
  from,
  subject,
  body,
  date,
}: {
  from: string
  subject: string
  body: string
  date: Date
}) {
  return `From: ${from}
Date: ${date.toUTCString()}
Subject: ${subject}
Content-Type: text/plain; charset=utf-8

${body}`
}

const seedAdmin = async () => {
  const [adminUser, project] = await Promise.all([
    db.user.findFirstOrThrow({ where: { email: "admin@fixmycity.test" } }),
    db.project.findFirstOrThrow({ where: { slug: "rs23" } }),
  ])

  const tags = await Promise.all([
    db.tag.create({
      data: { title: "Terminplanung", projectId: project.id },
    }),
    db.tag.create({
      data: { title: "Bürgerbeteiligung", projectId: project.id },
    }),
    db.tag.create({
      data: { title: "Technische Planung", projectId: project.id },
    }),
  ])

  const emailTemplateKeysToSeed = [
    emailTemplateKeys.forgotPassword,
    emailTemplateKeys.invitationCreatedUser,
    emailTemplateKeys.projectRecordAssignedUser,
  ] as const

  for (const key of emailTemplateKeysToSeed) {
    const definition = getEmailTemplateDefinition(key)
    await db.emailTemplate.create({
      data: {
        key,
        subject: definition.defaults.subject,
        introMarkdown: definition.defaults.introMarkdown,
        outroMarkdown: definition.defaults.outroMarkdown ?? null,
        ctaText: definition.defaults.ctaText ?? null,
        updatedById: adminUser.id,
      },
    })
  }

  const supportDocumentSeedData = [
    {
      title: "Admin-Handbuch",
      description: "Einführung in die Admin-Oberfläche von Trassenscout.",
      order: 1,
    },
    {
      title: "Protokoll-Workflow",
      description: "Anleitung zur Bearbeitung eingehender Protokoll-E-Mails.",
      order: 2,
    },
    {
      title: "Support-Kontakte",
      description: "Ansprechpartnerinnen und Ansprechpartner für technische Fragen.",
      order: 3,
    },
  ] as const

  for (const document of supportDocumentSeedData) {
    await db.supportDocument.create({
      data: {
        title: document.title,
        description: document.description,
        order: document.order,
        createdById: adminUser.id,
        upload: {
          create: {
            title: document.title,
            externalUrl: SEED_UPLOAD_URL,
            mimeType: "application/pdf",
            fileSize: 120_000,
            createdById: adminUser.id,
            projectId: null,
          },
        },
      },
    })
  }

  const projectRecordTemplateSeedData = [
    {
      templateTitle: "Terminprotokoll",
      entryTitle: "Terminprotokoll {{date}}",
      body: "Teilnehmende, Agenda und Ergebnisse des Termins.",
      purpose: "Standardvorlage für regelmäßige Projekttermine.",
      topicIndex: 0,
    },
    {
      templateTitle: "Bürgerinfo",
      entryTitle: "Infoveranstaltung {{date}}",
      body: "Zusammenfassung der Bürgerinfo mit offenen Punkten.",
      purpose: "Dokumentation von Beteiligungsformaten.",
      topicIndex: 1,
    },
    {
      templateTitle: "Planungsstand",
      entryTitle: "Planungsstand {{date}}",
      body: "Aktueller Stand der technischen Planung und nächste Schritte.",
      purpose: "Kurzprotokoll für interne Planungsupdates.",
      topicIndex: 2,
    },
  ] as const

  for (const template of projectRecordTemplateSeedData) {
    await db.projectRecordTemplate.create({
      data: {
        templateTitle: template.templateTitle,
        entryTitle: template.entryTitle,
        body: template.body,
        purpose: template.purpose,
        projects: { connect: [{ id: project.id }] },
        tags: { connect: [{ id: tags[template.topicIndex]!.id }] },
      },
    })
  }

  const systemLogEntrySeedData = [
    {
      logLevel: SystemLogLevelEnum.INFO,
      message: "Seed: Admin-Dashboard-Daten wurden angelegt.",
      projectId: project.id,
      userId: adminUser.id,
      context: { source: "seed", area: "admin" },
    },
    {
      logLevel: SystemLogLevelEnum.INFO,
      message: "Seed: Projektdaten für rs23 sind bereit.",
      projectId: project.id,
      context: { source: "seed", projectSlug: project.slug },
    },
    {
      logLevel: SystemLogLevelEnum.ERROR,
      message: "Seed: Beispiel-Fehlereintrag für LogEntries-Adminseite.",
      userId: adminUser.id,
      context: { source: "seed", demo: true },
    },
  ] as const

  for (const entry of systemLogEntrySeedData) {
    await db.systemLogEntry.create({ data: entry })
  }

  const emailDate = new Date("2026-06-01T10:00:00.000Z")

  const processedEmail = await db.projectRecordEmail.create({
    data: {
      text: rawEmailText({
        from: "extern@example.org",
        subject: "Hinweis aus der Bürgerinfo",
        body: "Sehr geehrte Damen und Herren,\n\nwir möchten einen Hinweis zur Querung melden.\n\nMit freundlichen Grüßen",
        date: new Date("2026-06-03T14:15:00.000Z"),
      }),
      from: "extern@example.org",
      subject: "Hinweis aus der Bürgerinfo",
      textBody:
        "Sehr geehrte Damen und Herren,\n\nwir möchten einen Hinweis zur Querung melden.\n\nMit freundlichen Grüßen",
      date: new Date("2026-06-03T14:15:00.000Z"),
      projectId: project.id,
    },
  })

  await Promise.all([
    db.projectRecordEmail.create({
      data: {
        text: rawEmailText({
          from: "buerger@example.org",
          subject: "Frage ohne Projektzuordnung",
          body: "Guten Tag,\n\nich habe eine allgemeine Frage zum Projektverlauf.\n\nViele Grüße",
          date: emailDate,
        }),
        from: "buerger@example.org",
        subject: "Frage ohne Projektzuordnung",
        textBody: "Guten Tag,\n\nich habe eine allgemeine Frage zum Projektverlauf.\n\nViele Grüße",
        date: emailDate,
        projectId: null,
      },
    }),
    db.projectRecordEmail.create({
      data: {
        text: rawEmailText({
          from: "planer@fixmycity.test",
          subject: "Offene Punkte Trassenplanung",
          body: "Hallo Team,\n\nbitte prüft die aktuelle Linienführung im Abschnitt Nord.\n\nDanke",
          date: new Date("2026-06-02T11:30:00.000Z"),
        }),
        from: "planer@fixmycity.test",
        subject: "Offene Punkte Trassenplanung",
        textBody:
          "Hallo Team,\n\nbitte prüft die aktuelle Linienführung im Abschnitt Nord.\n\nDanke",
        date: new Date("2026-06-02T11:30:00.000Z"),
        projectId: project.id,
      },
    }),
  ])

  const projectRecordSeedData = [
    {
      title: "Admin-Prüfung: unbekannter Absender",
      body: "Automatisch erfasster Protokolleintrag mit unbekannter Absenderadresse.",
      reviewState: ProjectRecordReviewState.NEEDSADMINREVIEW,
      reviewNotes: "Absender ist kein Teammitglied und kein Kontakt im Projekt.",
      projectRecordEmailId: processedEmail.id,
      topicIndex: 1,
    },
    {
      title: "Review: Terminprotokoll Juni",
      body: "Zusammenfassung des Projekttermins vom 1. Juni.",
      reviewState: ProjectRecordReviewState.NEEDSREVIEW,
      reviewNotes: null,
      projectRecordEmailId: null,
      topicIndex: 0,
    },
    {
      title: "Abgelehnt: unvollständige Angaben",
      body: "Protokolleintrag ohne ausreichende Informationen zur weiteren Bearbeitung.",
      reviewState: ProjectRecordReviewState.REJECTED,
      reviewNotes: "Inhalt zu unspezifisch, keine verwertbaren Planungsinformationen.",
      projectRecordEmailId: null,
      topicIndex: 2,
    },
  ] as const

  for (const record of projectRecordSeedData) {
    await db.projectRecord.create({
      data: {
        title: record.title,
        body: record.body,
        date: new Date("2026-06-04T09:00:00.000Z"),
        editingState: ProjectRecordEditingState.PENDING,
        reviewState: record.reviewState,
        reviewNotes: record.reviewNotes,
        projectId: project.id,
        projectRecordAuthorType: ProjectRecordType.SYSTEM,
        userId: adminUser.id,
        projectRecordEmailId: record.projectRecordEmailId,
        tags: {
          connect: [{ id: tags[record.topicIndex]!.id }],
        },
      },
    })
  }

  const survey = await db.survey.findFirstOrThrow({
    where: { slug: "radnetz-brandenburg", projectId: project.id },
  })

  const categoryFieldId = String(radnetzBrandenburgResponseConfig.evaluationRefs.category)
  const feedbackTextFieldId = String(radnetzBrandenburgResponseConfig.evaluationRefs.feedbackText)

  const surveyResponseSeedData = [
    "Seed-Beitrag: Querung an der Hauptstraße ist unübersichtlich.",
    "Seed-Beitrag: Mehr Grün entlang der geplanten Trasse wäre wünschenswert.",
    "Seed-Beitrag: Bitte Tempo 30 in der Bauphase berücksichtigen.",
  ] as const

  for (const [index, feedbackText] of surveyResponseSeedData.entries()) {
    const surveySession = await db.surveySession.create({
      data: { surveyId: survey.id },
    })

    await db.surveyResponse.create({
      data: {
        surveySessionId: surveySession.id,
        surveyPart: 2,
        source: "FORM",
        state: "SUBMITTED",
        status: "PENDING",
        data: JSON.stringify({
          [categoryFieldId]: String((index % 3) + 1),
          [feedbackTextFieldId]: feedbackText,
        }),
      },
    })
  }
}

export default seedAdmin
