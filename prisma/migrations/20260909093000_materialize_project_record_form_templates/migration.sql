INSERT INTO "_FormTemplateToProjectRecord" ("A", "B")
SELECT DISTINCT vorlage."A", pr."id"
FROM "ProjectRecord" pr
JOIN "_FormTemplateToProjectRecordTemplate" vorlage ON vorlage."B" = pr."projectRecordTemplateId"
JOIN "_FormTemplateToProject" scope ON scope."A" = vorlage."A" AND scope."B" = pr."projectId"
WHERE pr."projectRecordTemplateId" IS NOT NULL
ON CONFLICT ("A", "B") DO NOTHING;
