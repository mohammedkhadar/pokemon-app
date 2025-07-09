"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

interface PokemonDetailsCardProps {
  pokemon: {
    id: number
    name: string
    height: number
    weight: number
    base_experience: number
    types: Array<{
      type: { name: string }
    }>
    abilities: Array<{
      ability: { name: string }
      is_hidden: boolean
    }>
    stats: Array<{
      base_stat: number
      stat: { name: string }
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
  getTypeColor: (type: string) => string
}

export default function PokemonDetailsCard({ pokemon, getTypeColor }: PokemonDetailsCardProps) {
  return (
    <>
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
    </>
  )
}
