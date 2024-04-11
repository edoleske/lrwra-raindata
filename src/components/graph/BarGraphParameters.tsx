import { compareAsc, format, isSameDay, parse } from "date-fns";
import { useState } from "react";
import { api } from "~/utils/api";

interface GraphParametersProps {
	queryInput: BarGraphQueryInput;
	setQueryInput: React.Dispatch<React.SetStateAction<BarGraphQueryInput>>;
}

const BarGraphParameters = ({
	queryInput,
	setQueryInput,
}: GraphParametersProps) => {
	const [selectedGauge, setSelectedGauge] = useState(queryInput.gauge);
	const [monthData, setMonthData] = useState(queryInput.monthData);
	const [date, setDate] = useState(queryInput.date);

	const rainGauges = api.raindata.rainGauges.useQuery();

	const updateQueryInput = () => {
		setQueryInput({
			gauge: selectedGauge,
			monthData: monthData,
			date: date,
		});
	};

	const parametersModified = () => {
		return (
			queryInput.gauge !== selectedGauge ||
			queryInput.monthData !== monthData ||
			!isSameDay(queryInput.date, date)
		);
	};

	const onDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const value = parse(event.target.value, "yyyy-MM-dd", new Date());

		// If new date is after current date
		if (compareAsc(value, new Date()) === 1) {
			setDate(new Date());
		} else {
			setDate(value);
		}
	};

	return (
		<div className="flex flex-col items-center gap-4 bg-base-200 p-4 md:p-8 md:flex-row md:items-end">
			<label className="w-full max-w-xs">
				<div className="label">
					<span className="label-text">Rain Gauge</span>
				</div>
				<select
					className="select-bordered select select-sm md:select-md w-full"
					value={selectedGauge}
					onChange={(e) => setSelectedGauge(e.target.value)}
				>
					{rainGauges.data?.map((gauge) => (
						<option key={gauge.tag} value={gauge.tag}>
							{gauge.label}
						</option>
					))}
				</select>
			</label>
			<div className="w-full max-w-xs">
				<div className="label">
					<span className="label-text">Data Range</span>
				</div>
				<div className="form-control">
					<label className="label cursor-pointer justify-start">
						<input
							type="radio"
							name="barGraphMonth"
							className="radio radio-sm md:radio-md mr-4"
							value="true"
							checked={monthData}
							onChange={(e) => setMonthData(e.target.value === "true")}
						/>
						<span className="label-text">Month of Selected Date</span>
					</label>
				</div>
				<div className="form-control">
					<label className="label cursor-pointer justify-start">
						<input
							type="radio"
							name="barGraphMonth"
							className="radio radio-sm md:radio-md mr-4"
							value="false"
							checked={!monthData}
							onChange={(e) => setMonthData(e.target.value === "true")}
						/>
						<span className="label-text">Selected Date (Every 15 Minutes)</span>
					</label>
				</div>
			</div>
			<label className="w-full max-w-xs">
				<div className="label">
					<span className="label-text">Date</span>
				</div>
				<input
					type="date"
					className="input-bordered input input-sm md:input-md w-full"
					value={format(date, "yyyy-MM-dd")}
					onChange={onDateChange}
				/>
			</label>
			<div className="mx-2">
				<button
					type="button"
					className="btn-primary btn"
					disabled={!parametersModified()}
					onClick={updateQueryInput}
				>
					Update
				</button>
			</div>
		</div>
	);
};

export default BarGraphParameters;
