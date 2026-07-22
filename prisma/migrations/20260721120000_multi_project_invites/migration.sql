DROP INDEX "Invite_token_key";
DROP INDEX "Invite_email_projectId_key";

CREATE INDEX "Invite_token_idx" ON "Invite"("token");
CREATE INDEX "Invite_email_projectId_idx" ON "Invite"("email", "projectId");
