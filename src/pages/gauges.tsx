import { api } from "~/utils/api";

const GaugeDetails = () => {
	const rainGauges = api.raindata.rainGauges.useQuery();

	const linkToGIS = (gaugeCoordinates: string) => {
		const url = `https://gis.lrwu.com/index.html?find=${gaugeCoordinates
			.replace(" ", "%20")
			.replace("'", "%27")}`;
		window.open(url, "_blank")?.focus();
	};

	const TableBody = () => {
		return rainGauges.data?.map((gauge) => (
			<tr
				key={gauge.tag}
				className="hover cursor-pointer"
				tabIndex={0}
				onClick={() => linkToGIS(gauge.coordinates)}
				onKeyDown={(e) => {
					if (e.key === "Enter") linkToGIS(gauge.coordinates);
				}}
			>
				<td className="sm:hidden">{gauge.label_short}</td>
				<td className="hidden sm:table-cell lg:hidden">{gauge.label}</td>
				<td className="hidden lg:table-cell">{gauge.label_long}</td>
				<td>{gauge.address}</td>
				<td>{gauge.coordinates}</td>
			</tr>
		));
	};

	const GaugeTable = () => {
		if (rainGauges.isLoading) {
			return <div className="spinner spinner-xl spinner-primary" />;
		}

		return (
			<table className="table-zebra table-xs sm:table-sm  table">
				<thead>
					<tr>
						<th>Gauge</th>
						<th>Street Address</th>
						<th>Coordinates</th>
					</tr>
				</thead>
				<tbody>{TableBody()}</tbody>
			</table>
		);
	};

	return (
		<div className="mx-auto space-y-4 sm:space-y-8 max-w-4xl px-2 pt-4 pb-2 text-center sm:px-8 lg:px-16">
			<h1 className="text-4xl font-bold">Rain Gauge Details</h1>
			<p>
				Our rain gauges are scattered across the city of Little Rock, so we can
				monitor the rain experienced at key points in our collection system.
			</p>
			<div className="m-auto w-fit overflow-x-auto">{GaugeTable()}</div>
		</div>
	);
};

export default GaugeDetails;
