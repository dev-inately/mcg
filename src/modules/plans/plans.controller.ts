import { Controller, Post, Get, Body, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { PlansService } from './plans.service';
import { CreatePlanDto, PlanResponseDto } from '../../dto/plan.dto';

@ApiTags('Plans')
@Controller('plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Post()
  @ApiOperation({ summary: 'Purchase a plan' })
  @ApiBody({ type: CreatePlanDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Plan purchased successfully',
    type: PlanResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - insufficient funds or duplicate plan' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'User or product not found' 
  })
  async createPlan(@Body() createPlanDto: CreatePlanDto): Promise<PlanResponseDto> {
    return this.plansService.createPlan(createPlanDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get plan by ID' })
  @ApiParam({ name: 'id', description: 'Plan ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Plan details',
    type: PlanResponseDto
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Plan not found' 
  })
  async findById(@Param('id', ParseIntPipe) id: number): Promise<PlanResponseDto | null> {
    return this.plansService.findById(id);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get all plans for a user' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of user plans',
    type: [PlanResponseDto]
  })
  async findByUserId(@Param('userId', ParseIntPipe) userId: number): Promise<PlanResponseDto[]> {
    return this.plansService.findByUserId(userId);
  }
}
