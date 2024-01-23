import { TRPCError } from "@trpc/server";
import {
	addDays,
	addMonths,
	compareAsc,
	differenceInDays,
	startOfMonth,
} from "date-fns";
import { z } from "zod";
import { pureDate } from "~/utils/utils";
import { createTRPCRouter, publicProcedure } from "../trpc";
import {
	collectTimeInterval,
	handleError,
	normalizeValues,
	validateDates,
} from "~/server/api/utils";
import {
	getRawData,
	getRainGauges,
	getDailyTotalHistory,
} from "~/server/api/queries/raindatabase";

export const chartRouter = createTRPCRouter({
	lineHistory: publicProcedure
		.input(
			z.object({
				gauge: z.string(),
				startDate: z.date(),
				endDate: z.date(),
			}),
		)
		.query(async ({ input }) => {
			try {
				const RainGaugeData = await getRainGauges();

				if (!RainGaugeData.map((rg) => rg.tag).includes(input.gauge)) {
					throw new TRPCError({
						code: "BAD_REQUEST",
						message: `${input.gauge} is not a recognized rain gauge.`,
					});
				}

				validateDates(input.startDate, input.endDate, 730);
				const deltaDays = Math.abs(
					differenceInDays(input.startDate, input.endDate),
				);

				// Return raw readings for time ranges within two weeks
				if (deltaDays < 15) {
					const result = await getRawData(
						input.gauge,
						input.startDate,
						input.endDate,
					);
					result.readings = normalizeValues(result.readings);

					// Collect into different time intervals depending on time range
					if (deltaDays <= 1) {
						return collectTimeInterval(result);
					}
					if (deltaDays <= 3) {
						return collectTimeInterval(result, 30);
					}
					if (deltaDays <= 7) {
						return collectTimeInterval(result, 60);
					}
					return collectTimeInterval(result, 120);
				}

				// Otherwise, we want to get daily totals
				const result = await getDailyTotalHistory(
					input.gauge,
					input.startDate,
					input.endDate,
				);
				return result;
			} catch (err) {
				handleError(err);
			}
		}),
	barHistory: publicProcedure
		.input(
			z.object({ monthData: z.boolean(), gauge: z.string(), date: z.date() }),
		)
		.query(async ({ input }) => {
			const RainGaugeData = await getRainGauges();

			if (input.gauge) {
				if (
					!RainGaugeData.find(
						(gauge) => gauge.tag.trim() !== input.gauge.trim(),
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
					const history = await getDailyTotalHistory(
						input.gauge,
						startOfCurrent,
						startOfNext,
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
					const result = await getRawData(input.gauge, start, end);
					result.readings = normalizeValues(result.readings);
					return collectTimeInterval(result, 15);
				} catch (err) {
					handleError(err);
				}
			}
		}),
});
