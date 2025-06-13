export interface Formation {
  name: string
  category: string
  positions: {
    position: string
    x: number
    y: number
    label: string
  }[]
}

export const formations: Formation[] = [
  // Community & Pro-Recommended Formations (Most Popular)
  {
    name: "4-2-3-1 Wide",
    category: "Community Favorite",
    positions: [
      { position: "GK", x: 50, y: 90, label: "GK" },
      { position: "RB", x: 85, y: 70, label: "RB" },
      { position: "CB", x: 60, y: 70, label: "CB" },
      { position: "CB", x: 40, y: 70, label: "CB" },
      { position: "LB", x: 15, y: 70, label: "LB" },
      { position: "CDM", x: 60, y: 55, label: "CDM" },
      { position: "CDM", x: 40, y: 55, label: "CDM" },
      { position: "RW", x: 85, y: 30, label: "RW" },
      { position: "CAM", x: 50, y: 30, label: "CAM" },
      { position: "LW", x: 15, y: 30, label: "LW" },
      { position: "ST", x: 50, y: 15, label: "ST" },
    ]
  },
  {
    name: "4-4-2 Flat",
    category: "Community Favorite",
    positions: [
      { position: "GK", x: 50, y: 90, label: "GK" },
      { position: "RB", x: 80, y: 70, label: "RB" },
      { position: "CB", x: 60, y: 70, label: "CB" },
      { position: "CB", x: 40, y: 70, label: "CB" },
      { position: "LB", x: 20, y: 70, label: "LB" },
      { position: "RM", x: 80, y: 50, label: "RM" },
      { position: "CM", x: 60, y: 50, label: "CM" },
      { position: "CM", x: 40, y: 50, label: "CM" },
      { position: "LM", x: 20, y: 50, label: "LM" },
      { position: "ST", x: 60, y: 20, label: "ST" },
      { position: "ST", x: 40, y: 20, label: "ST" },
    ]
  },
  {
    name: "4-5-1 Flat",
    category: "Community Favorite",
    positions: [
      { position: "GK", x: 50, y: 90, label: "GK" },
      { position: "RB", x: 80, y: 70, label: "RB" },
      { position: "CB", x: 60, y: 70, label: "CB" },
      { position: "CB", x: 40, y: 70, label: "CB" },
      { position: "LB", x: 20, y: 70, label: "LB" },
      { position: "RM", x: 85, y: 50, label: "RM" },
      { position: "CM", x: 65, y: 50, label: "CM" },
      { position: "CM", x: 50, y: 50, label: "CM" },
      { position: "CM", x: 35, y: 50, label: "CM" },
      { position: "LM", x: 15, y: 50, label: "LM" },
      { position: "ST", x: 50, y: 15, label: "ST" },
    ]
  },
  {
    name: "5-2-1-2",
    category: "Community Favorite",
    positions: [
      { position: "GK", x: 50, y: 90, label: "GK" },
      { position: "RWB", x: 85, y: 65, label: "RWB" },
      { position: "CB", x: 70, y: 75, label: "CB" },
      { position: "CB", x: 50, y: 75, label: "CB" },
      { position: "CB", x: 30, y: 75, label: "CB" },
      { position: "LWB", x: 15, y: 65, label: "LWB" },
      { position: "CM", x: 60, y: 45, label: "CM" },
      { position: "CM", x: 40, y: 45, label: "CM" },
      { position: "CAM", x: 50, y: 25, label: "CAM" },
      { position: "ST", x: 60, y: 15, label: "ST" },
      { position: "ST", x: 40, y: 15, label: "ST" },
    ]
  },

  // Defensive & Balanced Formations
  {
    name: "4-1-4-1",
    category: "Defensive",
    positions: [
      { position: "GK", x: 50, y: 90, label: "GK" },
      { position: "RB", x: 80, y: 70, label: "RB" },
      { position: "CB", x: 60, y: 70, label: "CB" },
      { position: "CB", x: 40, y: 70, label: "CB" },
      { position: "LB", x: 20, y: 70, label: "LB" },
      { position: "CDM", x: 50, y: 55, label: "CDM" },
      { position: "RM", x: 80, y: 40, label: "RM" },
      { position: "CM", x: 60, y: 40, label: "CM" },
      { position: "CM", x: 40, y: 40, label: "CM" },
      { position: "LM", x: 20, y: 40, label: "LM" },
      { position: "ST", x: 50, y: 15, label: "ST" },
    ]
  },
  {
    name: "4-2-3-1",
    category: "Balanced",
    positions: [
      { position: "GK", x: 50, y: 90, label: "GK" },
      { position: "RB", x: 80, y: 70, label: "RB" },
      { position: "CB", x: 60, y: 70, label: "CB" },
      { position: "CB", x: 40, y: 70, label: "CB" },
      { position: "LB", x: 20, y: 70, label: "LB" },
      { position: "CDM", x: 60, y: 55, label: "CDM" },
      { position: "CDM", x: 40, y: 55, label: "CDM" },
      { position: "RW", x: 75, y: 30, label: "RW" },
      { position: "CAM", x: 50, y: 30, label: "CAM" },
      { position: "LW", x: 25, y: 30, label: "LW" },
      { position: "ST", x: 50, y: 15, label: "ST" },
    ]
  },
  {
    name: "4-4-1-1 Midfield",
    category: "Balanced",
    positions: [
      { position: "GK", x: 50, y: 90, label: "GK" },
      { position: "RB", x: 80, y: 70, label: "RB" },
      { position: "CB", x: 60, y: 70, label: "CB" },
      { position: "CB", x: 40, y: 70, label: "CB" },
      { position: "LB", x: 20, y: 70, label: "LB" },
      { position: "RM", x: 80, y: 45, label: "RM" },
      { position: "CM", x: 60, y: 45, label: "CM" },
      { position: "CM", x: 40, y: 45, label: "CM" },
      { position: "LM", x: 20, y: 45, label: "LM" },
      { position: "CF", x: 50, y: 25, label: "CF" },
      { position: "ST", x: 50, y: 15, label: "ST" },
    ]
  },
  {
    name: "4-5-1",
    category: "Defensive",
    positions: [
      { position: "GK", x: 50, y: 90, label: "GK" },
      { position: "RB", x: 80, y: 70, label: "RB" },
      { position: "CB", x: 60, y: 70, label: "CB" },
      { position: "CB", x: 40, y: 70, label: "CB" },
      { position: "LB", x: 20, y: 70, label: "LB" },
      { position: "RM", x: 85, y: 45, label: "RM" },
      { position: "CM", x: 65, y: 45, label: "CM" },
      { position: "CM", x: 50, y: 45, label: "CM" },
      { position: "CM", x: 35, y: 45, label: "CM" },
      { position: "LM", x: 15, y: 45, label: "LM" },
      { position: "ST", x: 50, y: 15, label: "ST" },
    ]
  },
  {
    name: "5-1-2-2",
    category: "Defensive",
    positions: [
      { position: "GK", x: 50, y: 90, label: "GK" },
      { position: "RWB", x: 85, y: 70, label: "RWB" },
      { position: "CB", x: 70, y: 75, label: "CB" },
      { position: "CB", x: 50, y: 75, label: "CB" },
      { position: "CB", x: 30, y: 75, label: "CB" },
      { position: "LWB", x: 15, y: 70, label: "LWB" },
      { position: "CDM", x: 50, y: 55, label: "CDM" },
      { position: "CM", x: 65, y: 35, label: "CM" },
      { position: "CM", x: 35, y: 35, label: "CM" },
      { position: "ST", x: 60, y: 15, label: "ST" },
      { position: "ST", x: 40, y: 15, label: "ST" },
    ]
  },

  // Attacking & Possession-Based Formations
  {
    name: "4-1-2-1-2 Narrow",
    category: "Attacking",
    positions: [
      { position: "GK", x: 50, y: 90, label: "GK" },
      { position: "RB", x: 80, y: 70, label: "RB" },
      { position: "CB", x: 60, y: 70, label: "CB" },
      { position: "CB", x: 40, y: 70, label: "CB" },
      { position: "LB", x: 20, y: 70, label: "LB" },
      { position: "CDM", x: 50, y: 55, label: "CDM" },
      { position: "CM", x: 60, y: 40, label: "CM" },
      { position: "CM", x: 40, y: 40, label: "CM" },
      { position: "CAM", x: 50, y: 25, label: "CAM" },
      { position: "ST", x: 60, y: 15, label: "ST" },
      { position: "ST", x: 40, y: 15, label: "ST" },
    ]
  },
  {
    name: "4-1-2-1-2 Wide",
    category: "Attacking",
    positions: [
      { position: "GK", x: 50, y: 90, label: "GK" },
      { position: "RB", x: 85, y: 70, label: "RB" },
      { position: "CB", x: 60, y: 70, label: "CB" },
      { position: "CB", x: 40, y: 70, label: "CB" },
      { position: "LB", x: 15, y: 70, label: "LB" },
      { position: "CDM", x: 50, y: 55, label: "CDM" },
      { position: "CM", x: 70, y: 40, label: "CM" },
      { position: "CM", x: 30, y: 40, label: "CM" },
      { position: "CAM", x: 50, y: 25, label: "CAM" },
      { position: "ST", x: 60, y: 15, label: "ST" },
      { position: "ST", x: 40, y: 15, label: "ST" },
    ]
  },
  {
    name: "4-2-2-2",
    category: "Attacking",
    positions: [
      { position: "GK", x: 50, y: 90, label: "GK" },
      { position: "RB", x: 80, y: 70, label: "RB" },
      { position: "CB", x: 60, y: 70, label: "CB" },
      { position: "CB", x: 40, y: 70, label: "CB" },
      { position: "LB", x: 20, y: 70, label: "LB" },
      { position: "CDM", x: 60, y: 55, label: "CDM" },
      { position: "CDM", x: 40, y: 55, label: "CDM" },
      { position: "CAM", x: 65, y: 30, label: "CAM" },
      { position: "CAM", x: 35, y: 30, label: "CAM" },
      { position: "ST", x: 60, y: 15, label: "ST" },
      { position: "ST", x: 40, y: 15, label: "ST" },
    ]
  },
  {
    name: "4-2-4",
    category: "Attacking",
    positions: [
      { position: "GK", x: 50, y: 90, label: "GK" },
      { position: "RB", x: 80, y: 70, label: "RB" },
      { position: "CB", x: 60, y: 70, label: "CB" },
      { position: "CB", x: 40, y: 70, label: "CB" },
      { position: "LB", x: 20, y: 70, label: "LB" },
      { position: "CDM", x: 60, y: 55, label: "CDM" },
      { position: "CDM", x: 40, y: 55, label: "CDM" },
      { position: "RW", x: 80, y: 25, label: "RW" },
      { position: "ST", x: 60, y: 15, label: "ST" },
      { position: "ST", x: 40, y: 15, label: "ST" },
      { position: "LW", x: 20, y: 25, label: "LW" },
    ]
  },
  {
    name: "4-3-3",
    category: "Attacking",
    positions: [
      { position: "GK", x: 50, y: 90, label: "GK" },
      { position: "RB", x: 80, y: 70, label: "RB" },
      { position: "CB", x: 60, y: 70, label: "CB" },
      { position: "CB", x: 40, y: 70, label: "CB" },
      { position: "LB", x: 20, y: 70, label: "LB" },
      { position: "CM", x: 65, y: 45, label: "CM" },
      { position: "CM", x: 50, y: 40, label: "CM" },
      { position: "CM", x: 35, y: 45, label: "CM" },
      { position: "RW", x: 75, y: 20, label: "RW" },
      { position: "ST", x: 50, y: 15, label: "ST" },
      { position: "LW", x: 25, y: 20, label: "LW" },
    ]
  },
  {
    name: "4-3-3 Holding",
    category: "Balanced",
    positions: [
      { position: "GK", x: 50, y: 90, label: "GK" },
      { position: "RB", x: 80, y: 70, label: "RB" },
      { position: "CB", x: 60, y: 70, label: "CB" },
      { position: "CB", x: 40, y: 70, label: "CB" },
      { position: "LB", x: 20, y: 70, label: "LB" },
      { position: "CDM", x: 50, y: 55, label: "CDM" },
      { position: "CM", x: 65, y: 40, label: "CM" },
      { position: "CM", x: 35, y: 40, label: "CM" },
      { position: "RW", x: 75, y: 20, label: "RW" },
      { position: "ST", x: 50, y: 15, label: "ST" },
      { position: "LW", x: 25, y: 20, label: "LW" },
    ]
  },
  {
    name: "4-3-3 Attack",
    category: "Attacking",
    positions: [
      { position: "GK", x: 50, y: 90, label: "GK" },
      { position: "RB", x: 80, y: 70, label: "RB" },
      { position: "CB", x: 60, y: 70, label: "CB" },
      { position: "CB", x: 40, y: 70, label: "CB" },
      { position: "LB", x: 20, y: 70, label: "LB" },
      { position: "CM", x: 60, y: 50, label: "CM" },
      { position: "CM", x: 40, y: 50, label: "CM" },
      { position: "CAM", x: 50, y: 30, label: "CAM" },
      { position: "RW", x: 75, y: 20, label: "RW" },
      { position: "ST", x: 50, y: 15, label: "ST" },
      { position: "LW", x: 25, y: 20, label: "LW" },
    ]
  },
  {
    name: "4-3-3 False 9",
    category: "Attacking",
    positions: [
      { position: "GK", x: 50, y: 90, label: "GK" },
      { position: "RB", x: 80, y: 70, label: "RB" },
      { position: "CB", x: 60, y: 70, label: "CB" },
      { position: "CB", x: 40, y: 70, label: "CB" },
      { position: "LB", x: 20, y: 70, label: "LB" },
      { position: "CM", x: 65, y: 45, label: "CM" },
      { position: "CM", x: 50, y: 40, label: "CM" },
      { position: "CM", x: 35, y: 45, label: "CM" },
      { position: "RW", x: 75, y: 20, label: "RW" },
      { position: "CF", x: 50, y: 25, label: "CF" },
      { position: "LW", x: 25, y: 20, label: "LW" },
    ]
  },
  {
    name: "4-3-3 Flat",
    category: "Balanced",
    positions: [
      { position: "GK", x: 50, y: 90, label: "GK" },
      { position: "RB", x: 80, y: 70, label: "RB" },
      { position: "CB", x: 60, y: 70, label: "CB" },
      { position: "CB", x: 40, y: 70, label: "CB" },
      { position: "LB", x: 20, y: 70, label: "LB" },
      { position: "CM", x: 65, y: 50, label: "CM" },
      { position: "CM", x: 50, y: 50, label: "CM" },
      { position: "CM", x: 35, y: 50, label: "CM" },
      { position: "RW", x: 75, y: 20, label: "RW" },
      { position: "ST", x: 50, y: 15, label: "ST" },
      { position: "LW", x: 25, y: 20, label: "LW" },
    ]
  },
  {
    name: "4-3-2-1",
    category: "Attacking",
    positions: [
      { position: "GK", x: 50, y: 90, label: "GK" },
      { position: "RB", x: 80, y: 70, label: "RB" },
      { position: "CB", x: 60, y: 70, label: "CB" },
      { position: "CB", x: 40, y: 70, label: "CB" },
      { position: "LB", x: 20, y: 70, label: "LB" },
      { position: "CM", x: 65, y: 50, label: "CM" },
      { position: "CM", x: 50, y: 50, label: "CM" },
      { position: "CM", x: 35, y: 50, label: "CM" },
      { position: "CAM", x: 60, y: 30, label: "CAM" },
      { position: "CAM", x: 40, y: 30, label: "CAM" },
      { position: "ST", x: 50, y: 15, label: "ST" },
    ]
  },
  {
    name: "3-4-2-1",
    category: "Attacking",
    positions: [
      { position: "GK", x: 50, y: 90, label: "GK" },
      { position: "CB", x: 70, y: 70, label: "CB" },
      { position: "CB", x: 50, y: 70, label: "CB" },
      { position: "CB", x: 30, y: 70, label: "CB" },
      { position: "RM", x: 85, y: 50, label: "RM" },
      { position: "CM", x: 65, y: 50, label: "CM" },
      { position: "CM", x: 35, y: 50, label: "CM" },
      { position: "LM", x: 15, y: 50, label: "LM" },
      { position: "CAM", x: 60, y: 30, label: "CAM" },
      { position: "CAM", x: 40, y: 30, label: "CAM" },
      { position: "ST", x: 50, y: 15, label: "ST" },
    ]
  },
  {
    name: "3-4-3",
    category: "Attacking",
    positions: [
      { position: "GK", x: 50, y: 90, label: "GK" },
      { position: "CB", x: 70, y: 70, label: "CB" },
      { position: "CB", x: 50, y: 70, label: "CB" },
      { position: "CB", x: 30, y: 70, label: "CB" },
      { position: "RM", x: 85, y: 50, label: "RM" },
      { position: "CM", x: 65, y: 50, label: "CM" },
      { position: "CM", x: 35, y: 50, label: "CM" },
      { position: "LM", x: 15, y: 50, label: "LM" },
      { position: "RW", x: 75, y: 20, label: "RW" },
      { position: "ST", x: 50, y: 15, label: "ST" },
      { position: "LW", x: 25, y: 20, label: "LW" },
    ]
  },

  // Hybrid & Tactical Formations
  {
    name: "4-1-3-2",
    category: "Hybrid",
    positions: [
      { position: "GK", x: 50, y: 90, label: "GK" },
      { position: "RB", x: 80, y: 70, label: "RB" },
      { position: "CB", x: 60, y: 70, label: "CB" },
      { position: "CB", x: 40, y: 70, label: "CB" },
      { position: "LB", x: 20, y: 70, label: "LB" },
      { position: "CDM", x: 50, y: 55, label: "CDM" },
      { position: "CAM", x: 70, y: 35, label: "CAM" },
      { position: "CAM", x: 50, y: 30, label: "CAM" },
      { position: "CAM", x: 30, y: 35, label: "CAM" },
      { position: "ST", x: 60, y: 15, label: "ST" },
      { position: "ST", x: 40, y: 15, label: "ST" },
    ]
  },
  {
    name: "4-3-1-2",
    category: "Hybrid",
    positions: [
      { position: "GK", x: 50, y: 90, label: "GK" },
      { position: "RB", x: 80, y: 70, label: "RB" },
      { position: "CB", x: 60, y: 70, label: "CB" },
      { position: "CB", x: 40, y: 70, label: "CB" },
      { position: "LB", x: 20, y: 70, label: "LB" },
      { position: "CM", x: 65, y: 50, label: "CM" },
      { position: "CM", x: 50, y: 50, label: "CM" },
      { position: "CM", x: 35, y: 50, label: "CM" },
      { position: "CAM", x: 50, y: 30, label: "CAM" },
      { position: "ST", x: 60, y: 15, label: "ST" },
      { position: "ST", x: 40, y: 15, label: "ST" },
    ]
  },
  {
    name: "4-4-2",
    category: "Balanced",
    positions: [
      { position: "GK", x: 50, y: 90, label: "GK" },
      { position: "RB", x: 80, y: 70, label: "RB" },
      { position: "CB", x: 60, y: 70, label: "CB" },
      { position: "CB", x: 40, y: 70, label: "CB" },
      { position: "LB", x: 20, y: 70, label: "LB" },
      { position: "RM", x: 80, y: 45, label: "RM" },
      { position: "CM", x: 60, y: 45, label: "CM" },
      { position: "CM", x: 40, y: 45, label: "CM" },
      { position: "LM", x: 20, y: 45, label: "LM" },
      { position: "ST", x: 60, y: 20, label: "ST" },
      { position: "ST", x: 40, y: 20, label: "ST" },
    ]
  },
  {
    name: "4-4-2 Holding",
    category: "Defensive",
    positions: [
      { position: "GK", x: 50, y: 90, label: "GK" },
      { position: "RB", x: 80, y: 70, label: "RB" },
      { position: "CB", x: 60, y: 70, label: "CB" },
      { position: "CB", x: 40, y: 70, label: "CB" },
      { position: "LB", x: 20, y: 70, label: "LB" },
      { position: "RM", x: 80, y: 45, label: "RM" },
      { position: "CDM", x: 60, y: 55, label: "CDM" },
      { position: "CDM", x: 40, y: 55, label: "CDM" },
      { position: "LM", x: 20, y: 45, label: "LM" },
      { position: "ST", x: 60, y: 20, label: "ST" },
      { position: "ST", x: 40, y: 20, label: "ST" },
    ]
  },
  {
    name: "5-3-2",
    category: "Defensive",
    positions: [
      { position: "GK", x: 50, y: 90, label: "GK" },
      { position: "RWB", x: 85, y: 65, label: "RWB" },
      { position: "CB", x: 70, y: 75, label: "CB" },
      { position: "CB", x: 50, y: 75, label: "CB" },
      { position: "CB", x: 30, y: 75, label: "CB" },
      { position: "LWB", x: 15, y: 65, label: "LWB" },
      { position: "CM", x: 65, y: 45, label: "CM" },
      { position: "CM", x: 50, y: 40, label: "CM" },
      { position: "CM", x: 35, y: 45, label: "CM" },
      { position: "ST", x: 60, y: 15, label: "ST" },
      { position: "ST", x: 40, y: 15, label: "ST" },
    ]
  },
  {
    name: "3-5-2",
    category: "Balanced",
    positions: [
      { position: "GK", x: 50, y: 90, label: "GK" },
      { position: "CB", x: 70, y: 70, label: "CB" },
      { position: "CB", x: 50, y: 70, label: "CB" },
      { position: "CB", x: 30, y: 70, label: "CB" },
      { position: "RWB", x: 85, y: 50, label: "RWB" },
      { position: "CM", x: 65, y: 45, label: "CM" },
      { position: "CM", x: 50, y: 40, label: "CM" },
      { position: "CM", x: 35, y: 45, label: "CM" },
      { position: "LWB", x: 15, y: 50, label: "LWB" },
      { position: "ST", x: 60, y: 20, label: "ST" },
      { position: "ST", x: 40, y: 20, label: "ST" },
    ]
  }
]

// Helper function to get formations by category
export function getFormationsByCategory() {
  const categories = {
    "Community Favorites": formations.filter(f => f.category === "Community Favorite"),
    "Defensive & Balanced": formations.filter(f => f.category === "Defensive" || f.category === "Balanced"),
    "Attacking & Possession": formations.filter(f => f.category === "Attacking"),
    "Hybrid & Tactical": formations.filter(f => f.category === "Hybrid"),
  }
  return categories
}

// Helper function to get all formation names
export function getFormationNames() {
  return formations.map(f => f.name)
}

// Helper function to find formation by name
export function getFormationByName(name: string) {
  return formations.find(f => f.name === name)
} 