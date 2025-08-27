import {
  Table,
  Column,
  Model,
  DataType,
  BelongsTo,
  HasOne,
  ForeignKey,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
} from 'sequelize-typescript';
import { Plan } from './plan.model';
import { Policy } from './policy.model';

@Table({
  tableName: 'pending_policies',
  timestamps: true,
  paranoid: true, // Enables soft delete
})
export class PendingPolicy extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  declare id: number;

  @ForeignKey(() => Plan)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  plan_id: number;

  @Column({
    type: DataType.ENUM('unused', 'used'),
    allowNull: false,
    defaultValue: 'unused',
  })
  status: 'unused' | 'used';

  @CreatedAt
  created_at: Date;

  @UpdatedAt
  updated_at: Date;

  @DeletedAt
  deleted_at: Date;

  // Associations
  @BelongsTo(() => Plan)
  plan: Plan;

  @HasOne(() => Policy)
  policy: Policy;
}
