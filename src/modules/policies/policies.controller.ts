import { Controller, Get, Post, Body, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiQuery } from '@nestjs/swagger';
import { PoliciesService } from './policies.service';
import { PolicyResponseDto, PolicyFilterDto } from '../../dto/policy.dto';
import { ActivatePendingPolicyDto } from '../../dto/pending-policy.dto';

@ApiTags('Policies')
@Controller('policies')
export class PoliciesController {
  constructor(private readonly policiesService: PoliciesService) {}

  @Post('activate')
  @ApiOperation({ summary: 'Activate a pending policy' })
  @ApiBody({ type: ActivatePendingPolicyDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Policy activated successfully',
    type: PolicyResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - policy already used or user limit exceeded' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Pending policy not found' 
  })
  async activatePendingPolicy(@Body() activateDto: ActivatePendingPolicyDto): Promise<PolicyResponseDto> {
    return this.policiesService.activatePendingPolicy(activateDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all activated policies with optional filtering' })
  @ApiQuery({ 
    name: 'plan_id', 
    required: false, 
    description: 'Filter policies by plan ID',
    type: Number
  })
  @ApiResponse({ 
    status: 200, 
    description: 'List of activated policies',
    type: [PolicyResponseDto]
  })
  async findAll(@Query() filters: PolicyFilterDto): Promise<PolicyResponseDto[]> {
    return this.policiesService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get policy by ID' })
  @ApiParam({ name: 'id', description: 'Policy ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Policy details',
    type: PolicyResponseDto
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Policy not found' 
  })
  async findById(@Param('id', ParseIntPipe) id: number): Promise<PolicyResponseDto | null> {
    return this.policiesService.findById(id);
  }
}
