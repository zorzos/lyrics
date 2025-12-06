import { routes } from "@/constants/routes";
import { Href } from "expo-router";

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
	const toAdd = incoming.filter(id => !existing.includes(id));
	const toRemove = existing.filter(id => !incoming.includes(id));
	return { toAdd, toRemove };
}