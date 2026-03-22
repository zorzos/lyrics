import { ExpoConfig } from "@expo/config-types";

const {
	EXPO_PUBLIC_SUPABASE_URL,
	EXPO_PUBLIC_SUPABASE_KEY,
	EXPO_MODE,
	ENV_COLOR
} = process.env;

const localConfigs = {
	production: {
		SUPABASE_URL: 'https://krseuuhibkrdaljozptu.supabase.co',
		SUPABASE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtyc2V1dWhpYmtyZGFsam96cHR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwNzg0NTAsImV4cCI6MjA3NjY1NDQ1MH0.nyIXHoguidUinpJlydY4bGucxdO8dHMbcbihyZfeDcE',
		EXPO_MODE: 'production',
		ENV_COLOR: ''
	},
	experiment: {
		SUPABASE_URL: 'https://nmyxtfiwrrkbqchejjam.supabase.co',
		SUPABASE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5teXh0Zml3cnJrYnFjaGVqamFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwNDExMjYsImV4cCI6MjA3ODYxNzEyNn0.LZdswgbUZctTEzUfWoRSjqoDdX1Jwrt5U83yzoPo408',
		EXPO_MODE: 'experiment',
		ENV_COLOR: 'yellow'
	},
	admin: {
		SUPABASE_URL: 'https://krseuuhibkrdaljozptu.supabase.co',
		SUPABASE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtyc2V1dWhpYmtyZGFsam96cHR1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTA3ODQ1MCwiZXhwIjoyMDc2NjU0NDUwfQ.mJPd7pROcmFtXvuWL-N32RraQYT5pm_AnIJ79F_4dgA',
		EXPO_MODE: 'admin',
		ENV_COLOR: 'red'
	},
};

function getAppName(mode: string | undefined) {
	let title = 'Lyrics';
	if (mode === "PROD") return title;
	else return `${title} ${mode?.toUpperCase()}`;
}

export default ({ config }: { config: ExpoConfig }) => {
	const envType = process.env.APP_ENV || 'UNSUPPORTED';
	console.log('envType', envType);
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
			supabaseUrl: EXPO_PUBLIC_SUPABASE_URL!,
			supabaseKey: EXPO_PUBLIC_SUPABASE_KEY!,
			mode: EXPO_MODE || "production",
			color: ENV_COLOR,
			eas: {
				projectId: "18a96692-fc2b-4633-917a-e059cf2867e6",
			},
		},
		android: {
			package: "com.strangerpulse.app",
			adaptiveIcon: {
				backgroundColor: "#E6F4FE"
			},
			edgeToEdgeEnabled: true,
			predictiveBackGestureEnabled: false,
		},
		ios: {
			supportsTablet: true
		},
		web: {
			output: "static"
		},
		runtimeVersion: {
			policy: "appVersion"
		},
		updates: {
			url: "https://u.expo.dev/18a96692-fc2b-4633-917a-e059cf2867e6"
		},
		experiments: {
			typedRoutes: true,
			reactCompiler: true,
			newArchEnabled: false
		},
		scheme: "reactnativeboilerplate",
		userInterfaceStyle: "automatic",
		plugins: [
			"expo-router",
			[
				"expo-splash-screen",
				{
					image: './assets/images/icon.jpg',
					imageWidth: 200,
					resizeMode: "contain",
					backgroundColor: "#ffffff",
					dark: {
						backgroundColor: "#000000"
					}
				}
			]
		]
	}
};