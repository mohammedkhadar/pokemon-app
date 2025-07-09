"use client"

import { useQuery } from "@tanstack/react-query"
import { fetchPokemonDetails } from "@/lib/api/pokemon-details"
import { getTypeColor } from "@/lib/utils"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import EvolutionTriggersTable from "./evolution-table"
import { PokemonDetails, PokemonDetailsCard } from "./pokemon-details"


interface PokemonModalProps {
  pokemonName: string
  isOpen: boolean
  onClose: () => void
}

export default function PokemonModal({ pokemonName, isOpen, onClose }: PokemonModalProps) {
  const {
    data: pokemon,
    isLoading: loading,
    error,
  } = useQuery<PokemonDetails, Error>({
    queryKey: ["pokemon-details", pokemonName],
    queryFn: () => fetchPokemonDetails(pokemonName),
    enabled: isOpen && !!pokemonName,
    refetchOnWindowFocus: false,
  })


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
            <p className="text-destructive">Error: {error instanceof Error ? error.message : String(error)}</p>
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

