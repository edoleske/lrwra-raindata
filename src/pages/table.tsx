import { useState } from "react";
import CustomTotalTable from "~/components/table/CustomTotalTable";
import DayTotalTable from "~/components/table/DayTotalTable";

const TablePage = () => {
  const [tableType, setTableType] = useState(0);

  const TabContent = () => {
    if (tableType === 0) {
      return <DayTotalTable />;
    } else if (tableType === 1) {
      return <CustomTotalTable />;
    } else {
      return <p>You broke it!</p>;
    }
  };

  return (
    <div className="p-8 lg:p-16">
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
          Custom Total
        </a>
      </div>
      {TabContent()}
    </div>
  );
};

export default TablePage;
