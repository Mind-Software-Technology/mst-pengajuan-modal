"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { projectSchema, ProjectInput } from "../dto/project.dto";

export async function getProjects() {
  try {
    const projects = await prisma.project.findMany({
      include: {
        client: true, // Fetch related client data
      },
      orderBy: { createdAt: 'desc' }
    });
    return { data: projects, error: null };
  } catch (error) {
    return { data: null, error: "Gagal mengambil data proyek" };
  }
}

export async function createProject(input: ProjectInput) {
  try {
    const validatedData = projectSchema.parse(input);
    const newProject = await prisma.project.create({
      data: {
        name: validatedData.name,
        clientId: validatedData.clientId,
        contractValue: validatedData.contractValue,
        estimatedCost: validatedData.estimatedCost,
        deadline: new Date(validatedData.deadline),
        status: validatedData.status,
      },
    });
    
    revalidatePath("/projects");
    return { success: true, error: null };
  } catch (error) {
    return { data: null, error: "Gagal membuat data proyek" };
  }
}

export async function updateProject(id: string, input: ProjectInput) {
  try {
    const validatedData = projectSchema.parse(input);
    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
        name: validatedData.name,
        clientId: validatedData.clientId,
        contractValue: validatedData.contractValue,
        estimatedCost: validatedData.estimatedCost,
        deadline: new Date(validatedData.deadline),
        status: validatedData.status,
      },
    });
    
    revalidatePath("/projects");
    return { success: true, error: null };
  } catch (error) {
    return { data: null, error: "Gagal memperbarui data proyek" };
  }
}

export async function deleteProject(id: string) {
  try {
    await prisma.project.delete({
      where: { id },
    });
    revalidatePath("/projects");
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: "Gagal menghapus data proyek" };
  }
}
