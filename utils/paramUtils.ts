import { routes } from "@/constants/routes";
import { Href } from "expo-router";
import { showErrorToast } from "./toastUtils";

export function getSingleParam(param?: string | string[]): string | undefined {
	return Array.isArray(param) ? param[0] : param;
}

export function generateHref<K extends keyof typeof routes>(
	pathname: K,
	params?: Record<string, any>
): Href {
	return {
		pathname: routes[pathname],
		params,
	} as Href;
}

export function diffRelations(existing: string[], incoming: string[]) {
	const toAdd = incoming.filter((id) => !existing.includes(id));
	const toRemove = existing.filter((id) => !incoming.includes(id));
	return { toAdd, toRemove };
}

const EXCLUDED_VALIDATION_KEYS = ["draft", "soundcheck", "paid"];

export function validate(values: any): number | null {
	const { value } = values;
	for (const key in value) {
		if (EXCLUDED_VALIDATION_KEYS.includes(key)) return null;
		const valueToCheck = value[key];
		if (!valueToCheck) {
			const label = key
				.replace(/([A-Z])/g, " $1")
				.replace(/_/g, " ")
				.replace(/^./, (str) => str.toUpperCase());
			showErrorToast(`${label} is required`);
			return -1;
		}
	}

	return null;
}
