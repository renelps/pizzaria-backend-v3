import { Injectable, NotFoundException } from '@nestjs/common';
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
      const localized = pizza.translations.find(t => t.locale === locale);
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
    const { translations, ...rest } = data;

    return this.prisma.pizza.create({
      data: {
        ...rest,
        translations: {
          create: translations.map((t: TranslationDto) => ({
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

    const { translations, ...rest } = data;

    if (translations) {
      await this.prisma.pizzaTranslation.deleteMany({ where: { pizzaId: id } });
    }

    return this.prisma.pizza.update({
      where: { id },
      data: {
        ...rest,
        ...(translations
          ? {
              translations: {
                create: translations.map((t: TranslationDto) => ({
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
