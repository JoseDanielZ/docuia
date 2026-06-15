import {
  AlignmentType,
  Document,
  Header,
  HeadingLevel,
  ImageRun,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";

const HEADER_PNG = "/fe-alegria-header.png";
const CONTENT_WIDTH = 624;

function isTableRow(line) {
  const t = line.trim();
  return t.startsWith("|") && t.endsWith("|");
}

function isTableSeparator(line) {
  return /^\|[\s\-:|]+\|$/.test(line.trim());
}

function splitTableCells(line) {
  return line.trim().split("|").slice(1, -1).map((c) => c.trim());
}

function parseInlineRuns(text) {
  const runs = [];
  const re = /(\*\*(.+?)\*\*|\*(.+?)\*|([^*]+))/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    if (m[2]) runs.push(new TextRun({ text: m[2], bold: true }));
    else if (m[3]) runs.push(new TextRun({ text: m[3], italics: true }));
    else if (m[4]) runs.push(new TextRun({ text: m[4] }));
  }
  if (!runs.length) runs.push(new TextRun({ text }));
  return runs;
}

function headingLevel(line) {
  const t = line.trim();
  if (t.startsWith("# ")) return { level: HeadingLevel.HEADING_1, text: t.slice(2), center: true };
  if (t.startsWith("## ")) return { level: HeadingLevel.HEADING_2, text: t.slice(3) };
  if (/^\d+\.\s/.test(t)) return { level: HeadingLevel.HEADING_2, text: t };
  if (t.startsWith("**") && t.endsWith("**")) return { level: HeadingLevel.HEADING_2, text: t.replaceAll("**", "") };
  return null;
}

function buildTable(tableLines) {
  const rows = tableLines.map((line) => {
    const cells = splitTableCells(line);
    return new TableRow({
      children: cells.map(
        (cell) =>
          new TableCell({
            children: [new Paragraph({ children: parseInlineRuns(cell), alignment: AlignmentType.JUSTIFIED })],
          })
      ),
    });
  });
  const colCount = Math.max(...tableLines.map((l) => splitTableCells(l).length), 1);
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    columnWidths: Array(colCount).fill(Math.floor(9360 / colCount)),
    rows,
  });
}

function markdownToDocxChildren(markdown) {
  const lines = markdown.split("\n");
  const children = [];
  let i = 0;

  while (i < lines.length) {
    const t = lines[i].trim();

    if (!t) {
      i++;
      continue;
    }

    if (isTableRow(t)) {
      const tableLines = [];
      while (i < lines.length) {
        const row = lines[i].trim();
        if (!row) break;
        if (isTableSeparator(row)) {
          i++;
          continue;
        }
        if (!isTableRow(row)) break;
        tableLines.push(row);
        i++;
      }
      if (tableLines.length) children.push(buildTable(tableLines));
      continue;
    }

    if (t === "---") {
      i++;
      continue;
    }

    const h = headingLevel(lines[i]);
    if (h) {
      children.push(
        new Paragraph({
          text: h.text,
          heading: h.level,
          alignment: h.center ? AlignmentType.CENTER : undefined,
        })
      );
      i++;
      continue;
    }

    children.push(
      new Paragraph({
        children: parseInlineRuns(t),
        alignment: AlignmentType.JUSTIFIED,
      })
    );
    i++;
  }

  return children;
}

async function loadHeaderImage() {
  const resp = await fetch(HEADER_PNG);
  if (!resp.ok) throw new Error("No se pudo cargar el encabezado institucional");
  const data = await resp.arrayBuffer();

  const dims = await new Promise((resolve, reject) => {
    const blob = new Blob([data], { type: "image/png" });
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(blob);
  });

  const height = Math.round(dims.height * (CONTENT_WIDTH / dims.width));
  return { data, width: CONTENT_WIDTH, height };
}

export async function exportToDocx(reportMarkdown, fileName) {
  const headerImg = await loadHeaderImage();
  const children = markdownToDocxChildren(reportMarkdown);

  const doc = new Document({
    sections: [
      {
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                children: [
                  new ImageRun({
                    type: "png",
                    data: headerImg.data,
                    transformation: { width: headerImg.width, height: headerImg.height },
                  }),
                ],
              }),
            ],
          }),
        },
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${fileName}.docx`;
  a.click();
  URL.revokeObjectURL(a.href);
}
