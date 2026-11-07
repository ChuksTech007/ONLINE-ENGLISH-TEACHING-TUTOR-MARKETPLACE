import { PrismaClient, MeetingPlatform, Role, TeacherStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Password123!', 12);

  await prisma.platformSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      contactFee: 2,
      siteName: 'Merit English',
      supportEmail: 'support@merit.local',
    },
  });

  const packages = [
    { name: 'Starter', creditAmount: 5, price: 5, sortOrder: 1 },
    { name: 'Basic', creditAmount: 10, price: 10, sortOrder: 2 },
    { name: 'Professional', creditAmount: 20, price: 20, sortOrder: 3 },
    { name: 'Business', creditAmount: 50, price: 50, sortOrder: 4 },
  ];
  for (const pack of packages) {
    const existing = await prisma.creditPackage.findFirst({ where: { name: pack.name } });
    if (!existing) await prisma.creditPackage.create({ data: pack });
  }

  const admin = await prisma.user.upsert({
    where: { email: 'admin@merit.test' },
    update: {},
    create: {
      email: 'admin@merit.test',
      passwordHash,
      role: Role.ADMIN,
      firstName: 'Amina',
      lastName: 'Diallo',
      country: 'Kenya',
      timezone: 'Africa/Nairobi',
      emailVerified: true,
    },
  });

  const teachers = [
    {
      email: 'amara.okafor@merit.test',
      firstName: 'Amara',
      lastName: 'Okafor',
      country: 'Nigeria',
      city: 'Lagos',
      timezone: 'Africa/Lagos',
      slug: 'amara-okafor',
      bio: 'I help busy professionals speak English with confidence. Lessons are practical, warm and built around the conversations you actually need at work and in daily life.',
      qualifications: 'BA English Language, CELTA, 8 years teaching online and in-person.',
      experienceYears: 8,
      specializations: ['Conversational English', 'Business English', 'Interview preparation'],
      levels: ['Beginner', 'Intermediate', 'Advanced'],
      languages: ['English', 'Yoruba'],
      isNativeSpeaker: false,
      hourlyRate: 12,
      methodology: 'Task-based lessons with real-world role play, pronunciation coaching and weekly feedback notes.',
      preferredPlatform: MeetingPlatform.GOOGLE_MEET,
      featured: true,
      photoUrl: '/uploads/photos/amara.jpg',
      paymentMethods: [
        { type: 'PayPal', details: 'amara.okafor@merit.test' },
        { type: 'Wise', details: 'Ask for Wise details after the trial lesson' },
      ],
      availability: [
        { dayOfWeek: 1, startMinute: 9 * 60, endMinute: 12 * 60 },
        { dayOfWeek: 3, startMinute: 14 * 60, endMinute: 18 * 60 },
        { dayOfWeek: 5, startMinute: 9 * 60, endMinute: 16 * 60 },
      ],
      credits: 20,
    },
    {
      email: 'james.whitfield@merit.test',
      firstName: 'James',
      lastName: 'Whitfield',
      country: 'United Kingdom',
      city: 'Manchester',
      timezone: 'Europe/London',
      slug: 'james-whitfield',
      bio: 'Cambridge-certified teacher specialising in Business English, presentations and professional writing for international teams.',
      qualifications: 'MA TESOL, Cambridge CELTA, former corporate trainer.',
      experienceYears: 12,
      specializations: ['Business English', 'IELTS', 'Academic writing'],
      levels: ['Intermediate', 'Advanced'],
      languages: ['English', 'French'],
      isNativeSpeaker: true,
      hourlyRate: 28,
      methodology: 'Structured lesson plans with measurable weekly goals, error logs and authentic workplace materials.',
      preferredPlatform: MeetingPlatform.ZOOM,
      featured: true,
      photoUrl: '/uploads/photos/james.jpg',
      paymentMethods: [{ type: 'Bank transfer', details: 'UK Faster Payments - details shared after booking' }],
      availability: [
        { dayOfWeek: 2, startMinute: 8 * 60, endMinute: 12 * 60 },
        { dayOfWeek: 4, startMinute: 8 * 60, endMinute: 12 * 60 },
        { dayOfWeek: 6, startMinute: 10 * 60, endMinute: 14 * 60 },
      ],
      credits: 40,
    },
    {
      email: 'sofia.martinez@merit.test',
      firstName: 'Sofia',
      lastName: 'Martinez',
      country: 'Mexico',
      city: 'Mexico City',
      timezone: 'America/Mexico_City',
      slug: 'sofia-martinez',
      bio: 'Patient IELTS and exam-prep teacher. I specialise in helping Spanish speakers improve pronunciation, fluency and writing band scores.',
      qualifications: 'BA Linguistics, TESOL certificate, IELTS trainer.',
      experienceYears: 6,
      specializations: ['IELTS', 'Pronunciation', 'Conversational English'],
      levels: ['Beginner', 'Intermediate'],
      languages: ['English', 'Spanish'],
      isNativeSpeaker: false,
      hourlyRate: 15,
      methodology: 'Guided speaking practice, targeted grammar, and exam-style mock tasks with detailed corrections.',
      preferredPlatform: MeetingPlatform.ZOOM,
      featured: false,
      photoUrl: '/uploads/photos/sofia.jpg',
      paymentMethods: [{ type: 'PayPal', details: 'sofia.martinez@merit.test' }],
      availability: [
        { dayOfWeek: 1, startMinute: 16 * 60, endMinute: 21 * 60 },
        { dayOfWeek: 2, startMinute: 16 * 60, endMinute: 21 * 60 },
        { dayOfWeek: 6, startMinute: 10 * 60, endMinute: 14 * 60 },
      ],
      credits: 10,
    },
  ];

  for (const t of teachers) {
    const user = await prisma.user.upsert({
      where: { email: t.email },
      update: {},
      create: {
        email: t.email,
        passwordHash,
        role: Role.TEACHER,
        firstName: t.firstName,
        lastName: t.lastName,
        country: t.country,
        timezone: t.timezone,
        emailVerified: true,
      },
    });
    const profile = await prisma.teacherProfile.upsert({
      where: { slug: t.slug },
      update: {},
      create: {
        userId: user.id,
        slug: t.slug,
        photoUrl: t.photoUrl,
        bio: t.bio,
        qualifications: t.qualifications,
        experienceYears: t.experienceYears,
        specializations: t.specializations,
        levels: t.levels,
        languages: t.languages,
        isNativeSpeaker: t.isNativeSpeaker,
        hourlyRate: t.hourlyRate,
        methodology: t.methodology,
        preferredPlatform: t.preferredPlatform,
        paymentMethods: t.paymentMethods,
        city: t.city,
        country: t.country,
        status: TeacherStatus.APPROVED,
        featured: t.featured,
        averageRating: t.slug === 'james-whitfield' ? 4.9 : 4.7,
        reviewCount: t.slug === 'james-whitfield' ? 18 : 11,
      },
    });
    await prisma.wallet.upsert({
      where: { teacherId: profile.id },
      update: { balance: t.credits, totalPurchased: t.credits },
      create: {
        teacherId: profile.id,
        balance: t.credits,
        totalPurchased: t.credits,
      },
    });
    await prisma.availabilitySlot.deleteMany({ where: { teacherId: profile.id } });
    await prisma.availabilitySlot.createMany({
      data: t.availability.map((slot) => ({ ...slot, teacherId: profile.id })),
    });
  }

  await prisma.user.upsert({
    where: { email: 'pending.teacher@merit.test' },
    update: {},
    create: {
      email: 'pending.teacher@merit.test',
      passwordHash,
      role: Role.TEACHER,
      firstName: 'Daniel',
      lastName: 'Kowalski',
      country: 'Poland',
      timezone: 'Europe/Warsaw',
      emailVerified: true,
      teacherProfile: {
        create: {
          slug: 'daniel-kowalski',
          bio: 'New teacher awaiting approval. I teach general English and exam prep.',
          qualifications: 'CELTA in progress, BA Education',
          experienceYears: 2,
          specializations: ['General English'],
          levels: ['Beginner', 'Intermediate'],
          languages: ['English', 'Polish'],
          hourlyRate: 10,
          country: 'Poland',
          city: 'Krakow',
          status: TeacherStatus.PENDING,
          wallet: { create: {} },
        },
      },
    },
  });

  const student = await prisma.user.upsert({
    where: { email: 'nina.chen@merit.test' },
    update: {},
    create: {
      email: 'nina.chen@merit.test',
      passwordHash,
      role: Role.STUDENT,
      firstName: 'Nina',
      lastName: 'Chen',
      country: 'Taiwan',
      timezone: 'Asia/Taipei',
      emailVerified: true,
      studentProfile: {
        create: {
          level: 'Intermediate',
          goals: 'Improve spoken English for work meetings.',
        },
      },
    },
  });

  await prisma.user.upsert({
    where: { email: 'david.mensah@merit.test' },
    update: {},
    create: {
      email: 'david.mensah@merit.test',
      passwordHash,
      role: Role.STUDENT,
      firstName: 'David',
      lastName: 'Mensah',
      country: 'Ghana',
      timezone: 'Africa/Accra',
      emailVerified: true,
      studentProfile: {
        create: { level: 'Beginner', goals: 'Build everyday conversation skills.' },
      },
    },
  });

  console.log('Seed complete');
  console.log('Admin   admin@merit.test / Password123!');
  console.log('Teacher amara.okafor@merit.test / Password123!');
  console.log('Student nina.chen@merit.test / Password123!');
  console.log('Admin id', admin.id, 'student', student.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
