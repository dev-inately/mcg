import {
  Table,
  Column,
  Model,
  DataType,
  BelongsTo,
  ForeignKey,
  CreatedAt,
  UpdatedAt,
  Index,
} from 'sequelize-typescript';
import { User } from './user.model';
import { Wallet } from './wallet.model';
import { Plan } from './plan.model';

@Table({
  tableName: 'transactions',
  timestamps: true,
})
export class Transaction extends Model {
  declare id: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  @Index('idx_transactions_user_id')
  userId: number;

  @ForeignKey(() => Wallet)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  @Index('idx_transactions_wallet_id')
  walletId: number;

  @ForeignKey(() => Plan)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  planId: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  })
  amount: number;

  @BelongsTo(() => User)
  user: User;

  @BelongsTo(() => Wallet)
  wallet: Wallet;

  @BelongsTo(() => Plan)
  plan: Plan;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;
}
