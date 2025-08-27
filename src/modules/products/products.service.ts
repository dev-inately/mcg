import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Product } from '../../models/product.model';
import { ProductCategory } from '../../models/product-category.model';
import { ProductResponseDto, ProductCategoryResponseDto } from '../../dto/product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product)
    private readonly productModel: typeof Product,
    @InjectModel(ProductCategory)
    private readonly productCategoryModel: typeof ProductCategory,
  ) {}

  async findAll(): Promise<ProductResponseDto[]> {
    const products = await this.productModel.findAll({
      include: [
        {
          model: ProductCategory,
          as: 'category',
          attributes: ['id', 'name', 'description'],
        },
      ],
      order: [['created_at', 'ASC']],
    });

    return products.map(product => ({
      id: product.id,
      name: product.name,
      price: product.price,
      category_id: product.category_id,
      category: {
        id: product.category.id,
        name: product.category.name,
        description: product.category.description,
      },
      created_at: product.created_at,
      updated_at: product.updated_at,
    }));
  }

  async findByCategory(categoryId: number): Promise<ProductResponseDto[]> {
    const products = await this.productModel.findAll({
      where: { category_id: categoryId },
      include: [
        {
          model: ProductCategory,
          as: 'category',
          attributes: ['id', 'name', 'description'],
        },
      ],
      order: [['created_at', 'ASC']],
    });

    return products.map(product => ({
      id: product.id,
      name: product.name,
      price: product.price,
      category_id: product.category_id,
      category: {
        id: product.category.id,
        name: product.category.name,
        description: product.category.description,
      },
      created_at: product.created_at,
      updated_at: product.updated_at,
    }));
  }

  async findAllCategories(): Promise<ProductCategoryResponseDto[]> {
    const categories = await this.productCategoryModel.findAll({
      include: [
        {
          model: Product,
          as: 'products',
          attributes: ['id', 'name', 'price'],
        },
      ],
      order: [['created_at', 'ASC']],
    });

    return categories.map(category => ({
      id: category.id,
      name: category.name,
      description: category.description,
      products: category.products.map(product => ({
        id: product.id,
        name: product.name,
        price: product.price,
        category_id: category.id,
        category: {
          id: category.id,
          name: category.name,
          description: category.description,
        },
        created_at: product.created_at,
        updated_at: product.updated_at,
      })),
      created_at: category.created_at,
      updated_at: category.updated_at,
    }));
  }

  async findById(id: number): Promise<ProductResponseDto | null> {
    const product = await this.productModel.findByPk(id, {
      include: [
        {
          model: ProductCategory,
          as: 'category',
          attributes: ['id', 'name', 'description'],
        },
      ],
    });

    if (!product) {
      return null;
    }

    return {
      id: product.id,
      name: product.name,
      price: product.price,
      category_id: product.category_id,
      category: {
        id: product.category.id,
        name: product.category.name,
        description: product.category.description,
      },
      created_at: product.created_at,
      updated_at: product.updated_at,
    };
  }
}
