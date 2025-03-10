import React, { useEffect, useState } from 'react'
import { Container, Row, Col, Form } from 'react-bootstrap'
import PokemonCard from './PokemonCard'
import { useLocation } from 'react-router-dom'

const MasterTeams = () => {
  const [teams, setTeams] = useState([])
  const [selectedTeam, setSelectedTeam] = useState('')
  const [pokemonList, setPokemonList] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const location = useLocation()

  const fetchTeams = async () => {
    try {
      const bearer =
        'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJzdHJpbmciLCJyb2xlcyI6WyJST0xFX0FETUlOIl0sImlhdCI6MTczOTg5MDI5MywiZXhwIjoxNzM5OTc2NjkzfQ.Citpq4uqNjuNbtQBgLcQh-CbSzttjHOlLrVdvsrQO-k' // 🔹 Prende il token JWT dal localStorage

      const response = await fetch('http://localhost:8080/teams', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${bearer}`,
        },
      })

      if (response.status === 401) {
        throw new Error('Not authorized. Make sure you are logged in.')
      }

      const data = await response.json()
      console.log('Team ricevuti:', data)
      setTeams(data)

      if (data.length > 0) {
        setSelectedTeam(data[0].id)
      }
    } catch (error) {
      console.error('Error fetching teams:', error)
    }
  }

  const fetchPokemonForTeam = async (teamId) => {
    if (!teamId) return
    setIsLoading(true)
    try {
      const bearer =
        'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJzdHJpbmciLCJyb2xlcyI6WyJST0xFX0FETUlOIl0sImlhdCI6MTczOTg5MDI5MywiZXhwIjoxNzM5OTc2NjkzfQ.Citpq4uqNjuNbtQBgLcQh-CbSzttjHOlLrVdvsrQO-k'

      const response = await fetch(`http://localhost:8080/teams/${teamId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${bearer}`,
        },
      })

      if (response.status === 401) {
        throw new Error('Not authorized. Make sure you are logged in.')
      }

      const data = await response.json()
      console.log('Dati del team ricevuti:', data)

      const parsedPokemons = data.pokemons.map(parsePokeAPIResponse)

      setPokemonList(parsedPokemons)
    } catch (error) {
      console.error('Error fetching team:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTeams()
  }, [])

  useEffect(() => {
    if (selectedTeam) {
      fetchPokemonForTeam(selectedTeam)
    }
  }, [selectedTeam])

  const parsePokeAPIResponse = (json) => ({
    name: json.name,
    weight: json.weight,
    height: json.height,
    spriteStat: json.sprites?.other?.showdown?.front_default || '',
    sprite: json.sprites?.other?.['official-artwork']?.front_default || '',
    spriteShiny: json.sprites?.other?.['official-artwork']?.front_shiny || '',
    abilities: json.abilities ? json.abilities.map((e) => e.ability.name) : [],
    moves: json.moves ? json.moves.map((e) => e.move.name) : [],
    stats: json.stats
      ? json.stats.map((e) => ({
          name: e.stat.name,
          value: e.base_stat,
        }))
      : [],
    types: json.types ? json.types.map((e) => e.type.name) : ['unknown'],
  })

  const handleOptionChange = (e) => {
    setSelectedTeam(e.target.value)
  }

  return (
    <Container>
      <div className="d-flex align-items-center">
        <Form.Select
          value={selectedTeam}
          onChange={handleOptionChange}
          className="mb-3 mt-3"
        >
          {teams.map((team) => (
            <option key={team.id} value={team.id}>
              <div className="d-flex">
                <div>{team.name}</div>
              </div>
            </option>
          ))}
        </Form.Select>
        <div style={{ cursor: 'pointer' }} className="ms-3 fs-4">
          ℹ️
        </div>
      </div>

      {isLoading ? (
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ height: '100vh' }}
        >
          <div className="ball"></div>
        </div>
      ) : (
        <Row>
          {pokemonList.map((pokemon, index) => (
            <Col key={index} xs={12} md={6} lg={4}>
              <PokemonCard data={pokemon} useLocation={location.pathname} />
            </Col>
          ))}
        </Row>
      )}
    </Container>
  )
}

export default MasterTeams
