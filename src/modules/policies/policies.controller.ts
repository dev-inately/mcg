import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Query,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { PoliciesService } from './policies.service';
import { PolicyResponseDto, PolicyFilterDto } from '../../dto/policy.dto';
import { ActivatePendingPolicyDto } from '../../dto/pending-policy.dto';

@ApiTags('Policies')
@Controller('policies')
export class PoliciesController {
  private readonly logger = new Logger(PoliciesController.name);

  constructor(private readonly policiesService: PoliciesService) {}

  @Post('activate')
  @ApiOperation({ summary: 'Activate a pending policy' })
  @ApiBody({ type: ActivatePendingPolicyDto })
  @ApiResponse({
    status: 201,
    description: 'Policy activated successfully',
    type: PolicyResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - policy already used or user limit exceeded',
  })
  @ApiResponse({
    status: 404,
    description: 'Pending policy not found',
  })
  async activatePendingPolicy(
    @Body() activateDto: ActivatePendingPolicyDto,
  ): Promise<PolicyResponseDto> {
    this.logger.log('POST /policies/activate - Activating pending policy', {
      pendingPolicyId: activateDto.pending_policy_id,
    });
    
    const startTime = Date.now();
    
    try {
      const result = await this.policiesService.activatePendingPolicy(activateDto);
      const duration = Date.now() - startTime;
      
      this.logger.log('POST /policies/activate - Policy activated successfully', {
        policyId: result.id,
        policyNumber: result.policy_number,
        userId: result.user_id,
        planId: result.plan_id,
        duration: `${duration}ms`,
      });
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error('POST /policies/activate - Failed to activate policy', {
        activateDto,
        error: error.message,
        duration: `${duration}ms`,
      });
      throw error;
    }
  }

  @Get()
  @ApiOperation({
    summary: 'Get all activated policies with optional filtering',
  })
  @ApiQuery({
    name: 'plan_id',
    required: false,
    description: 'Filter policies by plan ID',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'List of activated policies',
    type: [PolicyResponseDto],
  })
  async findAll(
    @Query() filters: PolicyFilterDto,
  ): Promise<PolicyResponseDto[]> {
    this.logger.log('GET /policies - Fetching all activated policies', { filters });
    const startTime = Date.now();
    
    try {
      const result = await this.policiesService.findAll(filters);
      const duration = Date.now() - startTime;
      
      this.logger.log('GET /policies - Successfully fetched policies', {
        policyCount: result.length,
        filters,
        duration: `${duration}ms`,
      });
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error('GET /policies - Failed to fetch policies', {
        filters,
        error: error.message,
        duration: `${duration}ms`,
      });
      throw error;
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get policy by ID' })
  @ApiParam({ name: 'id', description: 'Policy ID' })
  @ApiResponse({
    status: 200,
    description: 'Policy details',
    type: PolicyResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Policy not found',
  })
  async findById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<PolicyResponseDto | null> {
    this.logger.log(`GET /policies/${id} - Fetching policy by ID`);
    const startTime = Date.now();
    
    try {
      const result = await this.policiesService.findById(id);
      const duration = Date.now() - startTime;
      
      if (result) {
        this.logger.log(`GET /policies/${id} - Successfully fetched policy`, {
          policyId: id,
          policyNumber: result.policy_number,
          userName: result.user.name,
          duration: `${duration}ms`,
        });
      } else {
        this.logger.warn(`GET /policies/${id} - Policy not found`, {
          policyId: id,
          duration: `${duration}ms`,
        });
      }
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(`GET /policies/${id} - Failed to fetch policy`, {
        policyId: id,
        error: error.message,
        duration: `${duration}ms`,
      });
      throw error;
    }
  }
}
