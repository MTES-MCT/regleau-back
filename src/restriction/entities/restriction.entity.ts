import {
  BaseEntity,
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { ZoneAlerte } from '../../zone_alerte/entities/zone_alerte.entity';
import { NiveauGravite } from '../../arrete_restriction/type/niveau_gravite.type';
import { ArreteRestriction } from '../../arrete_restriction/entities/arrete_restriction.entity';
import { Commune } from '../../commune/entities/commune.entity';
import { ArreteCadre } from '../../arrete_cadre/entities/arrete_cadre.entity';
import { Usage } from '../../usage/entities/usage.entity';
import { ZoneAlerteComputed } from '../../zone_alerte_computed/entities/zone_alerte_computed.entity';

@Entity()
@Unique(['arreteRestriction', 'zoneAlerte'])
export class Restriction extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true, length: 255 })
  nomGroupementAep: string;

  @ManyToOne(
    () => ArreteRestriction,
    (arreteRestriction) => arreteRestriction.restrictions,
    { nullable: false, persistence: false, onDelete: 'CASCADE' },
  )
  arreteRestriction: ArreteRestriction;

  @ManyToOne(() => ZoneAlerte, (zoneAlerte) => zoneAlerte.restrictions)
  zoneAlerte: ZoneAlerte;

  @ManyToOne(() => ZoneAlerteComputed, (zoneAlerteComputed) => zoneAlerteComputed.restrictions)
  zoneAlerteComputed: ZoneAlerteComputed;

  @ManyToOne(() => ArreteCadre, (arreteCadre) => arreteCadre.restrictions)
  arreteCadre: ArreteCadre;

  @Column('enum', {
    name: 'niveauGravite',
    enum: ['vigilance', 'alerte', 'alerte_renforcee', 'crise'],
    nullable: true,
  })
  niveauGravite: NiveauGravite;

  @OneToMany(
    () => Usage,
    (usages) => usages.restriction,
    { persistence: false },
  )
  usages: Usage[];

  @ManyToMany(() => Commune, (commune) => commune.restrictions)
  @JoinTable({
    name: 'restriction_commune',
  })
  communes: Commune[];
}
