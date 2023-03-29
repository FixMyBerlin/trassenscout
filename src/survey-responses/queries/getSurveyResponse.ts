import { NotFoundError } from "blitz";
import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const GetSurveyResponse = z.object({
  // This accepts type of undefined, but is required at runtime
  id: z.number().optional().refine(Boolean, "Required"),
});

export default resolver.pipe(
  resolver.zod(GetSurveyResponse),
  resolver.authorize(),
  async ({ id }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const surveyResponse = await db.surveyResponse.findFirst({ where: { id } });

    if (!surveyResponse) throw new NotFoundError();

    return surveyResponse;
  }
);
