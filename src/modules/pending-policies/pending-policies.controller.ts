import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { PendingPoliciesService } from './pending-policies.service';
import { PendingPolicyResponseDto } from '../../dto/pending-policy.dto';

@ApiTags('Pending Policies')
@Controller('plans')
export class PendingPoliciesController {
  constructor(private readonly pendingPoliciesService: PendingPoliciesService) {}

  @Get(':id/pending-policies')
  @ApiOperation({ summary: 'Get pending policies under a plan' })
  @ApiParam({ name: 'id', description: 'Plan ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of pending policies under the plan',
    type: [PendingPolicyResponseDto]
  })
  async findByPlanId(@Param('id', ParseIntPipe) planId: number): Promise<PendingPolicyResponseDto[]> {
    return this.pendingPoliciesService.findByPlanId(planId);
  }

  @Get(':id/pending-policies/unused')
  @ApiOperation({ summary: 'Get unused pending policies under a plan' })
  @ApiParam({ name: 'id', description: 'Plan ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of unused pending policies under the plan',
    type: [PendingPolicyResponseDto]
  })
  async findUnusedByPlanId(@Param('id', ParseIntPipe) planId: number): Promise<PendingPolicyResponseDto[]> {
    return this.pendingPoliciesService.findUnusedByPlanId(planId);
  }
}
