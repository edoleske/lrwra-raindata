import { type NextPage } from "next";
import { env } from "~/env.mjs";

const RJNPage: NextPage = () => {
	return (
		<>
			<iframe
				src={env.NEXT_PUBLIC_RJN_IFRAME_URL}
				style={{ width: "100%", height: "100%", overflow: "hidden" }}
				title="Clarity RJN Rain Intensity Dashboard"
			/>
		</>
	);
};

export default RJNPage;