import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { StatutArreteRestriction } from '../type/statut_arrete_restriction.type';
import { ArreteCadre } from '../../arrete_cadre/entities/arrete_cadre.entity';
import { Departement } from '../../departement/entities/departement.entity';
import { RessourceEapCommunique } from '../../arrete_cadre/type/arrete_cadre.type';
import { Restriction } from '../../restriction/entities/restriction.entity';
import { Fichier } from '../../fichier/entities/fichier.entity';

@Entity()
export class ArreteRestriction extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true, length: 50 })
  numero: string;

  @Column({ type: 'date', nullable: true })
  dateSignature: string;

  @Column({ type: 'date', nullable: true })
  dateDebut: string;

  @Column({ type: 'date', nullable: true })
  dateFin: string;

  @OneToOne(() => Fichier, (fichier) => fichier.arreteRestriction)
  @JoinColumn()
  fichier: Fichier;

  @Column('enum', {
    name: 'statut',
    enum: ['a_valider', 'a_venir', 'publie', 'abroge'],
    default: 'a_valider',
    nullable: false,
  })
  statut: StatutArreteRestriction;

  @Column({ nullable: true })
  niveauGraviteSpecifiqueEap: boolean;

  @Column('enum', {
    name: 'ressourceEapCommunique',
    enum: ['esu', 'eso', 'max'],
    nullable: true,
  })
  ressourceEapCommunique: RessourceEapCommunique;

  @ManyToOne(() => Departement, (departement) => departement.arretesRestriction)
  departement: Departement;

  @ManyToMany(
    () => ArreteCadre,
    (arreteCadre) => arreteCadre.arretesRestriction,
    { onDelete: 'CASCADE' },
  )
  arretesCadre: ArreteCadre[];

  @OneToMany(
    () => Restriction,
    (restriction) => restriction.arreteRestriction,
    { persistence: false },
  )
  restrictions: Restriction[];

  @CreateDateColumn({ select: false, type: 'timestamp' })
  created_at: number;

  @UpdateDateColumn({ select: false, type: 'timestamp' })
  updated_at: number;
}
