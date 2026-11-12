import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Specializations
  const specializations = [
    {
      id: '1d8cf01b-97c2-48df-9f33-c23f66c98aa1',
      name: 'General',
      slug: 'general',
      iconUrl: 'https://img.icons8.com/color/96/stethoscope.png',
      description: 'General medicine and outpatient primary care consultations.',
      displayOrder: 1,
    },
    {
      id: '2e7a33bc-11a8-43d9-951c-43f9a77bd202',
      name: 'Neurologic',
      slug: 'neurologic',
      iconUrl: 'https://img.icons8.com/color/96/brain.png',
      description: 'Diagnosis and treatment of disorders of the nervous system.',
      displayOrder: 2,
    },
    {
      id: '3f8b44cd-22b9-44e0-962d-540ab88ce313',
      name: 'Pediatric',
      slug: 'pediatric',
      iconUrl: 'https://img.icons8.com/color/96/baby.png',
      description: 'Medical care for infants, children, and adolescents.',
      displayOrder: 3,
    },
    {
      id: '4a9c55de-33ca-45f1-973e-651bc99df424',
      name: 'Radiology',
      slug: 'radiology',
      iconUrl: 'https://img.icons8.com/color/96/xray.png',
      description: 'Medical imaging technologies to diagnose and treat diseases.',
      displayOrder: 4,
    },
    {
      id: '5b0d66ef-44db-4602-984f-762cd00ea535',
      name: 'ENT',
      slug: 'ent',
      iconUrl: 'https://img.icons8.com/color/96/hearing.png',
      description: 'Ear, nose, and throat diagnostics and therapies.',
      displayOrder: 5,
    },
    {
      id: '6c1e77f0-55ec-4713-9950-873de11fb646',
      name: 'Dentistry',
      slug: 'dentistry',
      iconUrl: 'https://img.icons8.com/color/96/tooth.png',
      description: 'Oral health, preventative dentistry, and dental surgeries.',
      displayOrder: 6,
    },
    {
      id: '7d2f8801-66fd-4824-0061-984ef22ac757',
      name: 'Cardiologist',
      slug: 'cardiologist',
      iconUrl: 'https://img.icons8.com/color/96/heart-with-pulse.png',
      description: 'Heart and blood vessel treatments and cardiology care.',
      displayOrder: 7,
    },
  ];

  for (const spec of specializations) {
    await prisma.specialization.upsert({
      where: { id: spec.id },
      update: spec,
      create: spec,
    });
  }
  console.log(`Seeded ${specializations.length} specializations.`);

  // 2. Doctors
  const doctors = [
    {
      id: 'd019f2a4-54c7-43c2-849d-64971c26f041',
      specializationId: '1d8cf01b-97c2-48df-9f33-c23f66c98aa1',
      name: 'Dr. Randy Wigham',
      hospitalName: 'RSUD Gatot Subroto',
      rating: 4.8,
      reviewCount: 4279,
      profileImageUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=400&q=80',
      bio: 'Dr. Randy Wigham is a dedicated General Practitioner with over 10 years of clinical experience providing comprehensive outpatient consultations.',
      consultationFee: 150000.0,
      isRecommended: true,
      isAvailable: true,
    },
    {
      id: 'e120f3b5-65d8-44d3-95ae-75082d370152',
      specializationId: '1d8cf01b-97c2-48df-9f33-c23f66c98aa1',
      name: 'Dr. Jack Sullivan',
      hospitalName: 'RSUD Gatot Subroto',
      rating: 4.8,
      reviewCount: 4277,
      profileImageUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80',
      bio: 'Dr. Jack Sullivan is an experienced general practitioner focusing on preventive family health.',
      consultationFee: 180000.0,
      isRecommended: true,
      isAvailable: true,
    },
    {
      id: 'f231a4c6-76e9-55e4-a6bf-86193e481263',
      specializationId: '2e7a33bc-11a8-43d9-951c-43f9a77bd202',
      name: 'Dr. Maria Elena',
      hospitalName: 'Mayapada Hospital',
      rating: 4.9,
      reviewCount: 3120,
      profileImageUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80',
      bio: 'Dr. Maria Elena is a neurologist with expertise in complex neurological conditions and migraine management.',
      consultationFee: 250000.0,
      isRecommended: true,
      isAvailable: true,
    },
    {
      id: 'a342b5d7-87fa-66f5-b7cf-97204f592374',
      specializationId: '3f8b44cd-22b9-44e0-962d-540ab88ce313',
      name: 'Dr. Sarah Jenkins',
      hospitalName: 'Siloam Hospital',
      rating: 4.7,
      reviewCount: 1845,
      profileImageUrl: 'https://images.unsplash.com/photo-1666886573583-9839aafe43cf?auto=format&fit=crop&w=400&q=80',
      bio: 'Dr. Sarah Jenkins offers compassionate pediatric care and developmental screenings for young children.',
      consultationFee: 200000.0,
      isRecommended: false,
      isAvailable: true,
    },
    {
      id: 'b453c6e8-98ab-77a6-c8da-08315a603485',
      specializationId: '7d2f8801-66fd-4824-0061-984ef22ac757',
      name: 'Dr. David Kim',
      hospitalName: 'Mitra Keluarga',
      rating: 4.9,
      reviewCount: 2900,
      profileImageUrl: 'https://images.unsplash.com/photo-1758691461513-88a0aef72160?auto=format&fit=crop&w=400&q=80',
      bio: 'Dr. David Kim is a leading interventional cardiologist dedicated to heart failure prevention and treatment.',
      consultationFee: 300000.0,
      isRecommended: true,
      isAvailable: true,
    },
  ];

  for (const doc of doctors) {
    await prisma.doctor.upsert({
      where: { id: doc.id },
      update: doc,
      create: doc,
    });
  }
  console.log(`Seeded ${doctors.length} doctors.`);

  console.log('Database seeded successfully.');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

