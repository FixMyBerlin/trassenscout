import db, { Upload } from "../index"

const seedUploads = async () => {
  const seedFiles: Omit<
    Upload,
    "id" | "createdAt" | "updatedAt" | "createdById" | "updatedById"
  >[] = [
    {
      title: "Protokoll Gesamttreffen",
      externalUrl:
        "https://trassenscout.s3.eu-central-1.amazonaws.com/rose-used-in-seed-data-do-not-delete.jpg",
      projectId: 1,
      subsectionId: null,
      subsubsectionId: null,
      summary: null,
      projectRecordEmailId: null,
      mimeType: "image/jpeg",
      fileSize: 2450000, // 2.45 MB - protocol document
      latitude: null,
      longitude: null,
      collaborationUrl: "https://fixmycity.de/",
      collaborationPath: null,
      surveyResponseId: null,
    },
    {
      title: "AWS S3 Image",
      externalUrl:
        "https://trassenscout.s3.eu-central-1.amazonaws.com/rose-used-in-seed-data-do-not-delete.jpg",
      projectId: 1,
      subsectionId: null,
      subsubsectionId: null,
      summary: null,
      projectRecordEmailId: null,
      mimeType: "image/jpeg",
      fileSize: 1800000, // 1.8 MB - medium image
      latitude: null,
      longitude: null,
      collaborationUrl: null,
      collaborationPath: null,
      surveyResponseId: null,
    },
    {
      title: "Trassenplanung Projekt 1",
      externalUrl:
        "https://trassenscout.s3.eu-central-1.amazonaws.com/rose-used-in-seed-data-do-not-delete.jpg",
      projectId: 1,
      subsectionId: 1,
      subsubsectionId: null,
      summary: null,
      projectRecordEmailId: null,
      mimeType: "image/jpeg",
      fileSize: 4200000, // 4.2 MB - large planning document
      latitude: 52.52039883952099,
      longitude: 13.317392954811083,
      collaborationUrl: null,
      collaborationPath: null,
      surveyResponseId: null,
    },
    {
      title: "FAQ Baulastträger 1",
      externalUrl:
        "https://trassenscout.s3.eu-central-1.amazonaws.com/rose-used-in-seed-data-do-not-delete.jpg",
      projectId: 1,
      subsectionId: 2,
      subsubsectionId: null,
      summary: null,
      projectRecordEmailId: null,
      mimeType: "image/jpeg",
      fileSize: 850000, // 850 KB - FAQ document
      latitude: 52.52243126246529,
      longitude: 13.392787102151175,
      collaborationUrl: null,
      collaborationPath: null,
      surveyResponseId: null,
    },
    {
      title: "FAQ Baulastträger 2",
      externalUrl:
        "https://trassenscout.s3.eu-central-1.amazonaws.com/rose-used-in-seed-data-do-not-delete.jpg",
      projectId: 1,
      subsectionId: 2,
      subsubsectionId: null,
      summary: null,
      projectRecordEmailId: null,
      mimeType: "image/jpeg",
      fileSize: 920000, // 920 KB - FAQ document
      latitude: 52.52204414153442,
      longitude: 13.387538142526438,
      collaborationUrl: null,
      collaborationPath: null,
      surveyResponseId: null,
    },
    {
      title: "Protokoll Gesamttreffen Projekt 2",
      externalUrl:
        "https://trassenscout.s3.eu-central-1.amazonaws.com/rose-used-in-seed-data-do-not-delete.jpg",
      projectId: 2,
      subsectionId: null,
      subsubsectionId: null,
      summary: null,
      projectRecordEmailId: null,
      mimeType: "image/jpeg",
      fileSize: 2100000, // 2.1 MB - protocol document
      latitude: null,
      longitude: null,
      collaborationUrl: null,
      collaborationPath: null,
      surveyResponseId: null,
    },
    {
      title: "Protokoll ADFC",
      externalUrl:
        "https://trassenscout.s3.eu-central-1.amazonaws.com/rose-used-in-seed-data-do-not-delete.jpg",
      projectId: 4,
      subsectionId: null,
      subsubsectionId: null,
      summary: null,
      projectRecordEmailId: null,
      mimeType: "image/jpeg",
      fileSize: 1500000, // 1.5 MB - protocol document
      latitude: null,
      longitude: null,
      collaborationUrl: null,
      collaborationPath: null,
      surveyResponseId: null,
    },
    {
      title: "Planungsdokument",
      externalUrl:
        "https://trassenscout.s3.eu-central-1.amazonaws.com/rose-used-in-seed-data-do-not-delete.jpg",
      projectId: 1,
      subsectionId: null,
      subsubsectionId: 1,
      summary: null,
      projectRecordEmailId: null,
      mimeType: "image/jpeg",
      fileSize: 3700000, // 3.7 MB - planning document
      latitude: 52.51831791403984,
      longitude: 13.360259458454504,
      collaborationUrl: null,
      collaborationPath: null,
      surveyResponseId: null,
    },
    {
      title: "Super langer Text in der Beschreibung sehr lang",
      externalUrl:
        "https://trassenscout.s3.eu-central-1.amazonaws.com/rose-used-in-seed-data-do-not-delete.jpg",
      projectId: 1,
      subsectionId: null,
      subsubsectionId: 1,
      summary: null,
      projectRecordEmailId: null,
      mimeType: "image/jpeg",
      fileSize: null, // null - missing file size data
      latitude: 52.51831791403984,
      longitude: 13.360259458454504,
      collaborationUrl: null,
      collaborationPath: null,
      surveyResponseId: null,
    },
    {
      title: "Kurz",
      externalUrl:
        "https://trassenscout.s3.eu-central-1.amazonaws.com/rose-used-in-seed-data-do-not-delete.jpg",
      projectId: 1,
      subsectionId: null,
      subsubsectionId: 1,
      summary: null,
      projectRecordEmailId: null,
      mimeType: "image/jpeg",
      fileSize: 320000, // 320 KB - small image
      latitude: null,
      longitude: null,
      collaborationUrl: null,
      collaborationPath: null,
      surveyResponseId: null,
    },
  ]

  for (const data of seedFiles) {
    // For seed data, assign a default user (user 1) as creator
    // Some uploads have been updated, so they get updatedById set
    const hasBeenUpdated =
      data.title.includes("Protokoll") || data.title.includes("Planungsdokument")

    await db.upload.create({
      data: {
        ...data,
        createdById: 1, // Seed data - assign to user 1
        updatedById: hasBeenUpdated ? 1 : null, // Only set if upload has been updated
      },
    })
  }
}

export default seedUploads
