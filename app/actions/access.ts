"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ACCESS_COOKIE, ACCESS_MAX_AGE_S } from "@/lib/access";

export interface AccessState {
  wrong: boolean;
}

export async function submitAccessCodeAction(_prev: AccessState, formData: FormData): Promise<AccessState> {
  const expected = process.env.ACCESS_CODE;
  const code = formData.get("code");
  if (expected) {
    if (typeof code !== "string" || code !== expected) return { wrong: true };
    (await cookies()).set(ACCESS_COOKIE, code, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: ACCESS_MAX_AGE_S,
      path: "/",
    });
  }
  redirect("/");
}
