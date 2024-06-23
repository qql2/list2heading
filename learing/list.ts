async function parseMd(markdown: string) {
	const unified = (await import('unified')).unified


	const remarkParse = (await import('remark-parse')).default


	// 读取文件
	return unified()
		.use(remarkParse)
		.parse(markdown)
}

import fs from 'fs'
import { join } from 'path'

parseMd(fs.readFileSync(join(__dirname, '../test/md3.md'), 'utf-8')).then((rst) => {
	console.log(JSON.stringify(rst.children, null, 2))
})