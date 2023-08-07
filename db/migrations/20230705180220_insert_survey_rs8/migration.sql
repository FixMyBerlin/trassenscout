DO
$$
    BEGIN
        IF EXISTS (SELECT FROM "Project" WHERE slug = 'rs8') AND NOT (EXISTS (SELECT FROM "Survey")) THEN
            INSERT INTO public."Survey" (id, "createdAt", "updatedAt", "projectId", slug, active)
            VALUES (1, '2023-07-05 00:00:00.000', '2023-07-05 00:00:00.000', (SELECT id FROM "Project" WHERE slug = 'rs8'), 'rs8', true);
            RAISE NOTICE 'Survey created';
        ELSE
            RAISE NOTICE 'No survey created';
        END IF;
    END;
$$
