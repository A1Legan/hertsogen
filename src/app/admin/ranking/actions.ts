'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { auth } from '@/src/auth';
import { prisma } from '@/src/lib/prisma';

async function checkAccess() {
    const session = await auth();
    if (!session?.user?.email) throw new Error ('Нет доступа');
    return session.user.email;
}

const form = z.object({
    levelId: z.coerce.number().int().positive(),
    position: z.coerce.number().int().min(1),
    requirement: z.coerce.number().int().min(1).max(100),
    note: z.string().trim().max(500).nullable(),
});