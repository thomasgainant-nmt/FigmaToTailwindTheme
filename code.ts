// code.ts

figma.showUI(__html__, { width: 400, height: 400 });

var selectedRoot: SceneNode | null = null;

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

figma.on("selectionchange", () => {
  const selection = figma.currentPage.selection;
  if (selection.length > 0) {
    selectedRoot = selection[0];
  }
  else{
    selectedRoot = null;
  }
  figma.ui.postMessage({
    type: "text-json",
    data: {event: "new-selection", selection: selectedRoot},
  });
});

figma.ui.onmessage = (msg: { type: string }) => {
  const selection = figma.currentPage.selection;

  if (selection.length !== 1 || selectedRoot == null) {
    figma.ui.postMessage({
      type: "error",
      message: "Please select exactly one node (frame, group, or component).",
    });
    return;
  }

  const textItems = extractTextNodes(selectedRoot);

  figma.ui.postMessage({
    type: "text-json",
    data: {event: "output", output: textItems},
  });
};
