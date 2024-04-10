import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
const config = {
	content: ["./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
		extend: {},
	},
	plugins: [daisyui],
	daisyui: {
		themes: ["corporate", "business"],
		darkTheme: "business",
	},
};

module.exports = config;
