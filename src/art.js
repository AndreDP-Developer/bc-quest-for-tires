// Original vector illustrations, rasterized once for Three.js textures.
export const INK = "#293b38",
  PAPER = "#fff4d5";
function path(c, d, fill, stroke = INK, width = 3) {
  const p = new Path2D(d);
  if (fill) {
    c.fillStyle = fill;
    c.fill(p);
  }
  if (stroke) {
    c.strokeStyle = stroke;
    c.lineWidth = width;
    c.lineJoin = "round";
    c.lineCap = "round";
    c.stroke(p);
  }
}
function ellipse(c, x, y, rx, ry, fill, stroke = INK, width = 3) {
  c.beginPath();
  c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  c.fillStyle = fill;
  c.fill();
  if (stroke) {
    c.strokeStyle = stroke;
    c.lineWidth = width;
    c.stroke();
  }
}
function line(c, d, color = INK, w = 3) {
  path(c, d, null, color, w);
}
export function canvas(w, h, draw) {
  const el = document.createElement("canvas");
  el.width = w;
  el.height = h;
  const c = el.getContext("2d");
  c.lineJoin = "round";
  c.lineCap = "round";
  draw(c);
  return el;
}
export function thor(pose = "ride", frame = 0) {
  return canvas(240, 320, (c) => {
    c.scale(1.3, 1.3);
    c.translate(4, 0);
    const duck = pose === "duck",
      crash = pose === "crash";
    if (crash) {
      c.translate(20, 65);
      c.rotate(-0.75);
    }
    // Stone tire and axle.
    ellipse(c, 81, 209, 34, 34, "#8d9883");
    ellipse(c, 81, 207, 27, 27, "#bdc1a7");
    c.save();
    c.translate(81, 207);
    c.rotate((frame * Math.PI) / 4);
    line(
      c,
      "M -20 -12 L -13 -20 M 12 -21 L 20 -13 M 21 11 L 13 20 M -12 20 L -21 12",
      "#788571",
      3,
    );
    path(c, "M -7 -25 L -3 -15 L -7 -8", null, "#788571", 2);
    c.restore();
    ellipse(c, 81, 207, 5, 5, INK, null);
    line(c, "M 80 201 L 82 166", INK, 7);
    line(c, "M 69 167 L 96 166", INK, 6);
    if (duck) {
      path(
        c,
        "M 59 163 Q 57 140 78 136 L 118 146 L 111 173 L 93 170 L 78 178 Z",
        "#d4874f",
      );
      path(
        c,
        "M 76 172 L 68 184 L 94 197 L 114 196 Q 122 202 112 207 L 92 208 L 55 188 L 64 165",
        "#edb178",
      );
      c.translate(44, 73);
      c.rotate(0.18);
    } else {
      const pedal = Math.sin((frame * Math.PI) / 4) * 10;
      path(
        c,
        `M 69 151 L 63 174 L ${89 + pedal} 190 L ${104 + pedal} 191 Q ${116 + pedal} 196 ${108 + pedal} 201 L ${84 + pedal} 200 L 47 179 L 55 148`,
        "#e0a270",
      );
      path(
        c,
        "M 84 146 L 90 174 L 69 199 L 79 202 Q 87 211 71 212 L 56 209 L 52 203 L 72 172 L 67 151",
        "#f2ba83",
      );
      path(
        c,
        "M 64 83 Q 46 95 42 126 L 34 151 L 56 148 L 64 158 L 76 149 L 88 155 L 90 117 L 83 85 Z",
        "#d89356",
      );
      path(
        c,
        "M 43 131 L 53 120 L 58 135 Z M 66 97 L 65 113 L 75 108 Z M 68 135 L 80 142 L 74 149 Z M 42 145 L 51 144 L 50 150 Z",
        INK,
        null,
      );
      path(
        c,
        "M 81 94 Q 91 106 95 120 L 125 112 Q 132 114 129 119 L 94 133 Q 87 132 79 119",
        "#f2ba83",
      );
    }
    // Comically oversized nose, chin and windswept hair.
    path(
      c,
      "M 70 37 Q 92 27 105 43 L 106 53 Q 129 51 144 66 Q 149 75 131 77 L 108 76 Q 119 91 104 96 L 80 95 L 73 83 Q 57 83 57 69 Q 57 59 68 58 Z",
      "#f2ba83",
    );
    path(
      c,
      "M 59 65 Q 52 45 65 32 L 39 28 L 67 25 L 44 15 L 81 22 L 71 9 Q 96 15 101 30 L 111 30 L 108 43 L 96 41 L 94 34 L 86 47 L 80 37 L 72 57 L 68 62 Z",
      "#624334",
    );
    line(c, "M 43 37 L 59 40 M 46 47 L 57 49", "#624334", 4);
    ellipse(c, 102, 52, 8, 11, "#fffae4", INK, 2);
    ellipse(c, 106, 54, 2.4, 4, INK, null);
    line(c, "M 97 38 L 112 41", INK, 3);
    line(c, "M 108 79 Q 119 82 125 76", INK, 2);
    line(c, "M 63 64 Q 72 61 70 72", INK, 2);
    for (let i = 0; i < 4; i++) line(c, `M ${82 + i * 5} 88 l 1 3`, INK, 1.5);
    if (pose === "jump") {
      line(c, "M 26 165 L 13 173 M 25 179 L 15 184", "#f2d485", 3);
    }
  });
}
export function rock() {
  return canvas(100, 75, (c) => {
    path(
      c,
      "M 9 66 L 14 38 L 34 13 L 66 10 L 87 35 L 92 63 L 78 68 Z",
      "#939b83",
    );
    path(
      c,
      "M 14 38 L 34 13 L 66 10 L 54 32 L 30 36 L 25 56 Z",
      "#c7c7a8",
      null,
    );
    line(c, "M 35 18 L 32 32 L 46 39 M 83 44 L 71 46 L 64 60", "#697962", 2);
  });
}
export function log() {
  return canvas(145, 90, (c) => {
    path(c, "M 22 18 L 115 31 L 121 75 L 22 65 Z", "#986441");
    ellipse(c, 25, 43, 20, 28, "#e4b977");
    ellipse(c, 24, 43, 12, 19, "#c38d56", INK, 2);
    line(
      c,
      "M 21 32 Q 33 32 31 48 Q 22 59 18 46 Q 16 37 24 39 M 50 31 L 99 38 M 44 45 L 88 51 M 64 65 L 103 67",
      "#674d37",
      2,
    );
    path(c, "M 85 29 L 87 12 L 101 11 L 100 34", "#986441");
  });
}
export function palm() {
  return canvas(350, 500, (c) => {
    path(
      c,
      "M 155 485 Q 175 360 183 210 Q 183 151 164 112 L 182 109 Q 221 192 214 282 Q 208 398 188 485 Z",
      "#bc9360",
    );
    for (let i = 0; i < 12; i++)
      line(
        c,
        `M ${177 + (i < 5 ? i * 3 : 20 - (i - 5) * 2)} ${155 + i * 27} l 24 6`,
        "#7b7950",
        2,
      );
    const leaves = [
      "M 178 121 Q 84 72 20 152 Q 87 112 167 136 Z",
      "M 176 121 Q 65 12 13 72 Q 81 54 168 126 Z",
      "M 177 117 Q 114 -8 93 15 Q 125 51 169 122 Z",
      "M 180 118 Q 230 1 304 53 Q 239 40 187 124 Z",
      "M 184 126 Q 299 55 342 131 Q 273 107 188 139 Z",
      "M 179 132 Q 279 127 302 209 Q 252 160 186 143 Z",
    ];
    leaves.forEach((d, i) => path(c, d, i % 2 ? "#447860" : "#729361"));
    ellipse(c, 181, 132, 13, 15, "#b78856");
    ellipse(c, 200, 135, 12, 14, "#c2985f");
  });
}
export function fern() {
  return canvas(260, 130, (c) => {
    for (let i = 0; i < 9; i++) {
      const x = 15 + i * 28;
      path(
        c,
        `M 130 126 Q ${x} 84 ${x} ${20 + Math.abs(i - 4) * 8} Q ${x + 50} 68 130 126`,
        i % 2 ? "#56795b" : "#88a368",
        INK,
        2,
      );
    }
    line(c, "M 130 125 L 130 28", "#c6c98a", 2);
  });
}
export function cloud() {
  return canvas(280, 120, (c) => {
    path(
      c,
      "M 25 97 Q 4 84 21 63 Q 34 49 58 59 Q 54 27 85 24 Q 109 20 126 47 Q 145 0 181 23 Q 203 34 205 60 Q 240 39 259 64 Q 286 97 250 102 Z",
      "#fff8df",
      "#d8cba2",
      2,
    );
    line(c, "M 44 88 Q 88 93 117 87 M 153 88 L 218 89", "#e7d9b4", 3);
  });
}
export function dinosaur(kind = "sleep") {
  return canvas(540, 400, (c) => {
    path(
      c,
      "M 150 262 Q 70 256 22 300 Q 72 288 111 317 L 308 320 Q 383 325 419 295 Q 454 265 443 230 Q 486 239 510 213 Q 536 187 513 172 L 453 154 Q 443 90 412 73 Q 367 63 358 104 Q 350 151 370 192 L 338 240 Q 285 208 215 223 Z",
      "#91ab78",
    );
    path(
      c,
      "M 328 303 Q 373 306 396 280 Q 417 259 410 224 L 403 130 Q 384 104 384 143 L 391 228 L 362 261 Z",
      "#d4d29b",
      null,
    );
    path(
      c,
      "M 156 279 L 148 345 L 199 345 L 198 284 M 270 283 L 284 345 L 337 345 L 322 281",
      "#91ab78",
    );
    for (let i = 0; i < 7; i++)
      ellipse(c, 170 + i * 27, 248 + Math.sin(i) * 12, 9, 7, "#708f64", null);
    if (kind === "sleep") {
      line(c, "M 424 172 Q 434 179 444 172", INK, 4);
      line(c, "M 477 207 Q 487 211 496 205", INK, 3);
      c.font = "bold 36px Georgia";
      c.fillStyle = INK;
      c.fillText("z", 451, 114);
      c.font = "bold 23px Georgia";
      c.fillText("z", 477, 82);
    } else {
      ellipse(c, 431, 164, 13, 18, "#fff8df");
      ellipse(c, 438, 168, 4, 7, INK, null);
      path(c, "M 461 207 L 502 208 L 484 227 Z", "#735947");
      path(
        c,
        "M 469 209 L 474 218 L 479 209 M 487 209 L 492 216 L 497 209",
        "#fff9dc",
        INK,
        1,
      );
    }
    line(
      c,
      "M 164 336 L 164 345 M 180 336 L 180 345 M 303 336 L 303 345 M 318 336 L 318 345",
      INK,
      2,
    );
  });
}
export function turtle(warning = false) {
  return canvas(180, 90, (c) => {
    ellipse(c, 53, 70, 16, 8, "#9eae72");
    ellipse(c, 118, 70, 17, 8, "#9eae72");
    ellipse(c, 153, 48, 20, 15, "#b8c88a");
    path(
      c,
      "M 14 64 Q 18 9 76 10 Q 130 8 141 64 Z",
      warning ? "#c59c55" : "#718a59",
    );
    path(
      c,
      "M 21 43 L 52 46 L 66 20 L 97 20 L 112 46 L 135 44 M 53 47 L 68 66 M 112 46 L 98 65",
      null,
      "#435d45",
      3,
    );
    ellipse(c, 160, 44, 3, 4, INK, null);
    line(c, "M 165 55 L 172 52", INK, 2);
  });
}
export function bird(frame = 0) {
  return canvas(240, 150, (c) => {
    const high = frame % 2 === 0;
    path(
      c,
      high
        ? "M 111 66 Q 48 0 6 13 L 59 78 L 110 91 Z"
        : "M 113 65 Q 47 104 14 127 L 65 63 Z",
      "#688b8b",
    );
    path(
      c,
      high
        ? "M 122 65 Q 167 5 216 17 L 176 83 L 125 91 Z"
        : "M 123 65 Q 200 98 221 126 L 167 66 Z",
      "#87a09a",
    );
    ellipse(c, 120, 75, 30, 21, "#d3c29b");
    path(c, "M 134 65 L 147 30 Q 154 10 169 23 L 177 44 L 162 74", "#779795");
    path(c, "M 171 36 L 220 47 L 173 53 Z", "#dcb065");
    ellipse(c, 164, 31, 6, 8, "#fff8df", INK, 2);
    ellipse(c, 166, 31, 2, 3, INK, null);
    line(
      c,
      "M 111 92 L 112 119 L 103 124 M 135 92 L 139 117 L 130 124",
      INK,
      4,
    );
  });
}
export function branch() {
  return canvas(230, 270, (c) => {
    path(
      c,
      "M 186 265 L 178 116 L 44 126 L 19 115 L 39 94 L 172 88 L 161 10 L 201 10 L 213 265 Z",
      "#9d754d",
    );
    path(c, "M 79 108 L 65 69 L 84 61 L 103 103", "#9d754d");
    line(c, "M 187 245 L 187 152 M 49 104 L 138 103", "#624f39", 3);
    for (let i = 0; i < 7; i++)
      ellipse(
        c,
        30 + i * 29,
        28 + Math.sin(i * 2) * 15,
        36,
        24,
        i % 2 ? "#72925e" : "#91a766",
      );
  });
}
export function stalactite() {
  return canvas(200, 260, (c) => {
    path(
      c,
      "M 8 9 L 191 9 L 168 105 L 141 68 L 96 246 L 62 90 L 40 149 Z",
      "#748781",
    );
    path(c, "M 97 20 L 96 224 L 113 126 L 129 42", "#a9b6a0", null);
    line(c, "M 58 30 L 75 100 M 150 30 L 143 68", "#4a6464", 3);
  });
}
export function club() {
  return canvas(190, 250, (c) => {
    path(
      c,
      "M 62 149 L 45 216 L 21 222 L 26 232 L 72 229 L 80 179 L 96 224 L 131 227 L 144 220 L 111 210 L 114 149",
      "#ecb784",
    );
    path(c, "M 55 65 Q 16 106 35 170 L 136 171 Q 147 104 102 72 Z", "#464343");
    ellipse(c, 78, 54, 32, 36, "#f1bd8a");
    path(
      c,
      "M 46 53 Q 20 20 52 9 Q 91 -4 109 20 L 105 56 L 90 31 L 62 24 Z",
      "#3b3b36",
    );
    ellipse(c, 91, 47, 5, 7, "#fff8df");
    line(c, "M 90 47 L 91 49 M 81 71 Q 93 77 102 67", INK, 3);
    path(c, "M 51 91 L 17 68 L 19 56 L 58 72", "#efb888");
    path(c, "M 19 65 L 7 8 Q 19 -2 28 8 L 31 60 Z", "#966741");
  });
}
export function sweetheart() {
  return canvas(180, 260, (c) => {
    path(
      c,
      "M 71 170 L 66 224 L 47 232 L 52 241 L 82 239 L 88 186 L 96 230 L 115 240 L 135 238 L 121 227 L 113 167",
      "#f3ba89",
    );
    path(
      c,
      "M 68 84 L 48 184 L 71 173 L 88 186 L 107 172 L 124 181 L 111 84 Z",
      "#e7cb76",
    );
    ellipse(c, 88, 56, 28, 34, "#f3ba89");
    path(
      c,
      "M 56 74 Q 36 36 64 15 Q 102 -4 119 29 L 128 85 L 107 86 L 105 42 L 77 33 L 63 76 Z",
      "#bd834d",
    );
    ellipse(c, 95, 54, 5, 8, "#fffae9");
    ellipse(c, 97, 55, 2, 3, INK, null);
    line(c, "M 90 75 Q 99 80 106 72", INK, 2);
    path(
      c,
      "M 66 98 L 42 122 L 30 100 L 24 86 L 16 91 L 20 108 L 36 139 L 50 138 L 72 119",
      "#f3ba89",
    );
  });
}
export function sign(text) {
  return canvas(330, 190, (c) => {
    path(c, "M 144 74 L 143 188 L 164 188 L 167 68", "#927549");
    path(c, "M 15 15 L 285 8 L 319 47 L 285 87 L 18 97 Z", "#f6df9e");
    c.fillStyle = INK;
    c.font = "bold 25px Trebuchet MS";
    c.textAlign = "center";
    c.fillText(text, 151, 57);
    ellipse(c, 33, 37, 3, 3, INK, null);
    ellipse(c, 278, 34, 3, 3, INK, null);
  });
}
export function mountains(color = "#bdc7a0") {
  return canvas(1600, 430, (c) => {
    path(
      c,
      "M -60 425 L 134 237 L 260 296 L 461 51 L 521 44 L 748 309 L 920 182 L 1085 312 L 1355 104 L 1455 241 L 1690 171 L 1690 440 Z",
      color,
      "#637d6c",
      2,
    );
    path(
      c,
      "M 461 51 L 501 126 L 464 176 L 585 312 L 521 44 Z M 1355 104 L 1371 211 L 1316 248 L 1455 300 L 1455 241 Z",
      "#8fa78b",
      null,
    );
    path(
      c,
      "M 432 88 L 461 51 L 521 44 L 559 93 L 529 88 L 511 110 L 490 82 L 470 99 Z",
      "#f1e4bb",
      null,
    );
    line(c, "M 219 302 L 259 321 M 857 252 L 929 215 L 1000 291", "#7f9680", 2);
  });
}
export function ground(cave = false) {
  return canvas(1280, 200, (c) => {
    c.fillStyle = cave ? "#777969" : "#cbb77d";
    c.fillRect(0, 0, 1280, 200);
    path(
      c,
      "M 0 0 L 1280 0 L 1280 20 Q 1000 33 760 21 Q 520 44 320 21 Q 160 31 0 24 Z",
      cave ? "#a9ad8b" : "#a6af67",
      INK,
      3,
    );
    c.strokeStyle = cave ? "#9b9b7c" : "#b1a36e";
    c.lineWidth = 2;
    for (let i = 0; i < 100; i++) {
      const x = (i * 173) % 1280,
        y = 45 + ((i * 41) % 150);
      c.beginPath();
      c.moveTo(x, y);
      c.lineTo(x + 7, y - 2);
      c.stroke();
    }
    for (let i = 0; i < 17; i++) {
      const x = i * 79;
      line(c, `M ${x} 5 l 8 -10 l 1 12 l 12 -6`, "#64784a", 2);
    }
  });
}
export function speech(text) {
  return canvas(420, 125, (c) => {
    path(
      c,
      "M 20 10 Q 4 10 4 30 L 4 80 Q 4 99 22 99 L 75 99 L 58 121 L 102 99 L 397 99 Q 415 99 415 80 L 415 29 Q 414 10 396 10 Z",
      PAPER,
      INK,
      3,
    );
    c.font = "bold 25px Trebuchet MS";
    c.textAlign = "center";
    c.fillStyle = INK;
    c.fillText(text, 207, 63);
  });
}
export function burst(text) {
  return canvas(310, 150, (c) => {
    path(
      c,
      "M 12 80 L 38 62 L 18 26 L 79 41 L 96 8 L 135 32 L 172 4 L 191 34 L 252 12 L 244 46 L 302 57 L 272 83 L 299 122 L 242 113 L 219 143 L 172 117 L 132 146 L 111 117 L 48 137 L 52 108 Z",
      "#f4cb64",
      INK,
      3,
    );
    c.save();
    c.translate(150, 95);
    c.rotate(-0.08);
    c.font = "900 42px Trebuchet MS";
    c.textAlign = "center";
    c.fillStyle = INK;
    c.fillText(text, 0, 0);
    c.restore();
  });
}
export function volcano() {
  return canvas(760, 570, (c) => {
    for (let i = 0; i < 6; i++)
      ellipse(
        c,
        350 + Math.sin(i * 2) * 35,
        180 - i * 25,
        35 + i * 8,
        24 + i * 7,
        "#b7b098",
        null,
      );
    path(
      c,
      "M 22 556 L 202 359 L 314 217 L 413 224 L 503 359 L 745 556 Z",
      "#a98c70",
      "#69755f",
      3,
    );
    path(
      c,
      "M 314 217 L 344 291 L 322 363 L 386 408 L 406 519 L 459 556 L 475 556 L 430 490 L 423 380 L 373 339 L 377 281 L 413 224 Z",
      "#e29c53",
      null,
    );
    path(
      c,
      "M 310 216 Q 364 242 418 224 L 404 208 Q 353 193 310 216 Z",
      "#5c6555",
    );
    line(
      c,
      "M 230 370 L 281 343 L 269 395 M 519 417 L 474 406 L 501 447",
      "#796e59",
      3,
    );
  });
}
export function cave() {
  return canvas(1280, 530, (c) => {
    c.fillStyle = "#658b87";
    c.fillRect(0, 0, 1280, 530);
    for (let i = 0; i < 11; i++) {
      const x = i * 127;
      path(
        c,
        `M ${x - 50} 530 Q ${x + 15} 260 ${x + 27} ${150 + (i % 3) * 35} Q ${x + 60} 350 ${x + 89} 530 Z`,
        i % 2 ? "#7f9f93" : "#8fa79a",
        null,
      );
    }
    for (let i = 0; i < 8; i++) {
      const x = 60 + i * 173;
      path(
        c,
        `M ${x} 0 L ${x + 32} ${100 + (i % 3) * 33} L ${x + 56} 0`,
        "#486d6b",
        null,
      );
    }
    for (let i = 0; i < 50; i++)
      ellipse(
        c,
        (i * 179) % 1280,
        220 + ((i * 59) % 290),
        2,
        3,
        "#bfcb9d",
        null,
      );
  });
}
export function heart() {
  return canvas(90, 90, (c) =>
    path(
      c,
      "M 45 78 Q -2 47 10 22 Q 24 0 45 23 Q 67 0 82 22 Q 95 46 45 78 Z",
      "#cf7c66",
      INK,
      3,
    ),
  );
}
