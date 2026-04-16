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
  acquisitionArea: {
    select: {
      id: true,
      subsubsection: {
        select: {
          slug: true,
          subsection: { select: { slug: true } },
        },
      },
      parcel: {
        select: {
          alkisParcelId: true,
        },
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
  assignedTo: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
    },
  },
  projectRecordComments: {
    select: {
      id: true,
      projectRecordId: true,
      createdAt: true,
      updatedAt: true,
      body: true,
      author: {
        select: {
          id: true,
          role: true,
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: { id: "asc" },
  },
} as const
