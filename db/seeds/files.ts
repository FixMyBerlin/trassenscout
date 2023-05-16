import db, { File } from "../index"

const seedFiles = async () => {
  const seedFiles: Omit<File, "id" | "createdAt" | "updatedAt">[] = [
    {
      title: "Protokoll Gesamttreffen",
      externalUrl:
        "https://trassenscout.s3.eu-central-1.amazonaws.com/rose-used-in-seed-data-do-not-delete.jpg",
      projectId: 1,
      subsectionId: null,
    },
    {
      title: "AWS S3 Image",
      externalUrl:
        "https://trassenscout.s3.eu-central-1.amazonaws.com/rose-used-in-seed-data-do-not-delete.jpg",
      projectId: 1,
      subsectionId: null,
    },
    {
      title: "Trassenplanung Projekt 1",
      externalUrl:
        "https://trassenscout.s3.eu-central-1.amazonaws.com/rose-used-in-seed-data-do-not-delete.jpg",
      projectId: 1,
      subsectionId: 1,
    },
    {
      title: "FAQ Baulastträger 1",
      externalUrl:
        "https://trassenscout.s3.eu-central-1.amazonaws.com/rose-used-in-seed-data-do-not-delete.jpg",
      projectId: 1,
      subsectionId: 2,
    },
    {
      title: "FAQ Baulastträger 2",
      externalUrl:
        "https://trassenscout.s3.eu-central-1.amazonaws.com/rose-used-in-seed-data-do-not-delete.jpg",
      projectId: 1,
      subsectionId: 2,
    },
    {
      title: "Protokoll Gesamttreffen Projekt 2",
      externalUrl:
        "https://trassenscout.s3.eu-central-1.amazonaws.com/rose-used-in-seed-data-do-not-delete.jpg",
      projectId: 2,
      subsectionId: null,
    },
    {
      title: "Protokoll ADFC",
      externalUrl:
        "https://trassenscout.s3.eu-central-1.amazonaws.com/rose-used-in-seed-data-do-not-delete.jpg",
      projectId: 4,
      subsectionId: null,
    },
  ]

  for (let i = 0; i < seedFiles.length; i++) {
    const data = seedFiles[i]
    if (data) {
      await db.file.create({ data })
    }
  }
}

export default seedFiles
