export async function fetchPokemonDetails(pokemonName: string) {
  if (!pokemonName) throw new Error("No Pokémon name provided")
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName.toLowerCase()}`)
  if (!response.ok) {
    throw new Error("Failed to fetch Pokemon details")
  }
  return response.json()
}
