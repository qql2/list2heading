import { readFile, writeFile } from 'fs/promises';

import { EOL } from 'os';
import { MdListConverter } from '../src/list2heading';
import { join } from 'path';
import mdast from 'mdast';

export class MdListConverterTest extends MdListConverter {
	protected constructor(markdown: string, tree: mdast.Root, public n: number) {
		super(markdown, tree)
	}
	static async createConverterTest(markdown: string, n: number) {
		return new MdListConverterTest(...await this.initConverterTest(markdown, n))
	}
	static async initConverterTest(markdown: string, n: number) {
		return [...await this.initConverter(markdown), n] as const
	}
}

async function parseMdInHtml(markdown: string) {
	const unified = (await import('unified')).unified
	const rehypeSanitize = (await import('rehype-sanitize')).default

	const rehypeStringify = (await import('rehype-stringify')).default

	const remarkParse = (await import('remark-parse')).default

	const remarkRehype = (await import('remark-rehype')).default

	// 读取文件
	const htmlFile = await unified()
		.use(remarkParse)
		.use(remarkRehype)
		.use(rehypeSanitize)
		.use(rehypeStringify)
		.process(markdown)
	return htmlFile.toString()
}
async function parseMdInAST(md: string) {
	const unified = (await import('unified')).unified
	const rehypeSanitize = (await import('rehype-sanitize')).default

	const rehypeStringify = (await import('rehype-stringify')).default

	const remarkParse = (await import('remark-parse')).default

	const remarkRehype = (await import('remark-rehype')).default

	// 读取文件
	return unified()
		.use(remarkParse)
		.parse(md)
}
async function htmlToMd(html: string) {
	const unified = (await import('unified')).unified
	//@ts-ignore
	const rehypeParse = (await import('rehype-parse')).default
	const rehypeRemark = (await import('rehype-remark')).default
	const remarkStringify = (await import('remark-stringify')).default

	const md = await unified()
		.use(rehypeParse)
		.use(rehypeRemark)
		.use(remarkStringify)
		.process(html)
	return md.toString()
}
async function test() {
	const md = await readFile(join(__dirname, './md3.md'), 'utf-8')

	const rst = listAndHeadingMdastStringify(await parseMdInAST(md))
	await writeFile(join(__dirname, './rst.md'), rst)

}
test()

function listAndHeadingMdastStringify(mdast: mdast.Root, intent = '  ') {
	let rst = ''
	/* 深度遍历 */
	function createDfs(root: mdast.Root) {
		const nodePath: mdast.Node[] = []
		function dfs(node: mdast.Node) {
			nodePath.push(node)
			function blockHandler() {
				for (const subNode of (node as mdast.Parent).children) {
					dfs(subNode)
				}
			}
			if (node.type === 'listItem') {
				let count = 0
				for (const parentN of nodePath) {
					if (parentN.type === 'listItem') {
						count++
					}
				}
				rst += intent.repeat(count - 1) + '- '
				blockHandler()
			}
			else if (node.type === 'heading') {
				rst += '#'.repeat((node as mdast.Heading).depth) + ' '
				blockHandler()
			}
			else if ('value' in node) {
				rst += node.value
				if (nodePath.length >= 2) {
					const parentN = nodePath[nodePath.length - 2]
					const children = (parentN as mdast.Parent).children
					const index = children.indexOf(node as mdast.RootContent)
					const nextN = children[index + 1]
					if (nextN?.type === 'listItem' || nextN?.type === 'heading' || nextN?.type === 'list' || nextN?.type === undefined) {
						rst += EOL
					}
				}
			} else if ('children' in node) {
				for (const subNode of node.children as mdast.Node[]) {
					dfs(subNode)
				}
			} else {
				throw new Error(`Unknown node type: ${node.type}`)
			}
			nodePath.pop()
		}
		return dfs
	}

	const dfs = createDfs(mdast)
	dfs(mdast)
	return rst
}