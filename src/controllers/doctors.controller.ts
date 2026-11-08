import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const getDoctors = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string, 10) || 10));
    const skip = (page - 1) * limit;

    const search = (req.query.search as string)?.trim();
    const specializationId = req.query.specialization_id as string;
    const sortBy = (req.query.sort_by as string) || 'rating';
    const sortOrder = ((req.query.sort_order as string)?.toLowerCase() === 'asc') ? 'asc' : 'desc';

    const where: any = {};

    if (specializationId) {
      where.specializationId = specializationId;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { hospitalName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const orderBy: any = {};
    if (sortBy === 'rating') {
      orderBy.rating = sortOrder;
    } else if (sortBy === 'review_count') {
      orderBy.reviewCount = sortOrder;
    } else if (sortBy === 'name') {
      orderBy.name = sortOrder;
    } else if (sortBy === 'created_at') {
      orderBy.createdAt = sortOrder;
    } else {
      orderBy.rating = 'desc';
    }

    const [totalItems, doctors] = await Promise.all([
      prisma.doctor.count({ where }),
      prisma.doctor.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          specialization: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(totalItems / limit) || 1;

    const formattedDoctors = doctors.map((doc) => ({
      id: doc.id,
      name: doc.name,
      hospital_name: doc.hospitalName,
      rating: Number(doc.rating),
      review_count: doc.reviewCount,
      profile_image_url: doc.profileImageUrl,
      is_available: doc.isAvailable,
      specialization: doc.specialization,
    }));

    res.status(200).json({
      status: 'success',
      data: {
        doctors: formattedDoctors,
      },
      meta: {
        pagination: {
          current_page: page,
          per_page: limit,
          total_items: totalItems,
          total_pages: totalPages,
          has_next_page: page < totalPages,
          has_prev_page: page > 1,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({
      status: 'error',
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to retrieve doctors',
    });
  }
};

export const getRecommendedDoctors = async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = Math.max(1, parseInt(req.query.limit as string, 10) || 5);

    const recommendedDoctors = await prisma.doctor.findMany({
      where: {
        isRecommended: true,
      },
      take: limit,
      orderBy: [
        { rating: 'desc' },
        { reviewCount: 'desc' },
      ],
      include: {
        specialization: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    const formattedDoctors = recommendedDoctors.map((doc) => ({
      id: doc.id,
      name: doc.name,
      hospital_name: doc.hospitalName,
      rating: Number(doc.rating),
      review_count: doc.reviewCount,
      profile_image_url: doc.profileImageUrl,
      is_available: doc.isAvailable,
      specialization: doc.specialization,
    }));

    res.status(200).json({
      status: 'success',
      data: {
        recommended_doctors: formattedDoctors,
      },
    });
  } catch (error) {
    console.error('Error fetching recommended doctors:', error);
    res.status(500).json({
      status: 'error',
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to retrieve recommended doctors',
    });
  }
};

export const getDoctorById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;

    if (!id) {
      res.status(400).json({
        status: 'error',
        code: 'VALIDATION_ERROR',
        message: 'Doctor ID is required',
      });
      return;
    }

    const doctor = await prisma.doctor.findUnique({
      where: { id },
      include: {
        specialization: {
          select: {
            id: true,
            name: true,
            slug: true,
            iconUrl: true,
          },
        },
      },
    });

    if (!doctor) {
      res.status(404).json({
        status: 'error',
        code: 'NOT_FOUND',
        message: `Doctor with ID ${id} not found`,
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      data: {
        doctor: {
          id: doctor.id,
          name: doctor.name,
          hospital_name: doctor.hospitalName,
          rating: Number(doctor.rating),
          review_count: doctor.reviewCount,
          profile_image_url: doctor.profileImageUrl,
          bio: doctor.bio,
          consultation_fee: doctor.consultationFee ? Number(doctor.consultationFee) : null,
          is_available: doctor.isAvailable,
          specialization: {
            id: doctor.specialization.id,
            name: doctor.specialization.name,
            slug: doctor.specialization.slug,
            icon_url: doctor.specialization.iconUrl,
          },
          created_at: doctor.createdAt,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching doctor by id:', error);
    res.status(500).json({
      status: 'error',
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to retrieve doctor details',
    });
  }
};
