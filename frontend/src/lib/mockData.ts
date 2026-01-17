import type { User, Announcement, Absence, Course, TimetableEntry, Assignment, Exam } from './api';

// Mock Users
export const mockUsers: Record<string, User> = {
  student: {
    id: 1,
    email: 'marie.dupont@esi.edu',
    firstName: 'Marie',
    lastName: 'Dupont',
    role: 'student',
    studentId: 'STU-2024-0142',
    program: 'Génie Informatique',
    avatar: undefined,
  },
  teacher: {
    id: 2,
    email: 'prof.bernard@esi.edu',
    firstName: 'Jean-Pierre',
    lastName: 'Bernard',
    role: 'teacher',
    teacherId: 'TCH-2019-0028',
    department: 'Informatique & Systèmes',
  },
  admin: {
    id: 3,
    email: 'admin@esi.edu',
    firstName: 'Sophie',
    lastName: 'Martin',
    role: 'admin',
  },
};

// Mock Announcements
export const mockAnnouncements: Announcement[] = [
  {
    id: 1,
    title: 'Calendrier des examens du semestre de printemps',
    content: 'Le calendrier officiel des examens finaux pour le semestre de printemps 2024 est désormais disponible. Les étudiants sont priés de consulter leur emploi du temps personnel et de signaler tout conflit avant le 15 janvier.',
    type: 'academic',
    createdAt: '2024-12-28T09:00:00Z',
    author: 'Service de la Scolarité',
  },
  {
    id: 2,
    title: 'Maintenance programmée des systèmes informatiques',
    content: 'Une maintenance technique est prévue le samedi 4 janvier de 6h00 à 12h00. Les services en ligne seront temporairement indisponibles durant cette période.',
    type: 'urgent',
    createdAt: '2024-12-27T14:30:00Z',
    author: 'Direction des Systèmes d\'Information',
  },
  {
    id: 3,
    title: 'Conférence internationale sur l\'Intelligence Artificielle',
    content: 'L\'École accueillera la 12ème édition de la conférence internationale sur l\'IA les 20 et 21 février. Inscription obligatoire pour les étudiants souhaitant y assister.',
    type: 'event',
    createdAt: '2024-12-26T11:00:00Z',
    author: 'Département Recherche',
  },
  {
    id: 4,
    title: 'Mise à jour du règlement intérieur',
    content: 'Suite au conseil d\'administration du 15 décembre, certaines dispositions du règlement intérieur ont été mises à jour. Les modifications concernent principalement les procédures de justification des absences.',
    type: 'general',
    createdAt: '2024-12-24T16:00:00Z',
    author: 'Direction Générale',
  },
];

// Mock Absences
export const mockAbsences: Absence[] = [
  {
    id: 1,
    date: '2024-12-20',
    module: 'Systèmes Distribués',
    moduleCode: 'INF-401',
    hours: 3,
    status: 'pending',
    justificationDeadline: '2024-12-22T23:59:59Z',
  },
  {
    id: 2,
    date: '2024-12-18',
    module: 'Bases de Données Avancées',
    moduleCode: 'INF-302',
    hours: 2,
    status: 'approved',
    justification: 'Certificat médical',
    justificationFile: 'certificat_medical.pdf',
    justificationDeadline: '2024-12-20T23:59:59Z',
    teacherComment: 'Justification acceptée.',
  },
  {
    id: 3,
    date: '2024-12-15',
    module: 'Analyse Numérique',
    moduleCode: 'MAT-205',
    hours: 2,
    status: 'rejected',
    justification: 'Problème de transport',
    justificationDeadline: '2024-12-17T23:59:59Z',
    teacherComment: 'Justification insuffisante. Veuillez fournir un document officiel.',
  },
  {
    id: 4,
    date: '2024-12-10',
    module: 'Réseaux et Protocoles',
    moduleCode: 'INF-305',
    hours: 3,
    status: 'approved',
    justification: 'Convocation préfecture',
    justificationFile: 'convocation.pdf',
    justificationDeadline: '2024-12-12T23:59:59Z',
  },
];

// Mock Courses
export const mockCourses: Course[] = [
  { id: 1, code: 'INF-401', name: 'Systèmes Distribués', credits: 4, semester: 7, teacher: 'Prof. Bernard' },
  { id: 2, code: 'INF-302', name: 'Bases de Données Avancées', credits: 3, semester: 7, teacher: 'Prof. Leroy' },
  { id: 3, code: 'MAT-205', name: 'Analyse Numérique', credits: 3, semester: 7, teacher: 'Prof. Moreau' },
  { id: 4, code: 'INF-305', name: 'Réseaux et Protocoles', credits: 4, semester: 7, teacher: 'Prof. Dubois' },
  { id: 5, code: 'INF-410', name: 'Intelligence Artificielle', credits: 4, semester: 7, teacher: 'Prof. Martin' },
  { id: 6, code: 'COM-201', name: 'Communication Professionnelle', credits: 2, semester: 7, teacher: 'Prof. Petit' },
];

// Mock Timetable
export const mockTimetable: TimetableEntry[] = [
  { id: 1, day: 'monday', startTime: '08:30', endTime: '10:00', course: 'Systèmes Distribués', courseCode: 'INF-401', room: 'Amphi A', type: 'lecture', teacher: 'Prof. Bernard' },
  { id: 2, day: 'monday', startTime: '10:15', endTime: '12:15', course: 'Bases de Données Avancées', courseCode: 'INF-302', room: 'Salle 201', type: 'tutorial', teacher: 'Prof. Leroy' },
  { id: 3, day: 'monday', startTime: '14:00', endTime: '16:00', course: 'Intelligence Artificielle', courseCode: 'INF-410', room: 'Lab 3', type: 'lab', teacher: 'Prof. Martin' },
  { id: 4, day: 'tuesday', startTime: '08:30', endTime: '10:30', course: 'Analyse Numérique', courseCode: 'MAT-205', room: 'Amphi B', type: 'lecture', teacher: 'Prof. Moreau' },
  { id: 5, day: 'tuesday', startTime: '10:45', endTime: '12:15', course: 'Communication Professionnelle', courseCode: 'COM-201', room: 'Salle 105', type: 'tutorial', teacher: 'Prof. Petit' },
  { id: 6, day: 'wednesday', startTime: '09:00', endTime: '11:00', course: 'Réseaux et Protocoles', courseCode: 'INF-305', room: 'Amphi A', type: 'lecture', teacher: 'Prof. Dubois' },
  { id: 7, day: 'wednesday', startTime: '14:00', endTime: '17:00', course: 'Systèmes Distribués', courseCode: 'INF-401', room: 'Lab 1', type: 'lab', teacher: 'Prof. Bernard' },
  { id: 8, day: 'thursday', startTime: '08:30', endTime: '10:30', course: 'Intelligence Artificielle', courseCode: 'INF-410', room: 'Amphi C', type: 'lecture', teacher: 'Prof. Martin' },
  { id: 9, day: 'thursday', startTime: '14:00', endTime: '16:00', course: 'Bases de Données Avancées', courseCode: 'INF-302', room: 'Lab 2', type: 'lab', teacher: 'Prof. Leroy' },
  { id: 10, day: 'friday', startTime: '09:00', endTime: '11:00', course: 'Réseaux et Protocoles', courseCode: 'INF-305', room: 'Salle 301', type: 'tutorial', teacher: 'Prof. Dubois' },
  { id: 11, day: 'friday', startTime: '11:15', endTime: '12:45', course: 'Analyse Numérique', courseCode: 'MAT-205', room: 'Salle 202', type: 'tutorial', teacher: 'Prof. Moreau' },
];

// Mock Assignments
export const mockAssignments: Assignment[] = [
  { id: 1, title: 'TP1 - Implémentation d\'un système distribué', course: 'Systèmes Distribués', courseCode: 'INF-401', dueDate: '2025-01-15', status: 'pending', maxGrade: 20 },
  { id: 2, title: 'Projet - Optimisation de requêtes SQL', course: 'Bases de Données Avancées', courseCode: 'INF-302', dueDate: '2025-01-10', status: 'submitted', submittedAt: '2025-01-08T14:30:00Z', maxGrade: 20 },
  { id: 3, title: 'Rapport - Analyse de convergence', course: 'Analyse Numérique', courseCode: 'MAT-205', dueDate: '2024-12-20', status: 'graded', grade: 16, maxGrade: 20, submittedAt: '2024-12-19T10:00:00Z' },
  { id: 4, title: 'TP2 - Configuration réseau', course: 'Réseaux et Protocoles', courseCode: 'INF-305', dueDate: '2025-01-20', status: 'pending', maxGrade: 20 },
];

// Mock Exams
export const mockExams: Exam[] = [
  { id: 1, course: 'Systèmes Distribués', courseCode: 'INF-401', date: '2025-01-25', startTime: '08:00', endTime: '11:00', room: 'Amphi A', type: 'final' },
  { id: 2, course: 'Bases de Données Avancées', courseCode: 'INF-302', date: '2025-01-27', startTime: '14:00', endTime: '16:00', room: 'Amphi B', type: 'final' },
  { id: 3, course: 'Intelligence Artificielle', courseCode: 'INF-410', date: '2025-01-30', startTime: '08:00', endTime: '11:00', room: 'Amphi C', type: 'final' },
  { id: 4, course: 'Analyse Numérique', courseCode: 'MAT-205', date: '2025-01-15', startTime: '10:00', endTime: '12:00', room: 'Salle 201', type: 'midterm' },
];

// Mock Statistics
export const mockAbsenceStats = {
  totalHours: 10,
  justifiedHours: 5,
  unjustifiedHours: 5,
  byModule: [
    { module: 'INF-401', hours: 3, justified: 0 },
    { module: 'INF-302', hours: 2, justified: 2 },
    { module: 'MAT-205', hours: 2, justified: 0 },
    { module: 'INF-305', hours: 3, justified: 3 },
  ],
  bySemester: [
    { semester: 'Automne 2024', hours: 10, justified: 5 },
  ],
};

// Disciplinary Alerts (for Admin)
export const mockDisciplinaryAlerts = [
  { id: 1, student: { id: 10, firstName: 'Lucas', lastName: 'Ferrand', studentId: 'STU-2024-0098', email: 'lucas.ferrand@esi.edu', program: 'Génie Informatique' }, absenceCount: 8, lastAbsence: '2024-12-28', convocationSent: false, convocationDate: null },
  { id: 2, student: { id: 11, firstName: 'Emma', lastName: 'Blanc', studentId: 'STU-2024-0156', email: 'emma.blanc@esi.edu', program: 'Génie Civil' }, absenceCount: 7, lastAbsence: '2024-12-27', convocationSent: true, convocationDate: '2024-12-29' },
  { id: 3, student: { id: 12, firstName: 'Thomas', lastName: 'Mercier', studentId: 'STU-2024-0089', email: 'thomas.mercier@esi.edu', program: 'Génie Électrique' }, absenceCount: 9, lastAbsence: '2024-12-30', convocationSent: false, convocationDate: null },
];

// Mock Students List (for Admin)
export interface MockStudent {
  id: number;
  studentId: string;
  firstName: string;
  lastName: string;
  email: string;
  program: string;
  year: number;
  status: 'active' | 'inactive' | 'suspended';
  enrollmentDate: string;
}

export const mockStudentsList: MockStudent[] = [
  { id: 1, studentId: 'STU-2024-0142', firstName: 'Marie', lastName: 'Dupont', email: 'marie.dupont@esi.edu', program: 'Génie Informatique', year: 3, status: 'active', enrollmentDate: '2022-09-01' },
  { id: 2, studentId: 'STU-2024-0098', firstName: 'Lucas', lastName: 'Ferrand', email: 'lucas.ferrand@esi.edu', program: 'Génie Informatique', year: 3, status: 'active', enrollmentDate: '2022-09-01' },
  { id: 3, studentId: 'STU-2024-0156', firstName: 'Emma', lastName: 'Blanc', email: 'emma.blanc@esi.edu', program: 'Génie Civil', year: 2, status: 'active', enrollmentDate: '2023-09-01' },
  { id: 4, studentId: 'STU-2024-0089', firstName: 'Thomas', lastName: 'Mercier', email: 'thomas.mercier@esi.edu', program: 'Génie Électrique', year: 4, status: 'suspended', enrollmentDate: '2021-09-01' },
  { id: 5, studentId: 'STU-2024-0201', firstName: 'Camille', lastName: 'Roux', email: 'camille.roux@esi.edu', program: 'Génie Mécanique', year: 1, status: 'active', enrollmentDate: '2024-09-01' },
  { id: 6, studentId: 'STU-2024-0178', firstName: 'Antoine', lastName: 'Garcia', email: 'antoine.garcia@esi.edu', program: 'Génie Informatique', year: 2, status: 'active', enrollmentDate: '2023-09-01' },
  { id: 7, studentId: 'STU-2024-0134', firstName: 'Julie', lastName: 'Lambert', email: 'julie.lambert@esi.edu', program: 'Génie Civil', year: 3, status: 'active', enrollmentDate: '2022-09-01' },
  { id: 8, studentId: 'STU-2024-0067', firstName: 'Nicolas', lastName: 'Petit', email: 'nicolas.petit@esi.edu', program: 'Génie Électrique', year: 5, status: 'active', enrollmentDate: '2020-09-01' },
];

// Mock Teachers List (for Admin)
export interface MockTeacher {
  id: number;
  teacherId: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  courses: string[];
  status: 'active' | 'inactive' | 'sabbatical';
  hireDate: string;
}

export const mockTeachersList: MockTeacher[] = [
  { id: 1, teacherId: 'TCH-2019-0028', firstName: 'Jean-Pierre', lastName: 'Bernard', email: 'jp.bernard@esi.edu', department: 'Informatique & Systèmes', courses: ['INF-401', 'INF-405'], status: 'active', hireDate: '2019-09-01' },
  { id: 2, teacherId: 'TCH-2015-0012', firstName: 'Claire', lastName: 'Leroy', email: 'c.leroy@esi.edu', department: 'Informatique & Systèmes', courses: ['INF-302', 'INF-303'], status: 'active', hireDate: '2015-09-01' },
  { id: 3, teacherId: 'TCH-2018-0045', firstName: 'François', lastName: 'Moreau', email: 'f.moreau@esi.edu', department: 'Mathématiques', courses: ['MAT-205', 'MAT-301'], status: 'active', hireDate: '2018-09-01' },
  { id: 4, teacherId: 'TCH-2017-0033', firstName: 'Isabelle', lastName: 'Dubois', email: 'i.dubois@esi.edu', department: 'Réseaux & Télécoms', courses: ['INF-305', 'INF-306'], status: 'active', hireDate: '2017-09-01' },
  { id: 5, teacherId: 'TCH-2020-0056', firstName: 'Philippe', lastName: 'Martin', email: 'p.martin@esi.edu', department: 'Intelligence Artificielle', courses: ['INF-410', 'INF-411'], status: 'active', hireDate: '2020-09-01' },
  { id: 6, teacherId: 'TCH-2016-0022', firstName: 'Catherine', lastName: 'Petit', email: 'c.petit@esi.edu', department: 'Communication', courses: ['COM-201', 'COM-202'], status: 'sabbatical', hireDate: '2016-09-01' },
];

// Mock Administrators List (for Admin)
export interface MockAdministrator {
  id: number;
  adminId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  permissions: string[];
  status: 'active' | 'inactive';
  hireDate: string;
}

export const mockAdministratorsList: MockAdministrator[] = [
  { id: 1, adminId: 'ADM-2015-0001', firstName: 'Sophie', lastName: 'Martin', email: 'admin@esi.edu', role: 'Administrateur Principal', permissions: ['all'], status: 'active', hireDate: '2015-01-01' },
  { id: 2, adminId: 'ADM-2018-0003', firstName: 'Michel', lastName: 'Durand', email: 'm.durand@esi.edu', role: 'Gestionnaire Scolarité', permissions: ['students', 'timetables', 'announcements'], status: 'active', hireDate: '2018-03-15' },
  { id: 3, adminId: 'ADM-2020-0007', firstName: 'Nathalie', lastName: 'Rousseau', email: 'n.rousseau@esi.edu', role: 'Gestionnaire RH', permissions: ['teachers', 'administrators'], status: 'active', hireDate: '2020-06-01' },
];

// Mock Attendance Sessions (for Teacher)
export interface AttendanceSession {
  id: number;
  courseCode: string;
  courseName: string;
  date: string;
  startTime: string;
  endTime: string;
  room: string;
  type: 'lecture' | 'tutorial' | 'lab';
  totalStudents: number;
  presentStudents: number;
  status: 'scheduled' | 'in_progress' | 'completed';
}

export const mockAttendanceSessions: AttendanceSession[] = [
  { id: 1, courseCode: 'INF-401', courseName: 'Systèmes Distribués', date: '2024-12-30', startTime: '08:30', endTime: '10:00', room: 'Amphi A', type: 'lecture', totalStudents: 45, presentStudents: 42, status: 'completed' },
  { id: 2, courseCode: 'INF-401', courseName: 'Systèmes Distribués', date: '2025-01-02', startTime: '14:00', endTime: '17:00', room: 'Lab 1', type: 'lab', totalStudents: 24, presentStudents: 0, status: 'scheduled' },
  { id: 3, courseCode: 'INF-302', courseName: 'Bases de Données Avancées', date: '2024-12-28', startTime: '10:15', endTime: '12:15', room: 'Salle 201', type: 'tutorial', totalStudents: 30, presentStudents: 28, status: 'completed' },
];

// Mock Student Attendance (for Teacher manual correction)
export interface StudentAttendance {
  id: number;
  studentId: string;
  firstName: string;
  lastName: string;
  present: boolean;
  arrivalTime?: string;
  method: 'qr' | 'facial' | 'manual';
}

export const mockStudentAttendance: StudentAttendance[] = [
  { id: 1, studentId: 'STU-2024-0142', firstName: 'Marie', lastName: 'Dupont', present: true, arrivalTime: '08:28', method: 'qr' },
  { id: 2, studentId: 'STU-2024-0098', firstName: 'Lucas', lastName: 'Ferrand', present: false, method: 'manual' },
  { id: 3, studentId: 'STU-2024-0178', firstName: 'Antoine', lastName: 'Garcia', present: true, arrivalTime: '08:32', method: 'facial' },
  { id: 4, studentId: 'STU-2024-0134', firstName: 'Julie', lastName: 'Lambert', present: true, arrivalTime: '08:30', method: 'qr' },
  { id: 5, studentId: 'STU-2024-0201', firstName: 'Camille', lastName: 'Roux', present: true, arrivalTime: '08:35', method: 'manual' },
];

// Mock Justification Requests (for Teacher review)
export interface JustificationRequest {
  id: number;
  studentId: string;
  studentName: string;
  date: string;
  courseCode: string;
  courseName: string;
  hours: number;
  justificationType: string;
  justificationText: string;
  fileName?: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedAt?: string;
  reviewComment?: string;
}

export const mockJustificationRequests: JustificationRequest[] = [
  { id: 1, studentId: 'STU-2024-0142', studentName: 'Marie Dupont', date: '2024-12-20', courseCode: 'INF-401', courseName: 'Systèmes Distribués', hours: 3, justificationType: 'Certificat médical', justificationText: 'Consultation médicale urgente', fileName: 'certificat_20241220.pdf', submittedAt: '2024-12-21T09:00:00Z', status: 'pending' },
  { id: 2, studentId: 'STU-2024-0098', studentName: 'Lucas Ferrand', date: '2024-12-18', courseCode: 'INF-302', courseName: 'Bases de Données Avancées', hours: 2, justificationType: 'Convocation officielle', justificationText: 'Convocation préfecture pour renouvellement titre de séjour', fileName: 'convocation_prefecture.pdf', submittedAt: '2024-12-19T14:30:00Z', status: 'pending' },
  { id: 3, studentId: 'STU-2024-0156', studentName: 'Emma Blanc', date: '2024-12-15', courseCode: 'MAT-205', courseName: 'Analyse Numérique', hours: 2, justificationType: 'Problème de transport', justificationText: 'Grève des transports en commun', submittedAt: '2024-12-16T08:00:00Z', status: 'rejected', reviewedAt: '2024-12-17T10:00:00Z', reviewComment: 'Justification insuffisante. Un document officiel est requis.' },
];

// Mock Programs (for Timetable management)
export interface Program {
  id: number;
  code: string;
  name: string;
  years: number;
  department: string;
}

export const mockPrograms: Program[] = [
  { id: 1, code: 'GI', name: 'Génie Informatique', years: 5, department: 'Informatique & Systèmes' },
  { id: 2, code: 'GC', name: 'Génie Civil', years: 5, department: 'Génie Civil' },
  { id: 3, code: 'GE', name: 'Génie Électrique', years: 5, department: 'Génie Électrique' },
  { id: 4, code: 'GM', name: 'Génie Mécanique', years: 5, department: 'Génie Mécanique' },
];
