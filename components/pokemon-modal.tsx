"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import EvolutionTriggersTable from "./evolution-triggers-table"
import { PokemonDetails, PokemonDetailsCard } from "./pokemon-details-card"

interface PokemonModalProps {
  pokemonName: string
  isOpen: boolean
  onClose: () => void
}

export default function PokemonModal({ pokemonName, isOpen, onClose }: PokemonModalProps) {
  const [pokemon, setPokemon] = useState<PokemonDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && pokemonName) {
      fetchPokemonDetails()
    }
  }, [isOpen, pokemonName])

  const fetchPokemonDetails = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName.toLowerCase()}`)
      if (!response.ok) {
        throw new Error("Failed to fetch Pokemon details")
      }
      const data = await response.json()
      setPokemon(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const getTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      normal: "bg-gray-400",
      fire: "bg-red-500",
      water: "bg-blue-500",
      electric: "bg-yellow-400",
      grass: "bg-green-500",
      ice: "bg-blue-200",
      fighting: "bg-red-700",
      poison: "bg-purple-500",
      ground: "bg-yellow-600",
      flying: "bg-indigo-400",
      psychic: "bg-pink-500",
      bug: "bg-green-400",
      rock: "bg-yellow-800",
      ghost: "bg-purple-700",
      dragon: "bg-indigo-700",
      dark: "bg-gray-800",
      steel: "bg-gray-500",
      fairy: "bg-pink-300",
    }
    return colors[type] || "bg-gray-400"
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="capitalize text-2xl">{pokemonName} Details</DialogTitle>
          <DialogDescription>Detailed information about this Pokémon</DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="space-y-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <p className="text-destructive">Error: {error}</p>
          </div>
        )}

        {pokemon && (
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Pokémon Details</TabsTrigger>
              <TabsTrigger value="evolution">Evolution Triggers</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-6">
              <PokemonDetailsCard pokemon={pokemon} getTypeColor={getTypeColor} />
            </TabsContent>

            <TabsContent value="evolution">
              <EvolutionTriggersTable />
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  )
}
