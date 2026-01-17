import { AxiosError, AxiosInstance } from "axios";
import { http } from "@/api/client";
import type { BackendUser } from "@/api/auth";

// -------------------------
// Types used across the UI
// -------------------------
export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: "student" | "teacher" | "admin";
  avatar?: string;
  studentId?: string;
  teacherId?: string;
  program?: string;
  department?: string;
}

export function mapBackendUser(u: BackendUser): User {
  // Try to split the name into first/last; keep it resilient.
  const parts = (u.name || "").trim().split(/\s+/).filter(Boolean);
  const firstName = parts[0] || u.name || "";
  const lastName = parts.slice(1).join(" ") || "";

  return {
    id: u.id,
    email: u.email,
    firstName,
    lastName,
    role: u.role,
    avatar: u.profile_photo_url || undefined,
    studentId: u.matricule || undefined,
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface Announcement {
  id: number;
  title: string;
  content: string;
  type: "general" | "urgent" | "academic" | "event";
  createdAt: string;
  author: string;
}

export interface Absence {
  id: number;
  date: string;
  module: string;
  moduleCode: string;
  hours: number;
  status: "pending" | "approved" | "rejected";
  justification?: string;
  justificationFile?: string;
  justificationDeadline: string;
  teacherComment?: string;
}

export interface Course {
  id: number;
  code: string;
  name: string;
  credits: number;
  semester: number;
  teacher: string;
}

export interface TimetableEntry {
  id: number;
  day: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday";
  startTime: string;
  endTime: string;
  course: string;
  courseCode: string;
  room: string;
  type: "lecture" | "tutorial" | "lab";
  teacher?: string;
}

export interface Assignment {
  id: number;
  title: string;
  course: string;
  courseCode: string;
  dueDate: string;
  status: "pending" | "submitted" | "graded";
  grade?: number;
  maxGrade: number;
  submittedAt?: string;
  file?: string;
}

export interface Exam {
  id: number;
  course: string;
  courseCode: string;
  date: string;
  startTime: string;
  endTime: string;
  room: string;
  type: "midterm" | "final" | "quiz";
}

// -------------------------
// API client
// -------------------------
// Note: `http` baseURL points to APP_URL. API routes are under /api.
export const api: AxiosInstance = http;

api.interceptors.response.use(
  (r) => r,
  (error: AxiosError) => {
    // Keep UI stable: do not force redirects; AuthContext handles 401.
    return Promise.reject(error);
  }
);

// -------------------------
// Placeholder services (connect when backend endpoints are ready)
// -------------------------
export const announcementService = {
  getAll: async (): Promise<Announcement[]> => {
    const res = await api.get<Announcement[]>("/api/announcements");
    return res.data;
  },
};

// -------------------------
// Student services (real backend)
// -------------------------
export const studentCoursesService = {
  getAll: async (): Promise<Course[]> => {
    // Backend: GET /api/student/courses
    // Note: your backend returns pagination currently; we handle both cases safely.
    const res = await api.get<any>("/api/student/courses");

    // If it's Laravel paginator: { data: [...] }
    const data = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
    return data as Course[];
  },

  downloadCourseFile: async (courseId: number): Promise<Blob> => {
    // Backend: GET /api/student/courses/{course}/download
    const res = await api.get(`/api/student/courses/${courseId}/download`, {
      responseType: "blob",
    });
    return res.data as Blob;
  },
};

export const studentTimetableService = {
  getAll: async (): Promise<TimetableEntry[]> => {
    // Backend: GET /api/student/timetable
    const res = await api.get<TimetableEntry[]>("/api/student/timetable");
    return res.data;
  },

  downloadPdf: async (): Promise<Blob> => {
    // Backend: GET /api/student/timetable/pdf
    const res = await api.get("/api/student/timetable/pdf", {
      responseType: "blob",
    });
    return res.data as Blob;
  },
};

// -------------------------
// Student Assignments/Homeworks services
// -------------------------
export const studentAssignmentsService = {
  getAll: async (): Promise<Assignment[]> => {
    // Backend: GET /api/student/homeworks
    const res = await api.get<any>("/api/student/homeworks");
    const data = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
    return data as Assignment[];
  },

  submit: async (homeworkId: number, file: File): Promise<void> => {
    // Backend: POST /api/student/homeworks/{homework}/submit (multipart)
    const form = new FormData();
    form.append("file", file);

    await api.post(`/api/student/homeworks/${homeworkId}/submit`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  downloadSubmission: async (submissionId: number): Promise<Blob> => {
    // Backend: GET /api/student/submissions/{submission}/download
    const res = await api.get(`/api/student/submissions/${submissionId}/download`, {
      responseType: "blob",
    });
    return res.data as Blob;
  },
};

// -------------------------
// Student Absences services
// -------------------------
export const studentAbsencesService = {
  // List absences (paginated on backend, we just read first page for now)
  getAll: async (): Promise<Absence[]> => {
    const res = await api.get<BackendAttendancesPage>("/api/student/attendances");
    const rows = res.data?.data ?? [];
    return rows.map(mapBackendAttendanceToAbsence);
  },

  // Stats: your backend currently returns { total, present, absent }
  // We transform into the UI’s AbsenceStatsUI so you keep the same design.
  getStats: async (): Promise<AbsenceStatsUI> => {
    const res = await api.get<{ total: number; present: number; absent: number }>("/api/student/attendance-stats");

    // We don’t have module breakdown from backend yet → return empty breakdown (safe)
    // totalHours approximation: absent * 2h (change if you store real hours)
    const absentCount = res.data?.absent ?? 0;

    return {
      totalHours: absentCount * 2,
      justifiedHours: 0,
      unjustifiedHours: absentCount * 2,
      pendingCount: 0,
      byModule: [],
    };
  },

  // Upload justification file (existing endpoint)
  uploadJustification: async (attendanceId: number, file: File) => {
    const form = new FormData();
    form.append("attendance_id", String(attendanceId));
    form.append("file", file);

    const res = await api.post("/api/student/justifications", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return res.data;
  },
};


// -------------------------
// Student Exams services
// -------------------------
export const studentExamsService = {
  getAll: async (): Promise<Exam[]> => {
    const res = await api.get<Exam[]>("/api/student/exams");
    return res.data;
  },
};

// -------------------------
// Student Attendance/Absences services
// -------------------------

export interface AttendanceItemFromBackend {
  id: number;
  date: string; // "YYYY-MM-DD" or ISO
  status: "present" | "absent";
  hours?: number | null;

  module?: { id: number; name: string } | null;
  // If you have module_code somewhere else, we'll map safely
  module_code?: string | null;

  justification?: {
    id: number;
    attendance_id: number;
    status: "pending" | "approved" | "rejected";
  } | null;
}

export interface AttendanceStatsFromBackend {
  total: number;
  present: number;
  absent: number;
}

// Map backend attendance -> UI Absence type
export function mapAttendanceToAbsence(a: AttendanceItemFromBackend): Absence {
  const isAbsent = a.status === "absent";
  const date = a.date;
  const moduleName = a.module?.name || "Module";
  const moduleCode = (a as any).module_code || (a as any).module?.code || "—";

  // If backend doesn't store hours, we fallback to 2h (common in timetables)
  const hours = typeof a.hours === "number" ? a.hours : 2;

  // Deadline = date + 48h (same rule as backend)
  const deadline = new Date(date);
  deadline.setHours(deadline.getHours() + 48);

  const j = a.justification;

  // Only absences matter here; but keep pending/approved/rejected based on justification state
  let status: Absence["status"] = "pending";
  if (!isAbsent) status = "approved"; // present -> treated as "not an absence"
  else if (j?.status === "approved") status = "approved";
  else if (j?.status === "rejected") status = "rejected";
  else status = "pending";

  return {
    id: a.id,
    date: date,
    module: moduleName,
    moduleCode: moduleCode,
    hours,
    status,
    justification: undefined,
    justificationFile: undefined,
    justificationDeadline: deadline.toISOString(),
    teacherComment: undefined,
  };
}

export const studentAttendanceService = {
  // list attendances (paginated backend)
  getAttendances: async (): Promise<AttendanceItemFromBackend[]> => {
    const res = await api.get("/api/student/attendances");
    // backend returns paginator: { data: [...] }
    const data = (res.data?.data ?? res.data) as AttendanceItemFromBackend[];
    return data;
  },

  getStats: async (): Promise<AttendanceStatsFromBackend> => {
    const res = await api.get<AttendanceStatsFromBackend>("/api/student/attendance-stats");
    return res.data;
  },

  submitJustification: async (attendanceId: number, file: File) => {
    const form = new FormData();
    form.append("attendance_id", String(attendanceId));
    form.append("file", file);

    const res = await api.post("/api/student/justifications", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return res.data;
  },
};

// -------------------------
// Student - Absences (Attendances) + Stats + Justifications
// -------------------------

type BackendAttendance = {
  id: number;
  date: string; // "YYYY-MM-DD"
  status: "present" | "absent";
  hours?: number | null;

  module?: { id: number; name: string; code?: string | null } | null;

  justification?: {
    id: number;
    status: "pending" | "approved" | "rejected";
    file_path?: string | null;
    teacher_comment?: string | null;
    created_at?: string;
  } | null;
};

type BackendAttendancesPage = {
  data: BackendAttendance[];
};

export type AbsenceStatsByModule = {
  module: string;
  hours: number;
  justified: number;
};

export type AbsenceStatsUI = {
  totalHours: number;
  justifiedHours: number;
  unjustifiedHours: number;
  pendingCount: number;
  byModule: AbsenceStatsByModule[];
};

function addHours(dateIso: string, hours: number) {
  const d = new Date(dateIso);
  d.setHours(d.getHours() + hours);
  return d.toISOString();
}

export function mapBackendAttendanceToAbsence(a: BackendAttendance): Absence {
  const moduleName = a.module?.name ?? "Module";
  const moduleCode = a.module?.code ?? moduleName;

  // deadline: 48h after absence date
  // If your backend stores date only, we assume 00:00 local.
  const deadlineIso = addHours(`${a.date}T00:00:00`, 48);

  const status: Absence["status"] =
    a.justification?.status === "approved"
      ? "approved"
      : a.justification?.status === "rejected"
        ? "rejected"
        : "pending";

  const hours = typeof a.hours === "number" ? a.hours : 2;

  return {
    id: a.id,
    date: a.date,
    module: moduleName,
    moduleCode,
    hours,
    status,
    justification: undefined,
    justificationFile: a.justification?.file_path ?? undefined,
    justificationDeadline: deadlineIso,
    teacherComment: a.justification?.teacher_comment ?? undefined,
  };
}

export type NotificationPreferences = {
  email_absences: boolean;
  email_assignments: boolean;
  email_announcements: boolean;
  email_exams: boolean;

  platform_absences: boolean;
  platform_assignments: boolean;
  platform_announcements: boolean;
  platform_exams: boolean;
};

export const studentPreferencesService = {
  get: async (): Promise<NotificationPreferences> => {
    const res = await api.get<NotificationPreferences>("/api/student/notification-preferences");
    return res.data;
  },
  update: async (payload: Partial<NotificationPreferences>): Promise<NotificationPreferences> => {
    const res = await api.put<NotificationPreferences>("/api/student/notification-preferences", payload);
    return res.data;
  },
};

export const studentProfileService = {
  updateName: async (firstName: string, lastName: string) => {
    const res = await api.put("/api/student/profile", {
      first_name: firstName,
      last_name: lastName,
    });
    return res.data;
  },
};

// -------------------------
// Teacher types
// -------------------------
export interface TeacherSession {
  id: number;
  date_effective: string; // yyyy-mm-dd
  heure_debut: string;    // HH:mm:ss or HH:mm
  heure_fin: string;
  salle: string;
  jour?: string;

  module?: { id: number; name: string };
  teacher?: { id: number; name: string };
  filiere?: { id: number; name: string };
}

export interface TeacherCourseItem {
  id: number;
  title: string;
  description?: string | null;
  file_path?: string | null;
  module?: { id: number; name: string };
}

export interface TeacherJustificationItem {
  id: number;
  status: "pending" | "approved" | "rejected";
  file_path: string;
  created_at: string;
  attendance?: {
    id: number;
    date: string;
    status: string;
    student?: { id: number; name: string; matricule?: string | null };
    module?: { id: number; name: string };
  };
}

export interface TeacherDashboardStats {
  assignedCourses: number;
  pendingJustifications: number;
  sessionsThisWeek: number;
}

// -------------------------
// Teacher services
// -------------------------
export const teacherSessionsService = {
  today: async (): Promise<TeacherSession[]> => {
    const res = await api.get("/api/teacher/sessions/today");
    return Array.isArray(res.data) ? res.data : [];
  },
};

export const teacherAttendanceService = {
  qrToken: async (courseSessionId: number): Promise<{ token: string; expires_at?: string }> => {
    const res = await api.post("/api/teacher/attendances/qr-token", { course_session_id: courseSessionId });
    return res.data;
  },

  markManual: async (payload: {
    course_session_id: number;
    items: Array<{ student_id: number; status: "present" | "absent" }>;
  }) => {
    const res = await api.post("/api/teacher/attendances/mark-manual", payload);
    return res.data;
  },

  exportExcelUrl: (courseSessionId: number) => {
    // backend returns file download; simplest is open this in new tab
    return `/api/teacher/attendances/export?course_session_id=${courseSessionId}`;
  },
};

export const teacherCoursesService = {
  list: async (): Promise<TeacherCourseItem[]> => {
    const res = await api.get("/api/teacher/courses");
    const data = Array.isArray(res.data) ? res.data : res.data?.data;
    return Array.isArray(data) ? data : [];
  },
};

export const teacherJustificationsService = {
  list: async (): Promise<TeacherJustificationItem[]> => {
    const res = await api.get("/api/teacher/justifications");
    const data = Array.isArray(res.data) ? res.data : res.data?.data;
    return Array.isArray(data) ? data : [];
  },
};

// Teacher dashboard helper (simple client-side compute)
export const teacherDashboardService = {
  getStats: async (): Promise<TeacherDashboardStats> => {
    const [courses, justifs, todaySessions] = await Promise.all([
      teacherCoursesService.list(),
      teacherJustificationsService.list(),
      teacherSessionsService.today(),
    ]);

    const pendingJustifications = justifs.filter(j => j.status === "pending").length;

    // “cours cette semaine” : approximation simple = nb de séances aujourd’hui
    // (on l’améliorera plus tard avec un endpoint week)
    const sessionsThisWeek = todaySessions.length;

    return {
      assignedCourses: courses.length,
      pendingJustifications,
      sessionsThisWeek,
    };
  },
};


