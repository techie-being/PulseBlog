const editorJsToText = (content) => {
  if (!content?.blocks) {
    return "";
  }

  return content.blocks
    .map((block, index) => {
      switch (block.type) {
        case "header":
          return `[BLOCK ${index}]
Heading:
${block.data.text}`;

        case "paragraph":
          return `[BLOCK ${index}]
Paragraph:
${block.data.text}`;

        case "list":
          return `[BLOCK ${index}]
List:
${block.data.items.join("\n")}`;

        case "quote":
          return `[BLOCK ${index}]
Quote:
${block.data.text}`;

        case "code":
          return `[BLOCK ${index}]
Code:
${block.data.code}`;

        default:
          return "";
      }
    })
    .filter(Boolean)
    .join("\n\n");
};

export default editorJsToText;