import { format, parse } from "date-fns";
import { useContext, useState } from "react";
import { api } from "~/utils/api";
import { today } from "~/utils/utils";
import QueryErrorAlert from "../QueryErrorAlert";
import { GlobalAlertContext } from "../globalAlerts/GlobalAlertProvider";
import GaugeValuesTable from "./GaugeValuesTable";
import Loading from "../Loading";

const DayTotalTable = () => {
	const addAlert = useContext(GlobalAlertContext);

	const [date, setDate] = useState(format(today(), "yyyy-MM-dd"));
	const [queryDate, setQueryDate] = useState(today());

	const updateQuery = () => {
		try {
			const newDate = parse(date, "yyyy-MM-dd", new Date());
			setQueryDate(newDate);
		} catch (error) {
			addAlert(String(error), "error");
			console.error(error);
		}
	};

	const historyValues = api.raindata.dateValues.useQuery({
		date: queryDate,
	});
	const rainGauges = api.raindata.rainGauges.useQuery();

	const DataTable = () => {
		if (historyValues.isLoading || rainGauges.isLoading) {
			return <Loading />;
		}

		if (historyValues.isError || !historyValues.data) {
			return (
				<QueryErrorAlert
					message={historyValues.error?.message ?? "No reading data found"}
				/>
			);
		}

		if (rainGauges.isError || !rainGauges.data) {
			return (
				<QueryErrorAlert
					message={rainGauges.error?.message ?? "No rain gauge data found"}
				/>
			);
		}

		return (
			<GaugeValuesTable
				gauges={rainGauges.data}
				values={historyValues.data.readings}
				filename={`LRWRA_RainGaugeTotals_${format(queryDate, "yyyyMMdd")}.csv`}
			/>
		);
	};

	return (
		<div className="space-y-8">
			<div className="m-auto w-full flex-wrap sm:flex-nowrap flex gap-4 items-end">
				<h1 className="self-start basis-full text-4xl font-bold flex-grow">
					Rain Totals by Date
				</h1>
				<label className="max-w-xs">
					<div className="label">
						<span className="label-text">Date</span>
					</div>
					<input
						type="date"
						className="input-bordered input w-full"
						value={date}
						onChange={(event) => setDate(event.target.value)}
					/>
				</label>
				<button
					type="button"
					className={`btn-primary btn ${
						parse(date, "yyyy-MM-dd", new Date()) === queryDate
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

export default DayTotalTable;
