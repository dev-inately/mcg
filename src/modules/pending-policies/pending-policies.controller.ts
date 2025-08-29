import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { PendingPoliciesService } from './pending-policies.service';
import { PendingPolicyResponseDto } from '../../dto/pending-policy.dto';
import {
  ResponseHelper,
  ApiResponse as CustomApiResponse,
} from '../../common/helpers';

@ApiTags('Pending Policies')
@Controller('/v1/plans')
export class PendingPoliciesController {
  constructor(
    private readonly pendingPoliciesService: PendingPoliciesService,
  ) {}

  @Get(':id/pending-policies')
  @ApiOperation({ summary: 'Get pending policies under a plan' })
  @ApiParam({ name: 'id', description: 'Plan ID' })
  @ApiResponse({
    status: 200,
    description: 'List of pending policies under the plan',
  })
  async findByPlanId(
    @Param('id', ParseIntPipe) planId: number,
  ): Promise<CustomApiResponse<PendingPolicyResponseDto[]>> {
    const pendingPolicies =
      await this.pendingPoliciesService.findByPlanId(planId);
    return ResponseHelper.success(
      pendingPolicies,
      'Pending policies retrieved successfully',
    );
  }

  @Get(':id/pending-policies/unused')
  @ApiOperation({ summary: 'Get unused pending policies under a plan' })
  @ApiParam({ name: 'id', description: 'Plan ID' })
  @ApiResponse({
    status: 200,
    description: 'List of unused pending policies under the plan',
  })
  async findUnusedByPlanId(
    @Param('id', ParseIntPipe) planId: number,
  ): Promise<CustomApiResponse<PendingPolicyResponseDto[]>> {
    const unusedPolicies =
      await this.pendingPoliciesService.findUnusedByPlanId(planId);
    return ResponseHelper.success(
      unusedPolicies,
      'Unused pending policies retrieved successfully',
    );
  }
}
