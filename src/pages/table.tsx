import { useState } from "react";
import CustomTotalTable from "~/components/table/CustomTotalTable";
import DayTotalTable from "~/components/table/DayTotalTable";
import MonthTotalTable from "~/components/table/MonthTotalTable";

const TablePage = () => {
  const [tableType, setTableType] = useState(0);

  const TabContent = () => {
    if (tableType === 0) {
      return <DayTotalTable />;
    } else if (tableType === 1) {
      return <MonthTotalTable />;
    } else if (tableType === 2) {
      return <CustomTotalTable />;
    } else {
      return <p>You broke it!</p>;
    }
  };

  return (
    <div className="px-8 pt-4 pb-2 lg:px-16">
      <div className="tabs mb-4">
        <a
          className={`tab-bordered tab ${tableType === 0 ? "tab-active" : ""}`}
          onClick={() => setTableType(0)}
        >
          Day Total
        </a>
        <a
          className={`tab-bordered tab ${tableType === 1 ? "tab-active" : ""}`}
          onClick={() => setTableType(1)}
        >
          Month Total
        </a>
        <a
          className={`tab-bordered tab ${tableType === 2 ? "tab-active" : ""}`}
          onClick={() => setTableType(2)}
        >
          Custom Total
        </a>
      </div>
      {TabContent()}
    </div>
  );
};

export default TablePage;
