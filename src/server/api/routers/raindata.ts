import { TRPCError } from "@trpc/server";
import {
  add,
  addDays,
  addMonths,
  compareAsc,
  differenceInDays,
  format,
  isToday,
  startOfMonth,
  sub,
} from "date-fns";
import { z } from "zod";
import { connection } from "~/server/db";
import { assertHistorianValuesSingle } from "~/server/typeValidation";
import { parseDatabaseHistory, pureDate, today } from "~/utils/utils";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { handleError, normalizeValues } from "~/server/api/utils";
import {
  getCurrentValuesAll,
  getDayTotalHistory,
  getRawData,
} from "../queries/ihistorian";
import {
  getTotalBetweenTwoDates,
  getRainGauges,
} from "../queries/raindatabase";

export const rainDataRouter = createTRPCRouter({
  // This endpoint is for testing queries
  testIHist: publicProcedure.query(async () => {
    const sqlString = `
      SELECT
        timestamp,
        ADAMS.AF2295LQT.F_CV.VALUE, ADAMS.AF2295LQT.F_CV.QUALITY,
        ADAMS.AF2295LQY.F_CV.VALUE, ADAMS.AF2295LQY.F_CV.QUALITY
      FROM IHTREND
      WHERE samplingmode = CurrentValue
      ORDER BY TIMESTAMP
    `;
    try {
      const adoresult = await connection.query(sqlString);
      console.log(JSON.stringify(adoresult, null, 2));
      return { result: adoresult };
    } catch (err) {
      handleError(err);
    }
  }),
  // Gets rain gauges from database
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
          const values = await getTotalBetweenTwoDates(
            input.date,
            addDays(input.date, 1)
          );
          return values;
        }
      } catch (err) {
        handleError(err);
      }
    }),
  barHistory: publicProcedure
    .input(
      z.object({ monthData: z.boolean(), gauge: z.string(), date: z.date() })
    )
    .query(async ({ input }) => {
      const RainGaugeData = await getRainGauges();

      if (input.gauge) {
        if (
          !RainGaugeData.find(
            (gauge) => gauge.tag.trim() !== input.gauge.trim()
          )
        ) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Unknown gauge ${input.gauge}`,
          });
        }
      } else {
        const firstTag = RainGaugeData[0]?.tag;
        if (firstTag) {
          input.gauge = firstTag;
        }
      }

      if (input.monthData) {
        if (input.date >= startOfMonth(addMonths(new Date(), 1))) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "No data available for future months!",
          });
        }

        const startOfCurrent = startOfMonth(input.date);
        const startOfNext = addMonths(startOfCurrent, 1);

        try {
          const history = await getDayTotalHistory(
            input.gauge,
            startOfCurrent,
            startOfNext
          );
          return history;
        } catch (err) {
          handleError(err);
        }
      } else {
        if (compareAsc(input.date, new Date()) === 1) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "No data available for the future!",
          });
        }

        const start = pureDate(input.date);
        const end = addDays(start, 1);

        try {
          const data = await getRawData(
            input.gauge,
            add(start, { minutes: 14 }),
            end,
            15
          );
          const result = parseDatabaseHistory(data, input.gauge);
          result.readings = result.readings.map((reading) => ({
            ...reading,
            timestamp: sub(reading.timestamp, { minutes: 14 }),
          }));
          result.readings = normalizeValues(result.readings);
          return result;
        } catch (err) {
          handleError(err);
        }
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

      const startOfCurrent = startOfMonth(input.month);
      const startOfNext = addMonths(startOfCurrent, 1);

      try {
        const totals = await getTotalBetweenTwoDates(
          startOfCurrent,
          startOfNext
        );
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
  interpolatedSamples: publicProcedure
    .input(
      z.object({
        gauge: z.string(),
        startDate: z.date(),
        endDate: z.date(),
        samples: z.number().int().positive(),
      })
    )
    .query(async ({ input }) => {
      const queryString = `
        SELECT
          timestamp, ${input.gauge}.F_CV.VALUE, ${input.gauge}.F_CV.QUALITY,
        FROM IHTREND
        WHERE samplingmode = interpolated AND 
          numberofsamples = ${Math.min(input.samples, 1000)} AND 
          timestamp >= '${format(input.startDate, "MM/dd/yyyy")}' AND 
          timestamp <= '${format(input.endDate, "MM/dd/yyyy")}'
        ORDER BY TIMESTAMP
      `;
      try {
        const RainGaugeData = await getRainGauges();

        if (!RainGaugeData.map((rg) => rg.tag).includes(input.gauge)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `${input.gauge} is not a recognized rain gauge.`,
          });
        }

        const result = await connection.query(queryString);
        assertHistorianValuesSingle(result, input.gauge);

        const history = parseDatabaseHistory(result, input.gauge);
        history.readings = normalizeValues(history.readings);

        return history;
      } catch (err) {
        handleError(err);
      }
    }),
});
