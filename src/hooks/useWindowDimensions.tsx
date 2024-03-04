import { useEffect, useState } from "react";

const getWindowDimensions = () => {
	// Ignore if server
	if (typeof window === "undefined") {
		return { width: 0, height: 0 };
	}

	// This destructures the width and height values from the window object
	const { innerWidth: width, innerHeight: height } = window;

	return { width, height };
};

const useWindowDimensions = () => {
	const [windowDimensions, setWindowDimensions] = useState(
		getWindowDimensions(),
	);

	useEffect(() => {
		function handleResize() {
			setWindowDimensions(getWindowDimensions());
		}

		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	return windowDimensions;
};

export default useWindowDimensions;
