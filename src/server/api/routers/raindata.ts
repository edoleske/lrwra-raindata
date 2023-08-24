import { TRPCError } from "@trpc/server";
import {
  add,
  addDays,
  addMonths,
  compareAsc,
  differenceInCalendarDays,
  differenceInDays,
  format,
  isToday,
  startOfMonth,
  sub,
} from "date-fns";
import { z } from "zod";
import { connection } from "~/server/db";
import {
  assertHistorianValuesSingle,
  assertHistorianValuesAll,
} from "~/server/typeValidation";
import {
  getRainGaugeLabel,
  parseDatabaseHistory,
  parseDatabaseValues,
  pureDate,
  today,
} from "~/utils/utils";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { RainGaugeData } from "~/utils/constants";
import { handleError, normalizeValues } from "~/server/api/utils";
import {
  getDayTotalAfterTime,
  getDayTotalBeforeTime,
  getDayTotalHistory,
  getRawData,
  getRawDataAll,
  getTotalBetweenTwoDates,
} from "../queries";

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
  barHistory: publicProcedure
    .input(
      z.object({ monthData: z.boolean(), gauge: z.string(), date: z.date() })
    )
    .query(async ({ input }) => {
      if (
        !RainGaugeData.find((gauge) => gauge.tag.trim() !== input.gauge.trim())
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Unknown gauge ${input.gauge}`,
        });
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

      const totals: AllGaugeTotals = {
        startDate: input.startDate,
        endDate: input.endDate,
        readings: [],
      };

      try {
        const calendarDayRange = Math.abs(
          differenceInCalendarDays(input.startDate, input.endDate)
        );
        if (calendarDayRange == 0) {
          const result = await getDayTotalAfterTime(
            input.startDate,
            input.endDate
          );

          totals.readings = RainGaugeData.map((gauge) => ({
            label: gauge.tag,
            value:
              result.readings.find((r) => r.label === gauge.tag)?.value ?? 0,
          }));
        } else {
          const startResult = await getDayTotalAfterTime(input.startDate);
          const endResult = await getDayTotalBeforeTime(input.endDate);

          totals.readings = RainGaugeData.map((gauge) => ({
            label: gauge.tag,
            value:
              (startResult.readings.find((r) => r.label === gauge.tag)?.value ??
                0) +
              (endResult.readings.find((r) => r.label === gauge.tag)?.value ??
                0),
          }));

          if (calendarDayRange > 1) {
            const fullDayTotals = await getTotalBetweenTwoDates(
              addDays(pureDate(input.startDate), 1),
              pureDate(input.endDate)
            );

            totals.readings = totals.readings.map((r) => ({
              label: r.label,
              value:
                r.value +
                (fullDayTotals.readings.find((fdr) => fdr.label === r.label)
                  ?.value ?? 0),
            }));
          }
        }

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
      if (
        !RainGaugeData.find((rg) => rg.tag.trim() === input.gauge.trim()) &&
        input.gauge !== "all"
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Unknown rain gauge ${input.gauge}`,
        });
      }

      const start = pureDate(input.startDate);
      const end = addDays(pureDate(input.endDate), 1);

      if (compareAsc(end, start) !== 1) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `End date ${format(
            end,
            "yyyy-mm-DD"
          )} is before start date ${format(start, "yyyy-mm-DD")}`,
        });
      }

      if (Math.abs(differenceInDays(start, end)) > 31) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot retrieve more than 31 days of data at once.",
        });
      }

      try {
        let csvfile = "";
        if (input.gauge === "all") {
          const result = await getRawDataAll(
            start,
            end,
            input.frequency ? input.frequency : 1
          );
          const history = result.map((r) => parseDatabaseValues(r));

          // Generate CSV file as string
          csvfile = `"Timestamp",${RainGaugeData.map(
            (rg) => `"${rg.label} Value (in)","${rg.label} Status %"`
          ).join(",")}\r\n`;
          history.forEach((row) => {
            csvfile += `"${format(
              row.timestamp,
              "yyyy-MM-dd HH:mm:ss"
            )}",${RainGaugeData.map((rg) => {
              const reading = row.readings.find((r) => r.label === rg.tag);
              if (!reading) {
                return '"",""';
              }
              return `"${reading.value}","${reading.quality}"`;
            }).join(",")}\r\n`;
          });
        } else {
          const result = await getRawData(
            input.gauge,
            start,
            end,
            input.frequency ? input.frequency : 1
          );
          const history = parseDatabaseHistory(result, input.gauge);

          // Generate CSV file as string
          csvfile = '"Rain Gauge","Timestamp","Value","Quality"\r\n';
          history.readings.forEach((reading) => {
            csvfile += `"${getRainGaugeLabel(history.label)}","${format(
              reading.timestamp,
              "yyyy-MM-dd HH:mm:ss"
            )}","${reading.value}","${reading.quality}"\r\n`;
          });
        }
        return csvfile;
      } catch (err) {
        handleError(err);
      }
    }),
});
