import { useEffect } from "react";
import {
  MdCheckCircleOutline,
  MdErrorOutline,
  MdInfoOutline,
  MdOutlineWarningAmber,
} from "react-icons/md";

interface GlobalAlertComponentProps {
  message: string;
  severity: AlertSeverity;
  setAlerts: React.Dispatch<React.SetStateAction<GlobalAlert[]>>;
}

const GlobalAlertComponent = ({
  message,
  severity,
  setAlerts,
}: GlobalAlertComponentProps) => {
  const closeAlert = () => {
    // This will remove alerts with same message and severity if multiple exist
    // But using index causes problems when alerts are created at same time
    // This approach prevents alerts from becoming orphaned and not auto-fading
    setAlerts((value) =>
      value
        .slice()
        .filter((a) => a.message !== message && a.severity !== severity)
    );
  };

  const getTimeout = (): number => {
    switch (severity) {
      case "info":
        return 4000;
      case "error":
        return 10000;
      case "success":
        return 4000;
      case "warning":
        return 8000;
    }
  };

  useEffect(() => {
    setTimeout(closeAlert, getTimeout());
  });

  const getSeverityStyle = () => {
    switch (severity) {
      case "info":
        return "alert-info";
      case "error":
        return "alert-error";
      case "success":
        return "alert-success";
      case "warning":
        return "alert-warning";
    }
  };

  const getSeverityIcon = () => {
    switch (severity) {
      case "info":
        return <MdInfoOutline size={22} />;
      case "error":
        return <MdErrorOutline size={22} />;
      case "success":
        return <MdCheckCircleOutline size={22} />;
      case "warning":
        return <MdOutlineWarningAmber size={22} />;
    }
  };

  return (
    <div
      className={`alert cursor-pointer ${getSeverityStyle()}`}
      onClick={closeAlert}
    >
      <div>
        <span>{getSeverityIcon()}</span>
        <span>{message}</span>
      </div>
    </div>
  );
};

export default GlobalAlertComponent;
