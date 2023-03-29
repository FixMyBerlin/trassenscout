import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const DeleteSurveyResponse = z.object({
  id: z.number(),
});

export default resolver.pipe(
  resolver.zod(DeleteSurveyResponse),
  resolver.authorize(),
  async ({ id }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const surveyResponse = await db.surveyResponse.deleteMany({
      where: { id },
    });

    return surveyResponse;
  }
);
