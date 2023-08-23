import { RainGaugeData } from "~/utils/constants";

const GaugeDetails = () => {
  const GaugeTable = () => (
    <table className="table-zebra table-compact table">
      <thead>
        <tr>
          <th>Gauge</th>
          <th>Street Address</th>
          <th>Coordinates</th>
        </tr>
      </thead>
      <tbody>
        {RainGaugeData.map((gauge, index) => (
          <tr key={index}>
            <td className="sm:hidden">{gauge.short}</td>
            <td className="hidden sm:table-cell lg:hidden">{gauge.label}</td>
            <td className="hidden lg:table-cell">{gauge.long}</td>
            <td>{gauge.address}</td>
            <td>{gauge.coordinates}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className="mx-auto flex flex-col items-center justify-center gap-8 p-8 text-center lg:px-16">
      <h1 className="text-4xl font-bold">Rain Gauge Details</h1>
      <p>
        Our rain gauges are scattered across the city of Little Rock, so we can
        monitor the rain experienced at key points in our collection system.
      </p>
      <div className="m-auto overflow-x-auto">{GaugeTable()}</div>
    </div>
  );
};

export default GaugeDetails;
