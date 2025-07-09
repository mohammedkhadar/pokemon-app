"use client"

import { useState, useEffect, useMemo } from "react"
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  createColumnHelper,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Pagination } from "@/components/pagination"

interface EvolutionTrigger {
  id: number
  name: string
}

interface EvolutionTriggersResponse {
  count: number
  next: string | null
  previous: string | null
  results: Array<{
    name: string
    url: string
  }>
}

const columnHelper = createColumnHelper<EvolutionTrigger>()

export default function EvolutionTriggersTable() {
  const [triggers, setTriggers] = useState<EvolutionTrigger[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [sorting, setSorting] = useState<SortingState>([])

  const limit = 10
  const offset = (currentPage - 1) * limit

  const columns = useMemo<ColumnDef<EvolutionTrigger>[]>(
    () => [
      {
        accessorKey: "id",
        header: "ID",
        sortingFn: "basic",
      },
      {
        accessorKey: "name",
        header: "Name",
        sortingFn: "alphanumeric",
      },
    ],
    [],
  )

  const table = useReactTable({
    data: triggers,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    enableSortingRemoval: true,
  })

  useEffect(() => {
    fetchEvolutionTriggers()
  }, [currentPage])

  const fetchEvolutionTriggers = async () => {
    setLoading(true)
    setError(null)
    try {
      const listResponse = await fetch(`https://pokeapi.co/api/v2/evolution-trigger?limit=${limit}&offset=${offset}`)
      if (!listResponse.ok) {
        throw new Error("Failed to fetch evolution triggers list")
      }
      const listData: EvolutionTriggersResponse = await listResponse.json()
      setTotalCount(listData.count)

      // Remove detailed triggers: just set triggers to the list results, mapping to minimal EvolutionTrigger shape
      setTriggers(
        listData.results.map((trigger, idx) => ({
          id: offset + idx + 1,
          name: trigger.name,
        }))
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const totalPages = Math.ceil(totalCount / limit)

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Evolution Triggers</CardTitle>
          <CardDescription>Loading evolution trigger data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Evolution Triggers</CardTitle>
          <CardDescription>Error loading evolution triggers</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">Error: {error}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evolution Triggers</CardTitle>
        <CardDescription>Methods that can trigger Pokémon evolution ({totalCount} total triggers)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <DataTable table={table} />

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          pageSize={limit}
          totalCount={totalCount}
          label="triggers"
        />
      </CardContent>
    </Card>
  )
}
