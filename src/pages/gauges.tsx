import { RainGaugeData } from "~/utils/constants";

const GaugeDetails = () => {
  const linkToGIS = (gaugeCoordinates: string) => {
    const url = `https://gis.lrwu.com/index.html?find=${gaugeCoordinates
      .replace(" ", "%20")
      .replace("'", "%27")}`;
    window.open(url, "_blank")?.focus();
  };

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
          <tr
            key={index}
            className="hover cursor-pointer"
            onClick={() => linkToGIS(gauge.coordinates)}
          >
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
    <div className="mx-auto flex flex-col items-center justify-center gap-8 px-0 pt-4 pb-2 text-center sm:px-8 lg:px-16">
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
