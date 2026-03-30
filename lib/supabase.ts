import { createClient } from "@supabase/supabase-js";
import Constants from "expo-constants";

type ExtraConfig = {
	supabaseUrl: string;
	supabaseKey: string;
	mode: "admin" | "production" | "experiment";
	color: string;
};

const extra = Constants.expoConfig?.extra as ExtraConfig;
const { supabaseUrl, supabaseKey, mode, color } = extra;

export const supabase = createClient(supabaseUrl, supabaseKey);
export const isAdmin = mode === "admin";
export const isProduction = mode === "production";
export const envColor = color;
export const envName = mode;
