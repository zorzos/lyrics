import * as Device from "expo-device";
import { useWindowDimensions } from "react-native";

export const useDevice = () => {
	const { width, height } = useWindowDimensions();
	const isTablet =
		Device.deviceType === Device.DeviceType.TABLET ||
		Math.min(width, height) >= 540;
	// console.log("width:", width, "height:", height, "isTablet:", isTablet);
	return { isTablet };
};
