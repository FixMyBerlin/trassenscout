CREATE OR REPLACE FUNCTION slugify(input_text TEXT)
  RETURNS TEXT AS
$$
DECLARE
  slug TEXT;
BEGIN
  slug := input_text;
  slug := lower(slug);
  slug := translate(slug, 'ä,ö,ü,ß', 'a,o,u,s');
  slug := regexp_replace(slug, '[^a-z0-9]+', '-', 'g');
  slug := regexp_replace(slug, '^[-]+|[-]+$', '', 'g');
  RETURN slug;
END;
$$ LANGUAGE plpgsql;

DO
$$
  DECLARE
    v_project_id INTEGER;
    v_task       TEXT;
  BEGIN
    FOR v_project_id IN SELECT id FROM "Project"
      LOOP
        RAISE NOTICE 'Project: %', v_project_id;
        FOR v_task IN SELECT DISTINCT task
                      FROM "Subsubsection"
                      WHERE "subsectionId" IN
                            (SELECT id FROM "Subsection" WHERE "projectId" = v_project_id)
          LOOP
            RAISE NOTICE '  Task: % %s', v_task, slugify(v_task);
            INSERT INTO "SubsubsectionTask" ("updatedAt", slug, title, "projectId")
            VALUES ('2023-12-20 19:31:21.496', slugify(v_task), v_task, v_project_id);
            UPDATE "Subsubsection"
            SET "subsubsectionTaskId" = (SELECT id
                                         FROM "SubsubsectionTask"
                                         WHERE "projectId" = v_project_id
                                           AND title = v_task)
            WHERE "subsectionId" IN
                  (SELECT id FROM "Subsection" WHERE "projectId" = v_project_id)
              AND task = v_task;
          END LOOP;
      END LOOP;
  END ;
$$;
