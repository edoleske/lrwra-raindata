import { createContext, useState } from "react";
import GlobalAlertComponent from "./GlobalAlertComponent";

type GlobalAlertProviderProps = {
	children: React.ReactNode;
};

export const GlobalAlertContext = createContext(
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	(message: string, severity: AlertSeverity = "info") => {
		return;
	},
);

const GlobalAlertProvider = ({ children }: GlobalAlertProviderProps) => {
	const [alerts, setAlerts] = useState<GlobalAlert[]>([]);

	const addAlert = (message: string, severity: AlertSeverity = "info") => {
		setAlerts((value) => [...value, { message, severity }]);
	};

	return (
		<>
			<GlobalAlertContext.Provider value={addAlert}>
				{children}
			</GlobalAlertContext.Provider>
			<div className="toast">
				{alerts.map((alert, i) => (
					<GlobalAlertComponent
						key={`${alert.severity}-${alert.message}`}
						message={alert.message}
						severity={alert.severity}
						setAlerts={setAlerts}
					/>
				))}
			</div>
		</>
	);
};

export default GlobalAlertProvider;
