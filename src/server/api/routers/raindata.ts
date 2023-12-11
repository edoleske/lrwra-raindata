import { TRPCError } from "@trpc/server";
import {
  addMonths,
  compareAsc,
  differenceInDays,
  isToday,
  startOfMonth,
} from "date-fns";
import { z } from "zod";
import { today } from "~/utils/utils";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { handleError } from "~/server/api/utils";
import { getCurrentValuesAll } from "~/server/api/queries/ihistorian";
import {
  getTotalBetweenTwoDates,
  getRainGauges,
  getDateTotalAll,
  getMonthTotalAll,
} from "~/server/api/queries/raindatabase";

export const rainDataRouter = createTRPCRouter({
  rainGauges: publicProcedure.query(async () => {
    try {
      const gauges = await getRainGauges();
      return gauges;
    } catch (err) {
      handleError(err);
    }
  }),
  // Gets the most recent readings for each gauge
  currentValues: publicProcedure.query(async () => {
    try {
      const gauges = await getRainGauges();
      const currentValues = await getCurrentValuesAll(gauges);
      return currentValues;
    } catch (err) {
      handleError(err);
    }
  }),
  // Gets the daily accured value for a given date
  dateValues: publicProcedure
    .input(z.object({ date: z.date() }))
    .query(async ({ input }) => {
      if (input.date > today()) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Input date must be or be before the current date.",
        });
      }

      try {
        if (isToday(input.date)) {
          const gauges = await getRainGauges();
          const values = await getCurrentValuesAll(gauges);
          return values;
        } else {
          const values = await getDateTotalAll(input.date);
          return values;
        }
      } catch (err) {
        handleError(err);
      }
    }),
  monthTotals: publicProcedure
    .input(z.object({ month: z.date() }))
    .query(async ({ input }) => {
      if (input.month >= startOfMonth(addMonths(new Date(), 1))) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No data available for future months!",
        });
      }

      try {
        const totals = await getMonthTotalAll(input.month);
        return totals;
      } catch (err) {
        handleError(err);
      }
    }),
  valueTotal: publicProcedure
    .input(z.object({ startDate: z.date(), endDate: z.date() }))
    .query(async ({ input }) => {
      if (Math.abs(differenceInDays(input.startDate, input.endDate)) > 31) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot total more than 31 days of data at a time.",
        });
      }

      if (compareAsc(input.endDate, input.startDate) !== 1) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Start date/time must be before end date/time.`,
        });
      }

      if (compareAsc(new Date(), input.endDate) !== 1) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "End date/time must be before current date/time.",
        });
      }

      try {
        // TODO: Investigate if this works for all cases
        const totals = await getTotalBetweenTwoDates(
          input.startDate,
          input.endDate
        );
        return totals;
      } catch (err) {
        handleError(err);
      }
    }),
});
