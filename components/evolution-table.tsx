"use client"

import { useState, useMemo } from "react"
import { useQuery } from '@tanstack/react-query'
import { fetchEvolutionTriggers } from "@/lib/api/evolution"
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table"
import { DataTable } from "@/components/ui/data-table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Pagination } from "@/components/pagination"
import { EvolutionTrigger } from "@/types/evolution"

export default function EvolutionTriggersTable() {
  const [currentPage, setCurrentPage] = useState(1)
  const [sorting, setSorting] = useState<SortingState>([])

  const limit = 10
  const offset = (currentPage - 1) * limit

  const columns = useMemo<ColumnDef<EvolutionTrigger>[]>(
    () => [
      {
        accessorKey: "id",
        header: "ID",
      },
      {
        accessorKey: "name",
        header: "Name",
      },
    ],
    [],
  )

  const {
    data,
    isLoading,
    isError,
  } = useQuery<{ count: number; triggers: EvolutionTrigger[] }, Error>({
    queryKey: ['evolution-triggers', currentPage],
    queryFn: () => fetchEvolutionTriggers(limit, offset),
  })

  const triggers = data?.triggers || []
  const totalCount = data?.count || 0
  const totalPages = Math.ceil(totalCount / limit)

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

  if (isLoading) {
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

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Evolution Triggers</CardTitle>
          <CardDescription>Error loading evolution triggers</CardDescription>
        </CardHeader>
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
          onPageChange={setCurrentPage}
          pageSize={limit}
          totalCount={totalCount}
          label="triggers"
        />
      </CardContent>
    </Card>
  )
}
