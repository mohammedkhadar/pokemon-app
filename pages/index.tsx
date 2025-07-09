import { Suspense } from "react"
import PokemonTable from "@/components/pokemon-table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GetServerSideProps } from "next"
import type { PokemonListResponse } from "@/types/pokemon"
import { fetchPokemonList } from "@/lib/api/pokemon"

interface HomeProps {
  currentPage: number
  searchQuery: string
  pokemonData: PokemonListResponse | null
}

export default function Home({ currentPage, searchQuery, pokemonData }: HomeProps) {
  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Pokémon Database</CardTitle>
          <CardDescription>
            Browse through all Pokémon with pagination and search functionality
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>Loading...</div>}>
            <PokemonTable
              currentPage={currentPage}
              searchQuery={searchQuery}
              pokemonData={pokemonData}
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
  const limit = 10
  const pokemonData = await fetchPokemonList({ page, search, limit }) || null

  return {
    props: {
      currentPage: page,
      searchQuery: search,
      pokemonData,
    },
  }
}
