import { MdDownload } from "react-icons/md";
import { saveAs } from "file-saver";

type GaugeValuesTableProps = {
	gauges: RainGaugeInfo[];
	values: LabeledReading[] | GaugeTotal[];
	filename: string;
};

const GaugeValuesTable = ({
	gauges,
	values,
	filename,
}: GaugeValuesTableProps) => {
	const downloadQueryResult = () => {
		let csvfile = '"Rain Gauge","Value (Inches)"\r\n';
		for (const reading of values) {
			csvfile += `"${gauges.find((g) => g.tag === reading.label)?.label}","${
				reading.value
			}"\r\n`;
		}

		const blob = new Blob([csvfile], { type: "text/csv;charset=utf-8;" });

		// Uses file-saver library to use best practive file download on most browsers
		saveAs(blob, filename);
	};

	return (
		<table className="table-zebra table-xs sm:table-sm m-auto table w-full ">
			<thead>
				<tr>
					<th>Gauge</th>
					<th className="flex items-center justify-between">
						Value (inches)
						<div className="tooltip" data-tip="Download">
							<button
								type="button"
								className="btn-xs btn-circle btn"
								onClick={downloadQueryResult}
							>
								<MdDownload size={14} />
							</button>
						</div>
					</th>
				</tr>
			</thead>
			<tbody>
				{values.map((reading) => (
					<tr key={reading.label}>
						<td className="table-cell md:hidden">
							{gauges.find((g) => g.tag === reading.label)?.label}
						</td>
						<td className="hidden md:table-cell">
							{gauges.find((g) => g.tag === reading.label)?.label_long}
						</td>
						<td>
							{reading.value === 0 || Number.isNaN(Number(reading.value))
								? Number(0).toFixed(2)
								: Number(reading.value).toFixed(2)}
							&quot;
						</td>
					</tr>
				))}
			</tbody>
		</table>
	);
};

export default GaugeValuesTable;
