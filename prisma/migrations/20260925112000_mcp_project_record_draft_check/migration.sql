-- Allow protocol create and update drafts in the kind identity check.
ALTER TABLE "McpDraft" DROP CONSTRAINT "McpDraft_kind_identity_check";

ALTER TABLE "McpDraft" ADD CONSTRAINT "McpDraft_kind_identity_check" CHECK (
  (
    "kind" = 'SUBSUBSECTION_UPDATE'
    AND "subsubsectionId" IS NOT NULL
    AND "parentSubsectionId" IS NULL
    AND "subsectionId" IS NULL
    AND "slug" IS NULL
    AND "projectRecordId" IS NULL
  )
  OR (
    "kind" = 'SUBSUBSECTION_CREATE'
    AND "subsubsectionId" IS NULL
    AND "parentSubsectionId" IS NOT NULL
    AND "subsectionId" IS NULL
    AND "slug" IS NOT NULL
    AND "projectRecordId" IS NULL
  )
  OR (
    "kind" = 'SUBSECTION_UPDATE'
    AND "subsubsectionId" IS NULL
    AND "parentSubsectionId" IS NULL
    AND "subsectionId" IS NOT NULL
    AND "slug" IS NULL
    AND "projectRecordId" IS NULL
  )
  OR (
    "kind" = 'SUBSECTION_CREATE'
    AND "subsubsectionId" IS NULL
    AND "parentSubsectionId" IS NULL
    AND "subsectionId" IS NULL
    AND "slug" IS NOT NULL
    AND "projectRecordId" IS NULL
  )
  OR (
    "kind" = 'PROJECT_RECORD_CREATE'
    AND "projectRecordId" IS NULL
    AND "subsubsectionId" IS NULL
    AND "parentSubsectionId" IS NULL
    AND "subsectionId" IS NULL
  )
  OR (
    "kind" = 'PROJECT_RECORD_UPDATE'
    AND "projectRecordId" IS NOT NULL
    AND "slug" IS NULL
    AND "subsubsectionId" IS NULL
    AND "parentSubsectionId" IS NULL
    AND "subsectionId" IS NULL
  )
);
