declare module "list2heading" {
    import { List, ListItem, PhrasingContent, Root, Text } from 'mdast';
    export class MdListConverter {
        markdown: string;
        private tree;
        constructor(markdown: string, tree: Root);
        static createConverter(markdown: string): Promise<MdListConverter>;
        lists2heading(): Promise<string>;
        private static parseMd;
        protected findLists(): List[];
        protected list2heading(list: List): Promise<string>;
        protected getListItemContent(listItem: ListItem): (Text | PhrasingContent)[];
        protected getListItemTitle(listItem: ListItem): any;
        protected findHeadingLevel(list: List): number;
        protected visitList(list: List, highestHeading: number, listItemHandler: (listItem: ListItem, level: number) => void, listHandler: (list: List) => void): Promise<void>;
        protected replaceList(items: List[], newItems: string[]): string;
    }
}
