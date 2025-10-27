import { NetworkContextType } from "@/types";
import NetInfo, { NetInfoState } from "@react-native-community/netinfo";
import React, { createContext, useContext, useEffect, useState } from "react";

const NetworkContext = createContext<NetworkContextType>({
	isOnline: true,
});

export const NetworkProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [isOnline, setIsOnline] = useState(true);

	useEffect(() => {
		// Check once at mount
		NetInfo.fetch().then((state: NetInfoState) => {
			setIsOnline(!!state.isConnected && !!state.isInternetReachable);
		});

		// Subscribe to connection changes
		const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
			setIsOnline(!!state.isConnected && !!state.isInternetReachable);
		});

		return () => unsubscribe();
	}, []);

	return (
		<NetworkContext.Provider value={{ isOnline }}>
			{children}
		</NetworkContext.Provider>
	);
};

export const useNetwork = () => useContext(NetworkContext);
