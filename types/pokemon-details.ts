export interface PokemonDetails {
  id: number
  name: string
  height: number
  weight: number
  base_experience: number
  types: Array<{
    type: { name: string }
  }>
  abilities: Array<{
    ability: { name: string }
    is_hidden: boolean
  }>
  stats: Array<{
    base_stat: number
    stat: { name: string }
  }>
  sprites: {
    front_default: string
    front_shiny: string
    other: {
      "official-artwork": {
        front_default: string
      }
    }
  }
}
