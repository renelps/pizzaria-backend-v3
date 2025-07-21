import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePizzaDto, TranslationDto } from './dto/create-pizza.dto';
import { UpdatePizzaDto } from './dto/update-pizza.dto';
import { FilterPizzaDto } from './dto/filter-pizza.dto';

@Injectable()
export class PizzaService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filter?: FilterPizzaDto) {
    return this.prisma.pizza.findMany({
      where: {
        price: {
          gte: filter?.minPrice,
          lte: filter?.maxPrice,
        },
      },
      include: { translations: true },
    });
  }

  async findOne(id: number, locale?: string) {
    const pizza = await this.prisma.pizza.findUnique({
      where: { id },
      include: { translations: true },
    });

    if (!pizza) throw new NotFoundException('Pizza not found');

    if (locale) {
      const localized = pizza.translations.find((t) => t.locale === locale);
      if (localized) {
        return {
          ...pizza,
          name: localized.name,
          description: localized.description,
        };
      }
    }

    return pizza;
  }

  async create(data: CreatePizzaDto) {
    const existingPizza = await this.prisma.pizza.findUnique({
      where: { slug: data.slug },
    });

    if (existingPizza) {
      throw new BadRequestException('Slug já está em uso por outra pizza.');
    }

    const { translations, price, ...rest } = data;

    if (!translations || !Array.isArray(translations)) {
      throw new BadRequestException('Invalid or missing translations');
    }

    const validTranslations = translations.filter(
      (t) =>
        t &&
        typeof t.locale === 'string' &&
        typeof t.name === 'string' &&
        (typeof t.description === 'string' || t.description === undefined),
    );

    if (validTranslations.length === 0) {
      throw new BadRequestException('No valid translations provided');
    }

    return this.prisma.pizza.create({
      data: {
        ...rest,
        price: typeof price === 'string' ? parseFloat(price) : price,
        translations: {
          create: validTranslations.map((t: TranslationDto) => ({
            locale: t.locale,
            name: t.name,
            description: t.description,
          })),
        },
      },
      include: { translations: true },
    });
  }

  async update(id: number, data: UpdatePizzaDto) {
    const pizzaExists = await this.prisma.pizza.findUnique({ where: { id } });
    if (!pizzaExists) throw new NotFoundException('Pizza not found');

    const { translations, price, slug, ...rest } = data;

    if (slug && slug !== pizzaExists.slug) {
      const slugExists = await this.prisma.pizza.findUnique({
        where: { slug },
      });
      if (slugExists) {
        throw new BadRequestException('Slug já está em uso por outra pizza.');
      }
    }

    let validTranslations: TranslationDto[] = [];

    if (translations) {
      validTranslations = translations.filter(
        (t) =>
          t &&
          typeof t.locale === 'string' &&
          typeof t.name === 'string' &&
          (typeof t.description === 'string' || t.description === undefined),
      );

      await this.prisma.pizzaTranslation.deleteMany({
        where: { pizzaId: id },
      });
    }

    return this.prisma.pizza.update({
      where: { id },
      data: {
        slug,
        ...rest,
        ...(price !== undefined
          ? { price: typeof price === 'string' ? parseFloat(price) : price }
          : {}),
        ...(validTranslations.length > 0
          ? {
              translations: {
                create: validTranslations.map((t: TranslationDto) => ({
                  locale: t.locale,
                  name: t.name,
                  description: t.description,
                })),
              },
            }
          : {}),
      },
      include: { translations: true },
    });
  }

  async remove(id: number) {
    const pizzaExists = await this.prisma.pizza.findUnique({ where: { id } });
    if (!pizzaExists) throw new NotFoundException('Pizza not found');

    return this.prisma.pizza.delete({ where: { id } });
  }
}
