import { Project } from "@prisma/client"

export const mockProject: Project = {
  id: 1,
  slug: "rs23", // "W" ist der 23. Buchstabe
  subTitle: "Radschnellverbindung Berliner Wasserwege",
  description: `*Lorem ipsum dolor sit amet*, consetetur sadipscing elitr.

Sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr.`,
  managerId: null,
  logoSrc: "rsv8-logo.png",
  partnerLogoSrcs: ["rsv8-logo.png", "test.png"],
  createdAt: new Date(),
  updatedAt: new Date(),
  exportEnabled: false,
}
