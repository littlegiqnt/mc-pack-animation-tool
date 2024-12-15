import { InvalidArgumentError, program } from "commander";
import sharp from "sharp";
import type { OverlayOptions } from "sharp";

interface Position { x: number; y: number }

const parser = {
    int: (value?: string): number => {
        if (value === undefined) {
            throw new InvalidArgumentError("No value provided.");
        }
        const parsedValue = parseInt(value, 10);
        if (isNaN(parsedValue)) {
            throw new InvalidArgumentError("Not a number.");
        }
        return parsedValue;
    },
};
program
    .requiredOption("-b, --background <path>", "Path to the background image")
    .requiredOption("-g, --gif <path>", "Path to the gif")
    .requiredOption("-w, --width <number>", "Width of the gif", parser.int)
    .requiredOption("-p, --position <x>,<y>", "Position to place the gif on the background", (value): Position => {
        const x = parser.int(value.split(",")[0]);
        const y = parser.int(value.split(",")[1]);
        return { x, y };
    })
    .option("--row <number>", "Row count to divide the background into", parser.int, 2)
    .option("--column <number>", "Column count to divide the background into", parser.int, 3)
    .option("-c, --cell <cells>", "Cells to place the gif on the background", (value) => value.split(",").map(parser.int), [0])
    .parse(process.argv);
interface Args {
    background: string;
    gif: string;
    width: number;
    position: Position;
    row: number;
    column: number;
    cell: number[];
}
const args = program.opts<Args>();

const background = await Bun.file(args.background).arrayBuffer();
const gif = await Bun.file(args.gif).arrayBuffer();
const backgroundMetadata = await sharp(background).metadata();
const baseWidth = backgroundMetadata.width;
const baseHeight = backgroundMetadata.height;
if (baseWidth == null || baseHeight == null) {
    throw new Error("Background image has no dimensions.");
}
console.log(`Width: ${baseWidth}, Height: ${baseHeight}`);
const gifMetadata = await sharp(gif, { animated: true }).metadata();
const pages = gifMetadata.pages;
if (pages == null) {
    throw new Error("Gif has no frames.");
}
console.log(`Frame count: ${pages}`);
const parsePosition = (cell: number): Position => {
    const row = Math.floor(cell / args.column);
    const column = cell % args.column;
    return {
        x: args.position.x + baseWidth / args.column * column,
        y: args.position.y + baseHeight / args.row * row,
    };
};
const positions: Position[] = args.cell.map(parsePosition);
console.log(`Positions:\n${positions.map((position) => `- x: ${position.x}, y: ${position.y}`).join("\n")}`);
const overlays: OverlayOptions[] = [];
for (let i = 0; i < pages; i++) {
    const frame = await sharp(gif, { page: i }).resize(args.width).toBuffer();
    overlays.push(
        { input: Buffer.from(background), top: baseHeight * i, left: 0 },
        ...positions.map((position) => ({ input: frame, top: baseHeight * i + position.y, left: position.x })),
    );
}
console.log("Exporting...");
await sharp({
    create: {
        width: baseWidth,
        height: baseHeight * pages,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
})
    .composite(overlays)
    .png()
    .toFile("output.png");
console.log("Done.");
