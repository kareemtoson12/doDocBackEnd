import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const getSpecializations = async (req: Request, res: Response): Promise<void> => {
  try {
    const limitQuery = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
    const sortQuery = (req.query.sort as string) || 'display_order:asc';

    const [field, direction] = sortQuery.split(':');
    const orderDirection = direction === 'desc' ? 'desc' : 'asc';
    const orderBy: Record<string, 'asc' | 'desc'> = {};

    if (field === 'name') {
      orderBy.name = orderDirection;
    } else {
      orderBy.displayOrder = orderDirection;
    }

    const [total, specializations] = await Promise.all([
      prisma.specialization.count(),
      prisma.specialization.findMany({
        take: limitQuery && !isNaN(limitQuery) ? limitQuery : undefined,
        orderBy,
        include: {
          _count: {
            select: { doctors: true },
          },
        },
      }),
    ]);

    const formattedSpecializations = specializations.map((spec) => ({
      id: spec.id,
      name: spec.name,
      slug: spec.slug,
      icon_url: spec.iconUrl,
      description: spec.description,
      display_order: spec.displayOrder,
      doctor_count: spec._count.doctors,
      created_at: spec.createdAt,
      updated_at: spec.updatedAt,
    }));

    res.status(200).json({
      status: 'success',
      data: {
        specializations: formattedSpecializations,
      },
      meta: {
        total,
      },
    });
  } catch (error) {
    console.error('Error fetching specializations:', error);
    res.status(500).json({
      status: 'error',
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to retrieve specializations',
    });
  }
};

