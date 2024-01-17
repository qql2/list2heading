import { readFile, writeFile } from "fs/promises";

import { MdListConverter } from "../src/list2heading";
import { join } from "path";

async function test() {
	const md = await readFile(join(__dirname, './md1.md'), 'utf-8')
	const converter = await MdListConverter.createConverter(md)
	const rst = await converter.lists2heading()
	const supposedRst = (await readFile(join(__dirname, './rst1.md'), 'utf-8'))
	// await writeFile(join(__dirname, './rst.md'), rst)
	return rst === supposedRst
}

async function test2() {
	const md = await readFile(join(__dirname, './md4.md'), 'utf-8')
	const converter = await MdListConverter.createConverter(md)
	const rst = await converter.lists2heading()
	const supposedRst = (await readFile(join(__dirname, './rst4.md'), 'utf-8'))
	await writeFile(join(__dirname, './rst.md'), rst)
	return rst === supposedRst
}
async function main() {
	console.log('test1', await test())
	console.log('test2', await test2())
}
main()