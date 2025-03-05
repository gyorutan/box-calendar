import { NextRequest, NextResponse } from "next/server";
import prisma from "@/helper/prismadb";

export const GET = async () => {
  const mode = await prisma.mode.findFirst();

  console.log({ mode });

  return NextResponse.json({ mode });
};

export const PATCH = async (request: NextRequest) => {
  try {
    const body = await request.json();
    console.log({ body });

    if (body === "休み") {
      const updatedMode = await prisma.mode.update({
        where: {
          mode: "通常",
        },
        data: {
          mode: "休み",
        },
      });

      console.log({ updatedMode });

      return NextResponse.json({ success: true });
    } else if (body === "通常") {
      const updatedMode = await prisma.mode.update({
        where: {
          mode: "休み",
        },
        data: {
          mode: "通常",
        },
      });

      console.log({ updatedMode });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ success: false, message: "Server Error" });
  }
};
