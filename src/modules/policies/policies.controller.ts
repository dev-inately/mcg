import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseIntPipe,
  NotFoundException,
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
import {
  ResponseHelper,
  ApiResponse as CustomApiResponse,
} from '../../common/helpers';

@ApiTags('Policies')
@Controller('/v1/policies')
export class PoliciesController {
  constructor(private readonly policiesService: PoliciesService) {}

  @Post('activate')
  @ApiOperation({ summary: 'Activate a pending policy' })
  @ApiBody({ type: ActivatePendingPolicyDto })
  @ApiResponse({
    status: 201,
    description: 'Policy activated successfully',
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
  ): Promise<CustomApiResponse<PolicyResponseDto>> {
    const policy =
      await this.policiesService.activatePendingPolicy(activateDto);
    return ResponseHelper.success(
      policy,
      'Insurance policy activated successfully',
    );
  }

  @Get()
  @ApiOperation({
    summary: 'Get all activated policies with optional filtering',
  })
  @ApiQuery({
    name: 'planId',
    required: false,
    description: 'Filter policies by plan ID',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'List of activated policies',
  })
  async findAll(
    @Query('planId', ParseIntPipe) planId: number,
  ): Promise<CustomApiResponse<PolicyResponseDto[]>> {
    const policies = await this.policiesService.findAll({ planId });
    return ResponseHelper.success(
      policies,
      'Insurance policies retrieved successfully',
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get policy by ID' })
  @ApiParam({ name: 'id', description: 'Policy ID' })
  @ApiResponse({
    status: 200,
    description: 'Policy details',
  })
  @ApiResponse({
    status: 404,
    description: 'Policy not found',
  })
  async findById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CustomApiResponse<PolicyResponseDto | null>> {
    const policy = await this.policiesService.findById(id);

    if (!policy) {
      throw new NotFoundException(`Policy with ID ${id} not found`);
    }

    return ResponseHelper.success(
      policy,
      'Insurance policy retrieved successfully',
    );
  }
}
