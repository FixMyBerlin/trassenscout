import db, { Upload } from "../index"

const seedUploads = async () => {
  const seedFiles: Omit<Upload, "id" | "createdAt" | "updatedAt">[] = [
    {
      title: "Protokoll Gesamttreffen",
      externalUrl:
        "https://trassenscout.s3.eu-central-1.amazonaws.com/rose-used-in-seed-data-do-not-delete.jpg",
      projectId: 1,
      subsectionId: null,
      subsubsectionId: null,
      summary: null,
      projectRecordEmailId: null,
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
    },
  ]

  for (const data of seedFiles) {
    await db.upload.create({ data })
  }
}

export default seedUploads
