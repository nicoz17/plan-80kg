import { Redis } from "@upstash/redis";

// Guarda los datos en Upstash Redis (integración de Vercel).
// Sin variables de entorno usa memoria (solo para probar en local).

const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

const redis = url && token ? new Redis({ url, token }) : null;

export const usandoMemoria = !redis;

type Mem = { hashes: Map<string, Map<string, string>>; sets: Map<string, Set<string>> };
const g = globalThis as unknown as { __mem?: Mem };
const mem: Mem = g.__mem ?? (g.__mem = { hashes: new Map(), sets: new Map() });

export async function hgetall(key: string): Promise<Record<string, string>> {
  if (redis) {
    const r = await redis.hgetall<Record<string, string | number>>(key);
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(r ?? {})) out[k] = String(v);
    return out;
  }
  return Object.fromEntries(mem.hashes.get(key) ?? new Map());
}

export async function hset(key: string, field: string, value: string) {
  if (redis) return void (await redis.hset(key, { [field]: value }));
  if (!mem.hashes.has(key)) mem.hashes.set(key, new Map());
  mem.hashes.get(key)!.set(field, value);
}

export async function hdel(key: string, field: string) {
  if (redis) return void (await redis.hdel(key, field));
  mem.hashes.get(key)?.delete(field);
}

export async function smembers(key: string): Promise<string[]> {
  if (redis) return ((await redis.smembers(key)) ?? []).map(String);
  return [...(mem.sets.get(key) ?? [])];
}

export async function sset(key: string, member: string, on: boolean) {
  if (redis) {
    if (on) await redis.sadd(key, member);
    else await redis.srem(key, member);
    return;
  }
  if (!mem.sets.has(key)) mem.sets.set(key, new Set());
  const s = mem.sets.get(key)!;
  if (on) s.add(member);
  else s.delete(member);
}
