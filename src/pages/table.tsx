import { useState } from "react";
import CustomTotalTable from "~/components/table/CustomTotalTable";
import DayTotalTable from "~/components/table/DayTotalTable";
import MonthTotalTable from "~/components/table/MonthTotalTable";

const TablePage = () => {
	const [tableType, setTableType] = useState(0);

	const TabContent = () => {
		if (tableType === 0) {
			return <DayTotalTable />;
		}
		if (tableType === 1) {
			return <MonthTotalTable />;
		}
		if (tableType === 2) {
			return <CustomTotalTable />;
		}
		return <DayTotalTable />;
	};

	return (
		<div className="px-8 pt-4 pb-2 lg:px-16">
			<div className="tabs mb-4">
				<button
					type="button"
					className={`tab-bordered tab ${tableType === 0 ? "tab-active" : ""}`}
					onClick={() => setTableType(0)}
				>
					Day Total
				</button>
				<button
					type="button"
					className={`tab-bordered tab ${tableType === 1 ? "tab-active" : ""}`}
					onClick={() => setTableType(1)}
				>
					Month Total
				</button>
				<button
					type="button"
					className={`tab-bordered tab ${tableType === 2 ? "tab-active" : ""}`}
					onClick={() => setTableType(2)}
				>
					Custom Total
				</button>
			</div>
			{TabContent()}
		</div>
	);
};

export default TablePage;
