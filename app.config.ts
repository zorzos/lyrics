import { ExpoConfig } from "@expo/config-types";
const env = process.env;

function getAppName(mode: string | undefined) {
	let title = "SP";
	if (mode === "production") return title;
	else return `${title} ${mode?.toUpperCase() || "UNSUPPORTED"}`;
}

export default ({ config }: { config: ExpoConfig }) => {
	const envType = process.env.EXPO_MODE;
	return {
		...config,
		name: getAppName(envType),
		slug: "lyrics-app",
		version: "1.0.0",
		platforms: ["android", "ios"],
		orientation: "portrait",
		icon: "./assets/images/icon.jpg",
		assetBundlePatterns: ["**/*"],
		extra: {
			supabaseUrl: env.EXPO_PUBLIC_SUPABASE_URL,
			supabaseKey: env.EXPO_PUBLIC_SUPABASE_KEY,
			mode: env.EXPO_MODE || "production",
			color: env.ENV_COLOR,
			eas: {
				projectId: "18a96692-fc2b-4633-917a-e059cf2867e6",
			},
		},
		android: {
			package: "com.strangerpulse.app",
			adaptiveIcon: {
				backgroundColor: "#E6F4FE",
			},
			edgeToEdgeEnabled: true,
			predictiveBackGestureEnabled: false,
		},
		ios: {
			supportsTablet: true,
		},
		web: {
			output: "static",
		},
		runtimeVersion: {
			policy: "appVersion",
		},
		updates: {
			url: "https://u.expo.dev/18a96692-fc2b-4633-917a-e059cf2867e6",
		},
		experiments: {
			typedRoutes: true,
			reactCompiler: true,
			newArchEnabled: false,
		},
		scheme: "reactnativeboilerplate",
		userInterfaceStyle: "automatic",
		plugins: [
			"expo-router",
			[
				"expo-splash-screen",
				{
					image: "./assets/images/icon.jpg",
					imageWidth: 200,
					resizeMode: "contain",
					backgroundColor: "#ffffff",
					dark: {
						backgroundColor: "#000000",
					},
				},
			],
		],
	};
};
