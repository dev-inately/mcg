import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  ParseIntPipe,
  Logger,
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

@ApiTags('Plans')
@Controller('plans')
export class PlansController {
  private readonly logger = new Logger(PlansController.name);

  constructor(private readonly plansService: PlansService) {}

  @Post()
  @ApiOperation({ summary: 'Purchase a plan' })
  @ApiBody({ type: CreatePlanDto })
  @ApiResponse({
    status: 201,
    description: 'Plan purchased successfully',
    type: PlanResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - insufficient funds or duplicate plan',
  })
  @ApiResponse({
    status: 404,
    description: 'User or product not found',
  })
  async createPlan(
    @Body() createPlanDto: CreatePlanDto,
  ): Promise<PlanResponseDto> {
    this.logger.log('POST /plans - Creating new plan', {
      userId: createPlanDto.user_id,
      productId: createPlanDto.product_id,
      quantity: createPlanDto.quantity,
    });
    
    const startTime = Date.now();
    
    try {
      const result = await this.plansService.createPlan(createPlanDto);
      const duration = Date.now() - startTime;
      
      this.logger.log('POST /plans - Plan created successfully', {
        planId: result.id,
        userId: result.user_id,
        productId: result.product_id,
        quantity: result.quantity,
        totalAmount: result.total_amount,
        duration: `${duration}ms`,
      });
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error('POST /plans - Failed to create plan', {
        createPlanDto,
        error: error.message,
        duration: `${duration}ms`,
      });
      throw error;
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get plan by ID' })
  @ApiParam({ name: 'id', description: 'Plan ID' })
  @ApiResponse({
    status: 200,
    description: 'Plan details',
    type: PlanResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Plan not found',
  })
  async findById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<PlanResponseDto | null> {
    this.logger.log(`GET /plans/${id} - Fetching plan by ID`);
    const startTime = Date.now();
    
    try {
      const result = await this.plansService.findById(id);
      const duration = Date.now() - startTime;
      
      if (result) {
        this.logger.log(`GET /plans/${id} - Successfully fetched plan`, {
          planId: id,
          userName: result.user.name,
          productName: result.product.name,
          duration: `${duration}ms`,
        });
      } else {
        this.logger.warn(`GET /plans/${id} - Plan not found`, {
          planId: id,
          duration: `${duration}ms`,
        });
      }
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(`GET /plans/${id} - Failed to fetch plan`, {
        planId: id,
        error: error.message,
        duration: `${duration}ms`,
      });
      throw error;
    }
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get all plans for a user' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'List of user plans',
    type: [PlanResponseDto],
  })
  async findByUserId(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<PlanResponseDto[]> {
    this.logger.log(`GET /plans/user/${userId} - Fetching plans for user`);
    const startTime = Date.now();
    
    try {
      const result = await this.plansService.findByUserId(userId);
      const duration = Date.now() - startTime;
      
      this.logger.log(`GET /plans/user/${userId} - Successfully fetched user plans`, {
        userId,
        planCount: result.length,
        totalSpent: result.reduce((sum, plan) => sum + plan.total_amount, 0),
        duration: `${duration}ms`,
      });
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(`GET /plans/user/${userId} - Failed to fetch user plans`, {
        userId,
        error: error.message,
        duration: `${duration}ms`,
      });
      throw error;
    }
  }
}
