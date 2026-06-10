export const uploadWithSubsectionsInclude = {
  subsubsections: {
    select: {
      id: true,
      slug: true,
      subsection: { select: { id: true, slug: true } },
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
      subject: true,
    },
  },
  createdBy: {
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
  project: {
    select: {
      aiEnabled: true,
      slug: true,
      landAcquisitionModuleEnabled: true,
    },
  },
  surveyResponse: {
    include: {
      surveySession: {
        include: {
          survey: { select: { id: true, slug: true } },
        },
      },
    },
  },
  acquisitionAreas: {
    select: {
      id: true,
      subsubsection: {
        select: {
          slug: true,
          subsection: { select: { id: true, slug: true } },
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
