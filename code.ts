// code.ts

figma.showUI(__html__, { width: 400, height: 400 });

var selectedRoot: SceneNode | null = null;

type NodeInfo = {
  nodeId: string;
  name: string;
  text?: string;
  children?:SceneNode[];
};

function extractTextNodes(node: SceneNode): NodeInfo[] {
  let results: NodeInfo[] = [];

  if (node.type === "TEXT") {
    results.push({
      nodeId: node.id,
      name: node.name,
      text: node.characters,
      children: undefined
    });
  }
  else if ('children' in node) {
    const rows = node.children.filter(child => child.type === 'FRAME');
    results.push({
      nodeId: node.id,
      name: node.name,
      text: undefined,
      children: rows
    });
  }

  if ("children" in node) {
    for (const child of node.children) {
      results = results.concat(extractTextNodes(child as SceneNode));
    }
  }

  return results;
}

function convertToTailwindTheme(nodes:NodeInfo[]):string{
  let colors = "";
  let heights = "";
  let spacings = "";
  let borderWidths = "";
  let borderRadiuses = "";
  let fontSizes = "";
  let fontWeights = "";
  let boxShadows = "";

  for(let node of nodes){
    if(node.name == "tailwind-colors"){
      for(let subNode of node.children!){
        colors += `'ink-blue': "#0000ff",`;
      }
    }
    else if(node.name == "tailwind-heights"){
      for(let subNode of node.children!){
        heights += `'xl': '24px',`;
      }
    }
    else if(node.name == "tailwind-spacings"){
      for(let subNode of node.children!){
        spacings += `'2xs': '2px',`;
      }
    }
    else if(node.name == "tailwind-borderWidths"){
      for(let subNode of node.children!){
        borderWidths += `'2xs': '2px',`;
      }
    }
    else if(node.name == "tailwind-borderRadiuses"){
      for(let subNode of node.children!){
        borderRadiuses += `'2xs': '2px',`;
      }
    }
    else if(node.name == "tailwind-fontSizes"){
      for(let subNode of node.children!){
        fontSizes += `'2xs': '2px',`;
      }
    }
    else if(node.name == "tailwind-fontWeights"){
      for(let subNode of node.children!){
        fontWeights += `'bold': 700,`;
      }
    }
    else if(node.name == "tailwind-boxShadows"){
      for(let subNode of node.children!){
        boxShadows += `shadowed: '0 4px 6px rgba(0, 0, 0, 0.1)',`;
      }
    }
  }

  let result = `
  module.exports = {
    content: ['./src/**/*.{html,ts}'],
    theme: {
      extend: {
        colors: {
          ${colors}
        },
        height: {
          ${heights}
        },
        spacing: {
          ${spacings}
        },
        borderWidth: {
          ${borderWidths}
        },
        borderRadius: {
          ${borderRadiuses}
        },
        fontSize: {
          ${fontSizes}
        },
        fontWeight: {
          ${fontWeights}
        },
        boxShadow: {
          ${boxShadows}
        },
      },
    },
    variants: {},
    plugins: [],
  };
`;
console.log(result)
  return result;
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
  const tailwindTheme = convertToTailwindTheme(textItems);

  figma.ui.postMessage({
    type: "text-json",
    data: {event: "output", output: tailwindTheme},
  });
};
