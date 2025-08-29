import {
  Table,
  Column,
  Model,
  DataType,
  HasMany,
  HasOne,
  UpdatedAt,
  CreatedAt,
} from 'sequelize-typescript';
import { Plan } from './plan.model';
import { Policy } from './policy.model';
import { Wallet } from './wallet.model';
import { Transaction } from './transaction.model';

@Table({
  tableName: 'users',
  timestamps: true,
})
export class User extends Model {
  declare id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  fullName: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  email: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  phoneNumber: string;

  // Associations
  @HasMany(() => Plan)
  plans: Plan[];

  @HasMany(() => Policy)
  policies: Policy[];

  @HasMany(() => Transaction)
  transactions: Transaction[];

  @HasOne(() => Wallet)
  wallet: Wallet;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;
}
