import { type RefObject, useEffect, useRef } from "react";
import * as d3 from "d3";
import { multiTimeFormat } from "~/utils/constants";
import { format } from "date-fns";

interface LineChartProps {
  data: ChartDataPoint[] | undefined;
  dimensions: ChartDimensions;
}

const drawGraph = (
  svgRef: RefObject<SVGSVGElement>,
  data: ChartDataPoint[],
  dimensions: ChartDimensions
) => {
  const svg = d3
    .select(svgRef.current)
    .attr("width", dimensions.width)
    .attr("height", dimensions.height);

  const boundedWidth =
    dimensions.width - dimensions.margin.left - dimensions.margin.right;
  const boundedHeight =
    dimensions.height - dimensions.margin.top - dimensions.margin.bottom;

  const timeDomain = data.map((d) => d.date.getTime());
  const minTime = Math.min(...timeDomain);
  const maxTime = Math.max(...timeDomain);
  const timeExtent = [minTime, maxTime];

  const xScale = d3
    .scaleTime()
    .domain(timeExtent)
    .range([
      dimensions.margin.left,
      dimensions.width - dimensions.margin.right,
    ]);

  const valueExtent = [
    Math.min(...data.map((d) => d.value)),
    Math.max(...data.map((d) => d.value)),
  ];

  // If all zeroes, then up the max to one for display purposes
  if (valueExtent[1] === 0) {
    valueExtent[1] = 1;
  }

  const yScale = d3
    .scaleLinear()
    .domain(valueExtent)
    .range([
      dimensions.height - dimensions.margin.bottom,
      dimensions.margin.top,
    ]);

  const group = svg
    .append("g")
    .attr("width", boundedWidth)
    .attr("height", boundedHeight);

  // X Axis, ticks take up about 30 pixels in width
  group
    .append("g")
    .attr(
      "transform",
      `translate(0, ${dimensions.height - dimensions.margin.bottom})`
    )
    .call(
      d3
        .axisBottom(xScale)
        .ticks(Math.floor(boundedWidth / 50))
        .tickFormat(multiTimeFormat)
    )
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("transform", "rotate(-30)");

  // Y axis, simple cause linear scale
  group
    .append("g")
    .attr("transform", `translate(${dimensions.margin.left}, 0)`)
    .call(d3.axisLeft(yScale));

  group
    .append("path")
    .datum(data)
    .attr("width", 20)
    .style("fill", "none")
    .attr("class", "stroke-secondary")
    .style("stroke-width", 1.5)
    .attr(
      "d",
      d3
        .line<ChartDataPoint>()
        .x((d) => xScale(d.date.getTime()))
        .y((d) => yScale(d.value))
        .curve(d3.curveMonotoneX)
    );

  // Mouse functionality
  const mouseG = group
    .append("g")
    .classed("mouse", true)
    .style("display", "none");
  mouseG
    .append("rect")
    .attr("width", 2)
    .attr("x", -1)
    .attr("y", dimensions.margin.top)
    .attr("height", boundedHeight)
    .attr("fill", "lightgray");
  mouseG
    .append("circle")
    .attr("r", 3)
    .attr("class", "stroke-accent fill-accent");
  mouseG
    .append("text")
    .attr("x", 4)
    .attr("y", dimensions.margin.top - 10)
    .attr("font-size", "0.9em");

  svg.on("mouseover", () => {
    mouseG.style("display", "block");
  });

  svg.on("mousemove", (mouse) => {
    const [x] = d3.pointer(mouse);

    // We must find the closest date point to the pointer, via the date key
    // To tie the dates with the mouse position on the chart, we take the normalized mouse position and compare it to the normalized dates in the domain
    const ratio = (x - dimensions.margin.left) / boundedWidth;
    const dataKeyRatios = data.map(
      (d) => (d.date.getTime() - minTime) / (maxTime - minTime)
    );
    const dataKeyRatioDeltas = dataKeyRatios.map((dr) => Math.abs(dr - ratio));
    const dataIndex = dataKeyRatioDeltas.indexOf(
      Math.min(...dataKeyRatioDeltas)
    );
    const closestDataPoint = data[dataIndex];

    // This will always be true, makes typescript happy
    if (closestDataPoint) {
      mouseG.attr(
        "transform",
        `translate(${xScale(closestDataPoint.date)},${0})`
      );
      mouseG
        .select("text")
        .text(
          `${format(
            closestDataPoint.date,
            "MMM d, hh:mm a"
          )}, ${closestDataPoint.value.toFixed(2)}"`
        )
        .attr("text-anchor", dataIndex <= data.length / 2 ? "start" : "end")
        .attr("class", "stroke-base-content");
      mouseG.select("circle").attr("cy", yScale(closestDataPoint.value));
    }
  });

  svg.on("mouseout", () => {
    mouseG.style("display", "none");
  });
};

const clearGraph = (svgRef: RefObject<SVGSVGElement>) => {
  const svg = d3.select(svgRef.current);
  svg.selectAll("*").remove();
};

const LineChart = ({ data, dimensions }: LineChartProps) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (data && data.length > 1) {
      drawGraph(svgRef, data, dimensions);
    }

    return () => {
      clearGraph(svgRef);
    };
  }, [svgRef, data, dimensions]);

  if (!data) {
    return (
      <div className="p-4 text-center">
        <div>No data!</div>
      </div>
    );
  }

  return (
    <div className="">
      <svg ref={svgRef} className="m-auto bg-base-100 text-base-content"></svg>
    </div>
  );
};

export default LineChart;
