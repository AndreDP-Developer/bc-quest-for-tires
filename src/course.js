const rock = (x) => ({ type: "rock", x, w: 52, h: 43 });
const log = (x) => ({ type: "log", x, w: 72, h: 42 });
const branch = (x) => ({ type: "branch", x, w: 100, bottom: 76, h: 160 });
const hole = (x, w = 100) => ({ type: "hole", x, w });
export const STAGES = [
  {
    name: "The rolling stones",
    tag: "SUNSTONE PLAINS",
    biome: "plains",
    length: 3600,
    hint: "SPACE / ↑ to jump. Clear the stones and mind the holes.",
    obstacles: [rock(900), rock(1390), hole(1910), rock(2400), rock(2880)],
  },
  {
    name: "Wood you believe it?",
    tag: "PETRIFIED FOREST",
    biome: "forest",
    length: 3400,
    hint: "Hold ↓ to duck under branches. Jump over fallen logs.",
    obstacles: [log(700), branch(1150), log(1650), branch(2140), log(2680)],
  },
  {
    name: "A shell of a crossing",
    tag: "TURTLE CREEK",
    biome: "river",
    length: 2200,
    hint: "Jump from shell to shell. Golden shells warn that a turtle is about to dive!",
    gaps: [{ x: 650, w: 820, type: "water" }],
    turtles: [730, 910, 1090, 1270, 1410],
    obstacles: [{ type: "club", x: 1620, w: 75, bottom: 75, h: 160 }],
  },
  {
    name: "Uphill from here",
    tag: "THE STONE RIDGE",
    biome: "ridge",
    length: 3200,
    hint: "A little uphill trouble. Jump the rocks and broken ground.",
    obstacles: [
      rock(730),
      hole(1230, 110),
      rock(1730),
      hole(2240, 125),
      rock(2770),
    ],
  },
  {
    name: "A little bird told me",
    tag: "DOOKY AIRWAYS",
    biome: "lava",
    length: 2600,
    hint: "Jump beneath Dooky Bird before the lava. He will carry you across.",
    gaps: [{ x: 1050, w: 780, type: "lava" }],
    bird: true,
    obstacles: [rock(520)],
  },
  {
    name: "One giant leap",
    tag: "THE GREAT DIVIDE",
    biome: "cliff",
    length: 2400,
    hint: "SHIFT + → to reach speed 75+. Jump at the edge of the ravine!",
    gaps: [{ x: 1200, w: 295, type: "cliff" }],
    obstacles: [rock(620)],
  },
  {
    name: "A rocky forecast",
    tag: "RUMBLE VOLCANO",
    biome: "volcano",
    length: 3300,
    hint: "Watch the shadows: falling boulders ahead. Keep rolling!",
    obstacles: [
      rock(680),
      { type: "falling", x: 1220, w: 58, h: 58 },
      { type: "falling", x: 1770, w: 58, h: 58 },
      hole(2220, 110),
      { type: "falling", x: 2740, w: 58, h: 58 },
    ],
  },
  {
    name: "Do not feed the dinosaur",
    tag: "DINOSAUR LAGOON",
    biome: "lagoon",
    length: 2400,
    hint: "Cross the turtles, then duck beneath the hungry dinosaur’s snout.",
    gaps: [{ x: 650, w: 820, type: "water" }],
    turtles: [730, 910, 1090, 1270, 1410],
    obstacles: [{ type: "dino", x: 1700, w: 190, bottom: 76, h: 180 }],
  },
  {
    name: "Love at first fright",
    tag: "THE LAST CAVE",
    biome: "cave",
    length: 3100,
    hint: "Duck beneath stalactites. Your stone-age sweetheart is just ahead!",
    obstacles: [
      { ...branch(650), type: "stalactite" },
      rock(1150),
      { ...branch(1690), type: "stalactite" },
      rock(2190),
      { ...branch(2620), type: "stalactite" },
    ],
  },
];
export function allGaps(stage) {
  return [
    ...(stage.gaps || []),
    ...stage.obstacles
      .filter((o) => o.type === "hole")
      .map((o) => ({ ...o, type: "hole" })),
  ];
}
export function turtleState(time, index) {
  const phase = (time + index * 0.49) % 5.2;
  return phase < 4.15 ? "up" : phase < 4.55 ? "warning" : "down";
}
export function birdPosition(s) {
  const gap = STAGES[s.stage].gaps?.[0];
  return {
    x: s.carry ? s.x : gap ? gap.x - 180 + Math.sin(s.time * 1.65) * 65 : 0,
    y: 213 + Math.sin(s.time * 2.4) * 14,
  };
}
export function fallingHeight(s, o) {
  const distance = o.x - s.x;
  return distance > 250 ? 370 : Math.max(0, 370 - (250 - distance) * 1.8);
}
