import db, { User } from "../index"

const seedUsers = async () => {
  const seeData: Omit<User, "id" | "createdAt" | "updatedAt" | "role">[] = [
    {
      email: "dev-team@fixmycity.de",
      // password: dev-team@fixmycity.de
      hashedPassword:
        "JGFyZ29uMmlkJHY9MTkkbT02NTUzNix0PTIscD0xJDRMWm82dmVrRk91VnVlZTVwcEpiS3ckOHFZcHhyM2RITm0yTGxTeXdqeEcxSWFsZEJCUWhxNVZxdm53eHoxTk4xTQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",
      superadmin: true,
      firstName: "Rudi",
      lastName: "Radfreund",
      phone: "030 123456",
    },
    {
      email: "regular-user@fixmycity.de",
      // password: dev-team@fixmycity.de
      hashedPassword:
        "JGFyZ29uMmlkJHY9MTkkbT02NTUzNix0PTIscD0xJDRMWm82dmVrRk91VnVlZTVwcEpiS3ckOHFZcHhyM2RITm0yTGxTeXdqeEcxSWFsZEJCUWhxNVZxdm53eHoxTk4xTQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",
      superadmin: false,
      firstName: null,
      lastName: null,
      phone: null,
    },
  ]

  for (let i = 0; i < seeData.length; i++) {
    const data = seeData[i]
    if (data) {
      await db.user.create({ data })
    }
  }
}

export default seedUsers
