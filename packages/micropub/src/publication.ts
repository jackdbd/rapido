import type { JF2, Location } from './schemas/index.js'

export interface Predicate {
  store: (jf2: JF2) => boolean
  website: (url: string) => boolean
}

export interface Item {
  location: Location
  predicate: Predicate
}

export interface Publication {
  default: { location: Location }
  items: Record<string, Item>
}
