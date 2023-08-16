import { TRPCError } from "@trpc/server";
import {
  add,
  addDays,
  addMonths,
  differenceInDays,
  format,
  isToday,
  startOfMonth,
} from "date-fns";
import { z } from "zod";
import { connection } from "~/server/db";
import {
  assertHistorianValuesSingle,
  assertHistorianValuesAll,
} from "~/server/typeValidation";
import {
  parseDatabaseHistory,
  parseDatabaseValues,
  pureDate,
  today,
} from "~/utils/utils";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { RainGaugeData } from "~/utils/constants";
import { handleError, normalizeValues } from "~/server/api/utils";
import { getRawData, getTotalBetweenTwoDates } from "../queries";

export const rainDataRouter = createTRPCRouter({
  // This endpoint is for testing queries
  testIHist: publicProcedure.query(async () => {
    const sqlString = `
      SELECT
        timestamp,
        ADAMS.AF2295LQT.F_CV.VALUE, ADAMS.AF2295LQT.F_CV.QUALITY,
        ADAMS.AF2295LQY.F_CV.VALUE, ADAMS.AF2295LQY.F_CV.QUALITY
      FROM IHTREND
      WHERE samplingmode = rawbytime AND timestamp >= '05/31/2023 23:59:00' AND timestamp <= '05/31/2023 23:59:00'
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
  // Gets the most recent readings for each gauge
  currentValues: publicProcedure.query(async () => {
    const queryString = `
      SELECT TOP 1
        ${RainGaugeData.map(
          (gauge) => `${gauge.tag}.F_CV.VALUE, ${gauge.tag}.F_CV.QUALITY, `
        ).join("")} timestamp
      FROM IHTREND 
      WHERE samplingmode = interpolated 
      ORDER BY TIMESTAMP DESC
    `;

    try {
      const result = await connection.query(queryString);
      assertHistorianValuesAll(result);

      const dbValues = result[0];
      if (dbValues === undefined) {
        throw new Error("No data returned from database!");
      }

      const values = parseDatabaseValues(dbValues);
      return { values };
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

      const minDate = format(add(input.date, { days: 1 }), "MM/dd/yyyy");
      const maxDate = format(add(input.date, { days: 2 }), "MM/dd/yyyy");

      const queryString = isToday(input.date)
        ? `
        SELECT
          ${RainGaugeData.map(
            (gauge) => `${gauge.tag}.F_CV.VALUE, ${gauge.tag}.F_CV.QUALITY, `
          ).join("")} timestamp
        FROM IHTREND 
        WHERE samplingmode = 'currentvalues'
      `
        : `
        SELECT
          ${RainGaugeData.map(
            (gauge) => `${gauge.tag}.F_CV.VALUE, ${gauge.tag}.F_CV.QUALITY, `
          ).join("")} timestamp
        FROM IHTREND 
        WHERE samplingmode = 'calculated' AND
            calculationmode = 'max' AND
            timestamp >= ${minDate} AND 
            timestamp < ${maxDate}
      `;

      try {
        const result = await connection.query(queryString);
        assertHistorianValuesAll(result);

        const dbValues = result[0];
        if (dbValues === undefined) {
          throw new Error("No data returned from database!");
        }

        const values = parseDatabaseValues(dbValues);
        return { values };
      } catch (err) {
        handleError(err);
      }
    }),
  monthValues: publicProcedure
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
        return { totals };
      } catch (err) {
        handleError(err);
      }
    }),
  valueTotal: publicProcedure
    .input(z.object({ startDate: z.date(), endDate: z.date() }))
    .query(async ({ input }) => {
      if (differenceInDays(input.startDate, input.endDate) > 31) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot total more than 31 days of data at a time.",
        });
      }

      try {
        const totals = await getTotalBetweenTwoDates(
          pureDate(input.startDate),
          addDays(pureDate(input.endDate), 1)
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
      if (!RainGaugeData.map((rg) => rg.tag).includes(input.gauge)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `${input.gauge} is not a recognized rain gauge.`,
        });
      }

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
        const result = await connection.query(queryString);
        assertHistorianValuesSingle(result, input.gauge);

        const history = parseDatabaseHistory(result, input.gauge);
        history.readings = normalizeValues(history.readings);

        return history;
      } catch (err) {
        handleError(err);
      }
    }),
  downloadCSV: publicProcedure
    .input(
      z.object({
        gauge: z.string(),
        startDate: z.date(),
        endDate: z.date(),
        frequency: z.number().nullable(),
      })
    )
    .mutation(async ({ input }) => {
      if (differenceInDays(input.startDate, input.endDate) > 31) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot retrieve more than 31 days of data at once.",
        });
      }

      try {
        const result = await getRawData(
          input.gauge,
          pureDate(input.startDate),
          input.endDate,
          input.frequency ? input.frequency : 1
        );
        const history = parseDatabaseHistory(result, input.gauge);

        // Generate CSV file as string
        let csvfile = '"Rain Gauge","Timestamp","Value","Quality"\r\n';
        history.readings.forEach((reading) => {
          csvfile += `"${history.label}","${format(
            reading.timestamp,
            "yyyy-MM-dd HH:mm:ss"
          )}","${reading.value}","${reading.quality}"\r\n`;
        });

        // Return CSV File string encoded as base64
        return csvfile;
      } catch (err) {
        handleError(err);
      }
    }),
});
