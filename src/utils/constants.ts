import * as d3 from "d3";

// Utility function that allows customization of D3 time axis label formats
export const multiTimeFormat = (date: Date | d3.NumberValue) => {
	const parsedDate =
		date instanceof Date ? new Date(date) : new Date(date.valueOf());

	return (
		d3.timeSecond(parsedDate) < parsedDate
			? d3.timeFormat(".%L")
			: d3.timeMinute(parsedDate) < parsedDate
			  ? d3.timeFormat(":%S")
			  : d3.timeHour(parsedDate) < parsedDate
				  ? d3.timeFormat("%I:%M")
				  : d3.timeDay(parsedDate) < parsedDate
					  ? d3.timeFormat("%I %p")
					  : d3.timeMonth(parsedDate) < parsedDate
						  ? d3.timeWeek(parsedDate) < parsedDate
								? d3.timeFormat("%b %d")
								: d3.timeFormat("%b %d")
						  : d3.timeYear(parsedDate) < parsedDate
							  ? d3.timeFormat("%B")
							  : d3.timeFormat("%Y")
	)(parsedDate);
};
