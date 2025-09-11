require("dotenv").config({ path: "./.env.local" })
const { length, lineString } = require("@turf/turf")
const { PrismaClient } = require("@prisma/client")

const db = new PrismaClient()
/*
 * This function is executed when you run `calc-lengthM`.
 */
const calculateLengthM = async () => {
  const subsections = await db.subsection.findMany()
  console.log("subsections successfully fetched")
  subsections.forEach(async (subsection) => {
    const calculatedlengthM = Number(
      (
        length(lineString(subsection.geometry), {
          units: "kilometers",
        }) * 1000
      ).toFixed(0),
    ) // in m
    const updatedSubsection = await db.subsection.update({
      where: { id: subsection.id },
      data: { lengthM: calculatedlengthM },
    })
    console.log(`updated subsection ${updatedSubsection.id} successfuly`, updatedSubsection.lengthM)
  })
  const subsubsections = await db.subsubsection.findMany()
  console.log("subsubsections successfully fetched")
  subsubsections.forEach(async (subsubsection) => {
    const calculatedlengthM =
      subsubsection.type === "AREA"
        ? 100 // AREAs are SF, they have no length so they get a default
        : Number(
            (
              length(lineString(subsubsection.geometry), {
                units: "kilometers",
              }) * 1000
            ).toFixed(0),
          ) // in m
    const updatedSubsubsection = await db.subsubsection.update({
      where: { id: subsubsection.id },
      data: { lengthM: calculatedlengthM },
    })
    console.log(
      `updated subsubsection ${updatedSubsubsection.id} successfuly`,
      updatedSubsubsection.lengthM,
    )
  })
}

calculateLengthM()
