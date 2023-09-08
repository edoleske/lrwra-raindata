import { sub } from "date-fns";
import { useRef, useState } from "react";
import BarChart from "~/components/BarChart";
import QueryErrorAlert from "~/components/QueryErrorAlert";
import BarGraphParameters from "~/components/graph/BarGraphParameters";
import useWindowDimensions from "~/hooks/useWindowDimensions";
import { api } from "~/utils/api";
import { RainGaugeData } from "~/utils/constants";
import { pureDate } from "~/utils/utils";

const BarChartPage = () => {
  const divRef = useRef<HTMLDivElement>(null);
  const { height: wHeight } = useWindowDimensions();

  const [queryInput, setQueryInput] = useState({
    monthData: true,
    date: sub(new Date(), { months: 1 }),
    gauge: RainGaugeData[0]?.tag ?? "",
  });

  const dataQuery = api.raindata.barHistory.useQuery(queryInput);

  const getChartDimensions = () => ({
    width: Math.max(300, (divRef.current?.clientWidth ?? 0) - 64),
    height: Math.max(200, wHeight * 0.6),
    margin: { top: 50, right: 50, bottom: 50, left: 50 },
  });

  const Chart = () => {
    if (dataQuery.isError) {
      return <QueryErrorAlert message={dataQuery.error.message} />;
    }

    if (!dataQuery.data) {
      return (
        <div className="py-4 text-center">
          <div className="spinner spinner-xl spinner-primary"></div>
        </div>
      );
    }

    return (
      <BarChart
        data={dataQuery.data.readings.map((r) => ({
          date: queryInput.monthData ? pureDate(r.timestamp) : r.timestamp,
          value: r.value,
        }))}
        dimensions={getChartDimensions()}
      />
    );
  };

  return (
    <>
      <BarGraphParameters
        queryInput={queryInput}
        setQueryInput={setQueryInput}
      />
      <div className="min-w-sm" ref={divRef}>
        {Chart()}
      </div>
    </>
  );
};

export default BarChartPage;
