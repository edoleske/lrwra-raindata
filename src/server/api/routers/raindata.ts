import { TRPCError } from "@trpc/server";
import {
  add,
  addDays,
  addMonths,
  format,
  isBefore,
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
  today,
} from "~/utils/utils";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { RainGauges } from "~/utils/constants";
import { handleError, normalizeValues } from "~/server/api/utils";

export const rainDataRouter = createTRPCRouter({
  // This endpoint is for testing queries
  testIHist: publicProcedure.query(async () => {
    const sqlString = `
      SELECT
        timestamp,
        ADAMS.AF2295LQT.F_CV.VALUE, ADAMS.AF2295LQT.F_CV.QUALITY,
        ADAMS.AF2295LQY.F_CV.VALUE, ADAMS.AF2295LQY.F_CV.QUALITY
      FROM IHTREND
      WHERE samplingmode = rawbytime AND timestamp = '04/03/2023 01:00:00'
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
        ${RainGauges.map(
          (gauge) => `${gauge}.F_CV.VALUE, ${gauge}.F_CV.QUALITY, `
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
          ${RainGauges.map(
            (gauge) => `${gauge}.F_CV.VALUE, ${gauge}.F_CV.QUALITY, `
          ).join("")} timestamp
        FROM IHTREND 
        WHERE samplingmode = 'currentvalues'
      `
        : `
        SELECT
          ${RainGauges.map(
            (gauge) => `${gauge}.F_CV.VALUE, ${gauge}.F_CV.QUALITY, `
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
      let queryString = `
        SELECT 
        ${RainGauges.map(
          (gauge) => `${gauge}.F_CV.VALUE, ${gauge}.F_CV.QUALITY, `
        ).join("")} timestamp
        FROM IHTREND
        WHERE samplingmode = 'rawbytime' AND (
      `;

      const startOfCurrent = startOfMonth(input.month);
      const startOfNext = addMonths(startOfCurrent, 1);
      for (
        let i = startOfMonth(input.month);
        isBefore(i, startOfNext);
        i = addDays(i, 1)
      ) {
        queryString += `(
          TIMESTAMP >= '${format(i, "MM/dd/yyyy")} 23:59:59' AND 
          TIMESTAMP <= '${format(i, "MM/dd/yyyy")} 23:59:59')`;
      }
      queryString += ")";

      try {
        const result = await connection.query(queryString);
        assertHistorianValuesAll(result);
        const parsedResult = result.map((r) => parseDatabaseValues(r));

        const totals: AllGaugeTotals = {
          startDate: startOfCurrent,
          endDate: startOfNext,
          readings: [],
        };

        if (result.length <= 0) {
          throw new Error("No data returned from database!");
        }

        totals.readings = RainGauges.map((gauge) => ({
          label: gauge,
          value: parsedResult.reduce(
            (previous, a) =>
              previous +
              (a.readings.find((r) => r.label === gauge)?.value ?? 0),
            0
          ),
        }));

        return { totals };
      } catch (err) {
        handleError(err);
      }
    }),
  valueTotal: publicProcedure
    .input(z.object({ startDate: z.date(), endDate: z.date() }))
    .query(async ({ input }) => {
      const gaugeTotals: AllGaugeTotals = {
        startDate: input.startDate,
        endDate: input.endDate,
        readings: [],
      };

      const totalStart = performance.now();

      try {
        const queryString = `
          SELECT 
            ${RainGauges.map(
              (gauge) => `${gauge}.F_CV.VALUE, ${gauge}.F_CV.QUALITY, `
            ).join("")} timestamp
          FROM IHTREND
          WHERE samplingmode = 'interpolatedtoraw' AND 
            numberofsamples = 1000 AND 
            timestamp >= '${format(
              input.startDate,
              "MM/dd/yyyy HH:mm:ss"
            )}' AND 
            timestamp <= '${format(input.endDate, "MM/dd/yyyy HH:mm:ss")}'
        `;

        const result = await connection.query(queryString);

        for (const gauge of RainGauges) {
          const gaugeStart = performance.now();

          assertHistorianValuesSingle(result, gauge);

          const history = parseDatabaseHistory(result, gauge);
          history.readings = normalizeValues(history.readings);

          gaugeTotals.readings.push({
            label: gauge,
            value: history.readings.reduce(
              (accumulator, value) => accumulator + value.value,
              0
            ),
          });

          const gaugeEnd = performance.now();
          console.log(`Gauge ${gauge} took ${gaugeEnd - gaugeStart} ms`);
        }

        const totalEnd = performance.now();
        console.log(`Total runtime: ${totalEnd - totalStart} ms`);

        return gaugeTotals;
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
      if (!RainGauges.includes(input.gauge)) {
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
      })
    )
    .mutation(async ({ input }) => {
      const queryString = `
        SELECT
          timestamp, ${input.gauge}.F_CV.VALUE, ${input.gauge}.F_CV.QUALITY,
        FROM IHTREND
        WHERE samplingmode = interpolated AND 
          intervalmilliseconds = 60000 AND 
          timestamp >= '${format(input.startDate, "MM/dd/yyyy HH:mm:00")}' AND 
          timestamp <= '${format(input.endDate, "MM/dd/yyyy HH:mm:00")}'
        ORDER BY TIMESTAMP
      `;

      try {
        const result = await connection.query(queryString);
        assertHistorianValuesSingle(result, input.gauge);

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
