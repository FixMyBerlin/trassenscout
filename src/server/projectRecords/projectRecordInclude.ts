/**
 * Shared include configuration for project record queries.
 * This ensures consistent data structure across all project record queries.
 */
export const projectRecordInclude = {
  project: { select: { slug: true, aiEnabled: true } },
  projectRecordTopics: true,
  subsection: true,
  subsubsection: {
    include: {
      subsection: {
        select: { slug: true },
      },
    },
  },
  uploads: {
    orderBy: { id: "desc" },
    select: {
      id: true,
      title: true,
      externalUrl: true,
    },
  },
  author: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
    },
  },
  updatedBy: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
    },
  },
  reviewedBy: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
    },
  },
} as const

