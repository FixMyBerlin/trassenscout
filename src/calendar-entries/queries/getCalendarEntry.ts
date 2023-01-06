import { NotFoundError } from "blitz";
import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const GetCalendarEntry = z.object({
  // This accepts type of undefined, but is required at runtime
  id: z.number().optional().refine(Boolean, "Required"),
});

export default resolver.pipe(
  resolver.zod(GetCalendarEntry),
  resolver.authorize(),
  async ({ id }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const calendarEntry = await db.calendarEntry.findFirst({ where: { id } });

    if (!calendarEntry) throw new NotFoundError();

    return calendarEntry;
  }
);
