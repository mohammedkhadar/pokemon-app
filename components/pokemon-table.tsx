"use client"

import type React from "react"
import { useState, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import PokemonModal from "./pokemon-modal"

interface Pokemon {
  name: string
  url: string
  id: number
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

const columnHelper = createColumnHelper<Pokemon>()

export default function PokemonTable({ pokemonData, searchResult, currentPage, searchQuery }: PokemonTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedPokemon, setSelectedPokemon] = useState<string | null>(null)
  const [searchInput, setSearchInput] = useState(searchQuery)
  const [sorting, setSorting] = useState<SortingState>([])

  const limit = 20

  // Transform data to include IDs for TanStack Table
  const tableData = useMemo(() => {
    if (searchResult) {
      return [
        {
          name: searchResult.name,
          url: `https://pokeapi.co/api/v2/pokemon/${searchResult.id}/`,
          id: searchResult.id,
        },
      ]
    }

    return pokemonData.results.map((pokemon, index) => ({
      ...pokemon,
      id: (currentPage - 1) * limit + index + 1,
    }))
  }, [pokemonData.results, searchResult, currentPage, limit])

  const columns = useMemo<ColumnDef<Pokemon>[]>(
    () => [
      columnHelper.accessor("id", {
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-semibold"
          >
            ID
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        ),
        cell: ({ getValue }) => <span className="font-mono">#{String(getValue()).padStart(3, "0")}</span>,
        sortingFn: "basic",
      }),
      columnHelper.accessor("name", {
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-semibold"
          >
            Name
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        ),
        cell: ({ getValue }) => <span className="font-medium capitalize">{getValue()}</span>,
        sortingFn: "alphanumeric",
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              setSelectedPokemon(row.original.name)
            }}
          >
            View Details
          </Button>
        ),
      }),
    ],
    [],
  )

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    enableSortingRemoval: true,
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams.toString())
    if (searchInput.trim()) {
      params.set("search", searchInput.trim())
      params.delete("page")
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

  const totalPages = Math.ceil(pokemonData.count / limit)

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

      {/* TanStack Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="font-semibold">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => setSelectedPokemon(row.original.name)}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                ))}
              </TableRow>
            ))}
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
