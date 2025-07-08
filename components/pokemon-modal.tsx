"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import EvolutionTriggersTable from "./evolution-triggers-table"
import Image from "next/image"

interface PokemonDetails {
  id: number
  name: string
  height: number
  weight: number
  base_experience: number
  types: Array<{
    type: {
      name: string
    }
  }>
  abilities: Array<{
    ability: {
      name: string
    }
    is_hidden: boolean
  }>
  stats: Array<{
    base_stat: number
    stat: {
      name: string
    }
  }>
  sprites: {
    front_default: string
    front_shiny: string
    other: {
      "official-artwork": {
        front_default: string
      }
    }
  }
}

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
              <div className="grid md:grid-cols-2 gap-6">
                {/* Image and Basic Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="capitalize">
                      #{pokemon.id.toString().padStart(3, "0")} {pokemon.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-center">
                      <Image
                        src={pokemon.sprites.other["official-artwork"].front_default || pokemon.sprites.front_default}
                        alt={pokemon.name}
                        width={200}
                        height={200}
                        className="object-contain"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Height:</span> {pokemon.height / 10} m
                      </div>
                      <div>
                        <span className="font-medium">Weight:</span> {pokemon.weight / 10} kg
                      </div>
                      <div className="col-span-2">
                        <span className="font-medium">Base Experience:</span> {pokemon.base_experience}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Types and Abilities */}
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Types</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2">
                        {pokemon.types.map((type) => (
                          <Badge
                            key={type.type.name}
                            className={`${getTypeColor(type.type.name)} text-white capitalize`}
                          >
                            {type.type.name}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Abilities</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {pokemon.abilities.map((ability) => (
                          <div key={ability.ability.name} className="flex items-center gap-2">
                            <Badge variant={ability.is_hidden ? "secondary" : "default"}>
                              {ability.ability.name.replace("-", " ")}
                            </Badge>
                            {ability.is_hidden && <span className="text-xs text-muted-foreground">(Hidden)</span>}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Base Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {pokemon.stats.map((stat) => (
                      <div key={stat.stat.name} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="capitalize font-medium">{stat.stat.name.replace("-", " ")}</span>
                          <span>{stat.base_stat}</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${Math.min((stat.base_stat / 255) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
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
