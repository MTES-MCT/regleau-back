import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import { Usage } from './entities/usage.entity';
import { User } from '../user/entities/user.entity';
import { CreateUpdateUsageDto } from './dto/create_usage.dto';
import { Restriction } from '../restriction/entities/restriction.entity';
import { ArreteCadre } from '../arrete_cadre/entities/arrete_cadre.entity';

@Injectable()
export class UsageService {
  constructor(
    @InjectRepository(Usage)
    private readonly usageRepository: Repository<Usage>,
  ) {
  }

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
      .leftJoin('usage.arreteCadre', 'arreteCadre')
      .leftJoin('arreteCadre.departements', 'departements')
      .where(
        curentUser.role === 'mte' ? 'usage."arreteCadreId" is not null' : 'departements.code = :code_dep',
        {
          code_dep: curentUser.role_departement,
        },
      )
      .orWhere('usage.isTemplate = true')
      .getMany();
  }

  async create(usage: CreateUpdateUsageDto): Promise<Usage> {
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
    if (usageExists) {
      usage.id = usageExists.id;
    }
    await this.usageRepository.save(usage);
    return this.findOne(usage.nom);
  }

  async updateAllByRestriction(restriction: Restriction): Promise<Usage[]> {
    const usagesId = restriction.usages
      .map((u) => u.id)
      .flat();
    // SUPPRESSION DES ANCIENS USAGES
    await this.usageRepository.delete({
      restriction: {
        id: restriction.id,
      },
      id: Not(In(usagesId)),
    });
    const usages: Usage[] =
      restriction.usages.map((u) => {
        // @ts-expect-error on ajoute seulement l'id
        u.restriction = { id: restriction.id };
        return u;
      });
    return this.usageRepository.save(usages);
  }

  async updateAllByArreteCadre(arreteCadre: ArreteCadre): Promise<Usage[]> {
    const usagesId = arreteCadre.usages
      .map((u) => u.id)
      .flat();
    // SUPPRESSION DES ANCIENS USAGES
    await this.usageRepository.delete({
      arreteCadre: {
        id: arreteCadre.id,
      },
      id: Not(In(usagesId)),
    });
    const usages: Usage[] =
      arreteCadre.usages.map((u) => {
        // @ts-expect-error on ajoute seulement l'id
        u.arreteCadre = { id: arreteCadre.id };
        return u;
      });
    return this.usageRepository.save(usages);
  }

  findByArreteCadre(arreteCadreId: number) {
    return this.usageRepository.find({
      select: {
        id: true,
        nom: true,
        thematique: {
          id: true,
          nom: true,
        },
        concerneParticulier: true,
        concerneEntreprise: true,
        concerneCollectivite: true,
        concerneExploitation: true,
        concerneEso: true,
        concerneEsu: true,
        concerneAep: true,
        descriptionVigilance: true,
        descriptionAlerte: true,
        descriptionAlerteRenforcee: true,
        descriptionCrise: true,
      },
      relations: ['thematique'],
      where: {
        arreteCadre: {
          id: arreteCadreId,
        },
      },
      order: {
        nom: 'ASC',
      },
    });
  }

  async deleteUsagesArByArreteCadreId(usagesNom: string[], acId: number) {
    if (usagesNom.length < 1) {
      return;
    }
    const usagesArreteRestrictionsId =
      await this.usageRepository
        .createQueryBuilder('usage')
        .select('usage.id')
        .leftJoin('usage.restriction', 'restriction')
        .leftJoin('restriction.arreteRestriction', 'arreteRestriction')
        .leftJoin('arreteRestriction.arretesCadre', 'arretesCadre')
        .where('arretesCadre.id = :acId', { acId: acId })
        .andWhere('arreteRestriction.statut != :statut', { statut: 'abroge' })
        .andWhere('usage.nom IN (:...usagesNom)', { usagesNom: usagesNom })
        .getMany();
    return this.usageRepository.delete({
      id: In(usagesArreteRestrictionsId.map((u) => u.id)),
    });
  }
}
