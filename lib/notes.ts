import "server-only";
import { Redis } from "@upstash/redis";
import type { MenteeNote } from "./types";

const redis =
  process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
    ? new Redis({
        url: process.env.KV_REST_API_URL,
        token: process.env.KV_REST_API_TOKEN,
      })
    : null;

function key(rollNo: string) {
  return `notes:${rollNo}`;
}

export async function getNotes(rollNo: string): Promise<MenteeNote[]> {
  if (!redis) return [];
  const raw = await redis.lrange<MenteeNote>(key(rollNo), 0, -1);
  return raw.reverse(); // newest first
}

export async function addNote(
  rollNo: string,
  mentorName: string,
  text: string
): Promise<MenteeNote> {
  if (!redis) throw new Error("Notes storage is not configured");

  const note: MenteeNote = {
    id: crypto.randomUUID(),
    rollNo,
    mentorName,
    text,
    createdAt: new Date().toISOString(),
  };

  await redis.rpush(key(rollNo), note);
  return note;
}
