import { sub } from "date-fns";
import { useMemo, useRef, useState } from "react";
import BarChart from "~/components/BarChart";
import QueryErrorAlert from "~/components/QueryErrorAlert";
import BarGraphParameters from "~/components/graph/BarGraphParameters";
import useWindowDimensions from "~/hooks/useWindowDimensions";
import { api } from "~/utils/api";
import { pureDate } from "~/utils/utils";

const BarChartPage = () => {
	const divRef = useRef<HTMLDivElement>(null);
	const { height: wHeight } = useWindowDimensions();

	const [queryInput, setQueryInput] = useState({
		monthData: true,
		date: sub(new Date(), { months: 1 }),
		gauge: "",
	});

	const dataQuery = api.chart.barHistory.useQuery(queryInput);

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
		if (dataQuery.isError) {
			return <QueryErrorAlert message={dataQuery.error.message} />;
		}

		if (!dataQuery.data) {
			return (
				<div className="py-4 text-center">
					<div className="spinner spinner-xl spinner-primary" />
				</div>
			);
		}

		return (
			<BarChart
				data={dataQuery.data.readings.map((r) => ({
					date: queryInput.monthData ? pureDate(r.timestamp) : r.timestamp,
					value: r.value,
				}))}
				dimensions={chartDimensions}
			/>
		);
	};

	return (
		<>
			<BarGraphParameters
				queryInput={queryInput}
				setQueryInput={setQueryInput}
			/>
			<div className="min-w-sm" ref={divRef}>
				{Chart()}
			</div>
		</>
	);
};

export default BarChartPage;
