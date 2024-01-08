import { Heading, List, ListItem, Paragraph, PhrasingContent, Root, Text } from 'mdast';
import { readFile, writeFile } from 'fs/promises';

import { EOL } from 'os';

const EOLRegex = /\r?\n|\r/g

export class MdListConverter {
	constructor(public markdown: string, private tree: Root) {
	}
	static async createConverter(markdown: string) {
		return new MdListConverter(markdown, await this.parseMd(markdown),)
	}
	async lists2heading() {
		const lists = this.findLists()
		const newLists: string[] = []
		for (const list of lists) {
			const newMd = await this.list2heading(list)
			newLists.push(newMd)
		}

		const newMd = this.replaceList(lists, newLists)
		return newMd
	}
	private static async parseMd(markdown: string) {
		const unified = (await import('unified')).unified


		const remarkParse = (await import('remark-parse')).default


		// 读取文件
		return unified()
			.use(remarkParse)
			.parse(markdown)
	}
	protected findLists(): List[] {
		const items = (this.tree).children.filter((node) => node.type === 'list') as List[]
		return items
	}
	protected async list2heading(list: List) {
		const highestHeading = this.findHeadingLevel(list)
		const newMd: Root = {
			type: 'root',
			children: []
		}
		await this.visitList(list, highestHeading, (listItem: ListItem, headingL) => {
			const newHeading: Heading = {
				type: 'heading',
				depth: headingL as 1 | 2 | 3 | 4 | 5 | 6,
				children: [this.getListItemTitle(listItem)],
			}
			newMd.children.push(newHeading)
			const listItemContent = this.getListItemContent(listItem)
			if (listItemContent.length > 0) {
				const contentBelowHeading: Paragraph = {
					type: 'paragraph',
					children: listItemContent
				}
				newMd.children.push(contentBelowHeading)
			}
		}
			, (list: List) => {
				newMd.children.push(list)
			})
		const stringify = (await import('remark-stringify')).default
		const unified = (await import('unified')).unified
		return unified().use(stringify, { listItemIndent: "mixed", join: [() => 0] }).stringify(newMd)
	}
	protected getListItemContent(listItem: ListItem): (Text | PhrasingContent)[] {
		const rst = []
		const text = (listItem.children.find((node) => node.type === 'paragraph') as Paragraph).children.find((node) => node.type === 'text') as Text
		if (text) {
			const contentSplit = text.value.split(EOLRegex)
			const content = contentSplit.slice(1)
			if (content.length > 0) {
				const textContent = JSON.parse(JSON.stringify(text)) as Text
				textContent.value = content.join(EOL)
				rst.push(textContent)
			}
		}
		const pContent = (listItem.children.find((node) => node.type === "paragraph") as Paragraph).children.slice(1)
		rst.push(...pContent)
		return rst
	}
	protected getListItemTitle(listItem: ListItem) {
		const title = (listItem.children.find((node) => node.type === 'paragraph') as Paragraph).children[0]
		const titleClone = JSON.parse(JSON.stringify(title))
		if (titleClone.type === 'text') {
			titleClone.value = titleClone.value.split(EOLRegex)[0]
		}
		return titleClone
	}
	protected findHeadingLevel(list: List) {
		let headingL = 0
		for (const node of this.tree.children) {
			if (node.type === 'heading') {
				headingL = node.depth
			} else if (node === list) {
				break
			}
		}
		return headingL
	}
	protected async visitList(list: List, highestHeading: number, listItemHandler: (listItem: ListItem, level: number) => void, listHandler: (list: List) => void) {
		const visit = (await import('unist-util-visit')).visit;
		function _listVisitor(list: List, level: number) {
			const headingL = level + highestHeading
			if (headingL <= 6) {
				/* 需要转换为标题 */
				for (const listItem of list.children) {
					listItemHandler(listItem, headingL)
					for (const i of listItem.children) {
						if (i.type === 'list') {
							_listVisitor(i, level + 1)
						}
					}
				}
			} else {
				/* 不需要转换为标题 */
				listHandler(list)
			}
		}
		_listVisitor(list, 1)
	}
	protected replaceList(items: List[], newItems: string[]) {
		function replaceRange(str: string, toReplaces: { start: number, end: number, data: string }[]) {
			toReplaces.sort((a, b) => a.start - b.start)
			let rst = ''
			for (let i = 0; i < toReplaces.length; i++) {
				let s2
				if (i === 0) {
					rst += str.slice(0, toReplaces[i].start)
					s2 = str.slice(toReplaces[i].end + 1, toReplaces[i + 1].start)
				} else if (i === toReplaces.length - 1) {
					s2 = str.slice(toReplaces[i].end + 1)
				} else {
					s2 = str.slice(toReplaces[i].end + 1, toReplaces[i + 1].start)
				}
				rst += toReplaces[i].data
				rst += s2
			}
			return rst
		}
		const md = this.markdown
		let newMd = replaceRange(md, items.map((item, index) => {
			return {
				start: item.position!.start.offset!,
				end: item.position!.end.offset!,
				data: newItems[index]
			}
		}))
		return newMd
	}
}