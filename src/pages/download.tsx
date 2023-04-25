import { format, sub } from "date-fns";
import { saveAs } from "file-saver";
import { useState } from "react";
import { api } from "~/utils/api";

const DownloadPage = () => {
  const [startDate, setStartDate] = useState(sub(new Date(), { days: 2 }));
  const [endDate, setEndDate] = useState(new Date());
  const fileMutation = api.raindata.downloadCSV.useMutation();

  const onClick = async () => {
    const result = await fileMutation.mutateAsync({
      gauge: "ADAMS.AF2295LQT",
      startDate: startDate,
      endDate: endDate,
    });

    if (result) {
      const filename =
        "LRWRA_RainDataExport_" +
        format(startDate, "yyyyMMdd") +
        "-" +
        format(endDate, "yyyyMMdd") +
        ".csv";
      const blob = new Blob([result], { type: "text/csv;charset=utf-8;" });

      // Uses file-saver library to use best practive file download on most browsers
      saveAs(blob, filename);
    }
  };

  return (
    <div>
      <div className="btn" onClick={onClick}>
        Test
      </div>
    </div>
  );
};

export default DownloadPage;
