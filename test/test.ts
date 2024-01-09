import { readFile, writeFile } from "fs/promises";

import { MdListConverter } from "../src/list2heading";
import { join } from "path";

async function test() {
	const md = await readFile(join(__dirname, './md.md'), 'utf-8')
	const converter = await MdListConverter.createConverter(md)
	const rst = await converter.lists2heading()
	await writeFile(join(__dirname, './rst.md'), rst)
}
test()