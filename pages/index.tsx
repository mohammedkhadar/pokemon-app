import { Suspense } from "react"
import PokemonTable from "@/components/pokemon-table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GetServerSideProps } from "next"
import type { PokemonListResponse } from "@/components/pokemon-table"

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

interface HomeProps {
  pokemonData: PokemonListResponse
  searchResult: any
  currentPage: number
  searchQuery: string
}

export default function Home({ pokemonData, searchResult, currentPage, searchQuery }: HomeProps) {

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
              currentPage={currentPage}
              searchQuery={searchQuery}
            />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { query } = context
  const page = Number(query.page) || 1
  const search = typeof query.search === "string" ? query.search : ""
  const limit = 20
  const offset = (page - 1) * limit

  const pokemonData = await fetchPokemon(limit, offset)

  let searchResult = null
  if (search) {
    searchResult = await fetchPokemonByName(search)
  }


  return {
    props: {
      pokemonData,
      searchResult,
      currentPage: page,
      searchQuery: search,
    },
  }
}
