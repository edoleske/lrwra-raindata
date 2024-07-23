import { compareAsc, format, parse } from "date-fns";
import { saveAs } from "file-saver";
import { useContext, useState } from "react";
import { BsCalendarEvent, BsCalendarWeek } from "react-icons/bs";
import { GlobalAlertContext } from "~/components/globalAlerts/GlobalAlertProvider";
import { api } from "~/utils/api";

const DownloadPage = () => {
	const addAlert = useContext(GlobalAlertContext);

	const [selectedGauge, setSelectedGauge] = useState("all");
	const [dateRange, setDateRange] = useState(false);
	const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-dd"));
	const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));
	const [frequency, setFrequency] = useState(1);
	const [normalize, setNormalize] = useState(false);

	const rainGauges = api.raindata.rainGauges.useQuery();
	const fileMutation = api.download.downloadCSV.useMutation();
	const dailyFileMutation = api.download.downloadDailyCSV.useMutation();

	const onClick = async () => {
		const result =
			frequency >= 86400
				? await dailyFileMutation.mutateAsync(
						{
							gauge: selectedGauge,
							startDate: parse(startDate, "yyyy-MM-dd", new Date()),
							endDate: parse(endDate, "yyyy-MM-dd", new Date()),
						},
						{ onError: (error) => addAlert(error.message, "error") },
					)
				: await fileMutation.mutateAsync(
						{
							gauge: selectedGauge,
							startDate: parse(startDate, "yyyy-MM-dd", new Date()),
							endDate: parse(endDate, "yyyy-MM-dd", new Date()),
							frequency: frequency,
							normalize: normalize,
						},
						{ onError: (error) => addAlert(error.message, "error") },
					);

		if (result) {
			const gaugeString =
				rainGauges.data
					?.find((rg) => rg.tag === selectedGauge)
					?.label_short?.replace(/\s/g, "") ?? selectedGauge;
			let dateString = startDate.replace("-", "");
			if (dateRange) {
				dateString += `-${endDate.replace("-", "")}`;
			}
			const filename = `LRWRA_${gaugeString}RainData_${dateString}.csv`;
			const blob = new Blob([result], { type: "text/csv;charset=utf-8;" });

			// Uses file-saver library to use best practive file download on most browsers
			saveAs(blob, filename);
		}
	};

	const isValid = () => {
		const start = parse(startDate, "yyyy-MM-dd", new Date());
		const end = parse(endDate, "yyyy-MM-dd", new Date());

		// If start is after end
		// Or both start and end are after current date
		if (
			compareAsc(start, end) === 1 ||
			(compareAsc(new Date(), end) !== 1 && compareAsc(new Date(), start) !== 1)
		) {
			return false;
		}

		return true;
	};

	const toggleDateRange = () => {
		setDateRange((dr) => {
			if (dr) {
				setEndDate(startDate);
			}
			return !dr;
		});
	};

	const onDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setStartDate(event.target.value);
		setEndDate(event.target.value);
	};

	const onStartDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setStartDate(event.target.value);
	};

	const onEndDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setEndDate(event.target.value);
	};

	const DateForm = () => {
		if (dateRange) {
			return (
				<div className="flex flex-col gap-2 md:flex-row">
					<div className="flex items-end gap-2">
						<label className="w-full max-w-xs">
							<div className="label">
								<span className="label-text">Start Date</span>
							</div>
							<input
								type="date"
								className="input-bordered input w-full"
								value={startDate}
								onChange={onStartDateChange}
							/>
						</label>
						<div className="tooltip" data-tip="Use Single Date">
							<button type="button" className="btn" onClick={toggleDateRange}>
								<BsCalendarEvent size={18} />
							</button>
						</div>
					</div>

					<label className="w-full max-w-xs">
						<div className="label">
							<span className="label-text">End Date</span>
						</div>
						<input
							type="date"
							className="input-bordered input w-full"
							value={endDate}
							onChange={onEndDateChange}
						/>
					</label>
				</div>
			);
		}
		return (
			<div className="flex items-end gap-2">
				<label className="w-full max-w-xs">
					<div className="label">
						<span className="label-text">Date</span>
					</div>
					<input
						type="date"
						className="input-bordered input w-full"
						value={startDate}
						onChange={onDateChange}
					/>
				</label>
				<div className="tooltip" data-tip="Use Date Range">
					<button
						type="button"
						aria-label="Toggle Single Date and Date Range"
						className="btn"
						onClick={toggleDateRange}
					>
						<BsCalendarWeek size={18} />
					</button>
				</div>
			</div>
		);
	};

	const Form = () => (
		<div className="m-auto flex-col items-center justify-center">
			<label className="m-auto w-full md:ml-0">
				<div className="label">
					<span className="label-text">Rain Gauge</span>
				</div>
				<select
					className="select-bordered select w-full"
					value={selectedGauge}
					onChange={(e) => setSelectedGauge(e.target.value)}
				>
					<option value="all">All</option>
					{rainGauges.data?.map((gauge) => (
						<option key={gauge.tag} value={gauge.tag}>
							{gauge.label}
						</option>
					))}
				</select>
			</label>
			{DateForm()}
			{selectedGauge !== "all" && (
				<label className="m-auto w-full md:ml-0">
					<div className="label">
						<span className="label-text">Value Type</span>
					</div>
					<select
						className="select-bordered select w-full"
						value={normalize ? "true" : "false"}
						onChange={(e) => setNormalize(e.currentTarget.value === "true")}
					>
						<option value={"false"}>Raw Reading (in.)</option>
						<option value={"true"}>Increase Since Last Time Step (in.)</option>
					</select>
				</label>
			)}
			<label className="m-auto w-full  md:ml-0">
				<div className="label">
					<span className="label-text">Sample Frequency</span>
				</div>
				<select
					className="select-bordered select w-full"
					value={frequency}
					onChange={(e) => setFrequency(+e.currentTarget.value)}
				>
					<option value={1}>Every minute</option>
					<option value={5}>Every 5 minutes</option>
					<option value={10}>Every 10 minutes</option>
					<option value={15}>Every 15 minutes</option>
					<option value={30}>Every 30 minutes</option>
					<option value={60}>Every hour</option>
					<option value={86400}>Daily</option>
				</select>
			</label>
		</div>
	);

	if (fileMutation.isLoading || rainGauges.isLoading) {
		return (
			<div className="w-full p-8 text-center">
				<h1 className="mb-8 text-4xl font-bold">Download Data</h1>
				{dateRange && (
					<p className="mb-4">
						Loading your data! Please be patient as this can take up to a
						minute.
					</p>
				)}
				<div className="spinner spinner-xl spinner-primary m-auto" />
			</div>
		);
	}

	return (
		<div className="mx-auto flex max-w-2xl flex-col items-center justify-center gap-8 p-8 text-center lg:px-16">
			<h1 className="text-4xl font-bold">Download Data</h1>
			<p>
				Download a CSV (Comma-separate values) file with raw data from one of
				our rain gauges.
			</p>
			<p>
				Our gauges report a single floating-point value every second
				representing the amount of rain measured that day in inches. The value
				is reset at the beginning of every day.
			</p>
			{Form()}
			<button
				type="button"
				className={`btn-primary btn ${isValid() ? "" : "btn-disabled"}`}
				onClick={onClick}
			>
				Download
			</button>
		</div>
	);
};

export default DownloadPage;
