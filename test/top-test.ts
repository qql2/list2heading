import { readFile, writeFile } from "fs/promises";

import { MdListConverter } from "../src/list2heading";
import { join } from "path";

async function test() {
	const md = await readFile(join(__dirname, './md1.md'), 'utf-8')
	const converter = await MdListConverter.createConverter(md)
	const rst = await converter.lists2heading(false)
	const supposedRst = (await readFile(join(__dirname, './rst1.md'), 'utf-8'))
	// await writeFile(join(__dirname, './rst.md'), rst)
	return rst === supposedRst
}

async function test2() {
	const md = await readFile(join(__dirname, './md4.md'), 'utf-8')
	const converter = await MdListConverter.createConverter(md)
	const rst = await converter.lists2heading(false)
	const supposedRst = (await readFile(join(__dirname, './rst4.md'), 'utf-8'))
	// await writeFile(join(__dirname, './rst.md'), rst)
	return rst === supposedRst
}
async function test3() {
	const md = await readFile(join(__dirname, './md4.md'), 'utf-8')
	const converter = await MdListConverter.createConverter(md)
	const rst = await converter.lists2heading(true)
	const supposedRst = (await readFile(join(__dirname, './rst4_2.md'), 'utf-8'))
	// await writeFile(join(__dirname, './rst.md'), rst)
	return rst === supposedRst
}
async function test4() {
	const md = await readFile(join(__dirname, './md1.md'), 'utf-8')
	const converter = await MdListConverter.createConverter(md)
	const rst = await converter.lists2heading(true)
	const supposedRst = (await readFile(join(__dirname, './rst1_2.md'), 'utf-8'))
	await writeFile(join(__dirname, './rst.md'), rst)
	return rst === supposedRst
}
async function main() {
	console.log('test1', await test())
	console.log('test2', await test2())
	console.log('test3', await test3())
	console.log("test4", await test4())
}
main()