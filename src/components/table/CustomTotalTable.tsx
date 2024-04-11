import { format, parse, sub } from "date-fns";
import { useContext, useState } from "react";
import { api } from "~/utils/api";
import { today } from "~/utils/utils";
import QueryErrorAlert from "~/components/QueryErrorAlert";
import { GlobalAlertContext } from "../globalAlerts/GlobalAlertProvider";
import GaugeValuesTable from "./GaugeValuesTable";
import Loading from "../Loading";

const CustomTotalTable = () => {
	const addAlert = useContext(GlobalAlertContext);

	const [startDate, setStartDate] = useState(
		format(sub(new Date(), { days: 2 }), "yyyy-MM-dd'T'HH:mm"),
	);
	const [endDate, setEndDate] = useState(
		format(new Date(), "yyyy-MM-dd'T'HH:mm"),
	);

	const [queryStartDate, setQueryStartDate] = useState(
		sub(today(), { days: 2 }),
	);
	const [queryEndDate, setQueryEndDate] = useState(today());

	const updateQuery = () => {
		try {
			const start = parse(startDate, "yyyy-MM-dd'T'HH:mm", new Date());
			const end = parse(endDate, "yyyy-MM-dd'T'HH:mm", new Date());
			setQueryStartDate(start);
			setQueryEndDate(end);
		} catch (error) {
			addAlert(String(error), "error");
			console.error(error);
		}
	};

	const historyValues = api.raindata.valueTotal.useQuery({
		startDate: queryStartDate,
		endDate: queryEndDate,
	});
	const rainGauges = api.raindata.rainGauges.useQuery();

	const DataTable = () => {
		if (historyValues.isError) {
			return <QueryErrorAlert message={historyValues.error.message} />;
		}

		if (rainGauges.isError) {
			return <QueryErrorAlert message={rainGauges.error.message} />;
		}

		if (!historyValues.data || !rainGauges.data) {
			return <Loading />;
		}

		return (
			<GaugeValuesTable
				gauges={rainGauges.data}
				values={historyValues.data.readings}
				filename={`LRWRA_RainGaugeTotals_${format(
					queryStartDate,
					"yyyyMMdd",
				)}-${format(queryEndDate, "yyyyMMdd")}.csv`}
			/>
		);
	};

	return (
		<div className="space-y-8">
			<div className="m-auto w-full flex-wrap xl:flex-nowrap flex gap-4 items-end justify-center sm:justify-start">
				<h1 className="self-start basis-full flex-grow text-4xl font-bold">
					Rain Totals by Range
				</h1>
				<label className="max-w-xs">
					<div className="label">
						<span className="label-text">Start Date</span>
					</div>
					<input
						type="datetime-local"
						className="input-bordered input w-full"
						value={startDate}
						onChange={(event) => setStartDate(event.target.value)}
					/>
				</label>
				<label className="max-w-xs">
					<div className="label">
						<span className="label-text">End Date</span>
					</div>
					<input
						type="datetime-local"
						className="input-bordered input w-full"
						value={endDate}
						onChange={(event) => setEndDate(event.target.value)}
					/>
				</label>
				<button
					type="button"
					className={`btn-primary btn ${
						parse(startDate, "yyyy-MM-dd'T'HH:mm", new Date()) ===
							queryStartDate &&
						parse(endDate, "yyyy-MM-dd'T'HH:mm", new Date()) === queryEndDate
							? "btn-disabled"
							: ""
					}`}
					onClick={updateQuery}
				>
					Update
				</button>
			</div>
			{DataTable()}
		</div>
	);
};

export default CustomTotalTable;
