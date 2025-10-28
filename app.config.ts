import { ExpoConfig } from "@expo/config-types";
import "dotenv/config";

const env = process.env;

export default ({ config }: { config: ExpoConfig }) => ({
	...config,
	name: "Lyrics DEV",
	slug: "lyrics-app",
	version: "1.0.0",
	platforms: ["ios", "android"],
	orientation: "portrait",
	icon: "./assets/images/icon.jpg",
	splash: {
		image: "./assets/images/icon.jpg",
		resizeMode: "contain",
		backgroundColor: "#000000",
	},
	assetBundlePatterns: ["**/*"],
	extra: {
		supabaseUrl: env.EXPO_PUBLIC_SUPABASE_URL,
		supabaseKey: env.EXPO_PUBLIC_SUPABASE_KEY,
		mode: env.EXPO_MODE,
		eas: {
			projectId: "18a96692-fc2b-4633-917a-e059cf2867e6",
		},
	},
	android: {
		package: "com.strangerpulse.app",
	},
});
