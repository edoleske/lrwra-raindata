import { useState } from "react";
import CustomTotalTable from "~/components/table/CustomTotalTable";
import DayTotalTable from "~/components/table/DayTotalTable";
import MonthTotalTable from "~/components/table/MonthTotalTable";
import YearTotalTable from "~/components/table/YearTotalTable";

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
			return <YearTotalTable />;
		}
		if (tableType === 3) {
			return <CustomTotalTable />;
		}
		return <DayTotalTable />;
	};

	return (
		<div className="px-8 pt-4 pb-2 lg:px-16">
			<div role="tablist" className="tabs tabs-bordered pb-4 w-fit">
				<button
					role="tab"
					type="button"
					className={`tab ${tableType === 0 ? "tab-active" : ""}`}
					onClick={() => setTableType(0)}
				>
					Day
				</button>
				<button
					role="tab"
					type="button"
					className={`tab ${tableType === 1 ? "tab-active" : ""}`}
					onClick={() => setTableType(1)}
				>
					Month
				</button>
				<button
					role="tab"
					type="button"
					className={`tab ${tableType === 2 ? "tab-active" : ""}`}
					onClick={() => setTableType(2)}
				>
					Year
				</button>
				<button
					role="tab"
					type="button"
					className={`tab ${tableType === 3 ? "tab-active" : ""}`}
					onClick={() => setTableType(3)}
				>
					Custom
				</button>
			</div>
			{TabContent()}
		</div>
	);
};

export default TablePage;
