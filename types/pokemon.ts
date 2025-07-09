export interface Pokemon {
  name: string
  url: string
  id: number
}

export interface PokemonListResponse {
  count: number
  next: string | null
  previous: string | null
  results: Pokemon[]
}
