import { createClient } from "@supabase/supabase-js";
import Constants from "expo-constants";

type ExtraConfig = {
	supabaseUrl: string;
	supabaseKey: string;
	mode: "admin" | "production" | "experiment";
};

const extra = Constants.expoConfig?.extra as ExtraConfig;

const { supabaseUrl, supabaseKey, mode } = extra;

export const supabase = createClient(supabaseUrl, supabaseKey);
export const isAdmin = mode === "admin";
