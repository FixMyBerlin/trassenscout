export const uploadWithSubsectionsInclude = {
  subsection: { select: { id: true, slug: true } },
  subsubsections: {
    select: {
      id: true,
      slug: true,
      subsection: { select: { slug: true } },
    },
  },
  projectRecords: {
    select: {
      id: true,
      title: true,
      date: true,
    },
  },
  projectRecordEmail: {
    select: {
      id: true,
      createdAt: true,
    },
  },
  createdBy: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
    },
  },
  project: {
    select: {
      landAcquisitionModuleEnabled: true,
    },
  },
  acquisitionAreas: {
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
} as const
