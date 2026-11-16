// src/services/providerServices.ts
import { Prisma, type Provider } from "../generated/prisma/client.js";
import { HttpError } from "../utils/httpError.js";
import { prisma } from "../utils/prismaClient.js";
import type {
  CreateProviderInput,
  UpdateProviderInput,
} from "../utils/validation.js";

export interface PublicProvider {
  id: string;
  businessName: string;
  slug: string;
  timezone: string;
}

const publicProviderSelect = {
  id: true,
  businessName: true,
  slug: true,
  timezone: true,
} as const;

export async function createProvider(
  userId: string,
  input: CreateProviderInput,
): Promise<Provider> {
  const existing = await prisma.provider.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (existing) {
    throw new HttpError(409, "Provider profile already exists");
  }
  try {
    return await prisma.provider.create({
      data: {
        userId,
        businessName: input.businessName,
        slug: input.slug,
        timezone: input.timezone,
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new HttpError(409, "Slug is taken or a profile already exists");
    }
    throw error;
  }
}

export async function getProviderByUserId(userId: string): Promise<Provider> {
  const provider = await prisma.provider.findUnique({ where: { userId } });
  if (!provider) {
    throw new HttpError(404, "Provider profile not found. Create one first.");
  }
  return provider;
}

export async function updateProvider(
  userId: string,
  input: UpdateProviderInput,
): Promise<Provider> {
  const provider = await getProviderByUserId(userId);
  return prisma.provider.update({
    where: { id: provider.id },
    data: {
      ...(input.businessName !== undefined && {
        businessName: input.businessName,
      }),
      ...(input.timezone !== undefined && { timezone: input.timezone }),
    },
  });
}

export async function getPublicProviderBySlug(
  slug: string,
): Promise<PublicProvider> {
  const provider = await prisma.provider.findUnique({
    where: { slug },
    select: publicProviderSelect,
  });
  if (!provider) {
    throw new HttpError(404, "Provider not found");
  }
  return provider;
}
