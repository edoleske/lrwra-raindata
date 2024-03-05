import { format, parse } from "date-fns";
import { useState, useContext } from "react";
import { api } from "~/utils/api";
import { today } from "~/utils/utils";
import QueryErrorAlert from "~/components/QueryErrorAlert";
import { GlobalAlertContext } from "../globalAlerts/GlobalAlertProvider";
import GaugeValuesTable from "./GaugeValuesTable";
import Loading from "../Loading";

const MonthTotalTable = () => {
	const addAlert = useContext(GlobalAlertContext);

	const [month, setMonth] = useState(format(today(), "yyyy-MM-dd"));
	const [queryMonth, setQueryMonth] = useState(today());

	const historyValues = api.raindata.monthTotals.useQuery({
		month: queryMonth,
	});
	const rainGauges = api.raindata.rainGauges.useQuery();

	const updateQuery = () => {
		try {
			const newMonth = parse(month, "yyyy-MM-dd", new Date());
			setQueryMonth(newMonth);
		} catch (error) {
			addAlert(String(error), "error");
			console.error(error);
		}
	};

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
				filename={`LRWRA_RainGaugeTotals_${format(queryMonth, "yyyyMM")}.csv`}
			/>
		);
	};

	return (
		<div className="space-y-8">
			<div className="m-auto w-full flex-wrap sm:flex-nowrap flex gap-4 items-end">
				<h1 className="self-start basis-full flex-grow text-4xl font-bold">
					Rain Totals by Month
				</h1>
				<div className="max-w-xs">
					<label className="label">
						<span className="label-text">Month</span>
					</label>
					<input
						type="date"
						className="input-bordered input w-full"
						value={month}
						onChange={(event) => setMonth(event.target.value)}
					/>
				</div>
				<div className="flex justify-center">
					<button
						type="button"
						className={`btn-primary btn ${
							parse(month, "yyyy-MM-dd", new Date()) === queryMonth
								? "btn-disabled"
								: ""
						}`}
						onClick={updateQuery}
					>
						Update
					</button>
				</div>
			</div>
			{DataTable()}
		</div>
	);
};

export default MonthTotalTable;
