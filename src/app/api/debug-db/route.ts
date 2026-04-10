import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const result: any = {
    timestamp: new Date().toISOString(),
    env_vars: {
      has_db_url: !!process.env.DATABASE_URL,
      db_url_protocol: process.env.DATABASE_URL?.split(":")[0],
    },
    connection_test: "starting...",
  };

  try {
    // Attempt simple query
    await prisma.$connect();
    const userCount = await prisma.user.count();
    
    result.connection_test = "success";
    result.data = { userCount };
  } catch (error: any) {
    result.connection_test = "failed";
    result.error = {
      name: error.name,
      message: error.message,
      code: error.code, // Prisma Error Code (e.g. P1001)
      meta: error.meta,
    };
  }

  return NextResponse.json(result, { status: 200 });
}
