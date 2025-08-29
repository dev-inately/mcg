import {
  Table,
  Column,
  Model,
  DataType,
  BelongsTo,
  ForeignKey,
  Index,
  CreatedAt,
  UpdatedAt,
} from 'sequelize-typescript';
import { User } from './user.model';
import { Plan } from './plan.model';
import { Product } from './product.model';

@Table({
  tableName: 'policies',
  timestamps: true,
  indexes: [
    {
      name: 'idx_policies_user_policy_type',
      fields: ['userId', 'policyTypeId'],
    },
  ],
})
export class Policy extends Model {
  declare id: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  userId: number;

  @ForeignKey(() => Plan)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  @Index('idx_policies_plan_id')
  planId: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  policyNumber: string;

  @ForeignKey(() => Product)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  policyTypeId: number; // aka product id

  @BelongsTo(() => User)
  user: User;

  @BelongsTo(() => Plan)
  plan: Plan;

  @BelongsTo(() => Product)
  product: Product;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;
}
