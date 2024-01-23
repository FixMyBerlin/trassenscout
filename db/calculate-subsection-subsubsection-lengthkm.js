require("dotenv").config({ path: "./.env.local" })
const { length, lineString } = require("@turf/turf")
const { PrismaClient } = require("@prisma/client")

const db = new PrismaClient()
/*
 * This function is executed when you run `todo`.
 */
const calculateLengthKm = async () => {
  const subsections = await db.subsection.findMany()
  console.log("subsections successfully fetched")
  subsections.forEach(async (subsection) => {
    const calculatedLengthKm = Number(length(lineString(subsection.geometry)).toFixed(3))
    const updatedSubsection = await db.subsection.update({
      where: { id: subsection.id },
      data: { lengthKm: calculatedLengthKm },
    })
    console.log(
      `updated subsection ${updatedSubsection.id} successfuly`,
      updatedSubsection.lengthKm,
    )
  })
  const subsubsections = await db.subsubsection.findMany()
  console.log("subsubsections successfully fetched")
  subsubsections.forEach(async (subsubsection) => {
    const calculatedLengthKm =
      subsubsection.type === "AREA"
        ? 0.1 // AREAs are SF, they have no length so they get a default
        : Number(length(lineString(subsubsection.geometry)).toFixed(3))
    const updatedSubsubsection = await db.subsubsection.update({
      where: { id: subsubsection.id },
      data: { lengthKm: calculatedLengthKm },
    })
    console.log(
      `updated subsubsection ${updatedSubsubsection.id} successfuly`,
      updatedSubsubsection.lengthKm,
    )
  })
}

calculateLengthKm()
