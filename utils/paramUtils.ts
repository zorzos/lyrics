export function getSingleParam(param?: string | string[]): string | undefined {
	return Array.isArray(param) ? param[0] : param;
}
