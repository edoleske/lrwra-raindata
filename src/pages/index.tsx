import { type NextPage } from "next";

const Home: NextPage = () => {
  return (
    <>
      <iframe
        src="https://gis.lrwu.com/portal/apps/opsdashboard/index.html#/8b0caa3cea5b4b54ab6ee777c3480383"
        style={{ width: "100%", height: "100%", overflow: "hidden" }}
      ></iframe>
    </>
  );
};

export default Home;
