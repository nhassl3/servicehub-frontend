// Applies the remaining revisions to the existing ServiceHub Figma design.
(async () => {
  const p = figma.currentPage,
    get = id => figma.getNodeByIdAsync(id),
    d = await get("2:326"),
    m = await get("2:447"),
    bank = await get("2:200");
  const paint = h => ({
    type: "SOLID",
    color: {
      r: parseInt(h.slice(0, 2), 16) / 255,
      g: parseInt(h.slice(2, 4), 16) / 255,
      b: parseInt(h.slice(4), 16) / 255
    }
  });
  const ids = [];
  if (!d || !m || !bank) throw Error("Откройте исходный файл ServiceHub с фреймами 2:326 и 2:447.");
  if (figma.currentPage !== d.parent) await figma.setCurrentPageAsync(d.parent);
  if (d.getPluginData("homepage-revision") === "5") {
    figma.closePlugin("Обновление уже применено.");
    return;
  }
  const searchSet = bank.children.find(node => node.name.startsWith("Поиск"));
  const searchHint = searchSet?.children[0]?.children[0]?.children.find(
    node => node.type === "TEXT" && node.name !== "⌕"
  );
  if (!searchHint) {
    throw Error("Не удалось найти подсказку поиска в исходном макете.");
  }
  const labelFont = { family: "Inter", style: "Regular" };
  await figma.loadFontAsync(labelFont);

  function textLabel(parent, name, characters, size, x, y, color) {
    const node = figma.createText();
    node.name = name;
    node.fontName = labelFont;
    node.fontSize = size;
    node.characters = characters;
    node.fills = [paint(color)];
    parent.appendChild(node);
    node.x = x;
    node.y = y;
    return node;
  }
  // Revision 2 · artwork and product spacing.
  const arts = ["<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"500\" height=\"310\" viewBox=\"0 0 500 310\"><defs><linearGradient id=\"bg\" x2=\"1\" y2=\"1\"><stop stop-color=\"#152E43\"/><stop offset=\".55\" stop-color=\"#102034\"/><stop offset=\"1\" stop-color=\"#111A2A\"/></linearGradient><linearGradient id=\"metal\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\"><stop stop-color=\"#CCF4F1\"/><stop offset=\".35\" stop-color=\"#64BBC4\"/><stop offset=\"1\" stop-color=\"#345B7A\"/></linearGradient></defs><rect width=\"500\" height=\"310\" rx=\"16\" fill=\"url(#bg)\"/><path d=\"M-220 310 l 500 -214\" fill=\"none\" stroke=\"#1D3548\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M-172 310 l 500 -214\" fill=\"none\" stroke=\"#1D3548\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M-124 310 l 500 -214\" fill=\"none\" stroke=\"#1D3548\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M-76 310 l 500 -214\" fill=\"none\" stroke=\"#1D3548\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M-28 310 l 500 -214\" fill=\"none\" stroke=\"#1D3548\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M20 310 l 500 -214\" fill=\"none\" stroke=\"#1D3548\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M68 310 l 500 -214\" fill=\"none\" stroke=\"#1D3548\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M116 310 l 500 -214\" fill=\"none\" stroke=\"#1D3548\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M164 310 l 500 -214\" fill=\"none\" stroke=\"#1D3548\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M212 310 l 500 -214\" fill=\"none\" stroke=\"#1D3548\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M260 310 l 500 -214\" fill=\"none\" stroke=\"#1D3548\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M308 310 l 500 -214\" fill=\"none\" stroke=\"#1D3548\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M356 310 l 500 -214\" fill=\"none\" stroke=\"#1D3548\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M404 310 l 500 -214\" fill=\"none\" stroke=\"#1D3548\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M452 310 l 500 -214\" fill=\"none\" stroke=\"#1D3548\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M500 310 l 500 -214\" fill=\"none\" stroke=\"#1D3548\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M548 310 l 500 -214\" fill=\"none\" stroke=\"#1D3548\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M596 310 l 500 -214\" fill=\"none\" stroke=\"#1D3548\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M644 310 l 500 -214\" fill=\"none\" stroke=\"#1D3548\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><polygon points=\"124,211 252,158 380,211 252,264\" fill=\"url(#metal)\" stroke=\"#6BADC0\" stroke-width=\"1.5\"/><polygon points=\"124,211 252,264 252,277 124,224\" fill=\"#294A65\" stroke=\"#6BADC0\" stroke-width=\"1.5\"/><polygon points=\"252,264 380,211 380,224 252,277\" fill=\"#183346\" stroke=\"#6BADC0\" stroke-width=\"1.5\"/><polygon points=\"124,168 252,115 380,168 252,221\" fill=\"url(#metal)\" stroke=\"#6BADC0\" stroke-width=\"1.5\"/><polygon points=\"124,168 252,221 252,234 124,181\" fill=\"#294A65\" stroke=\"#6BADC0\" stroke-width=\"1.5\"/><polygon points=\"252,221 380,168 380,181 252,234\" fill=\"#183346\" stroke=\"#6BADC0\" stroke-width=\"1.5\"/><polygon points=\"124,125 252,72 380,125 252,178\" fill=\"url(#metal)\" stroke=\"#6BADC0\" stroke-width=\"1.5\"/><polygon points=\"124,125 252,178 252,191 124,138\" fill=\"#294A65\" stroke=\"#6BADC0\" stroke-width=\"1.5\"/><polygon points=\"252,178 380,125 380,138 252,191\" fill=\"#183346\" stroke=\"#6BADC0\" stroke-width=\"1.5\"/><path d=\"M160 131 l 63 -26\" fill=\"none\" stroke=\"#34627B\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M176 138 l 63 -26\" fill=\"none\" stroke=\"#34627B\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M192 145 l 63 -26\" fill=\"none\" stroke=\"#34627B\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M208 152 l 63 -26\" fill=\"none\" stroke=\"#34627B\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M224 159 l 63 -26\" fill=\"none\" stroke=\"#34627B\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M126 165 L84 182 L53 169 M381 205 L419 190 L455 204\" fill=\"none\" stroke=\"#68C9D2\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><circle cx=\"53\" cy=\"169\" r=\"5\" fill=\"#85DEDD\"/><circle cx=\"455\" cy=\"204\" r=\"5\" fill=\"#85DEDD\"/></svg>", "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"500\" height=\"310\" viewBox=\"0 0 500 310\"><defs><linearGradient id=\"bg\" x2=\"1\" y2=\"1\"><stop stop-color=\"#152E43\"/><stop offset=\".55\" stop-color=\"#102034\"/><stop offset=\"1\" stop-color=\"#111A2A\"/></linearGradient><linearGradient id=\"metal\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\"><stop stop-color=\"#CCF4F1\"/><stop offset=\".35\" stop-color=\"#64BBC4\"/><stop offset=\"1\" stop-color=\"#345B7A\"/></linearGradient></defs><rect width=\"500\" height=\"310\" rx=\"16\" fill=\"url(#bg)\"/><path d=\"M-220 310 l 500 -214\" fill=\"none\" stroke=\"#1D3548\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M-172 310 l 500 -214\" fill=\"none\" stroke=\"#1D3548\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M-124 310 l 500 -214\" fill=\"none\" stroke=\"#1D3548\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M-76 310 l 500 -214\" fill=\"none\" stroke=\"#1D3548\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M-28 310 l 500 -214\" fill=\"none\" stroke=\"#1D3548\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M20 310 l 500 -214\" fill=\"none\" stroke=\"#1D3548\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M68 310 l 500 -214\" fill=\"none\" stroke=\"#1D3548\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M116 310 l 500 -214\" fill=\"none\" stroke=\"#1D3548\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M164 310 l 500 -214\" fill=\"none\" stroke=\"#1D3548\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M212 310 l 500 -214\" fill=\"none\" stroke=\"#1D3548\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M260 310 l 500 -214\" fill=\"none\" stroke=\"#1D3548\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M308 310 l 500 -214\" fill=\"none\" stroke=\"#1D3548\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M356 310 l 500 -214\" fill=\"none\" stroke=\"#1D3548\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M404 310 l 500 -214\" fill=\"none\" stroke=\"#1D3548\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M452 310 l 500 -214\" fill=\"none\" stroke=\"#1D3548\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M500 310 l 500 -214\" fill=\"none\" stroke=\"#1D3548\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M548 310 l 500 -214\" fill=\"none\" stroke=\"#1D3548\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M596 310 l 500 -214\" fill=\"none\" stroke=\"#1D3548\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M644 310 l 500 -214\" fill=\"none\" stroke=\"#1D3548\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M52 190 L140 139 L231 178 L339 100 L437 145\" fill=\"none\" stroke=\"#457C92\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><polygon points=\"82,172 121,154 160,172 121,190\" fill=\"url(#metal)\" stroke=\"#6BADC0\" stroke-width=\"1.5\"/><polygon points=\"82,172 121,190 121,202 82,184\" fill=\"#294A65\" stroke=\"#6BADC0\" stroke-width=\"1.5\"/><polygon points=\"121,190 160,172 160,184 121,202\" fill=\"#183346\" stroke=\"#6BADC0\" stroke-width=\"1.5\"/><polygon points=\"203,172 242,154 281,172 242,190\" fill=\"url(#metal)\" stroke=\"#6BADC0\" stroke-width=\"1.5\"/><polygon points=\"203,172 242,190 242,202 203,184\" fill=\"#294A65\" stroke=\"#6BADC0\" stroke-width=\"1.5\"/><polygon points=\"242,190 281,172 281,184 242,202\" fill=\"#183346\" stroke=\"#6BADC0\" stroke-width=\"1.5\"/><polygon points=\"342,118 381,100 420,118 381,136\" fill=\"url(#metal)\" stroke=\"#6BADC0\" stroke-width=\"1.5\"/><polygon points=\"342,118 381,136 381,148 342,130\" fill=\"#294A65\" stroke=\"#6BADC0\" stroke-width=\"1.5\"/><polygon points=\"381,136 420,118 420,130 381,148\" fill=\"#183346\" stroke=\"#6BADC0\" stroke-width=\"1.5\"/><polygon points=\"170,115 228,91 286,115 228,139\" fill=\"url(#metal)\" stroke=\"#6BADC0\" stroke-width=\"1.5\"/><polygon points=\"170,115 228,139 228,156 170,132\" fill=\"#294A65\" stroke=\"#6BADC0\" stroke-width=\"1.5\"/><polygon points=\"228,139 286,115 286,132 228,156\" fill=\"#183346\" stroke=\"#6BADC0\" stroke-width=\"1.5\"/><path d=\"M196 113 l 13 -6 m 24 10 l 14 -6\" fill=\"none\" stroke=\"#28475E\" stroke-width=\"4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg>", "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"500\" height=\"310\" viewBox=\"0 0 500 310\"><defs><linearGradient id=\"bg\" x2=\"1\" y2=\"1\"><stop stop-color=\"#152E43\"/><stop offset=\".55\" stop-color=\"#102034\"/><stop offset=\"1\" stop-color=\"#111A2A\"/></linearGradient><linearGradient id=\"metal\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\"><stop stop-color=\"#CCF4F1\"/><stop offset=\".35\" stop-color=\"#64BBC4\"/><stop offset=\"1\" stop-color=\"#345B7A\"/></linearGradient></defs><rect width=\"500\" height=\"310\" rx=\"16\" fill=\"url(#bg)\"/><path d=\"M-220 310 l 500 -214\" fill=\"none\" stroke=\"#1D3548\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M-172 310 l 500 -214\" fill=\"none\" stroke=\"#1D3548\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M-124 310 l 500 -214\" fill=\"none\" stroke=\"#1D3548\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M-76 310 l 500 -214\" fill=\"none\" stroke=\"#1D3548\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M-28 310 l 500 -214\" fill=\"none\" stroke=\"#1D3548\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M20 310 l 500 -214\" fill=\"none\" stroke=\"#1D3548\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M68 310 l 500 -214\" fill=\"none\" stroke=\"#1D3548\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M116 310 l 500 -214\" fill=\"none\" stroke=\"#1D3548\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M164 310 l 500 -214\" fill=\"none\" stroke=\"#1D3548\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M212 310 l 500 -214\" fill=\"none\" stroke=\"#1D3548\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M260 310 l 500 -214\" fill=\"none\" stroke=\"#1D3548\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M308 310 l 500 -214\" fill=\"none\" stroke=\"#1D3548\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M356 310 l 500 -214\" fill=\"none\" stroke=\"#1D3548\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M404 310 l 500 -214\" fill=\"none\" stroke=\"#1D3548\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M452 310 l 500 -214\" fill=\"none\" stroke=\"#1D3548\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M500 310 l 500 -214\" fill=\"none\" stroke=\"#1D3548\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M548 310 l 500 -214\" fill=\"none\" stroke=\"#1D3548\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M596 310 l 500 -214\" fill=\"none\" stroke=\"#1D3548\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M644 310 l 500 -214\" fill=\"none\" stroke=\"#1D3548\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><rect x=\"92\" y=\"94\" width=\"187\" height=\"94\" rx=\"9\" fill=\"#183549\" stroke=\"#7EACBD\" stroke-width=\"2\"/><path d=\"M104 118h161\" fill=\"none\" stroke=\"#68C9D2\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M108 133h102\" fill=\"none\" stroke=\"#68A7AC\" stroke-width=\"4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M108 148h89\" fill=\"none\" stroke=\"#68A7AC\" stroke-width=\"4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M108 163h76\" fill=\"none\" stroke=\"#68A7AC\" stroke-width=\"4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><rect x=\"150\" y=\"118\" width=\"187\" height=\"94\" rx=\"9\" fill=\"#183549\" stroke=\"#7EACBD\" stroke-width=\"2\"/><path d=\"M162 142h161\" fill=\"none\" stroke=\"#68C9D2\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M166 157h102\" fill=\"none\" stroke=\"#68A7AC\" stroke-width=\"4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M166 172h89\" fill=\"none\" stroke=\"#68A7AC\" stroke-width=\"4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M166 187h76\" fill=\"none\" stroke=\"#68A7AC\" stroke-width=\"4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><rect x=\"208\" y=\"142\" width=\"187\" height=\"94\" rx=\"9\" fill=\"#183549\" stroke=\"#7EACBD\" stroke-width=\"2\"/><path d=\"M220 166h161\" fill=\"none\" stroke=\"#68C9D2\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M224 181h102\" fill=\"none\" stroke=\"#68A7AC\" stroke-width=\"4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M224 196h89\" fill=\"none\" stroke=\"#68A7AC\" stroke-width=\"4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M224 211h76\" fill=\"none\" stroke=\"#68A7AC\" stroke-width=\"4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg>", "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"500\" height=\"310\" viewBox=\"0 0 500 310\"><defs><linearGradient id=\"bg\" x2=\"1\" y2=\"1\"><stop stop-color=\"#152E43\"/><stop offset=\".55\" stop-color=\"#102034\"/><stop offset=\"1\" stop-color=\"#111A2A\"/></linearGradient><linearGradient id=\"metal\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\"><stop stop-color=\"#CCF4F1\"/><stop offset=\".35\" stop-color=\"#64BBC4\"/><stop offset=\"1\" stop-color=\"#345B7A\"/></linearGradient></defs><rect width=\"500\" height=\"310\" rx=\"16\" fill=\"url(#bg)\"/><path d=\"M-220 310 l 500 -214\" fill=\"none\" stroke=\"#1D3548\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M-172 310 l 500 -214\" fill=\"none\" stroke=\"#1D3548\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M-124 310 l 500 -214\" fill=\"none\" stroke=\"#1D3548\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M-76 310 l 500 -214\" fill=\"none\" stroke=\"#1D3548\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M-28 310 l 500 -214\" fill=\"none\" stroke=\"#1D3548\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M20 310 l 500 -214\" fill=\"none\" stroke=\"#1D3548\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M68 310 l 500 -214\" fill=\"none\" stroke=\"#1D3548\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M116 310 l 500 -214\" fill=\"none\" stroke=\"#1D3548\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M164 310 l 500 -214\" fill=\"none\" stroke=\"#1D3548\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M212 310 l 500 -214\" fill=\"none\" stroke=\"#1D3548\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M260 310 l 500 -214\" fill=\"none\" stroke=\"#1D3548\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M308 310 l 500 -214\" fill=\"none\" stroke=\"#1D3548\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M356 310 l 500 -214\" fill=\"none\" stroke=\"#1D3548\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M404 310 l 500 -214\" fill=\"none\" stroke=\"#1D3548\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M452 310 l 500 -214\" fill=\"none\" stroke=\"#1D3548\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M500 310 l 500 -214\" fill=\"none\" stroke=\"#1D3548\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M548 310 l 500 -214\" fill=\"none\" stroke=\"#1D3548\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M596 310 l 500 -214\" fill=\"none\" stroke=\"#1D3548\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M644 310 l 500 -214\" fill=\"none\" stroke=\"#1D3548\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M72 164 H149 Q170 164 170 144 V108 Q170 88 193 88 H307 Q330 88 330 110 V163 H429 M168 163 V205 Q168 222 192 222 H315\" fill=\"none\" stroke=\"#6DC6CC\" stroke-width=\"5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><circle cx=\"72\" cy=\"164\" r=\"14\" fill=\"#1C3A51\"/><circle cx=\"72\" cy=\"164\" r=\"6\" fill=\"#ABEAE3\"/><circle cx=\"204\" cy=\"88\" r=\"14\" fill=\"#1C3A51\"/><circle cx=\"204\" cy=\"88\" r=\"6\" fill=\"#ABEAE3\"/><circle cx=\"330\" cy=\"163\" r=\"14\" fill=\"#1C3A51\"/><circle cx=\"330\" cy=\"163\" r=\"6\" fill=\"#ABEAE3\"/><circle cx=\"315\" cy=\"222\" r=\"14\" fill=\"#1C3A51\"/><circle cx=\"315\" cy=\"222\" r=\"6\" fill=\"#ABEAE3\"/><polygon points=\"197,154 244,134 291,154 244,174\" fill=\"url(#metal)\" stroke=\"#6BADC0\" stroke-width=\"1.5\"/><polygon points=\"197,154 244,174 244,186 197,166\" fill=\"#294A65\" stroke=\"#6BADC0\" stroke-width=\"1.5\"/><polygon points=\"244,174 291,154 291,166 244,186\" fill=\"#183346\" stroke=\"#6BADC0\" stroke-width=\"1.5\"/></svg>", "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"500\" height=\"310\" viewBox=\"0 0 500 310\"><defs><linearGradient id=\"bg\" x2=\"1\" y2=\"1\"><stop stop-color=\"#152E43\"/><stop offset=\".55\" stop-color=\"#102034\"/><stop offset=\"1\" stop-color=\"#111A2A\"/></linearGradient><linearGradient id=\"metal\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\"><stop stop-color=\"#CCF4F1\"/><stop offset=\".35\" stop-color=\"#64BBC4\"/><stop offset=\"1\" stop-color=\"#345B7A\"/></linearGradient></defs><rect width=\"500\" height=\"310\" rx=\"16\" fill=\"url(#bg)\"/><path d=\"M-220 310 l 500 -214\" fill=\"none\" stroke=\"#1D3548\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M-172 310 l 500 -214\" fill=\"none\" stroke=\"#1D3548\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M-124 310 l 500 -214\" fill=\"none\" stroke=\"#1D3548\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M-76 310 l 500 -214\" fill=\"none\" stroke=\"#1D3548\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M-28 310 l 500 -214\" fill=\"none\" stroke=\"#1D3548\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M20 310 l 500 -214\" fill=\"none\" stroke=\"#1D3548\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M68 310 l 500 -214\" fill=\"none\" stroke=\"#1D3548\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M116 310 l 500 -214\" fill=\"none\" stroke=\"#1D3548\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M164 310 l 500 -214\" fill=\"none\" stroke=\"#1D3548\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M212 310 l 500 -214\" fill=\"none\" stroke=\"#1D3548\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M260 310 l 500 -214\" fill=\"none\" stroke=\"#1D3548\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M308 310 l 500 -214\" fill=\"none\" stroke=\"#1D3548\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M356 310 l 500 -214\" fill=\"none\" stroke=\"#1D3548\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M404 310 l 500 -214\" fill=\"none\" stroke=\"#1D3548\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M452 310 l 500 -214\" fill=\"none\" stroke=\"#1D3548\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M500 310 l 500 -214\" fill=\"none\" stroke=\"#1D3548\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M548 310 l 500 -214\" fill=\"none\" stroke=\"#1D3548\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M596 310 l 500 -214\" fill=\"none\" stroke=\"#1D3548\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M644 310 l 500 -214\" fill=\"none\" stroke=\"#1D3548\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><polygon points=\"78,211 228,158 378,211 228,264\" fill=\"url(#metal)\" stroke=\"#6BADC0\" stroke-width=\"1.5\"/><polygon points=\"78,211 228,264 228,276 78,223\" fill=\"#294A65\" stroke=\"#6BADC0\" stroke-width=\"1.5\"/><polygon points=\"228,264 378,211 378,223 228,276\" fill=\"#183346\" stroke=\"#6BADC0\" stroke-width=\"1.5\"/><path d=\"M111 104 L314 52 Q322 50 323 60 L337 180 L130 233 Z\" fill=\"#28516A\" stroke=\"#82BDC7\" stroke-width=\"3\"/><path d=\"M124 112 L312 65 L322 171 L139 217 Z\" fill=\"#102336\"/><path d=\"M150 133 L232 112 M153 148 L205 135 M157 165 L267 137\" fill=\"none\" stroke=\"#6DBFC9\" stroke-width=\"5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M165 188 L196 180\" fill=\"none\" stroke=\"#C6EEE4\" stroke-width=\"7\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><polygon points=\"287,163 336,142 385,163 336,184\" fill=\"url(#metal)\" stroke=\"#6BADC0\" stroke-width=\"1.5\"/><polygon points=\"287,163 336,184 336,196 287,175\" fill=\"#294A65\" stroke=\"#6BADC0\" stroke-width=\"1.5\"/><polygon points=\"336,184 385,163 385,175 336,196\" fill=\"#183346\" stroke=\"#6BADC0\" stroke-width=\"1.5\"/></svg>"],
    paths = ["M8 6 2 12l6 6 M16 6l6 6-6 6 M14 3l-4 18", "M3 5l9-3 9 3-9 4z M3 10l9 4 9-4 M3 15l9 4 9-4", "M3 4h18v16H3z M6 9l3 3-3 3 M12 15h5", "M2 4h20v13H2z M8 21h8 M12 17v4", "M19 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0z M17 16l5 6 M8 10h6", "M3 7l9-5 9 5v10l-9 5-9-5z M3 7l9 5 9-5 M12 12v10"];
  function icon(container, d, size, x, y, name) {
    const a = figma.createNodeFromSvg('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="' + d + '" fill="none" stroke="#82DFE6" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round"/></svg>');
    container.appendChild(a);
    a.name = name;
    a.rescale(size / 24);
    a.x = x;
    a.y = y;
    ids.push(a.id, ...a.findAll().map(n => n.id));
    return a;
  }
  function draw(f, i) {
    for (const n of [...f.children]) n.remove();
    const a = figma.createNodeFromSvg(arts[i]);
    f.appendChild(a);
    a.name = ["Слои интеграции", "Узлы API", "Листы данных", "Маршрут автоматизации", "Рабочее место продавца"][i];
    const scale = Math.min(f.width / 500, f.height / 310);
    a.rescale(scale);
    a.x = (f.width - a.width) / 2;
    a.y = (f.height - a.height) / 2;
    f.fills = [paint("111E2F")];
    ids.push(f.id, a.id, ...a.findAll().map(n => n.id));
  }
  for (const r of [d, m]) {
    draw(r.children[0].children.find(n => n.name.startsWith("Иллюстрация")), 0);
    draw(r.children[3].children.find(n => n.name.startsWith("Иллюстрация")), 4);
    r.children[2].children.filter(n => n.type === "FRAME").forEach((item, i) => {
      const old = item.children[0];
      icon(item, paths[i], r === m ? 26 : 30, 22, (item.height - 30) / 2, "Пиктограмма / " + item.name);
      old.remove();
    });
  }
  for (const [i, set] of bank.children.filter(n => n.name.startsWith("Товар")).entries()) {
    for (const variant of set.children) {
      draw(variant.children[0].children[0], i + 1);
    }
  }
  for (const c of bank.children.find(n => n.name.startsWith("Поиск")).children) {
    const f = c.children[0],
      old = f.children.find(n => n.name === "⌕");
    if (old) old.remove();
    icon(f, "M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0z M15 15l6 6", 22, 15, 19, "Лупа");
  }
  for (const set of bank.children.filter(n => n.name.startsWith("Товар"))) {
    for (const v of set.children) {
      const wrap = v.children[0],
        [title, desc, price] = wrap.children.filter(n => n.type === "TEXT");
      title.y = wrap.children[0].height + 12;
      desc.y = title.y + title.height + 16;
      price.y = Math.max(desc.y + desc.height + 16, wrap.height - 40);
      ids.push(title.id, desc.id, price.id);
    }
  }
  const sec = m.children[1];
  let cursor = sec.children[0].y + sec.children[0].height + 24;
  for (const c of sec.children.filter(n => n.type === "INSTANCE")) {
    c.rescale(342 / c.width);
    c.x = 24;
    c.y = cursor;
    cursor += c.height + 18;
    ids.push(c.id);
  }
  const more = sec.children[sec.children.length - 1];
  more.y = cursor + 4;
  const dh = cursor + 66 - sec.height;
  sec.resize(m.width, sec.height + dh);
  for (const s of m.children.slice(2)) s.y += dh;
  // Revision 3 · character-by-character search and product hover.
  const old = searchSet;
  const phrase = "Парсер маркетплейсов";
  const base = old.children[0];
  const variants = [base];
  const field = base.children[0];
  const texts = field.children.filter(n => n.type === "TEXT");
  const hintX = searchHint.x;
  const hint = textLabel(field, "Набор запроса", "│", 16, hintX, 19, "A9B8CD");
  for (const t of texts) t.remove();
  base.name = "Символ=0";
  ids.push(hint.id, base.id);
  for (let i = 1; i <= phrase.length; i++) {
    const c = base.clone();
    old.appendChild(c);
    c.name = "Символ=" + i;
    c.x = base.x + 540 * Math.floor(i / 6);
    c.y = base.y + 80 * (i % 6);
    const clonedField = c.children[0];
    const query = clonedField.children.find(n => n.name === "Набор запроса");
    query.characters = phrase.slice(0, i) + (i < phrase.length ? "│" : "");
    variants.push(c);
    ids.push(c.id, ...c.findAll().map(n => n.id));
  }
  for (const c of [...old.children]) if (!variants.includes(c)) c.remove();
  for (let i = 0; i < variants.length; i++) {
    await variants[i].setReactionsAsync([{
      trigger: {
        type: "AFTER_TIMEOUT",
        timeout: i === phrase.length ? 2.5 : i === 0 ? .65 : .09
      },
      actions: [{
        type: "NODE",
        destinationId: variants[(i + 1) % variants.length].id,
        navigation: "CHANGE_TO",
        transition: null
      }]
    }]);
  }
  old.name = "Поиск / печать запроса";
  ids.push(old.id);
  const anim = {
    type: "SMART_ANIMATE",
    duration: .36,
    easing: {
      type: "EASE_IN_AND_OUT"
    }
  };
  for (const set of bank.children.filter(n => n.name.startsWith("Товар"))) {
    const [rest, hover] = set.children;
    const a = rest.children[0],
      b = hover.children[0];
    a.y = 6;
    b.y = 2;
    b.strokes = [paint("648F9F")];
    b.fills = [paint("17283C")];
    await rest.setReactionsAsync([{
      trigger: {
        type: "ON_HOVER"
      },
      actions: [{
        type: "NODE",
        destinationId: hover.id,
        navigation: "CHANGE_TO",
        transition: anim
      }]
    }]);
    ids.push(rest.id, hover.id, a.id, b.id);
  }
  // Revision 4 · button feedback and adaptive price clearance.
  // Turn each visual button into a fixed-size interactive component pair.
  async function buttonInteractions(base, hover, url) {
    await base.setReactionsAsync([{
      trigger: {
        type: "ON_HOVER"
      },
      actions: [{
        type: "NODE",
        destinationId: hover.id,
        navigation: "CHANGE_TO",
        transition: {
          type: "SMART_ANIMATE",
          duration: .24,
          easing: {
            type: "EASE_OUT"
          }
        }
      }]
    }, {
      trigger: {
        type: "ON_CLICK"
      },
      actions: [{
        type: "URL",
        url
      }]
    }]);
    await hover.setReactionsAsync([{
      trigger: {
        type: "ON_CLICK"
      },
      actions: [{
        type: "URL",
        url
      }]
    }]);
  }
  const sellerButton = bank.children.find(n => n.name === "Кнопка / Продавцам");
  await buttonInteractions(sellerButton.children[0], sellerButton.children[1], "https://servicehub-nu-nine.vercel.app/sellers/create");
  for (const [index, id] of ["2:341", "2:459", "2:332"].entries()) {
    const source = await get(id),
      parent = source.parent;
    const x = source.x,
      y = source.y,
      w = source.width,
      h = source.height;
    const parts = [];
    for (const [v, state] of ["Default", "Hover"].entries()) {
      const comp = figma.createComponent();
      bank.appendChild(comp);
      comp.name = "Состояние=" + state;
      comp.resize(w, h);
      comp.x = 48 + v * (w + 24);
      comp.y = 2000 + index * 110;
      comp.fills = [];
      const shape = source.clone();
      comp.appendChild(shape);
      shape.x = 0;
      shape.y = 0;
      if (v) {
        shape.fills = [paint(index === 2 ? "233C52" : "A6ECE7")];
        shape.strokes = [paint("8FE9E7")];
      }
      parts.push(comp);
    }
    const set = figma.combineAsVariants(parts, bank);
    set.name = "Кнопка / " + source.name + (index === 1 ? " · Mobile" : "");
    await buttonInteractions(parts[0], parts[1], "https://servicehub-nu-nine.vercel.app/" + (index === 2 ? "login" : "catalog?q=" + encodeURIComponent("Парсер маркетплейсов")));
    const instance = parts[0].createInstance();
    parent.insertChild(parent.children.indexOf(source), instance);
    instance.x = x;
    instance.y = y;
    source.remove();
  }
  for (const set of bank.children.filter(n => n.name.startsWith("Товар"))) {
    for (const variant of set.children) {
      const face = variant.children[0],
        price = face.children.filter(n => n.type === "TEXT").slice(-1)[0];
      if (price.y + price.height + 10 > face.height) {
        const extra = price.y + price.height + 10 - face.height;
        face.resize(face.width, face.height + extra);
        variant.resize(variant.width, variant.height + extra);
      }
    }
  }
  for (const root of [d, m]) {
    const section = root.children[1],
      cards = section.children.filter(n => n.type === "INSTANCE");
    const title = section.children[0];
    let bottom = title.y + title.height + 24;
    for (const c of cards) {
      c.y = root === m ? bottom : Math.max(c.y, bottom);
      if (root === m) bottom = c.y + c.height + 18;
    }
    const finalEdge = Math.max(...cards.map(c => c.y + c.height));
    const link = section.children.find(n => n.name === "Весь каталог");
    link.y = Math.max(link.y, finalEdge + 18);
  }
  // Revision 5 · section lighting and animated accessible jump links.
  const lighten = hex => paint(hex).color;
  for (const root of [d, m]) {
    const sections = root.children.slice(0, 5);
    for (let index = 0; index < 4; index++) {
      const section = sections[index],
        target = sections[index + 1];
      section.fills = [{
        type: "GRADIENT_LINEAR",
        gradientTransform: [[.93, .32, -.12], [-.32, .93, .15]],
        gradientStops: [{
          position: 0,
          color: {
            ...lighten(index % 2 ? "15273A" : "101F30"),
            a: 1
          }
        }, {
          position: 1,
          color: {
            ...lighten("0C1424"),
            a: 1
          }
        }]
      }];
      const navigation = figma.createFrame();
      section.appendChild(navigation);
      navigation.name = "Далее / " + target.name;
      navigation.resize(root === m ? 224 : 260, 44);
      navigation.fills = [];
      navigation.x = root === m ? 24 : 124;
      navigation.y = section.height - (root === m ? 46 : 58);
      // Keep navigation clear of content on narrow screens.
      const bottom = Math.max(0, ...section.children.filter(n => n !== navigation).map(n => n.y + n.height));
      if (navigation.y < bottom + 12) {
        const extra = bottom + 12 - navigation.y;
        section.resize(section.width, section.height + extra);
        navigation.y += extra;
        for (const later of sections.slice(index + 1)) later.y += extra;
      }
      const caption = ["Популярные товары", "Категории", "Продавцам", "К футеру"][index];
      const t = textLabel(navigation, caption, caption, 15, 32, 12, "A9C3CC");
      icon(navigation, "M12 4v15 M5 12l7 7 7-7", 19, 2, 12, "Вниз");
      await navigation.setReactionsAsync([{
        trigger: {
          type: "ON_CLICK"
        },
        actions: [{
          type: "NODE",
          destinationId: target.id,
          navigation: "SCROLL_TO",
          transition: {
            type: "SCROLL_ANIMATE",
            duration: .52,
            easing: {
              type: "EASE_IN_AND_OUT"
            }
          }
        }]
      }]);
    }
  }
  d.setPluginData("homepage-revision", "5");
  figma.viewport.scrollAndZoomIntoView([d]);
  figma.closePlugin("Готово.");
})().catch(error => figma.closePlugin(String(error)));
