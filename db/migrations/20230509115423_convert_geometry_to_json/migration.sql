alter table public."Subsection"
    alter column geometry type jsonb using geometry::jsonb;

alter table public."Subsubsection"
    alter column geometry type jsonb using geometry::jsonb;
