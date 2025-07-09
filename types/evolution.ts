export interface EvolutionTrigger {
  id: number
  name: string
}

export interface EvolutionTriggersResponse {
  count: number
  next: string | null
  previous: string | null
  results: Array<{
    name: string
    url: string
  }>
}
