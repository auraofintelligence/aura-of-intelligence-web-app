import pageTreeSource from "../../research/extracted/aura-page-tree.json";

export type SourceNode = {
  id: string;
  label: string;
  kind: string;
  sourceCell?: string;
  children?: SourceNode[];
};

export type IndexedSourceNode = SourceNode & {
  path: SourceNode[];
};

export const AURA_PAGE_TREE = pageTreeSource.navigationTree as SourceNode;

function indexNode(node: SourceNode, parents: SourceNode[] = []): IndexedSourceNode[] {
  const path = [...parents, node];
  return [{ ...node, path }, ...(node.children ?? []).flatMap((child) => indexNode(child, path))];
}

export const ALL_AURA_PAGES = indexNode(AURA_PAGE_TREE);

export function findSourceNode(id: string) {
  return ALL_AURA_PAGES.find((node) => node.id === id);
}

export function sourcePathLabels(node: IndexedSourceNode | SourceNode) {
  if ("path" in node) return node.path.map((item) => item.label);
  const indexed = findSourceNode(node.id);
  return indexed?.path.map((item) => item.label) ?? [node.label];
}
