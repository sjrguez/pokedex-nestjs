import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Pokemon } from './entities/pokemon.entity';
import { BadRequestException, InternalServerErrorException } from '@nestjs/common'

@Injectable()
export class PokemonService {
  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>
  ){}

  async create(createPokemonDto: CreatePokemonDto) {
    try {
      createPokemonDto.name = createPokemonDto.name.toLowerCase();
      const pokemon = await this.pokemonModel.create(createPokemonDto)
      return pokemon;
      
    } catch (error) {
      this.handleExceptions(error)
      throw new InternalServerErrorException(`Can't create pokemom`)
    }
  }

  findAll() {
    return `This action returns all pokemon`;
  }

  async findOne(term: string) {
    let pokemon: Pokemon;
    // Number
    if( !isNaN(+term)){
      pokemon = await this.pokemonModel.findOne({no: term});
    }
    // Mongo Id
    if(!pokemon && isValidObjectId(term)) {
      pokemon = await this.pokemonModel.findById(term);
    } 
    // Name
    else {
      pokemon = await this.pokemonModel.findOne({name: term.toLowerCase()});
    }

    if(!pokemon) {
      throw new NotFoundException(`Pokemon with id, name or no ${term} not found`)
    }
    return pokemon;
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {
    const pokemon = await this.findOne(term)
    try {
      if(updatePokemonDto.name) updatePokemonDto.name = updatePokemonDto.name.toLowerCase();
      await pokemon.update(updatePokemonDto)
      return {...pokemon.toJSON(), ...updatePokemonDto} 
    } catch (error) {
      this.handleExceptions(error)
      throw new InternalServerErrorException(`Can't update pokemom`)
    }
  }

  async remove(_id: string) {
    // const pokemon = await this.findOne(id);
    // await pokemon.deleteOne();
    // const result = this.pokemonModel.findByIdAndDelete(id)
    const { deletedCount } = await this.pokemonModel.deleteOne({_id}, {new: true})
    if( deletedCount === 0) {
      throw new BadRequestException(`pokemon with id '${_id}' no found`)
    } 
    return 
  }

  private handleExceptions (error: any) {
    if(error.code === 11000) {
      throw new BadRequestException(`Pokemon exists in db ${JSON.stringify(error.keyValue)}`)
    }
  }
}
