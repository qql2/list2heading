import * as mdast from 'mdast';

import { Heading, List, ListItem, Paragraph, PhrasingContent, Root, Text } from 'mdast';
import { readFile, writeFile } from 'fs/promises';

import { EOL } from 'os';

const EOLRegex = /\r?\n|\r/g

export interface OUT_PUT_OPTION {
	intent: string
}

export class MdListConverter {
	protected constructor(public markdown: string, protected tree: Root) {
	}
	static async createConverter(markdown: string) {
		return new MdListConverter(...await this.initConverter(markdown))
	}
	static async initConverter(markdown: string) {
		return [markdown, await this.parseMd(markdown)] as const
	}
	async lists2heading(ignoreLastList: boolean, outPutOption?: OUT_PUT_OPTION) {
		outPutOption = Object.assign({ intent: '  ' }, outPutOption)
		const lists = this.findLists()
		const newLists: string[] = []
		for (const list of lists) {
			const newMd = await this.list2heading(list, outPutOption, ignoreLastList)
			newLists.push(newMd)
		}

		const newMd = this.replaceList(lists, newLists)
		return newMd
	}
	protected static async parseMd(markdown: string) {
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
	protected async list2heading(list: List, outPutOption: OUT_PUT_OPTION, ignoreLastList: boolean) {
		const highestHeading = this.findHeadingLevel(list)
		const newMd: Root = {
			type: 'root',
			children: []
		}
		await this.visitList(list, highestHeading, (listItem: ListItem, headingL, haveSubList: boolean, listItems: ListItem[]) => {
			if (ignoreLastList && !haveSubList) {
				let newList: List = {
					type: 'list',
					children: [listItem]
				}
				newMd.children.push(newList)
			} else {
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
		}
			, (list: List) => {
				newMd.children.push(list)
			})
		return this.listAndHeadingMdastStringify(newMd, outPutOption)
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
	/** 遍历List中的每一个List，如果子List的headingLevel大于6的话，则用listHandler 处理该List，否则使用ListItemHandler处理该List下所有ListItem的集合 */
	protected async visitList(list: List, highestHeading: number, listItemsHandler: (listItem: ListItem, level: number, haveSubList: boolean, listItems: ListItem[]) => void, listHandler: (list: List) => void) {
		function _listVisitor(list: List, level: number) {
			const headingL = level + highestHeading
			if (headingL <= 6) {
				for (const listItem of list.children) {
					let subList = listItem.children.find((node) => node.type === 'list') as List
					if (subList) {
						listItemsHandler(listItem, headingL, true, list.children)
						_listVisitor(subList, level + 1)
					} else {
						listItemsHandler(listItem, headingL, false, list.children)
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
				const c1 = i === 0
				const c2 = i === toReplaces.length - 1
				if (c1 || c2) {
					if (c1) {
						rst += str.slice(0, toReplaces[i].start)
						if (!c2) s2 = str.slice(toReplaces[i].end + 1, toReplaces[i + 1].start)
					}
					if (c2) {
						s2 = str.slice(toReplaces[i].end + 1)
					}
				}
				else {
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
	protected listAndHeadingMdastStringify(mdast: mdast.Root, outPutOption: OUT_PUT_OPTION) {
		let rst = ''
		/* 深度遍历 */
		function createDfs() {
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
					rst += outPutOption.intent.repeat(count - 1) + '- '
					blockHandler()
				}
				else if (node.type === 'heading') {
					rst += '#'.repeat((node as mdast.Heading).depth) + ' '
					blockHandler()
				}
				else if (node.type === 'break') {
					rst += EOL
				}
				else if ('value' in node) {
					rst += node.value
					if (nodePath.length >= 2) {
						const parentN = nodePath[nodePath.length - 2]
						const children = (parentN as mdast.Parent).children
						const index = children.indexOf(node as mdast.RootContent)
						const nextN = children[index + 1]
						if (nextN?.type === undefined || nextN?.type === 'listItem' || nextN?.type === 'heading' || nextN?.type === 'list') {
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

		const dfs = createDfs()
		dfs(mdast)
		return rst
	}
}