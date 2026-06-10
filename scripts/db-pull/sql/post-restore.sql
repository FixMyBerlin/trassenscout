UPDATE public."User"
SET email = email || '.invalid'
WHERE
  email NOT LIKE '%.invalid' AND
  email NOT LIKE '%@fixmycity.de';

UPDATE public."Invite"
SET email = email || '.invalid'
WHERE
  email NOT LIKE '%.invalid' AND
  email NOT LIKE '%@fixmycity.de';
