// src/services/serviceCatalogServices.ts
import { Prisma, type Service } from "../generated/prisma/client.js";
import { HttpError } from "../utils/httpError.js";
import { prisma } from "../utils/prismaClient.js";
import type { ServiceInput, UpdateServiceInput } from "../utils/validation.js";

export async function listServicesBySlug(slug: string): Promise<Service[]> {
  const provider = await prisma.provider.findUnique({
    where: { slug },
    select: { id: true },
  });
  if (!provider) {
    throw new HttpError(404, "Provider not found");
  }
  return prisma.service.findMany({
    where: { providerId: provider.id },
    orderBy: { name: "asc" },
  });
}

export function createService(
  providerId: string,
  input: ServiceInput,
): Promise<Service> {
  return prisma.service.create({
    data: {
      providerId,
      name: input.name,
      durationMinutes: input.durationMinutes,
      price: input.price,
    },
  });
}

async function findOwnedService(
  providerId: string,
  serviceId: string,
): Promise<Service> {
  const service = await prisma.service.findFirst({
    where: { id: serviceId, providerId },
  });
  if (!service) {
    throw new HttpError(404, "Service not found");
  }
  return service;
}

export async function updateService(
  providerId: string,
  serviceId: string,
  input: UpdateServiceInput,
): Promise<Service> {
  await findOwnedService(providerId, serviceId);
  return prisma.service.update({
    where: { id: serviceId },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.durationMinutes !== undefined && {
        durationMinutes: input.durationMinutes,
      }),
      ...(input.price !== undefined && { price: input.price }),
    },
  });
}

export async function deleteService(
  providerId: string,
  serviceId: string,
): Promise<void> {
  await findOwnedService(providerId, serviceId);
  try {
    await prisma.service.delete({ where: { id: serviceId } });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      throw new HttpError(409, "Service has bookings and cannot be deleted");
    }
    throw error;
  }
}
