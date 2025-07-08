"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface EvolutionTrigger {
  id: number
  name: string
  names: Array<{
    name: string
    language: {
      name: string
    }
  }>
  pokemon_species: Array<{
    name: string
    url: string
  }>
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

export default function EvolutionTriggersTable() {
  const [triggers, setTriggers] = useState<EvolutionTrigger[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  const limit = 10
  const offset = (currentPage - 1) * limit

  useEffect(() => {
    fetchEvolutionTriggers()
  }, [currentPage])

  const fetchEvolutionTriggers = async () => {
    setLoading(true)
    setError(null)
    try {
      // First, get the list of evolution triggers
      const listResponse = await fetch(`https://pokeapi.co/api/v2/evolution-trigger?limit=${limit}&offset=${offset}`)
      if (!listResponse.ok) {
        throw new Error("Failed to fetch evolution triggers list")
      }
      const listData: EvolutionTriggersResponse = await listResponse.json()
      setTotalCount(listData.count)

      // Then, fetch detailed information for each trigger
      const detailedTriggers = await Promise.all(
        listData.results.map(async (trigger) => {
          const detailResponse = await fetch(trigger.url)
          if (!detailResponse.ok) {
            throw new Error(`Failed to fetch details for ${trigger.name}`)
          }
          return detailResponse.json()
        }),
      )

      setTriggers(detailedTriggers)
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
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Display Name</TableHead>
                <TableHead>Species Count</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {triggers.map((trigger) => {
                const englishName = trigger.names.find((n) => n.language.name === "en")?.name || trigger.name
                return (
                  <TableRow key={trigger.id}>
                    <TableCell className="font-mono">#{trigger.id}</TableCell>
                    <TableCell className="font-medium capitalize">{trigger.name.replace("-", " ")}</TableCell>
                    <TableCell>{englishName}</TableCell>
                    <TableCell>
                      <span className="text-muted-foreground">{trigger.pokemon_species.length} species</span>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {offset + 1} to {Math.min(offset + limit, totalCount)} of {totalCount} triggers
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
              {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(currentPage - 1 + i, totalPages - 2 + i))
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
      </CardContent>
    </Card>
  )
}
