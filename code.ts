// code.ts

figma.showUI(__html__, { width: 400, height: 400 });

type TextNodeInfo = {
  nodeId: string;
  name: string;
  text: string;
};

function extractTextNodes(node: SceneNode): TextNodeInfo[] {
  let results: TextNodeInfo[] = [];

  if (node.type === "TEXT") {
    results.push({
      nodeId: node.id,
      name: node.name,
      text: node.characters,
    });
  }

  if ("children" in node) {
    for (const child of node.children) {
      results = results.concat(extractTextNodes(child as SceneNode));
    }
  }

  return results;
}

figma.ui.onmessage = (msg: { type: string }) => {
  const selection = figma.currentPage.selection;

  if (selection.length !== 1) {
    figma.ui.postMessage({
      type: "error",
      message: "Please select exactly one node (frame, group, or component).",
    });
    return;
  }

  const root = selection[0];
  const textItems = extractTextNodes(root);

  figma.ui.postMessage({
    type: "text-json",
    data: textItems,
  });
};
