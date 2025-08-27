import { Controller, Get, Param, ParseIntPipe, Logger } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { PendingPoliciesService } from './pending-policies.service';
import { PendingPolicyResponseDto } from '../../dto/pending-policy.dto';

@ApiTags('Pending Policies')
@Controller('plans')
export class PendingPoliciesController {
  private readonly logger = new Logger(PendingPoliciesController.name);

  constructor(
    private readonly pendingPoliciesService: PendingPoliciesService,
  ) {}

  @Get(':id/pending-policies')
  @ApiOperation({ summary: 'Get pending policies under a plan' })
  @ApiParam({ name: 'id', description: 'Plan ID' })
  @ApiResponse({
    status: 200,
    description: 'List of pending policies under the plan',
    type: [PendingPolicyResponseDto],
  })
  async findByPlanId(
    @Param('id', ParseIntPipe) planId: number,
  ): Promise<PendingPolicyResponseDto[]> {
    this.logger.log(`GET /plans/${planId}/pending-policies - Fetching pending policies for plan`);
    const startTime = Date.now();
    
    try {
      const result = await this.pendingPoliciesService.findByPlanId(planId);
      const duration = Date.now() - startTime;
      
      this.logger.log(`GET /plans/${planId}/pending-policies - Successfully fetched pending policies`, {
        planId,
        pendingPolicyCount: result.length,
        duration: `${duration}ms`,
      });
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(`GET /plans/${planId}/pending-policies - Failed to fetch pending policies`, {
        planId,
        error: error.message,
        duration: `${duration}ms`,
      });
      throw error;
    }
  }

  @Get(':id/pending-policies/unused')
  @ApiOperation({ summary: 'Get unused pending policies under a plan' })
  @ApiParam({ name: 'id', description: 'Plan ID' })
  @ApiResponse({
    status: 200,
    description: 'List of unused pending policies under the plan',
    type: [PendingPolicyResponseDto],
  })
  async findUnusedByPlanId(
    @Param('id', ParseIntPipe) planId: number,
  ): Promise<PendingPolicyResponseDto[]> {
    this.logger.log(`GET /plans/${planId}/pending-policies/unused - Fetching unused pending policies for plan`);
    const startTime = Date.now();
    
    try {
      const result = await this.pendingPoliciesService.findUnusedByPlanId(planId);
      const duration = Date.now() - startTime;
      
      this.logger.log(`GET /plans/${planId}/pending-policies/unused - Successfully fetched unused pending policies`, {
        planId,
        unusedPolicyCount: result.length,
        duration: `${duration}ms`,
      });
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(`GET /plans/${planId}/pending-policies/unused - Failed to fetch unused pending policies`, {
        planId,
        error: error.message,
        duration: `${duration}ms`,
      });
      throw error;
    }
  }
}
