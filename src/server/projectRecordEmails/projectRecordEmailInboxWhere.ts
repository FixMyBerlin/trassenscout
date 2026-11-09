// Unprocessed: no Protokolleintrag links the mail yet and nobody discarded it.
export function projectRecordEmailInboxWhere(projectId: number) {
  return {
    projectId,
    discardedAt: null,
    projectRecords: { none: {} },
  }
}
