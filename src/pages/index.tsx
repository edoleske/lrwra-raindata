import { type NextPage } from "next";
import { env } from "~/env.mjs";

const Home: NextPage = () => {
	return (
		<>
			<iframe
				src={env.NEXT_PUBLIC_GIS_IFRAME_URL}
				style={{ width: "100%", height: "100%", overflow: "hidden" }}
				title="LRWRA GIS Rain Gauge Map"
			/>
		</>
	);
};

export default Home;
