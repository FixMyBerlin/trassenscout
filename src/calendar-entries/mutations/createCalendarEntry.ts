import { resolver } from "@blitzjs/rpc";
import db from "db";
import { CalendarEntrySchema } from "../schema";

export default resolver.pipe(
  resolver.zod(CalendarEntrySchema),
  resolver.authorize(),
  async (input) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const calendarEntry = await db.calendarEntry.create({ data: input });

    return calendarEntry;
  }
);
