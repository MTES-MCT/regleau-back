import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usage } from './entities/usage.entity';
import { User } from '../user/entities/user.entity';
import { CreateUsageDto } from './dto/create_usage.dto';

@Injectable()
export class UsageService {
  constructor(
    @InjectRepository(Usage)
    private readonly usageRepository: Repository<Usage>,
  ) {}

  findOne(nom: string): Promise<Usage> {
    return this.usageRepository.findOne({
      relations: ['thematique'],
      where: { nom },
    });
  }

  findAll(curentUser: User): Promise<Usage[]> {
    return this.usageRepository
      .createQueryBuilder('usage')
      .select()
      .leftJoinAndSelect('usage.thematique', 'thematique')
      .leftJoin('usage.usagesArreteCadre', 'usagesArreteCadre')
      .leftJoin('usagesArreteCadre.arreteCadre', 'arreteCadre')
      .leftJoin('arreteCadre.departements', 'departements')
      .where(
        curentUser.role === 'mte' ? '1=1' : 'departements.code = :code_dep',
        {
          code_dep: curentUser.role_departement,
        },
      )
      .getMany();
  }

  async create(usage: CreateUsageDto): Promise<Usage> {
    if (
      (!usage.concerneEso && !usage.concerneEsu && !usage.concerneAep) ||
      (!usage.concerneParticulier &&
        !usage.concerneCollectivite &&
        !usage.concerneEntreprise &&
        !usage.concerneExploitation)
    ) {
      throw new HttpException(
        `Il faut au moins un usager et un type de ressouce pour créer un usage.`,
        HttpStatus.BAD_REQUEST,
      );
    }
    const usageExists = await this.findOne(usage.nom);
    if (!usageExists) {
      await this.usageRepository.save(usage);
      return this.findOne(usage.nom);
    }
    return usageExists;
  }
}
