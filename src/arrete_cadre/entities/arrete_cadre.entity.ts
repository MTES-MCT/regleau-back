import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ZoneAlerte } from '../../zone_alerte/entities/zone_alerte.entity';
import {
  AffichageRessource,
  CommuneNiveauGraviteMax,
  RessourceEapCommunique,
  StatutArreteCadre,
} from '../type/arrete_cadre.type';
import { Departement } from '../../departement/entities/departement.entity';
import { UsageArreteCadre } from '../../usage_arrete_cadre/entities/usage_arrete_cadre.entity';
import { ArreteRestriction } from '../../arrete_restriction/entities/arrete_restriction.entity';

@Entity()
export class ArreteCadre extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true, length: 50 })
  numero: string;

  @Column({ type: 'date', nullable: true })
  dateDebut: string;

  @Column({ type: 'date', nullable: true })
  dateFin: string;

  @Column({ nullable: true, length: 200 })
  url: string;

  @Column({ nullable: true, length: 200 })
  urlDdt: string;

  @Column('enum', {
    name: 'statut',
    enum: ['a_valider', 'publie', 'abroge'],
    default: 'a_valider',
    nullable: false,
  })
  statut: StatutArreteCadre;

  @Column('enum', {
    name: 'communeNiveauGraviteMax',
    enum: ['all', 'eap', 'none'],
    nullable: true,
  })
  communeNiveauGraviteMax: CommuneNiveauGraviteMax;

  @Column({ nullable: true })
  niveauGraviteSpecifiqueEap: boolean;

  @Column('enum', {
    name: 'ressourceEapCommunique',
    enum: ['esu', 'eso', 'max'],
    nullable: true,
  })
  ressourceEapCommunique: RessourceEapCommunique;

  @Column('enum', {
    name: 'affichageRessourceParticulier',
    enum: ['esu', 'eso', 'aep', 'max'],
    nullable: true,
  })
  affichageRessourceParticulier: AffichageRessource;

  @Column('enum', {
    name: 'affichageRessourceCollectivite',
    enum: ['esu', 'eso', 'aep', 'max'],
    nullable: true,
  })
  affichageRessourceCollectivite: AffichageRessource;

  @Column('enum', {
    name: 'affichageRessourceEntreprise',
    enum: ['esu', 'eso', 'aep', 'max'],
    nullable: true,
  })
  affichageRessourceEntreprise: AffichageRessource;

  @Column('enum', {
    name: 'affichageRessourceExploitation',
    enum: ['esu', 'eso', 'aep', 'max'],
    nullable: true,
  })
  affichageRessourceExploitation: AffichageRessource;

  @ManyToMany(
    () => ArreteRestriction,
    (ArreteRestriction) => ArreteRestriction.arretesCadre,
  )
  @JoinTable({
    name: 'arrete_cadre_arrete_restriction',
  })
  arretesRestriction: ArreteRestriction[];

  @ManyToMany(() => Departement, (departement) => departement.arretesCadre)
  @JoinTable({
    name: 'arrete_cadre_departement',
  })
  departements: Departement[];

  @ManyToMany(() => ZoneAlerte, (zoneAlerte) => zoneAlerte.arretesCadre)
  @JoinTable({
    name: 'arrete_cadre_zone_alerte',
  })
  zonesAlerte: ZoneAlerte[];

  @OneToMany(
    () => UsageArreteCadre,
    (usagesArreteCadre) => usagesArreteCadre.arreteCadre,
    { persistence: false },
  )
  usagesArreteCadre: UsageArreteCadre[];

  @CreateDateColumn({ select: false, type: 'timestamp' })
  created_at: number;

  @UpdateDateColumn({ select: false, type: 'timestamp' })
  updated_at: number;
}
