import type { EvolutionTriggersResponse, EvolutionTrigger } from "@/types/evolution"

export async function fetchEvolutionTriggers(limit: number, offset: number): Promise<{ count: number; triggers: EvolutionTrigger[] }> {
  const res = await fetch(`https://pokeapi.co/api/v2/evolution-trigger?limit=${limit}&offset=${offset}`)
  if (!res.ok) throw new Error('Failed to fetch evolution triggers list')
  const listData: EvolutionTriggersResponse = await res.json()
  return {
    count: listData.count,
    triggers: listData.results.map((trigger: { name: string; url: string }, idx: number) => ({
      id: offset + idx + 1,
      name: trigger.name,
    })),
  }
}
