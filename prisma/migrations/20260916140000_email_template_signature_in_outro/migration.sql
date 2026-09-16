UPDATE "EmailTemplate"
SET "outroMarkdown" = CASE
  WHEN btrim(COALESCE("outroMarkdown", '')) = ''
    THEN E'Mit freundlichen Grüßen\n\ni.A. das Team vom Trassenscout'
  ELSE btrim("outroMarkdown") || E'\n\nMit freundlichen Grüßen\n\ni.A. das Team vom Trassenscout'
END
WHERE COALESCE("outroMarkdown", '') NOT LIKE '%Team vom Trassenscout%';
