
import type { PokemonListResponse } from "@/types/pokemon"

export async function fetchPokemonList({ page, search, limit }: { page: number; search: string; limit: number }): Promise<PokemonListResponse> {
  if (search) {
    return searchPokemonByName(search)
  }
  const offset = (page - 1) * limit
  const url = `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`
  const res = await fetch(url)
  if (!res.ok) throw new Error("Failed to fetch Pokémon list")
  const data = await res.json()
  // Add id to each result
  const results = data.results.map((pokemon: { name: string; url: string }, idx: number) => ({
    ...pokemon,
    id: offset + idx + 1,
  }))
  return { ...data, results }
}

export async function searchPokemonByName(search: string): Promise<PokemonListResponse> {
  const searchUrl = `https://pokeapi.co/api/v2/pokemon/${search.toLowerCase()}`
  const res = await fetch(searchUrl)
  if (res.ok) {
    const data = await res.json()
    return {
      count: 1,
      next: null,
      previous: null,
      results: [{ name: data.name, url: searchUrl, id: data.id }],
    }
  } else {
    return {
      count: 0,
      next: null,
      previous: null,
      results: [],
    }
  }
}

