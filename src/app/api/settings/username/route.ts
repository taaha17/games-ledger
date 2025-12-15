import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";

const usernameSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be 30 characters or less")
    .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores, and hyphens")
    .nullable(),
});

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const result = usernameSchema.safeParse(body);

    if (!result.success) {
      const error = result.error.issues[0]?.message || "Invalid username";
      return NextResponse.json(
        { error },
        { status: 400 }
      );
    }

    const { username } = result.data;

    // Check if username is already taken (if not null)
    if (username) {
      const existingUser = await prisma.user.findUnique({
        where: { username },
      });

      if (existingUser && existingUser.id !== userId) {
        return NextResponse.json(
          { error: "Username is already taken" },
          { status: 400 }
        );
      }
    }

    // Update username
    await prisma.user.update({
      where: { id: userId },
      data: { username },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update username error:", error);
    return NextResponse.json(
      { error: "Failed to update username" },
      { status: 500 }
    );
  }
}
