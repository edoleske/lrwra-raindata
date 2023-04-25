import LineChart from "~/components/LineChart";
import useWindowDimensions from "~/hooks/useWindowDimensions";
import { api } from "~/utils/api";

const GraphPage = () => {
  const { width: wWidth, height: wHeight } = useWindowDimensions();

  const historyQuery = api.raindata.interpolatedSamples.useQuery({
    gauge: "ADAMS.AF2295LQT",
    startDate: new Date(2023, 2, 1),
    endDate: new Date(2023, 3, 1),
    samples: 1000,
  });

  const getChartDimensions = () => ({
    width: Math.max(300, wWidth - 64),
    height: Math.max(200, wHeight * 0.6),
    margin: { top: 50, right: 50, bottom: 50, left: 50 },
  });

  return (
    <div>
      <div className="min-w-sm mt-16">
        <LineChart
          data={historyQuery.data?.readings.map((r) => ({
            date: r.timestamp,
            value: r.value,
          }))}
          dimensions={getChartDimensions()}
        />
      </div>
    </div>
  );
};

export default GraphPage;
