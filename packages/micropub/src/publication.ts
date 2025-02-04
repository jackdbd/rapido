import type { Jf2 } from '@paulrobertlloyd/mf2tojf2'
import type { Location } from './schemas/location.js'

export interface Predicate {
  store: (jf2: Jf2) => boolean
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
