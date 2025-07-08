"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, ChevronLeft, ChevronRight } from "lucide-react"
import PokemonModal from "./pokemon-modal"

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

interface PokemonTableProps {
  pokemonData: PokemonListResponse
  searchResult: any
  currentPage: number
  searchQuery: string
}

export default function PokemonTable({ pokemonData, searchResult, currentPage, searchQuery }: PokemonTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedPokemon, setSelectedPokemon] = useState<string | null>(null)
  const [searchInput, setSearchInput] = useState(searchQuery)

  const limit = 20
  const totalPages = Math.ceil(pokemonData.count / limit)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams.toString())
    if (searchInput.trim()) {
      params.set("search", searchInput.trim())
      params.delete("page") // Reset to first page when searching
    } else {
      params.delete("search")
    }
    router.push(`/?${params.toString()}`)
  }

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    if (newPage === 1) {
      params.delete("page")
    } else {
      params.set("page", newPage.toString())
    }
    router.push(`/?${params.toString()}`)
  }

  const clearSearch = () => {
    setSearchInput("")
    const params = new URLSearchParams(searchParams.toString())
    params.delete("search")
    params.delete("page")
    router.push(`/?${params.toString()}`)
  }

  const displayData = searchResult
    ? [{ name: searchResult.name, url: `https://pokeapi.co/api/v2/pokemon/${searchResult.id}/` }]
    : pokemonData.results

  return (
    <div className="space-y-4">
      {/* Search Form */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Search Pokémon by name..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button type="submit">Search</Button>
        {searchQuery && (
          <Button type="button" variant="outline" onClick={clearSearch}>
            Clear
          </Button>
        )}
      </form>

      {/* Search Results Info */}
      {searchQuery && (
        <div className="flex items-center gap-2">
          <Badge variant={searchResult ? "default" : "destructive"}>
            {searchResult ? `Found: ${searchResult.name}` : `No results for "${searchQuery}"`}
          </Badge>
        </div>
      )}

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayData.map((pokemon, index) => {
              const pokemonId = pokemon.url.split("/").filter(Boolean).pop()
              return (
                <TableRow
                  key={pokemon.name}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setSelectedPokemon(pokemon.name)}
                >
                  <TableCell className="font-mono">
                    #{searchResult ? searchResult.id : String((currentPage - 1) * limit + index + 1).padStart(3, "0")}
                  </TableCell>
                  <TableCell className="font-medium capitalize">{pokemon.name}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedPokemon(pokemon.name)
                      }}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination - Only show if not searching */}
      {!searchQuery && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * limit + 1} to {Math.min(currentPage * limit, pokemonData.count)} of{" "}
            {pokemonData.count.toLocaleString()} Pokémon
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(currentPage - 2 + i, totalPages - 4 + i))
                return (
                  <Button
                    key={pageNum}
                    variant={pageNum === currentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(pageNum)}
                    className="w-10"
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Modal */}
      {selectedPokemon && (
        <PokemonModal
          pokemonName={selectedPokemon}
          isOpen={!!selectedPokemon}
          onClose={() => setSelectedPokemon(null)}
        />
      )}
    </div>
  )
}
