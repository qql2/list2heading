import { EOL } from 'os';
import { MdListConverter } from '../src/list2heading';
import { join } from 'path';
import mdast from 'mdast';
import { readFile } from 'fs/promises';

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
	const md = await readFile(join(__dirname, './md.md'), 'utf-8')

	const unified = (await import('unified')).unified
	const remarkParse = (await import('remark-parse')).default


	// 读取文件
	// const mdast = unified()
	// 	.use(remarkParse, { gfm: true })
	// 	.use(wikiLinkPlugin)
	// 	.parse(md)
	// const stringify = (await import('remark-stringify')).default

	// const rst = unified()
	// 	.use(stringify, { listItemIndent: "mixed", join: [() => 0], resourceLink: true, })
	// 	.stringify(mdast)

	// const rst = await htmlToMd(await parseMdInHtml(md))

	const rst = listAndHeadingMdastStringify(await parseMdInAST(md))
	console.log(rst);
}
test()

function listAndHeadingMdastStringify(mdast: mdast.Root) {
	let rst = ''
	/* 深度遍历 */
	function createDfs(root: mdast.Root) {
		let last
		function dfs(node: mdast.Node) {
			function blockHandler() {
				for (const subNode of (node as mdast.Parent).children) {
					dfs(subNode)
					rst += EOL
				}
			}
			if (node.type === 'listItem') {
				blockHandler()
			}
			else if (node.type === 'heading') {
				rst += '#'.repeat((node as mdast.Heading).depth) + ' '
				blockHandler()
			}
			else if ('value' in node) {
				rst += node.value
			} else if ('children' in node) {
				for (const subNode of node.children as mdast.Node[]) {
					dfs(subNode)
				}
			}
			throw new Error(`Unknown node type: ${node.type}`)
		}
		return dfs
	}

	const dfs = createDfs(mdast)
	dfs(mdast)
	return rst
}