declare module "list2heading" {
    import * as mdast from 'mdast';
    import { List, ListItem, PhrasingContent, Root, Text } from 'mdast';
    export class MdListConverter {
        markdown: string;
        protected tree: Root;
        protected constructor(markdown: string, tree: Root);
        static createConverter(markdown: string): Promise<MdListConverter>;
        static initConverter(markdown: string): Promise<readonly [string, mdast.Root]>;
        lists2heading(): Promise<string>;
        protected static parseMd(markdown: string): Promise<mdast.Root>;
        protected findLists(): List[];
        protected list2heading(list: List): Promise<string>;
        protected getListItemContent(listItem: ListItem): (Text | PhrasingContent)[];
        protected getListItemTitle(listItem: ListItem): any;
        protected findHeadingLevel(list: List): number;
        protected visitList(list: List, highestHeading: number, listItemHandler: (listItem: ListItem, level: number) => void, listHandler: (list: List) => void): Promise<void>;
        protected replaceList(items: List[], newItems: string[]): string;
        protected listAndHeadingMdastStringify(mdast: mdast.Root, intent?: string): string;
    }
}
