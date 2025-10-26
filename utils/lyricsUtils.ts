import { XMLParser } from "fast-xml-parser";

const xmlParser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "",
    removeNSPrefix: true,
});

export function parseLyrics(xml: string) {
    let lyrics;
    try {
        lyrics = xmlParser.parse(xml).lyrics;
    } catch (error) {
        console.error("Error parsing XML:", error);
        return [];
    }

    if (!lyrics) return [];

    const blocks: any[] = [];
    for (const [key, value] of Object.entries(lyrics)) {
        const elements = Array.isArray(value) ? value : [value];

        for (const el of elements) {
            const order = Number(el.order) || 0;
            const repeat = Number(el.repeat) || 1;
            const lines = Array.isArray(el.line) ? el.line : [el.line];

            for (let i = 0; i < repeat; i++) {
                blocks.push({
                    type: key,
                    order,
                    repeatIndex: i + 1,
                    lines,
                });
            }
        }
    }

    blocks.sort((a, b) => a.order - b.order);
    return blocks;
}