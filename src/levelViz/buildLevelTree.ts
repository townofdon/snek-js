import { Episode, Level } from "@/types";
import { NEXT_LEVEL_MAP, SECRET_LEVEL_MAP, SELECTABLE_LEVELS_EP_01, SELECTABLE_LEVELS_EP_02, SELECTABLE_LEVELS_EP_03 } from "@/levels/levelConstants";

export interface Node {
  id: string,
  name: string,
  prev: Node[],
  next: Node[],
  x: number,
  y: number,
}

const getProgressionFromEpisode = (episode: Episode): Level[] => {
  switch (episode) {
    case Episode.E1:
      return SELECTABLE_LEVELS_EP_01;
    case Episode.E2:
      return SELECTABLE_LEVELS_EP_02;
    case Episode.E3:
      return SELECTABLE_LEVELS_EP_03;
    case Episode.None:
    default:
      throw new Error(`Invalid episode: ${String(episode)}`);
  }
}

export function buildLevelTree(root: Level, episode: Episode): Node {
  const progression = getProgressionFromEpisode(episode);
  const seen: Record<string, Node> = {};
  const levelToNode = (level: Level, prev: Node, x: number, y: number) => {
    const current: Node = {
      id: level.id,
      name: level.name,
      prev: prev ? [prev] : [],
      next: [],
      x,
      y,
    } satisfies Node;
    seen[level.id] = current;
    let nextLevel = NEXT_LEVEL_MAP[level.id];

    const idx = progression.findIndex(progLevel => progLevel.id === level.id);
    if (!nextLevel && idx >= 0) {
      nextLevel = progression[idx + 1] || undefined;
    }

    if (nextLevel) {
      const nextstandardlevel = progression.indexOf(nextLevel) >= 0;
      if (seen[nextLevel.id]) {
        seen[nextLevel.id].prev.push(current);
        current.next.push(seen[nextLevel.id]);
      } else {
        current.next.push(levelToNode(nextLevel, current, nextstandardlevel ? 0 : x + 10, y + 10));
      }
    }
    let count = 0;
    if (SECRET_LEVEL_MAP[level.id]) {
      const links: Level[] = [];
      Object.keys(SECRET_LEVEL_MAP[level.id]).forEach((key) => {
        const link = SECRET_LEVEL_MAP[level.id][key];
        if (link) { links.push(link); }
      });
      dedupe(links).forEach((link, i) => {
        if (seen[link.id]) {
          seen[link.id].prev.push(current);
          current.next.push(seen[link.id]);
        } else {
          count++;
          current.next.push(levelToNode(link, current, x + 10, y + 2 + 2 * i));
        }
      });
    }
    if (level.nextLevelMap) {
      const links: Level[] = Object.keys(level.nextLevelMap).map(key => level.nextLevelMap[key]);
      dedupe(links).forEach((link, i) => {
        if (seen[link.id]) {
          seen[link.id].prev.push(current);
          current.next.push(seen[link.id]);
        } else {
          current.next.push(levelToNode(link, current, x + 10, y + 2 + 2 * (i + count)));
        }
      });
    }
    return current;
  };

  const node = levelToNode(root, null, 0, 0);
  return node;
}

const dedupe = (levels: Level[]) => {
  const seen : Record<string, boolean> = {};
  const uniq: Level[] = [];
  levels.filter(v => !!v).forEach(level => {
    if (seen[level.id]) return;
    uniq.push(level);
    seen[level.id] = true;
  });
  return uniq;
}
