import {
  Table,
  Column,
  Model,
  DataType,
  BelongsTo,
  ForeignKey,
  UpdatedAt,
  CreatedAt,
  DeletedAt,
} from 'sequelize-typescript';
import { Plan } from './plan.model';

@Table({
  tableName: 'pending_policies',
  timestamps: true,
  paranoid: true,
})
export class PendingPolicy extends Model {
  declare id: number;

  @ForeignKey(() => Plan)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  planId: number;

  @Column({
    type: DataType.ENUM('unused', 'used'),
    allowNull: false,
    defaultValue: 'unused',
  })
  status: 'unused' | 'used';

  // Associations
  @BelongsTo(() => Plan)
  plan: Plan;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;

  @DeletedAt
  deletedAt: Date;
}
