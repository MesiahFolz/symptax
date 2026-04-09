import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET contacts for the current user (people they can message)
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const userRole = (session.user as any).role;

    let contacts: any[] = [];

    if (userRole === "PATIENT") {
      // Patients can message doctors who have records for them
      const records = await prisma.medicalRecord.findMany({
        where: { patientId: userId },
        select: { patientId: true },
      });

      // Also find any doctor they've exchanged messages with
      const messagedUsers = await prisma.message.findMany({
        where: {
          OR: [{ senderId: userId }, { receiverId: userId }],
        },
        select: { senderId: true, receiverId: true },
      });

      const contactIds = new Set<string>();
      messagedUsers.forEach((m) => {
        if (m.senderId !== userId) contactIds.add(m.senderId);
        if (m.receiverId !== userId) contactIds.add(m.receiverId);
      });

      // Get all doctors (patients can message any doctor)
      const doctors = await prisma.user.findMany({
        where: { role: "DOCTOR" },
        select: { id: true, name: true, email: true, role: true },
      });

      contacts = doctors;
    } else if (userRole === "DOCTOR") {
      // Doctors can see patients they have records for + all other doctors
      const patients = await prisma.user.findMany({
        where: { role: "PATIENT" },
        select: { id: true, name: true, email: true, role: true },
      });

      const doctors = await prisma.user.findMany({
        where: { role: "DOCTOR", NOT: { id: userId } },
        select: { id: true, name: true, email: true, role: true },
      });

      contacts = [...patients, ...doctors];
    }

    // For each contact, get the last message
    const contactsWithLastMessage = await Promise.all(
      contacts.map(async (contact) => {
        const lastMessage = await prisma.message.findFirst({
          where: {
            OR: [
              { senderId: userId, receiverId: contact.id },
              { senderId: contact.id, receiverId: userId },
            ],
          },
          orderBy: { createdAt: "desc" },
        });

        const unreadCount = await prisma.message.count({
          where: {
            senderId: contact.id,
            receiverId: userId,
            // We'd need a `read` field — for now skip
          },
        });

        return {
          ...contact,
          lastMessage: lastMessage?.content || null,
          lastMessageAt: lastMessage?.createdAt || null,
        };
      })
    );

    // Sort by last message time (most recent first)
    contactsWithLastMessage.sort((a, b) => {
      if (!a.lastMessageAt && !b.lastMessageAt) return 0;
      if (!a.lastMessageAt) return 1;
      if (!b.lastMessageAt) return -1;
      return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
    });

    return NextResponse.json({ contacts: contactsWithLastMessage }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
