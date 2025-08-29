import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { PlansService } from './plans.service';
import { CreatePlanDto, PlanResponseDto } from '../../dto/plan.dto';
import {
  ResponseHelper,
  ApiResponse as CustomApiResponse,
} from '../../common/helpers';

@ApiTags('Plans')
@Controller('/v1/plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Post()
  @ApiOperation({ summary: 'Buy a new plan' })
  @ApiBody({ type: CreatePlanDto })
  @ApiResponse({
    status: 201,
    description: 'Plan created successfully',
    type: PlanResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - insufficient wallet balance or duplicate plan',
  })
  @ApiResponse({
    status: 404,
    description: 'User or product not found',
  })
  async createPlan(
    @Body() createPlanDto: CreatePlanDto,
  ): Promise<CustomApiResponse<PlanResponseDto>> {
    const plan = await this.plansService.createPlan(createPlanDto);
    return ResponseHelper.success(plan, 'Insurance plan created successfully');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get plan by ID' })
  @ApiParam({ name: 'id', description: 'Plan ID' })
  @ApiResponse({
    status: 200,
    description: 'Plan details',
  })
  @ApiResponse({
    status: 404,
    description: 'Plan not found',
  })
  async findById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CustomApiResponse<PlanResponseDto | null>> {
    const plan = await this.plansService.findById(id);
    return ResponseHelper.success(
      plan,
      'Insurance plan retrieved successfully',
    );
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get all plans for a user' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'List of user plans',
  })
  async findByUserId(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<CustomApiResponse<PlanResponseDto[]>> {
    const plans = await this.plansService.findByUserId(userId);
    return ResponseHelper.success(
      plans,
      'User insurance plans retrieved successfully',
    );
  }
}
