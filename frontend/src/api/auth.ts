import { http, ensureCsrfCookie } from "./client";


export type BackendUser = {
  id: number;
  name: string;
  email: string;
  role: "student" | "teacher" | "admin";
  matricule?: string | null;
  phone?: string | null;
  filiere_id?: number | null;
  suri_person_id?: string | null;
  face_enrolled_at?: string | null;
  profile_photo_url?: string | null;
};

export async function me(): Promise<BackendUser> {
  const res = await http.get<BackendUser>("/api/me", {
    headers: { Accept: "application/json" },
  });
  return res.data;
}

export async function login(email: string, password: string): Promise<BackendUser> {
  await ensureCsrfCookie();

  await http.post(
    "/api/login",
    { email, password },
    {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    }
  );

  return await me();
}

export async function logout(): Promise<void> {
  await ensureCsrfCookie();

  await http.post("/api/logout", {}, { headers: { Accept: "application/json" } });
}
