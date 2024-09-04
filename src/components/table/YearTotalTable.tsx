import { format, parse } from "date-fns";
import { useState, useContext } from "react";
import { api } from "~/utils/api";
import { GlobalAlertContext } from "../globalAlerts/GlobalAlertProvider";
import { today } from "~/utils/utils";
import QueryErrorAlert from "../QueryErrorAlert";
import Loading from "../Loading";
import GaugeValuesTable from "./GaugeValuesTable";

const YearTotalTable = () => {
	const addAlert = useContext(GlobalAlertContext);

	const currentYear = new Date().getFullYear();
	const [year, setYear] = useState(currentYear.toString());
	const [queryYear, setQueryYear] = useState(currentYear.toString());

	const historyValues = api.raindata.yearTotals.useQuery({
		year: queryYear,
	});
	const rainGauges = api.raindata.rainGauges.useQuery();

	const updateQuery = () => {
		try {
			setQueryYear(year);
		} catch (error) {
			addAlert(String(error), "error");
			console.error(error);
		}
	};

	const getYearRange = () => {
		const result = [];
		for (let y = currentYear; y > 2002; y--) {
			result.push(y);
		}
		return result;
	};

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
				filename={`LRWRA_RainGaugeTotals_${queryYear}.csv`}
			/>
		);
	};

	return (
		<div className="space-y-8">
			<div className="m-auto w-full flex-wrap sm:flex-nowrap flex gap-4 items-end">
				<h1 className="self-start basis-full flex-grow text-4xl font-bold">
					Rain Totals by Year
				</h1>
				<label className="max-w-xs">
					<div className="label">
						<span className="label-text">Year</span>
					</div>
					<select
						className="select select-bordered"
						value={year}
						onChange={(e) => setYear(e.target.value)}
					>
						{getYearRange().map((y) => (
							<option key={y} value={y}>
								{y}
							</option>
						))}
					</select>
				</label>
				<div className="flex justify-center">
					<button
						type="button"
						className={`btn-primary btn ${
							year === queryYear ? "btn-disabled" : ""
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

export default YearTotalTable;
