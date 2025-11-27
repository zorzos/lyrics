export function camelToSnake(obj: any) {
	const result: any = {};
	for (const key in obj) {
		const snake = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
		result[snake] = obj[key];
	}
	return result;
}
