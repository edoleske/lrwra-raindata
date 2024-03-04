import { sub } from "date-fns";
import React, { useMemo, useRef, useState } from "react";
import LineChart from "~/components/LineChart";
import QueryErrorAlert from "~/components/QueryErrorAlert";
import LineGraphParameters from "~/components/graph/LineGraphParameters";
import useWindowDimensions from "~/hooks/useWindowDimensions";
import { api } from "~/utils/api";

const LineGraphPage = () => {
	const divRef = useRef<HTMLDivElement>(null);
	const { height: wHeight } = useWindowDimensions();

	const [queryInput, setQueryInput] = useState({
		gauge: "ADAMS.AF2295LQT",
		startDate: sub(new Date(), { months: 1 }),
		endDate: new Date(),
	});

	const historyQuery = api.chart.lineHistory.useQuery(queryInput);

	// biome-ignore lint/correctness/useExhaustiveDependencies: clientWidth is a dependency
	const chartDimensions = useMemo(() => {
		const width = divRef.current?.clientWidth ?? 0;
		return {
			width: Math.max(300, width - 64),
			height: Math.max(200, width <= 768 ? wHeight * 0.45 : wHeight * 0.65),
			margin: { top: 32, right: 32, bottom: 48, left: 32 },
		};
	}, [divRef.current?.clientWidth, wHeight]);

	const Chart = () => {
		if (historyQuery.isError) {
			return <QueryErrorAlert message={historyQuery.error.message} />;
		}

		if (!historyQuery.data) {
			return (
				<div className="py-4 text-center">
					<div className="spinner spinner-xl spinner-primary" />
				</div>
			);
		}

		return (
			<LineChart
				data={historyQuery.data.readings.map((r) => ({
					date: r.timestamp,
					value: r.value,
				}))}
				dimensions={chartDimensions}
			/>
		);
	};

	return (
		<>
			<LineGraphParameters
				queryInput={queryInput}
				setQueryInput={setQueryInput}
			/>
			<div className="min-w-sm" ref={divRef}>
				{Chart()}
			</div>
		</>
	);
};

export default LineGraphPage;
