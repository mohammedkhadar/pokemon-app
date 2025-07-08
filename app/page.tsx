import { Suspense } from "react"
import PokemonTable from "@/components/pokemon-table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface Pokemon {
  name: string
  url: string
}

interface PokemonListResponse {
  count: number
  next: string | null
  previous: string | null
  results: Pokemon[]
}

async function fetchPokemon(limit = 20, offset = 0): Promise<PokemonListResponse> {
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`)
  if (!response.ok) {
    throw new Error("Failed to fetch Pokemon")
  }
  return response.json()
}

async function fetchPokemonByName(name: string) {
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`)
    if (!response.ok) {
      return null
    }
    return response.json()
  } catch {
    return null
  }
}

interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function Home({ searchParams }: PageProps) {
  const page = Number(searchParams.page) || 1
  const search = typeof searchParams.search === "string" ? searchParams.search : ""
  const limit = 20
  const offset = (page - 1) * limit

  let pokemonData: PokemonListResponse
  let searchResult = null

  if (search) {
    // If searching, try to fetch the specific Pokemon
    searchResult = await fetchPokemonByName(search)
    // Still fetch the regular list for fallback
    pokemonData = await fetchPokemon(limit, offset)
  } else {
    pokemonData = await fetchPokemon(limit, offset)
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">Pokémon Explorer</h1>
        <p className="text-muted-foreground">
          Explore the world of Pokémon with server-side rendering and real-time search
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pokémon Database</CardTitle>
          <CardDescription>
            Browse through {pokemonData.count.toLocaleString()} Pokémon with pagination and search functionality
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>Loading...</div>}>
            <PokemonTable
              pokemonData={pokemonData}
              searchResult={searchResult}
              currentPage={page}
              searchQuery={search}
            />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}
