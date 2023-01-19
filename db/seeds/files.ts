import db, { File } from "../index"

const seedFiles = async () => {
  const seedFiles: Omit<File, "id" | "createdAt" | "updatedAt">[] = [
    {
      title: "Protokoll Gesamttreffen",
      externalUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      projectId: 1,
    },
    {
      title: "Protokoll Gesamttreffen Projekt 2",
      externalUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      projectId: 2,
    },
    {
      title: "Protokoll ADFC",
      externalUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      projectId: 4,
    },
    {
      title: "Datenschutz",
      externalUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      projectId: 2,
    },
    {
      title: "FAQ Baulastträger",
      externalUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      projectId: 2,
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
