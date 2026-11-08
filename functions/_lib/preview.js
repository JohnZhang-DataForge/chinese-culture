const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
}[char]));

function inlineMarkdown(value) {
  return escapeHtml(value)
    .replace(/\[([^\]]+)\]\((https:\/\/[^\s)]+)\)/g, '<a href="$2" rel="noopener noreferrer">$1</a>')
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
}

function renderBlocks(markdown) {
  const lines = String(markdown || "").replace(/\r\n?/g, "\n").split("\n");
  const output = [];
  let paragraph = [];
  let list = null;
  const closeParagraph = () => {
    if (paragraph.length) {
      output.push("<p>" + inlineMarkdown(paragraph.join(" ")) + "</p>");
      paragraph = [];
    }
  };
  const closeList = () => {
    if (list) {
      output.push("</" + list + ">");
      list = null;
    }
  };
  for (const line of lines) {
    const value = line.trim();
    if (!value) { closeParagraph(); closeList(); continue; }
    const heading = /^(#{1,6})\s+(.+)$/.exec(value);
    if (heading) {
      closeParagraph(); closeList();
      const level = heading[1].length;
      output.push("<h" + level + ">" + inlineMarkdown(heading[2]) + "</h" + level + ">");
      continue;
    }
    const unordered = /^[-*+]\s+(.+)$/.exec(value);
    const ordered = /^\d+[.)]\s+(.+)$/.exec(value);
    if (unordered || ordered) {
      closeParagraph();
      const nextList = unordered ? "ul" : "ol";
      if (list !== nextList) { closeList(); output.push("<" + nextList + ">"); list = nextList; }
      output.push("<li>" + inlineMarkdown((unordered || ordered)[1]) + "</li>");
      continue;
    }
    closeList();
    paragraph.push(value);
  }
  closeParagraph(); closeList();
  return output.join("\n");
}

export function renderSafePreview(content) {
  const locale = content.locale === "zh-CN" ? "zh-CN" : content.locale;
  const title = escapeHtml(content.title);
  const description = escapeHtml(content.description);
  const category = escapeHtml(content.category);
  const body = renderBlocks(content.bodyMarkdown);
  return `<!doctype html><html lang="${locale}"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font:16px/1.75 system-ui,sans-serif;color:#26332f;max-width:760px;margin:32px auto;padding:0 24px}h1,h2,h3{line-height:1.25;color:#172b27}h1{font-size:2rem}a{color:#176b5b}img{max-width:100%}blockquote{border-left:3px solid #b6c9bf;padding-left:1rem;color:#52645c}code{background:#f1f4f2;padding:.1em .3em;border-radius:4px}.category{font-size:.8rem;letter-spacing:.08em;text-transform:uppercase;color:#62756b}</style><body><article><p class="category">${category}</p><h1>${title}</h1><p>${description}</p><hr>${body}</article></body></html>`;
}
