"use server";

import { z } from "zod";
import { getHindiPage } from "@/lib/rules/hindi";

// One page at a time, so the whole Hindi JSON never ships to the browser.
export async function getHindiPageAction(page: number): Promise<string | null> {
  const parsed = z.number().int().positive().safeParse(page);
  return parsed.success ? getHindiPage(parsed.data) : null;
}
