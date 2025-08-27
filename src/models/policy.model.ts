import {
  Table,
  Column,
  Model,
  DataType,
  BelongsTo,
  ForeignKey,
  CreatedAt,
  UpdatedAt,
} from 'sequelize-typescript';
import { User } from './user.model';
import { Plan } from './plan.model';
import { PendingPolicy } from './pending-policy.model';

@Table({
  tableName: 'policies',
  timestamps: true,
})
export class Policy extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  declare id: number;

  @ForeignKey(() => PendingPolicy)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  pending_policy_id: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  user_id: number;

  @ForeignKey(() => Plan)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  plan_id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  policy_number: string;

  @CreatedAt
  created_at: Date;

  @UpdatedAt
  updated_at: Date;

  // Associations
  @BelongsTo(() => PendingPolicy)
  pending_policy: PendingPolicy;

  @BelongsTo(() => User)
  user: User;

  @BelongsTo(() => Plan)
  plan: Plan;
}
