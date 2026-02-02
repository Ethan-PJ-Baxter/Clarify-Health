/**
 * Single source of truth for all body regions (~45 granular regions).
 * Each region has an SVG path for 2D rendering and a parentRegion
 * for backward compatibility with the old coarse 18-region system.
 */

export interface BodyRegion {
  id: string;
  label: string;
  parentRegion: string;
  view: "front" | "back";
  path: string;
  center: { x: number; y: number };
}

/**
 * SVG coordinate system: viewBox="50 0 180 400"
 * Body is centered at x≈140, head top ≈15, feet ≈385.
 *
 * Front view (~32 regions) and Back view (~13 regions).
 */
export const BODY_REGIONS: BodyRegion[] = [
  // ── Head (front) ──────────────────────────────────────────────
  {
    id: "forehead",
    label: "Forehead",
    parentRegion: "head",
    view: "front",
    path: "M 125,18 C 130,13 150,13 155,18 L 158,32 C 158,34 122,34 122,32 Z",
    center: { x: 140, y: 24 },
  },
  {
    id: "left_temple",
    label: "Left Temple",
    parentRegion: "head",
    view: "front",
    path: "M 115,28 C 113,22 118,18 125,18 L 122,34 C 118,34 115,33 115,28 Z",
    center: { x: 119, y: 27 },
  },
  {
    id: "right_temple",
    label: "Right Temple",
    parentRegion: "head",
    view: "front",
    path: "M 155,18 C 162,18 167,22 165,28 C 165,33 162,34 158,34 L 155,18 Z",
    center: { x: 161, y: 27 },
  },
  {
    id: "left_jaw",
    label: "Left Jaw",
    parentRegion: "head",
    view: "front",
    path: "M 115,40 C 114,36 115,33 115,28 L 122,34 L 125,55 C 120,52 116,47 115,40 Z",
    center: { x: 119, y: 42 },
  },
  {
    id: "right_jaw",
    label: "Right Jaw",
    parentRegion: "head",
    view: "front",
    path: "M 165,28 C 165,33 166,36 165,40 C 164,47 160,52 155,55 L 158,34 L 165,28 Z",
    center: { x: 161, y: 42 },
  },
  {
    id: "face",
    label: "Face",
    parentRegion: "head",
    view: "front",
    path: "M 122,34 L 158,34 L 155,55 C 150,62 140,68 140,68 C 140,68 130,62 125,55 L 122,34 Z",
    center: { x: 140, y: 50 },
  },

  // ── Head (back) ───────────────────────────────────────────────
  {
    id: "crown",
    label: "Crown",
    parentRegion: "head",
    view: "back",
    path: "M 120,15 C 128,10 152,10 160,15 C 167,22 168,35 165,48 C 162,58 155,65 140,72 C 125,65 118,58 115,48 C 112,35 113,22 120,15 Z",
    center: { x: 140, y: 42 },
  },

  // ── Neck ──────────────────────────────────────────────────────
  {
    id: "front_neck",
    label: "Front of Neck",
    parentRegion: "neck",
    view: "front",
    path: "M 130,72 L 150,72 L 150,98 L 130,98 Z",
    center: { x: 140, y: 85 },
  },
  {
    id: "back_neck",
    label: "Back of Neck",
    parentRegion: "neck",
    view: "back",
    path: "M 130,72 L 150,72 L 150,98 L 130,98 Z",
    center: { x: 140, y: 85 },
  },

  // ── Chest (front) ────────────────────────────────────────────
  {
    id: "upper_chest",
    label: "Upper Chest",
    parentRegion: "chest",
    view: "front",
    path: "M 110,100 L 170,100 L 170,125 L 110,125 Z",
    center: { x: 140, y: 112 },
  },
  {
    id: "left_chest",
    label: "Left Chest",
    parentRegion: "chest",
    view: "front",
    path: "M 110,125 L 140,125 L 140,155 L 108,155 Z",
    center: { x: 124, y: 140 },
  },
  {
    id: "right_chest",
    label: "Right Chest",
    parentRegion: "chest",
    view: "front",
    path: "M 140,125 L 170,125 L 172,155 L 140,155 Z",
    center: { x: 156, y: 140 },
  },
  {
    id: "sternum",
    label: "Sternum",
    parentRegion: "chest",
    view: "front",
    path: "M 135,105 L 145,105 L 145,155 L 135,155 Z",
    center: { x: 140, y: 130 },
  },
  {
    id: "lower_chest",
    label: "Lower Chest",
    parentRegion: "chest",
    view: "front",
    path: "M 108,155 L 172,155 L 170,165 L 110,165 Z",
    center: { x: 140, y: 160 },
  },

  // ── Abdomen (front) ──────────────────────────────────────────
  {
    id: "epigastric",
    label: "Epigastric",
    parentRegion: "abdomen",
    view: "front",
    path: "M 120,165 L 160,165 L 158,182 L 122,182 Z",
    center: { x: 140, y: 173 },
  },
  {
    id: "upper_abdomen_left",
    label: "Upper Left Abdomen",
    parentRegion: "abdomen",
    view: "front",
    path: "M 108,165 L 122,165 L 122,195 L 107,195 Z",
    center: { x: 115, y: 180 },
  },
  {
    id: "upper_abdomen_right",
    label: "Upper Right Abdomen",
    parentRegion: "abdomen",
    view: "front",
    path: "M 158,165 L 172,165 L 173,195 L 158,195 Z",
    center: { x: 165, y: 180 },
  },
  {
    id: "umbilical",
    label: "Umbilical",
    parentRegion: "abdomen",
    view: "front",
    path: "M 122,182 L 158,182 L 158,205 L 122,205 Z",
    center: { x: 140, y: 193 },
  },
  {
    id: "lower_abdomen_left",
    label: "Lower Left Abdomen",
    parentRegion: "abdomen",
    view: "front",
    path: "M 107,195 L 122,195 L 122,215 L 110,215 Z",
    center: { x: 115, y: 205 },
  },
  {
    id: "lower_abdomen_right",
    label: "Lower Right Abdomen",
    parentRegion: "abdomen",
    view: "front",
    path: "M 158,195 L 173,195 L 170,215 L 158,215 Z",
    center: { x: 165, y: 205 },
  },
  {
    id: "suprapubic",
    label: "Suprapubic",
    parentRegion: "abdomen",
    view: "front",
    path: "M 122,205 L 158,205 L 155,220 L 125,220 Z",
    center: { x: 140, y: 212 },
  },

  // ── Shoulders (front) ────────────────────────────────────────
  {
    id: "left_shoulder_front",
    label: "Left Shoulder",
    parentRegion: "left_shoulder",
    view: "front",
    path: "M 85,102 L 110,100 L 110,122 L 95,125 Z",
    center: { x: 98, y: 112 },
  },
  {
    id: "right_shoulder_front",
    label: "Right Shoulder",
    parentRegion: "right_shoulder",
    view: "front",
    path: "M 170,100 L 195,102 L 185,125 L 170,122 Z",
    center: { x: 182, y: 112 },
  },

  // ── Arms (front) ─────────────────────────────────────────────
  {
    id: "left_upper_arm",
    label: "Left Upper Arm",
    parentRegion: "left_arm",
    view: "front",
    path: "M 82,125 L 100,122 L 97,165 L 80,165 Z",
    center: { x: 90, y: 143 },
  },
  {
    id: "left_elbow",
    label: "Left Elbow",
    parentRegion: "left_arm",
    view: "front",
    path: "M 80,165 L 97,165 L 95,185 L 78,185 Z",
    center: { x: 88, y: 175 },
  },
  {
    id: "left_forearm",
    label: "Left Forearm",
    parentRegion: "left_arm",
    view: "front",
    path: "M 78,185 L 95,185 L 92,210 L 76,210 Z",
    center: { x: 85, y: 197 },
  },
  {
    id: "right_upper_arm",
    label: "Right Upper Arm",
    parentRegion: "right_arm",
    view: "front",
    path: "M 180,122 L 198,125 L 200,165 L 183,165 Z",
    center: { x: 190, y: 143 },
  },
  {
    id: "right_elbow",
    label: "Right Elbow",
    parentRegion: "right_arm",
    view: "front",
    path: "M 183,165 L 200,165 L 202,185 L 185,185 Z",
    center: { x: 192, y: 175 },
  },
  {
    id: "right_forearm",
    label: "Right Forearm",
    parentRegion: "right_arm",
    view: "front",
    path: "M 185,185 L 202,185 L 204,210 L 188,210 Z",
    center: { x: 195, y: 197 },
  },

  // ── Hands (front) ────────────────────────────────────────────
  {
    id: "left_wrist",
    label: "Left Wrist",
    parentRegion: "left_hand",
    view: "front",
    path: "M 74,210 L 92,210 L 90,222 L 72,222 Z",
    center: { x: 82, y: 216 },
  },
  {
    id: "left_palm",
    label: "Left Palm",
    parentRegion: "left_hand",
    view: "front",
    path: "M 72,222 L 90,222 L 88,240 L 65,240 Z",
    center: { x: 78, y: 231 },
  },
  {
    id: "right_wrist",
    label: "Right Wrist",
    parentRegion: "right_hand",
    view: "front",
    path: "M 188,210 L 206,210 L 208,222 L 190,222 Z",
    center: { x: 198, y: 216 },
  },
  {
    id: "right_palm",
    label: "Right Palm",
    parentRegion: "right_hand",
    view: "front",
    path: "M 190,222 L 208,222 L 215,240 L 192,240 Z",
    center: { x: 202, y: 231 },
  },

  // ── Hands (back) ─────────────────────────────────────────────
  {
    id: "left_back_of_hand",
    label: "Left Back of Hand",
    parentRegion: "left_hand",
    view: "back",
    path: "M 72,222 L 90,222 L 88,240 L 65,240 Z",
    center: { x: 78, y: 231 },
  },
  {
    id: "right_back_of_hand",
    label: "Right Back of Hand",
    parentRegion: "right_hand",
    view: "back",
    path: "M 190,222 L 208,222 L 215,240 L 192,240 Z",
    center: { x: 202, y: 231 },
  },

  // ── Hips (front) ─────────────────────────────────────────────
  {
    id: "left_hip_joint",
    label: "Left Hip Joint",
    parentRegion: "left_hip",
    view: "front",
    path: "M 108,218 L 125,218 L 122,240 L 108,240 Z",
    center: { x: 116, y: 229 },
  },
  {
    id: "left_groin",
    label: "Left Groin",
    parentRegion: "left_hip",
    view: "front",
    path: "M 125,218 L 140,218 L 138,240 L 122,240 Z",
    center: { x: 131, y: 229 },
  },
  {
    id: "right_hip_joint",
    label: "Right Hip Joint",
    parentRegion: "right_hip",
    view: "front",
    path: "M 155,218 L 172,218 L 172,240 L 158,240 Z",
    center: { x: 164, y: 229 },
  },
  {
    id: "right_groin",
    label: "Right Groin",
    parentRegion: "right_hip",
    view: "front",
    path: "M 140,218 L 155,218 L 158,240 L 138,240 Z",
    center: { x: 149, y: 229 },
  },

  // ── Legs (front) ─────────────────────────────────────────────
  {
    id: "left_thigh",
    label: "Left Thigh",
    parentRegion: "left_leg",
    view: "front",
    path: "M 108,240 L 138,240 L 134,300 L 112,300 Z",
    center: { x: 123, y: 270 },
  },
  {
    id: "left_knee",
    label: "Left Knee",
    parentRegion: "left_leg",
    view: "front",
    path: "M 112,300 L 134,300 L 132,325 L 114,325 Z",
    center: { x: 123, y: 312 },
  },
  {
    id: "left_shin",
    label: "Left Shin",
    parentRegion: "left_leg",
    view: "front",
    path: "M 114,325 L 132,325 L 130,362 L 110,362 Z",
    center: { x: 122, y: 343 },
  },
  {
    id: "right_thigh",
    label: "Right Thigh",
    parentRegion: "right_leg",
    view: "front",
    path: "M 142,240 L 172,240 L 168,300 L 146,300 Z",
    center: { x: 157, y: 270 },
  },
  {
    id: "right_knee",
    label: "Right Knee",
    parentRegion: "right_leg",
    view: "front",
    path: "M 146,300 L 168,300 L 166,325 L 148,325 Z",
    center: { x: 157, y: 312 },
  },
  {
    id: "right_shin",
    label: "Right Shin",
    parentRegion: "right_leg",
    view: "front",
    path: "M 148,325 L 166,325 L 170,362 L 150,362 Z",
    center: { x: 158, y: 343 },
  },

  // ── Feet (front) ─────────────────────────────────────────────
  {
    id: "left_ankle",
    label: "Left Ankle",
    parentRegion: "left_foot",
    view: "front",
    path: "M 110,362 L 130,362 L 130,375 L 108,375 Z",
    center: { x: 120, y: 368 },
  },
  {
    id: "left_top_of_foot",
    label: "Left Top of Foot",
    parentRegion: "left_foot",
    view: "front",
    path: "M 108,375 L 130,375 L 132,390 L 100,390 Z",
    center: { x: 116, y: 382 },
  },
  {
    id: "right_ankle",
    label: "Right Ankle",
    parentRegion: "right_foot",
    view: "front",
    path: "M 150,362 L 170,362 L 172,375 L 150,375 Z",
    center: { x: 160, y: 368 },
  },
  {
    id: "right_top_of_foot",
    label: "Right Top of Foot",
    parentRegion: "right_foot",
    view: "front",
    path: "M 150,375 L 172,375 L 180,390 L 148,390 Z",
    center: { x: 164, y: 382 },
  },

  // ── Upper Back ────────────────────────────────────────────────
  {
    id: "left_upper_back",
    label: "Left Upper Back",
    parentRegion: "upper_back",
    view: "back",
    path: "M 110,100 L 138,100 L 138,145 L 108,145 Z",
    center: { x: 124, y: 122 },
  },
  {
    id: "right_upper_back",
    label: "Right Upper Back",
    parentRegion: "upper_back",
    view: "back",
    path: "M 142,100 L 170,100 L 172,145 L 142,145 Z",
    center: { x: 156, y: 122 },
  },
  {
    id: "spine_thoracic",
    label: "Thoracic Spine",
    parentRegion: "upper_back",
    view: "back",
    path: "M 136,100 L 144,100 L 144,165 L 136,165 Z",
    center: { x: 140, y: 132 },
  },

  // ── Lower Back ────────────────────────────────────────────────
  {
    id: "left_lower_back",
    label: "Left Lower Back",
    parentRegion: "lower_back",
    view: "back",
    path: "M 108,165 L 138,165 L 138,205 L 107,205 Z",
    center: { x: 122, y: 185 },
  },
  {
    id: "right_lower_back",
    label: "Right Lower Back",
    parentRegion: "lower_back",
    view: "back",
    path: "M 142,165 L 172,165 L 173,205 L 142,205 Z",
    center: { x: 158, y: 185 },
  },
  {
    id: "spine_lumbar",
    label: "Lumbar Spine",
    parentRegion: "lower_back",
    view: "back",
    path: "M 136,165 L 144,165 L 144,205 L 136,205 Z",
    center: { x: 140, y: 185 },
  },
  {
    id: "sacrum",
    label: "Sacrum",
    parentRegion: "lower_back",
    view: "back",
    path: "M 130,205 L 150,205 L 148,222 L 132,222 Z",
    center: { x: 140, y: 213 },
  },

  // ── Buttocks (back) ──────────────────────────────────────────
  {
    id: "left_buttock",
    label: "Left Buttock",
    parentRegion: "left_hip",
    view: "back",
    path: "M 108,218 L 138,218 L 138,248 L 108,248 Z",
    center: { x: 123, y: 233 },
  },
  {
    id: "right_buttock",
    label: "Right Buttock",
    parentRegion: "right_hip",
    view: "back",
    path: "M 142,218 L 172,218 L 172,248 L 142,248 Z",
    center: { x: 157, y: 233 },
  },

  // ── Calves (back) ────────────────────────────────────────────
  {
    id: "left_calf",
    label: "Left Calf",
    parentRegion: "left_leg",
    view: "back",
    path: "M 112,300 L 134,300 L 130,362 L 110,362 Z",
    center: { x: 122, y: 330 },
  },
  {
    id: "right_calf",
    label: "Right Calf",
    parentRegion: "right_leg",
    view: "back",
    path: "M 146,300 L 168,300 L 170,362 L 150,362 Z",
    center: { x: 158, y: 330 },
  },

  // ── Heels / Soles (back) ─────────────────────────────────────
  {
    id: "left_heel",
    label: "Left Heel",
    parentRegion: "left_foot",
    view: "back",
    path: "M 110,362 L 130,362 L 130,378 L 108,378 Z",
    center: { x: 120, y: 370 },
  },
  {
    id: "left_sole",
    label: "Left Sole",
    parentRegion: "left_foot",
    view: "back",
    path: "M 108,378 L 130,378 L 132,390 L 100,390 Z",
    center: { x: 116, y: 384 },
  },
  {
    id: "right_heel",
    label: "Right Heel",
    parentRegion: "right_foot",
    view: "back",
    path: "M 150,362 L 170,362 L 172,378 L 150,378 Z",
    center: { x: 160, y: 370 },
  },
  {
    id: "right_sole",
    label: "Right Sole",
    parentRegion: "right_foot",
    view: "back",
    path: "M 150,378 L 172,378 L 180,390 L 148,390 Z",
    center: { x: 164, y: 384 },
  },

  // ── Back-view legs (thigh/knee reuse same position) ──────────
  {
    id: "left_thigh_back",
    label: "Left Thigh (Back)",
    parentRegion: "left_leg",
    view: "back",
    path: "M 108,248 L 138,248 L 134,300 L 112,300 Z",
    center: { x: 123, y: 274 },
  },
  {
    id: "left_knee_back",
    label: "Left Knee (Back)",
    parentRegion: "left_leg",
    view: "back",
    path: "M 112,300 L 134,300 L 132,325 L 114,325 Z",
    center: { x: 123, y: 312 },
  },
  {
    id: "right_thigh_back",
    label: "Right Thigh (Back)",
    parentRegion: "right_leg",
    view: "back",
    path: "M 142,248 L 172,248 L 168,300 L 146,300 Z",
    center: { x: 157, y: 274 },
  },
  {
    id: "right_knee_back",
    label: "Right Knee (Back)",
    parentRegion: "right_leg",
    view: "back",
    path: "M 146,300 L 168,300 L 166,325 L 148,325 Z",
    center: { x: 157, y: 312 },
  },

  // ── Back-view arms (mirror front) ────────────────────────────
  {
    id: "left_shoulder_back",
    label: "Left Shoulder (Back)",
    parentRegion: "left_shoulder",
    view: "back",
    path: "M 85,102 L 110,100 L 110,122 L 95,125 Z",
    center: { x: 98, y: 112 },
  },
  {
    id: "right_shoulder_back",
    label: "Right Shoulder (Back)",
    parentRegion: "right_shoulder",
    view: "back",
    path: "M 170,100 L 195,102 L 185,125 L 170,122 Z",
    center: { x: 182, y: 112 },
  },
  {
    id: "left_upper_arm_back",
    label: "Left Upper Arm (Back)",
    parentRegion: "left_arm",
    view: "back",
    path: "M 82,125 L 100,122 L 97,165 L 80,165 Z",
    center: { x: 90, y: 143 },
  },
  {
    id: "left_elbow_back",
    label: "Left Elbow (Back)",
    parentRegion: "left_arm",
    view: "back",
    path: "M 80,165 L 97,165 L 95,185 L 78,185 Z",
    center: { x: 88, y: 175 },
  },
  {
    id: "left_forearm_back",
    label: "Left Forearm (Back)",
    parentRegion: "left_arm",
    view: "back",
    path: "M 78,185 L 95,185 L 92,210 L 76,210 Z",
    center: { x: 85, y: 197 },
  },
  {
    id: "right_upper_arm_back",
    label: "Right Upper Arm (Back)",
    parentRegion: "right_arm",
    view: "back",
    path: "M 180,122 L 198,125 L 200,165 L 183,165 Z",
    center: { x: 190, y: 143 },
  },
  {
    id: "right_elbow_back",
    label: "Right Elbow (Back)",
    parentRegion: "right_arm",
    view: "back",
    path: "M 183,165 L 200,165 L 202,185 L 185,185 Z",
    center: { x: 192, y: 175 },
  },
  {
    id: "right_forearm_back",
    label: "Right Forearm (Back)",
    parentRegion: "right_arm",
    view: "back",
    path: "M 185,185 L 202,185 L 204,210 L 188,210 Z",
    center: { x: 195, y: 197 },
  },
  {
    id: "left_wrist_back",
    label: "Left Wrist (Back)",
    parentRegion: "left_hand",
    view: "back",
    path: "M 74,210 L 92,210 L 90,222 L 72,222 Z",
    center: { x: 82, y: 216 },
  },
  {
    id: "right_wrist_back",
    label: "Right Wrist (Back)",
    parentRegion: "right_hand",
    view: "back",
    path: "M 188,210 L 206,210 L 208,222 L 190,222 Z",
    center: { x: 198, y: 216 },
  },
];

// ── Utility functions ─────────────────────────────────────────────

const regionById = new Map<string, BodyRegion>();
const regionsByParent = new Map<string, BodyRegion[]>();

for (const r of BODY_REGIONS) {
  regionById.set(r.id, r);
  const list = regionsByParent.get(r.parentRegion);
  if (list) {
    list.push(r);
  } else {
    regionsByParent.set(r.parentRegion, [r]);
  }
}

/** Get the display label for any region ID (granular or legacy). */
export function getBodyPartLabel(id: string): string {
  const region = regionById.get(id);
  if (region) return region.label;
  // Fallback: check if it's a legacy parent region
  const children = regionsByParent.get(id);
  if (children && children.length > 0) {
    return id
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  }
  return id;
}

/** Get all sub-regions for a legacy parent region ID. */
export function getSubRegions(parentId: string): BodyRegion[] {
  return regionsByParent.get(parentId) ?? [];
}

/** Get the parent region ID. If already a parent ID, returns itself. */
export function getParentRegionId(regionId: string): string {
  const region = regionById.get(regionId);
  return region?.parentRegion ?? regionId;
}

/** Get all regions for a given view. */
export function getRegionsForView(view: "front" | "back"): BodyRegion[] {
  return BODY_REGIONS.filter((r) => r.view === view);
}

/** All unique parent region IDs (legacy compatibility). */
export const PARENT_REGION_IDS = [
  ...new Set(BODY_REGIONS.map((r) => r.parentRegion)),
];
