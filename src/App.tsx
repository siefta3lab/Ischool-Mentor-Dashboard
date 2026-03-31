import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import Papa from 'papaparse';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  onSnapshot, 
  query, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  addDoc, 
  where, 
  orderBy,
  getDocFromServer, 
  Timestamp,
  increment 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { initializeApp, getApp, getApps } from 'firebase/app';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut, 
  onAuthStateChanged, 
  getAuth,
  User 
} from 'firebase/auth';
import { 
  LayoutDashboard, 
  Users, 
  PlusCircle, 
  LogOut, 
  ChevronRight, 
  Calendar, 
  FileText, 
  TrendingUp, 
  BookOpen, 
  Flag as FlagIcon, 
  Trash2, 
  Edit, 
  UserMinus, 
  Globe, 
  Send, 
  Plus, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Upload,
  MessageSquare,
  Bell,
  Settings,
  Link as LinkIcon,
  Save
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend 
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { db, auth, storage, firebaseConfig } from './firebase';
import { 
  UserProfile, 
  TutorDetails, 
  Vacation, 
  QualityReport, 
  Flag, 
  Course, 
  StudyPlan, 
  Performance 
} from './types';

// --- Utils ---
const getDirectDriveLink = (url: string | null | undefined) => {
  if (!url) return null;
  if (url.includes('drive.google.com')) {
    const fileId = url.match(/\/d\/([a-zA-Z0-9_-]+)/)?.[1] || url.match(/id=([a-zA-Z0-9_-]+)/)?.[1];
    if (fileId) {
      return `https://lh3.googleusercontent.com/u/0/d/${fileId}`;
    }
  }
  return url;
};

const Logo = ({ url, size = 24, className = "" }: { url: string | null | undefined, size?: number, className?: string }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const directUrl = getDirectDriveLink(url);

  if (!url || error) {
    return (
      <div className={`flex items-center justify-center bg-gray-50/50 border border-dashed border-gray-200 ${className}`}>
        <div className="w-1/2 h-1/2 bg-gray-100/50 rounded-full blur-sm" />
      </div>
    );
  }

  return (
    <div className={`relative flex items-center justify-center overflow-hidden bg-white ${className}`}>
      {loading && (
        <div className="absolute inset-0 bg-gray-50 animate-pulse flex items-center justify-center">
          <div className="w-1/3 h-1/3 bg-gray-200/50 rounded-full" />
        </div>
      )}
      <img 
        src={directUrl!} 
        alt="Logo" 
        className={`w-full h-full object-contain transition-opacity duration-500 ${loading ? 'opacity-0' : 'opacity-100'}`}
        onLoad={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setError(true);
        }}
        referrerPolicy="no-referrer"
      />
    </div>
  );
};

// --- Translations ---
const translations = {
  en: {
    login: "Login",
    email: "Email",
    password: "Password",
    mentor: "Mentor",
    tutor: "Tutor",
    dashboard: "Dashboard",
    tutors: "Tutors",
    addTutor: "Add New Tutor",
    logout: "Logout",
    id: "ID",
    name: "Name",
    studyPlan: "Study Plan",
    vacations: "Vacations",
    monthFlags: "Month Flags",
    totalPerformance: "Total Performance",
    last3Months: "Last 3 Months",
    flagRate: "Flag Rate",
    repeatedFlags: "Repeated Flags",
    save: "Save",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    resign: "Resign",
    notes: "Notes",
    materialLink: "Material Link",
    qualityReport: "Quality Report",
    tutorPortal: "Tutor Portal",
    settings: "Settings",
    teamBranding: "Team Branding",
    logoDescription: "Set your team's logo URL. This will be visible to all your tutors.",
    teamLogoUrl: "Team Logo URL",
    saveChanges: "Save Changes",
    saved: "Saved!",
    teamLogo: "Team Logo",
    yourMentor: "Your Mentor",
    subTeam: "Sub-team",
    yourPerformance: "Your Performance",
    percentage: "Percentage",
    meetingDate: "Meeting Date",
    meetingLink: "Meeting Link",
    recordedLink: "Recorded Link",
    postMeetingNotes: "Post-Meeting Notes",
    performance: "Performance",
    quality: "Quality",
    work: "Work",
    total: "Total",
    totalStudy: "Total Study",
    grade: "Grade",
    courseName: "Course Name",
    flags: "Flags",
    type: "Type",
    reason: "Reason",
    status: "Status",
    tutorFeedback: "Tutor Feedback",
    mentorFeedback: "Mentor Feedback",
    history: "History",
    showAll: "Show All",
    designedBy: "Designed by Seif Ta'lab",
    language: "Language",
    arabic: "Arabic",
    english: "English",
    error: "Error",
    success: "Success",
    loading: "Loading...",
    noData: "No data available",
    addFlag: "Add Flag",
    red: "Red",
    yellow: "Yellow",
    done: "Done",
    inProgress: "In Progress",
    canceled: "Canceled",
    tutorView: "Tutor View",
    mentorView: "Mentor View",
    feedbackToMentor: "Feedback to Mentor",
    submit: "Submit",
    problemReport: "Report a problem or suggestion",
    welcome: "Welcome",
    back: "Back",
    confirmDelete: "Are you sure you want to delete this tutor?",
    confirmDeleteReport: "Are you sure you want to delete this report?",
    confirmResign: "Are you sure you want to mark this tutor as resigned?",
    yes: "Yes",
    no: "No",
    active: "Active",
    resigned: "Resigned",
    mentorSetup: "Mentor Initial Setup",
    teamLeaderName: "Team Leader Name",
    teamNumber: "Team Number",
    mentorName: "Mentor Name",
    subTeamName: "Sub-team Name",
    alreadyHaveAccount: "Already have an account? Login",
    needSetup: "First time? Mentor Initial Setup",
    selectRole: "Select Your Role",
    mentorRole: "Mentor / Admin",
    tutorRole: "Tutor / Teacher",
    mentorSupport: "Mentor Support",
    accessPortal: "Access Portal",
    messageSent: "Message Sent Successfully!",
    feedbacks: "Feedbacks",
    tutorName: "Tutor Name",
    message: "Message",
    date: "Date",
    send: "Send",
    writeMessage: "Write your message here...",
    resolvedIssues: "Resolved Issues",
    markAsDone: "Mark as Done",
    reply: "Still have an issue / Reply",
    confirmDone: "Confirm Done",
    archived: "Archived",
    resolved: "Resolved",
    pending: "Pending"
  },
  ar: {
    login: "تسجيل الدخول",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    mentor: "المنتور",
    tutor: "التوتور",
    dashboard: "لوحة التحكم",
    tutors: "المدرسين",
    addTutor: "إضافة مدرس جديد",
    logout: "تسجيل الخروج",
    id: "المعرف",
    name: "الاسم",
    studyPlan: "خطة الدراسة",
    vacations: "الإجازات",
    monthFlags: "أعلام الشهر",
    totalPerformance: "الأداء الكلي",
    last3Months: "آخر 3 أشهر",
    flagRate: "معدل الأعلام",
    repeatedFlags: "الأعلام المتكررة",
    save: "حفظ",
    cancel: "إلغاء",
    edit: "تعديل",
    delete: "حذف",
    resign: "استقالة",
    notes: "ملاحظات",
    materialLink: "رابط الماتريال",
    qualityReport: "تقرير الجودة",
    tutorPortal: "بوابة المعلم",
    settings: "الإعدادات",
    teamBranding: "هوية الفريق",
    logoDescription: "قم بتعيين رابط شعار فريقك. سيكون هذا مرئيًا لجميع المعلمين التابعين لك.",
    teamLogoUrl: "رابط شعار الفريق",
    saveChanges: "حفظ التغييرات",
    saved: "تم الحفظ!",
    teamLogo: "شعار الفريق",
    yourMentor: "مرشدك",
    subTeam: "الفريق الفرعي",
    yourPerformance: "أداؤك",
    percentage: "النسبة",
    meetingDate: "موعد الميتينج",
    meetingLink: "رابط الميتينج",
    recordedLink: "رابط الميتينج المسجل",
    postMeetingNotes: "ملاحظات ما بعد الميتينج",
    performance: "الأداء",
    quality: "الجودة",
    work: "العمل",
    total: "المجموع",
    totalStudy: "إجمالي الدراسة",
    grade: "الدرجة",
    courseName: "اسم الكورس",
    flags: "الأعلام",
    type: "النوع",
    reason: "السبب",
    status: "الحالة",
    tutorFeedback: "فيدباك التوتور",
    mentorFeedback: "فيدباك المنتور",
    history: "السجل",
    showAll: "عرض الكل",
    designedBy: "تم التصميم بواسطة سيف تعلب",
    language: "اللغة",
    arabic: "العربية",
    english: "الإنجليزية",
    error: "خطأ",
    success: "نجاح",
    loading: "جاري التحميل...",
    noData: "لا توجد بيانات",
    addFlag: "إضافة علم",
    red: "أحمر",
    yellow: "أصفر",
    done: "تم",
    inProgress: "قيد التنفيذ",
    canceled: "ملغي",
    tutorView: "واجهة التوتور",
    mentorView: "واجهة المنتور",
    feedbackToMentor: "فيدباك للمنتور",
    submit: "إرسال",
    problemReport: "أبلغ عن مشكلة أو اقتراح",
    welcome: "مرحباً",
    back: "رجوع",
    confirmDelete: "هل أنت متأكد من حذف هذا المدرس؟",
    confirmDeleteReport: "هل أنت متأكد من حذف هذا الملف؟",
    confirmResign: "هل أنت متأكد من وضع هذا المدرس كمستقيل؟",
    confirmAction: "تأكيد الإجراء",
    confirmMessage: "هل أنت متأكد من رغبتك في تنفيذ هذا الإجراء؟",
    yes: "نعم",
    no: "لا",
    active: "نشط",
    resigned: "مستقيل",
    mentorSetup: "إعداد المنسق لأول مرة",
    teamLeaderName: "اسم قائد الفريق (Team Leader)",
    teamNumber: "رقم الفريق",
    mentorName: "اسم المنسق (Mentor)",
    subTeamName: "اسم الفريق الفرعي (Sub-team)",
    alreadyHaveAccount: "لديك حساب بالفعل؟ تسجيل دخول",
    needSetup: "أول مرة؟ إعداد المنسق",
    selectRole: "اختر دورك",
    mentorRole: "منسق / مسؤول",
    tutorRole: "مدرس",
    mentorSupport: "دعم المنسق",
    accessPortal: "بوابة الوصول",
    messageSent: "تم إرسال الرسالة بنجاح!",
    feedbacks: "الرسائل",
    tutorName: "اسم المدرس",
    message: "الرسالة",
    date: "التاريخ",
    send: "إرسال",
    writeMessage: "اكتب رسالتك هنا...",
    resolvedIssues: "المشكلات التي تم حلها",
    markAsDone: "تم الحل",
    reply: "لا تزال هناك مشكلة / رد",
    confirmDone: "تأكيد الحل النهائي",
    archived: "مؤرشف",
    resolved: "تم الحل",
    pending: "قيد الانتظار"
  }
};

function ConfirmDialog({ isOpen, onClose, onConfirm, title, message }: { isOpen: boolean, onClose: () => void, onConfirm: () => void, title: string, message: string }) {
  const { t } = useLang();
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl"
      >
        <h3 className="text-lg font-bold text-[#0047AB] mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex gap-3">
          <button 
            onClick={onConfirm}
            className="flex-1 bg-red-600 text-white py-2 rounded-lg font-bold hover:bg-red-700 transition-colors"
          >
            {t('yes')}
          </button>
          <button 
            onClick={onClose}
            className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-bold hover:bg-gray-200 transition-colors"
          >
            {t('no')}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// --- Contexts ---
const LanguageContext = createContext({
  lang: 'ar',
  setLang: (l: 'ar' | 'en') => {},
  t: (key: keyof typeof translations.en) => ""
});

const useLang = () => useContext(LanguageContext);

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// --- Components ---

const Loading = () => (
  <div className="flex items-center justify-center min-h-screen bg-[#E3F2FD]">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#89CFF0]"></div>
  </div>
);

const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  const [hasError, setHasError] = useState(false);
  const [errorInfo, setErrorInfo] = useState<any>(null);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      setHasError(true);
      setErrorInfo(event.error);
    };
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return (
      <div className="p-8 bg-red-50 text-red-800 rounded-lg m-4 border border-red-200">
        <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
        <pre className="text-sm overflow-auto max-h-40">{JSON.stringify(errorInfo, null, 2)}</pre>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Reload App
        </button>
      </div>
    );
  }

  return <>{children}</>;
};

// --- Main App ---

export default function App() {
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState<'login' | 'dashboard' | 'tutorDetail' | 'tutorSelf'>('login');
  const [selectedTutorId, setSelectedTutorId] = useState<string | null>(null);
  const activeListeners = useRef<(() => void)[]>([]);

  const registerListener = (unsub: () => void) => {
    activeListeners.current.push(unsub);
  };

  const t = (key: keyof typeof translations.en) => translations[lang][key] || key;

  const handleLogout = async () => {
    // 1. Cleanup all active listeners first
    if (activeListeners.current) {
      activeListeners.current.forEach(unsub => {
        try {
          unsub();
        } catch (e) {
          console.error("Error unsubscribing:", e);
        }
      });
      activeListeners.current = [];
    }
    
    // 2. Clear local state
    setUser(null);
    setSelectedTutorId(null);
    localStorage.removeItem('sim_user');
    
    // 3. Redirect to login
    setView('login');
    
    // 4. Sign out from Firebase
    try {
      await signOut(auth);
    } catch (e) {
      console.error("Error signing out:", e);
    }
  };

  useEffect(() => {
    // Check local storage for simulated user session
    const savedUser = localStorage.getItem('sim_user');
    if (savedUser) {
      const userData = JSON.parse(savedUser) as UserProfile;
      setUser(userData);
      if (userData.role === 'mentor') {
        setView('dashboard');
      } else {
        setView('tutorSelf');
        setSelectedTutorId(userData.uid || null);
      }
      setLoading(false);
    }

    // Bootstrap initial data if needed
    const bootstrapData = async () => {
      try {
        const mentorEmail = 'sief.ta3lab@gmail.com';
        // Only allow the admin to bootstrap
        if (auth.currentUser?.email !== mentorEmail) return;

        const mentorsRef = collection(db, 'users');
        const qMentor = query(mentorsRef, where('email', '==', mentorEmail));
        const mentorSnap = await getDocs(qMentor);
        if (mentorSnap.empty) {
          await setDoc(doc(db, 'users', 'mentor_sief'), {
            uid: 'mentor_sief',
            email: mentorEmail,
            password: '123',
            name: 'سيف تعلب',
            role: 'mentor',
            isResigned: false
          });
          console.log("Bootstrap: Mentor account created.");
        }

        const schoolEmail = 'school@ischool.com';
        const qSchool = query(mentorsRef, where('email', '==', schoolEmail));
        const schoolSnap = await getDocs(qSchool);
        if (schoolSnap.empty) {
          await setDoc(doc(db, 'users', 'school_account'), {
            uid: 'school_account',
            email: schoolEmail,
            password: '123',
            name: 'iSchool Administration',
            role: 'mentor',
            isResigned: false
          });
          console.log("Bootstrap: School account created.");
        }
      } catch (err) {
        // Only log if it's not a permission error (which is expected if not logged in)
        if (err instanceof Error && !err.message.includes('permission')) {
          console.error("Bootstrap error:", err);
        }
      }
    };
    bootstrapData();

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          let userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          let userData: UserProfile | null = null;

          if (userDoc.exists()) {
            userData = userDoc.data() as UserProfile;
          } else {
            // Check if there's a user document with this email (for first-time Google login)
            const q = query(collection(db, 'users'), where('email', '==', firebaseUser.email));
            const snap = await getDocs(q);
            if (!snap.empty) {
              const existingUserDoc = snap.docs[0];
              const existingUserData = existingUserDoc.data() as UserProfile;
              const oldUid = existingUserDoc.id;

              // Link the account to the new Firebase UID
              userData = {
                ...existingUserData,
                uid: firebaseUser.uid
              };
              
              // Create new doc with Firebase UID
              await setDoc(doc(db, 'users', firebaseUser.uid), userData);
              
              // If it's a tutor, we need to migrate the tutor document too
              if (existingUserData.role === 'tutor') {
                const tutorDoc = await getDoc(doc(db, 'tutors', oldUid));
                if (tutorDoc.exists()) {
                  await setDoc(doc(db, 'tutors', firebaseUser.uid), tutorDoc.data());
                  await deleteDoc(doc(db, 'tutors', oldUid));
                }
              }
              
              // Delete old user doc
              await deleteDoc(doc(db, 'users', oldUid));
            } else if (firebaseUser.email === 'sief.ta3lab@gmail.com' || firebaseUser.email === 'sief.ta3lab@mentor.com') {
              userData = {
                uid: firebaseUser.uid,
                email: firebaseUser.email!,
                name: firebaseUser.displayName || 'Admin',
                role: 'mentor',
                isResigned: false
              };
              await setDoc(doc(db, 'users', firebaseUser.uid), userData);
            }
          }

          if (userData) {
            setUser(userData);
            localStorage.removeItem('sim_user');
            if (userData.role === 'mentor') {
              setView('dashboard');
            } else {
              setView('tutorSelf');
              setSelectedTutorId(userData.uid || null);
            }
          } else {
            setUser(null);
            setView('login');
            setError('User profile not found in database.');
          }
        } catch (err) {
          console.error("Error fetching user profile:", err);
          if (!localStorage.getItem('sim_user')) {
            setUser(null);
            setView('login');
          }
        }
      } else {
        if (!localStorage.getItem('sim_user')) {
          setUser(null);
          setView('login');
        }
      }
      setLoading(false);
    });

    // Test Firestore connection
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
        }
      }
    };
    testConnection();

    return () => unsubscribe();
  }, []);

  if (loading) return <Loading />;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      <ErrorBoundary>
        <div className={`min-h-screen bg-[#F0F8FF] font-sans ${lang === 'ar' ? 'rtl' : 'ltr'}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
          <Header user={user} setView={setView} onLogout={handleLogout} onUpdateUser={setUser} />
          <main className="container mx-auto px-4 py-8 pb-20">
            <AnimatePresence mode="wait">
              {view === 'login' && (
                <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <Login onLogin={(u) => {
                    setUser(u);
                    if (u.role === 'mentor') {
                      setView('dashboard');
                    } else {
                      setView('tutorSelf');
                      setSelectedTutorId(u.uid || null);
                    }
                  }} externalError={error} />
                </motion.div>
              )}
              {view === 'dashboard' && (
                <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <MentorDashboard 
                    mentor={user!} 
                    onSelectTutor={(id) => { setSelectedTutorId(id); setView('tutorDetail'); }} 
                    registerListener={registerListener}
                  />
                </motion.div>
              )}
              {view === 'tutorDetail' && selectedTutorId && (
                <motion.div key="detail" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <TutorDetail 
                    tutorId={selectedTutorId} 
                    isMentor={true} 
                    onBack={() => setView('dashboard')} 
                    registerListener={registerListener}
                  />
                </motion.div>
              )}
              {view === 'tutorSelf' && (
                <motion.div key="self" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <TutorDashboard user={user!} registerListener={registerListener} />
                </motion.div>
              )}
              {view === 'settings' && user?.role === 'mentor' && (
                <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <MentorSettings mentor={user!} onUpdateUser={setUser} onBack={() => setView('dashboard')} />
                </motion.div>
              )}
            </AnimatePresence>
          </main>
          <Footer />
        </div>
      </ErrorBoundary>
    </LanguageContext.Provider>
  );
}

// --- Sub-components ---


function Header({ user, setView, onLogout, onUpdateUser }: { user: UserProfile | null, setView: (v: any) => void, onLogout: () => void, onUpdateUser: (u: UserProfile) => void }) {
  const { lang, setLang, t } = useLang();
  const [mentorLogo, setMentorLogo] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role === 'tutor' && user.mentorId) {
      const unsub = onSnapshot(doc(db, 'users', user.mentorId), (doc) => {
        if (doc.exists()) {
          setMentorLogo(doc.data().teamLogoURL || null);
        }
      }, (error) => handleFirestoreError(error, OperationType.GET, `users/${user.mentorId}`));
      return () => unsub();
    }
  }, [user?.uid, user?.mentorId]);

  const currentLogo = user?.role === 'mentor' ? user.teamLogoURL : mentorLogo;

  return (
    <header className="bg-white shadow-sm border-b border-[#89CFF0]/30 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center bg-[#0047AB] shadow-lg shadow-blue-200 cursor-pointer" 
            onClick={() => setView(user?.role === 'mentor' ? 'dashboard' : 'tutorSelf')}
          >
            <Logo url={currentLogo} size={20} className="w-full h-full" />
          </div>
          <h1 className="text-xl font-bold text-[#0047AB] hidden sm:block">{t('mentorSupport')}</h1>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#89CFF0] text-[#0047AB] hover:bg-[#89CFF0]/10 transition-colors"
          >
            <Globe size={18} />
            <span className="text-sm font-medium">{t('language')}</span>
          </button>

          {user && (
            <div className="flex items-center gap-4">
              {user.role === 'mentor' && (
                <button 
                  onClick={() => setView('settings')}
                  className="p-2 text-gray-500 hover:text-[#0047AB] transition-colors"
                  title={t('settings')}
                >
                  <Settings size={20} />
                </button>
              )}
              
              <div className="hidden md:block text-right">
                <p className="text-sm font-bold text-[#0047AB]">{user.name}</p>
                <p className="text-xs text-gray-500 capitalize">{t(user.role)}</p>
              </div>
              <button 
                onClick={onLogout}
                className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                title={t('logout')}
              >
                <LogOut size={20} />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function Footer() {
  const { t, lang } = useLang();
  return (
    <footer className="bg-white border-t border-[#89CFF0]/30 py-4 fixed bottom-0 w-full z-40">
      <div className="container mx-auto px-4 text-center">
        <p className="text-sm text-gray-500">
          {lang === 'ar' ? (
            <>تم التصميم بواسطة <span className="text-[#0047AB] font-bold">سيف تعلب</span></>
          ) : (
            <>Designed by <span className="text-[#0047AB] font-bold">Seif Ta'lab</span></>
          )}
        </p>
      </div>
    </footer>
  );
}

function ISchoolLogo() {
  return (
    <div className="flex flex-col items-center gap-2 mb-6">
      <div className="w-16 h-16 bg-[#89CFF0] rounded-2xl flex items-center justify-center text-white font-black text-4xl shadow-lg shadow-[#89CFF0]/40">
        i
      </div>
      <div className="flex flex-col items-center">
        <span className="text-2xl font-black text-[#0047AB] tracking-tighter">iSchool</span>
        <span className="text-xs font-bold text-[#89CFF0] tracking-[0.2em] uppercase mt-[-4px]">Mentors</span>
      </div>
    </div>
  );
}

function Login({ onLogin, externalError }: { onLogin: (u: UserProfile) => void, externalError?: string }) {
  const { t, lang } = useLang();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'mentor' | 'tutor'>('tutor');
  const [isSetup, setIsSetup] = useState(false);
  const [error, setError] = useState(externalError || '');
  const [loading, setLoading] = useState(false);

  // Setup fields
  const [setupData, setSetupData] = useState({
    teamLeaderName: '',
    teamNumber: '',
    mentorName: '',
    subTeamName: '',
    email: '',
    password: ''
  });

  useEffect(() => {
    if (externalError) setError(externalError);
  }, [externalError]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    let loginEmail = email.trim().toLowerCase();
    const loginPassword = password.trim();
    // Firebase Auth requires a valid email format (e.g., .com)
    if (loginEmail === 'sief.ta3lab@mentor') {
      loginEmail = 'sief.ta3lab@mentor.com';
    }

    try {
      // 1. Try standard Firebase Auth
      try {
        const userCredential = await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
        const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data() as UserProfile;
          if (userData.role !== role) {
            await signOut(auth);
            throw new Error('Invalid role selected');
          }
        }
        return; // Success, onAuthStateChanged will handle
      } catch (authErr: any) {
        if (authErr.message === 'Invalid role selected') throw authErr;
        
        // 2. Try simulated auth as fallback (for existing tutors/mentors not in Auth yet)
        const emailsToTry = [loginEmail, email.trim().toLowerCase()];
        
        for (const testEmail of emailsToTry) {
          const q = query(
            collection(db, 'users'), 
            where('email', '==', testEmail), 
            where('password', '==', loginPassword)
          );
          const snapshot = await getDocs(q);
          if (!snapshot.empty) {
            const userData = snapshot.docs[0].data() as UserProfile;
            if (userData.role !== role) {
              throw new Error('Invalid role selected');
            }
            // Set localStorage BEFORE calling onLogin to prevent onAuthStateChanged race condition
            localStorage.setItem('sim_user', JSON.stringify(userData));
            onLogin(userData);
            return;
          }
        }
        
        // If we reach here, both Auth and Simulated failed
        if (authErr.code === 'auth/user-not-found' || authErr.code === 'auth/wrong-password' || authErr.code === 'auth/invalid-credential' || authErr.code === 'auth/invalid-email') {
          throw new Error('Invalid email or password');
        } else if (authErr.code === 'auth/operation-not-allowed') {
          throw new Error('Email/Password login is not enabled in Firebase Console.');
        }
        throw authErr;
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // 1. Create in Auth if possible
      let mentorUid = '';
      try {
        const res = await createUserWithEmailAndPassword(auth, setupData.email, setupData.password);
        mentorUid = res.user.uid;
      } catch (authErr: any) {
        if (authErr.code === 'auth/email-already-in-use') {
          const res = await signInWithEmailAndPassword(auth, setupData.email, setupData.password);
          mentorUid = res.user.uid;
        } else {
          // Fallback to simulated UID if Auth is not configured
          mentorUid = 'mentor_' + Math.random().toString(36).substr(2, 9);
        }
      }

      // 2. Create Mentor Profile
      const mentorProfile: UserProfile = {
        uid: mentorUid,
        email: setupData.email,
        password: setupData.password,
        name: setupData.mentorName,
        role: 'mentor',
        teamLeaderName: setupData.teamLeaderName,
        teamNumber: setupData.teamNumber,
        subTeamName: setupData.subTeamName,
        isResigned: false
      };

      await setDoc(doc(db, 'users', mentorUid), mentorProfile);
      
      localStorage.setItem('sim_user', JSON.stringify(mentorProfile));
      onLogin(mentorProfile);
    } catch (err: any) {
      setError(err.message || 'Setup failed');
    } finally {
      setLoading(false);
    }
  };

  if (isSetup) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto mt-12 bg-white p-8 rounded-2xl shadow-xl border border-[#89CFF0]/20"
      >
        <div className="text-center mb-8">
          <ISchoolLogo />
          <h2 className="text-2xl font-bold text-[#0047AB]">{t('mentorSetup')}</h2>
        </div>

        <form onSubmit={handleSetup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('teamLeaderName')}</label>
            <input 
              type="text" 
              value={setupData.teamLeaderName}
              onChange={(e) => setSetupData({...setupData, teamLeaderName: e.target.value})}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#89CFF0] outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('teamNumber')}</label>
            <input 
              type="text" 
              value={setupData.teamNumber}
              onChange={(e) => setSetupData({...setupData, teamNumber: e.target.value})}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#89CFF0] outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('mentorName')}</label>
            <input 
              type="text" 
              value={setupData.mentorName}
              onChange={(e) => setSetupData({...setupData, mentorName: e.target.value})}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#89CFF0] outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('subTeamName')}</label>
            <input 
              type="text" 
              value={setupData.subTeamName}
              onChange={(e) => setSetupData({...setupData, subTeamName: e.target.value})}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#89CFF0] outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('email')}</label>
            <input 
              type="email" 
              value={setupData.email}
              onChange={(e) => setSetupData({...setupData, email: e.target.value})}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#89CFF0] outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('password')}</label>
            <input 
              type="password" 
              value={setupData.password}
              onChange={(e) => setSetupData({...setupData, password: e.target.value})}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#89CFF0] outline-none"
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-2.5 bg-[#0047AB] text-white rounded-lg font-bold hover:bg-[#003580] transition-all disabled:opacity-50"
          >
            {loading ? t('loading') : t('submit')}
          </button>

          <button 
            type="button"
            onClick={() => setIsSetup(false)}
            className="w-full text-sm text-gray-500 hover:text-[#0047AB] transition-colors"
          >
            {t('alreadyHaveAccount')}
          </button>
        </form>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto mt-12 bg-white p-8 rounded-2xl shadow-xl border border-[#89CFF0]/20"
    >
      <div className="text-center mb-8">
        <ISchoolLogo />
        <h2 className="text-2xl font-black text-[#0047AB] tracking-tight">
          {t('mentorSupport')}
        </h2>
        <p className="text-sm font-bold text-[#89CFF0] uppercase tracking-widest mt-1">
          {t('accessPortal')}
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-6">
        <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
          <p className="text-xs text-[#0047AB] font-bold text-center mb-3 uppercase tracking-wider">
            {t('selectRole')}
          </p>
          <div className="flex gap-2">
            <button 
              type="button"
              onClick={() => setRole('tutor')}
              className={`flex-1 py-3 rounded-xl text-sm font-black transition-all duration-300 ${role === 'tutor' ? 'bg-[#0047AB] text-white shadow-lg shadow-blue-200 scale-105' : 'bg-white text-gray-400 border border-gray-100'}`}
            >
              {t('tutorRole')}
            </button>
            <button 
              type="button"
              onClick={() => setRole('mentor')}
              className={`flex-1 py-3 rounded-xl text-sm font-black transition-all duration-300 ${role === 'mentor' ? 'bg-[#0047AB] text-white shadow-lg shadow-blue-200 scale-105' : 'bg-white text-gray-400 border border-gray-100'}`}
            >
              {t('mentorRole')}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">{t('email')}</label>
            <input 
              type="text" 
              value={email}
              onChange={(e) => setEmail(e.target.value.trim())}
              className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-[#89CFF0]/20 focus:border-[#89CFF0] outline-none transition-all text-lg font-medium"
              placeholder="name@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">{t('password')}</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value.trim())}
              className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-[#89CFF0]/20 focus:border-[#89CFF0] outline-none transition-all text-lg font-medium"
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-4 bg-red-50 text-red-600 text-sm rounded-xl flex items-center gap-3 border border-red-100"
          >
            <AlertCircle size={18} />
            <span className="font-bold">{error}</span>
          </motion.div>
        )}

        <button 
          type="submit" 
          disabled={loading}
          className={`w-full py-5 rounded-2xl font-black text-lg transition-all duration-300 disabled:opacity-50 transform hover:scale-[1.02] active:scale-[0.98] ${
            email && password 
              ? 'bg-[#0047AB] text-white shadow-xl shadow-blue-200' 
              : 'bg-gray-100 text-gray-400'
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center gap-3">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              {t('loading')}
            </div>
          ) : t('login')}
        </button>

        {role === 'mentor' && (
          <button 
            type="button"
            onClick={() => setIsSetup(true)}
            className="w-full mt-4 text-sm font-bold text-gray-400 hover:text-[#0047AB] transition-colors py-2"
          >
            {t('needSetup')}
          </button>
        )}
      </form>
    </motion.div>
  );
}

function TutorDashboard({ user, registerListener }: { user: UserProfile, registerListener: (unsub: () => void) => void }) {
  const { t, lang } = useLang();
  const [feedback, setFeedback] = useState('');
  const [sending, setSending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [resolvedFeedbacks, setResolvedFeedbacks] = useState<any[]>([]);
  const [mentorProfile, setMentorProfile] = useState<UserProfile | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    const q = query(
      collection(db, 'feedbacks'),
      where('tutorId', '==', user.uid),
      where('status', '==', 'resolved'),
      orderBy('timestamp', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setResolvedFeedbacks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'feedbacks'));
    registerListener(unsubscribe);

    // Fetch Mentor Profile
    if (user.mentorId) {
      const unsubMentor = onSnapshot(doc(db, 'users', user.mentorId), (doc) => {
        if (doc.exists()) {
          setMentorProfile(doc.data() as UserProfile);
        }
      }, (error) => handleFirestoreError(error, OperationType.GET, `users/${user.mentorId}`));
      registerListener(unsubMentor);
    }
  }, [user.uid, user.mentorId]);

  const handleSendFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;
    setSending(true);
    try {
      await addDoc(collection(db, 'feedbacks'), {
        tutorName: user.name,
        tutorId: user.uid,
        mentorId: user.mentorId,
        messageContent: feedback.trim(),
        timestamp: new Date().toISOString(),
        status: 'pending',
        replies: []
      });
      setFeedback('');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error("Error sending feedback:", err);
    } finally {
      setSending(false);
    }
  };

  const handleReply = async (fbId: string) => {
    if (!replyText.trim()) return;
    try {
      const fbRef = doc(db, 'feedbacks', fbId);
      const fbDoc = await getDoc(fbRef);
      if (!fbDoc.exists()) return;
      
      const currentReplies = fbDoc.data().replies || [];
      const newReply = {
        senderId: user.uid,
        senderName: user.name,
        content: replyText.trim(),
        timestamp: new Date().toISOString()
      };

      await updateDoc(fbRef, {
        replies: [...currentReplies, newReply],
        status: 'pending',
        timestamp: new Date().toISOString()
      });
      setReplyingTo(null);
      setReplyText('');
    } catch (err) {
      console.error("Error replying:", err);
    }
  };

  const handleConfirmDone = async (fbId: string) => {
    try {
      await updateDoc(doc(db, 'feedbacks', fbId), {
        status: 'archived'
      });
    } catch (err) {
      console.error("Error confirming done:", err);
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-3xl shadow-xl border border-[#89CFF0]/20 text-center"
      >
        <div className="w-24 h-24 bg-[#89CFF0]/20 rounded-2xl flex items-center justify-center mx-auto mb-6 overflow-hidden border-4 border-white shadow-lg">
          <Logo url={mentorProfile?.teamLogoURL} size={48} className="w-full h-full" />
        </div>
        <h2 className="text-3xl font-black text-[#0047AB] mb-2">{t('welcome')}, {user.name}</h2>
        <p className="text-gray-500 mb-8">{t('tutorPortal')}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-[#89CFF0]/10 rounded-2xl border border-[#89CFF0]/20 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-white border-2 border-[#89CFF0] flex items-center justify-center shadow-sm">
              <Logo url={mentorProfile?.teamLogoURL} size={24} className="w-full h-full" />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-gray-500 uppercase mb-1">{t('yourMentor')}</p>
              <p className="text-xl font-bold text-[#0047AB]">{user.mentorName || '-'}</p>
            </div>
          </div>
          <div className="p-6 bg-[#89CFF0]/10 rounded-2xl border border-[#89CFF0]/20">
            <p className="text-xs font-bold text-gray-500 uppercase mb-2">{t('subTeam')}</p>
            <p className="text-xl font-bold text-[#0047AB]">{user.subTeamName || '-'}</p>
          </div>
        </div>
      </motion.div>

      {/* Feedback Form */}
      <div className="bg-white rounded-3xl shadow-lg border border-[#89CFF0]/20 overflow-hidden">
        <div className="p-6 bg-[#89CFF0]/5 border-b border-[#89CFF0]/10">
          <h3 className="font-bold text-[#0047AB] flex items-center gap-2">
            <MessageSquare size={20} />
            {t('feedbackToMentor')}
          </h3>
        </div>
        <div className="p-8">
          <form onSubmit={handleSendFeedback} className="space-y-4">
            <textarea 
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder={t('writeMessage')}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#89CFF0] focus:border-transparent outline-none transition-all min-h-[120px]"
              required
            />
            <div className="flex items-center justify-between">
              {showSuccess && (
                <motion.p 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-green-600 font-bold text-sm"
                >
                  {t('messageSent')}
                </motion.p>
              )}
              <button 
                type="submit"
                disabled={sending}
                className="bg-[#0047AB] text-white px-8 py-2.5 rounded-xl font-bold hover:bg-[#003580] transition-all flex items-center gap-2 disabled:opacity-50 ml-auto"
              >
                {sending ? t('loading') : (
                  <>
                    <Send size={18} />
                    {t('send')}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Resolved Issues Section */}
      {resolvedFeedbacks.length > 0 && (
        <div className="bg-white rounded-3xl shadow-lg border border-green-100 overflow-hidden">
          <div className="p-6 bg-green-50 border-b border-green-100">
            <h3 className="font-bold text-green-700 flex items-center gap-2">
              <CheckCircle size={20} />
              {t('resolvedIssues')}
            </h3>
          </div>
          <div className="p-6 space-y-4">
            {resolvedFeedbacks.map((fb) => (
              <div key={fb.id} className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <p className="text-sm text-gray-600 mb-4 whitespace-pre-wrap">{fb.messageContent}</p>
                
                {fb.replies && fb.replies.length > 0 && (
                  <div className="mt-4 space-y-3 pl-4 border-l-2 border-[#89CFF0]/30">
                    {fb.replies.map((reply: any, idx: number) => (
                      <div key={idx} className="flex items-start gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#89CFF0]/20 flex items-center justify-center text-[#0047AB] text-[10px] font-bold">
                          {reply.senderName.charAt(0)}
                        </div>
                        <div className="text-xs">
                          <p className="font-bold text-[#0047AB]">{reply.senderName}</p>
                          <p className="text-gray-600">{reply.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-4 flex flex-wrap gap-2">
                  {replyingTo === fb.id ? (
                    <div className="w-full space-y-2">
                      <textarea 
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder={t('writeMessage')}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-[#89CFF0]"
                      />
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleReply(fb.id)}
                          className="bg-[#0047AB] text-white px-4 py-1.5 rounded-lg text-xs font-bold"
                        >
                          {t('send')}
                        </button>
                        <button 
                          onClick={() => { setReplyingTo(null); setReplyText(''); }}
                          className="text-gray-500 px-4 py-1.5 rounded-lg text-xs font-bold"
                        >
                          {t('cancel')}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <button 
                        onClick={() => setReplyingTo(fb.id)}
                        className="text-xs font-bold text-[#0047AB] hover:underline flex items-center gap-1"
                      >
                        <MessageSquare size={14} />
                        {t('reply')}
                      </button>
                      <button 
                        onClick={() => handleConfirmDone(fb.id)}
                        className="text-xs font-bold text-green-600 hover:underline flex items-center gap-1"
                      >
                        <CheckCircle size={14} />
                        {t('confirmDone')}
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-lg border border-[#89CFF0]/20 overflow-hidden">
        <div className="p-6 bg-[#89CFF0]/5 border-b border-[#89CFF0]/10">
          <h3 className="font-bold text-[#0047AB] flex items-center gap-2">
            <TrendingUp size={20} />
            {t('yourPerformance')}
          </h3>
        </div>
        <div className="p-8">
          <TutorDetail tutorId={user.uid} isMentor={false} registerListener={registerListener} />
        </div>
      </div>
    </div>
  );
}
function MentorSettings({ mentor, onUpdateUser, onBack }: { mentor: UserProfile, onUpdateUser: (u: UserProfile) => void, onBack: () => void }) {
  const { t, lang } = useLang();
  const [logoUrl, setLogoUrl] = useState(mentor.teamLogoURL || '');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', mentor.uid), {
        teamLogoURL: logoUrl.trim()
      });
      onUpdateUser({ ...mentor, teamLogoURL: logoUrl.trim() });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Error saving settings:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-xl border border-[#89CFF0]/20 overflow-hidden"
      >
        <div className="p-6 bg-[#89CFF0]/5 border-b border-[#89CFF0]/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ChevronRight className={lang === 'ar' ? '' : 'rotate-180'} />
            </button>
            <h3 className="font-bold text-[#0047AB] flex items-center gap-2">
              <Settings size={20} />
              {t('settings')}
            </h3>
          </div>
        </div>
        
        <form onSubmit={handleSave} className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-6 mb-8">
              <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-50 border-2 border-[#89CFF0] flex items-center justify-center shadow-inner">
                <Logo url={logoUrl} size={40} className="w-full h-full" />
              </div>
              <div>
                <h4 className="font-bold text-[#0047AB]">{t('teamBranding')}</h4>
                <p className="text-sm text-gray-500">{t('logoDescription')}</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wider">
                {t('teamLogoUrl')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LinkIcon size={16} className="text-gray-400" />
                </div>
                <input 
                  type="url" 
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://example.com/logo.png"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#89CFF0] outline-none transition-all text-sm"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4">
            {success && (
              <span className="text-green-600 text-sm font-bold flex items-center gap-1">
                <CheckCircle size={16} />
                {t('saved')}
              </span>
            )}
            <button 
              type="submit"
              disabled={saving}
              className="ml-auto bg-[#0047AB] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#003580] transition-all shadow-lg shadow-blue-200 disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={18} />}
              {t('saveChanges')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function MentorDashboard({ onSelectTutor, mentor, registerListener }: { onSelectTutor: (id: string) => void, mentor: UserProfile, registerListener: (unsub: () => void) => void }) {
  const { t, lang } = useLang();
  const [tutors, setTutors] = useState<UserProfile[]>([]);
  const [tutorDetails, setTutorDetails] = useState<Record<string, TutorDetails>>({});
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Stats for Card 2
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [flagStats, setFlagStats] = useState({ rate: 0, repeated: [] as string[] });

  useEffect(() => {
    // Only show tutors assigned to this mentor
    const q = query(
      collection(db, 'users'), 
      where('role', '==', 'tutor'), 
      where('mentorId', '==', mentor.uid)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tutorList = snapshot.docs.map(doc => doc.data() as UserProfile);
      setTutors(tutorList);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'users');
    });

    registerListener(unsubscribe);

    // Fetch Feedbacks
    const qFeedbacks = query(
      collection(db, 'feedbacks'),
      where('mentorId', '==', mentor.uid),
      where('status', '==', 'pending'),
      orderBy('timestamp', 'desc')
    );
    const unsubFeedbacks = onSnapshot(qFeedbacks, (snap) => {
      setFeedbacks(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'feedbacks'));
    registerListener(unsubFeedbacks);

    // Fetch details for all tutors to calculate total performance
    const fetchDetails = async () => {
      const qTutors = query(collection(db, 'tutors'), where('mentorId', '==', mentor.uid));
      const detailsSnapshot = await getDocs(qTutors);
      const detailsMap: Record<string, TutorDetails> = {};
      detailsSnapshot.forEach(doc => {
        detailsMap[doc.id] = doc.data() as TutorDetails;
      });
      setTutorDetails(detailsMap);

      // Calculate chart data based on actual performance
      const totalAvg = Object.values(detailsMap).reduce((acc, curr) => {
        return acc + (curr.performance.quality + curr.performance.work) / 2;
      }, 0) / (Object.keys(detailsMap).length || 1);

      // Calculate flag stats
      const totalFlags = Object.values(detailsMap).reduce((acc, curr) => acc + (curr.redFlags || 0) + (curr.yellowFlags || 0), 0);
      const tutorCount = Object.keys(detailsMap).length || 1;
      const rate = Math.round((totalFlags / tutorCount) * 100);
      
      setFlagStats({ 
        rate, 
        repeated: totalFlags > 0 ? [t('attendance'), t('quality')] : [] 
      });

      setPerformanceData([
        { name: t('totalPerformance'), value: Math.round(totalAvg) },
        { name: '', value: 100 - Math.round(totalAvg) }
      ]);
    };

    fetchDetails();

    return () => unsubscribe();
  }, []);

  const handleMarkAsDone = async (fbId: string) => {
    try {
      await updateDoc(doc(db, 'feedbacks', fbId), {
        status: 'resolved'
      });
    } catch (err) {
      console.error("Error marking as done:", err);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-8">
      {/* Card 1: Tutor Table */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white rounded-2xl shadow-lg border border-[#89CFF0]/20 overflow-hidden"
      >
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-[#89CFF0]/5">
          <h3 className="text-lg font-bold text-[#0047AB] flex items-center gap-2">
            <Users size={20} />
            {t('tutors')}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-bold">
              <tr>
                <th className="px-6 py-4">{t('id')}</th>
                <th className="px-6 py-4">{t('name')}</th>
                <th className="px-6 py-4">{t('studyPlan')}</th>
                <th className="px-6 py-4">{t('vacations')}</th>
                <th className="px-6 py-4">{t('monthFlags')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tutors.map((tutor) => {
                const details = tutorDetails[tutor.uid];
                return (
                  <tr key={tutor.uid} className="hover:bg-[#89CFF0]/5 transition-colors">
                    <td className="px-6 py-4 font-mono text-gray-500">{tutor.tutorId}</td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => onSelectTutor(tutor.uid)}
                        className="text-[#0047AB] font-bold hover:underline flex items-center gap-2"
                      >
                        <div className="w-8 h-8 rounded-full bg-[#89CFF0]/20 flex items-center justify-center text-[#0047AB] text-xs">
                          {tutor.name.charAt(0)}
                        </div>
                        {tutor.name}
                        <ChevronRight size={14} />
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      {details?.studyPlan ? (
                        <div className="space-y-1">
                          <span className="block text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full w-fit">{details.studyPlan.course1}</span>
                          <span className="block text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full w-fit">{details.studyPlan.course2}</span>
                        </div>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      <Calendar size={16} className="inline mr-1" />
                      {details?.vacationCount || 0}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1">
                        {Array.from({ length: details?.redFlags || 0 }).map((_, i) => (
                          <div key={`red-${i}`} className="w-3 h-3 rounded-full bg-red-500" title="Red Flag"></div>
                        ))}
                        {Array.from({ length: details?.yellowFlags || 0 }).map((_, i) => (
                          <div key={`yellow-${i}`} className="w-3 h-3 rounded-full bg-yellow-400" title="Yellow Flag"></div>
                        ))}
                        {(!details?.redFlags && !details?.yellowFlags) && <span className="text-gray-300">-</span>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Card 2: Performance Wheel */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg border border-[#89CFF0]/20 p-6"
        >
          <h3 className="text-lg font-bold text-[#0047AB] mb-6 flex items-center gap-2">
            <TrendingUp size={20} />
            {t('totalPerformance')}
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={performanceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {performanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#89CFF0', '#0047AB', '#B0E0E6'][index % 3]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="p-4 bg-[#89CFF0]/10 rounded-xl">
              <p className="text-xs text-gray-500 uppercase font-bold mb-1">{t('flagRate')}</p>
              <p className="text-2xl font-bold text-[#0047AB]">{flagStats.rate}%</p>
            </div>
            <div className="p-4 bg-[#89CFF0]/10 rounded-xl">
              <p className="text-xs text-gray-500 uppercase font-bold mb-1">{t('repeatedFlags')}</p>
              <p className="text-sm font-medium text-gray-700">
                {flagStats.repeated.length > 0 ? flagStats.repeated.join(', ') : '-'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Card 3: Add Tutor */}
        <AddTutorCard mentor={mentor} />
      </div>

      {/* Card 4: Feedbacks */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg border border-[#89CFF0]/20 overflow-hidden"
      >
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-[#89CFF0]/5">
          <h3 className="text-lg font-bold text-[#0047AB] flex items-center gap-2">
            <Bell size={20} />
            {t('feedbacks')}
          </h3>
          <span className="bg-[#0047AB] text-white text-xs font-bold px-2.5 py-1 rounded-full">
            {feedbacks.length}
          </span>
        </div>
        <div className="p-6">
          {feedbacks.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <MessageSquare size={48} className="mx-auto mb-4 opacity-20" />
              <p>{t('noData')}</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {feedbacks.map((fb) => (
                <div key={fb.id} className="p-4 rounded-xl bg-gray-50 border border-gray-100 hover:border-[#89CFF0]/30 transition-all">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#89CFF0]/20 flex items-center justify-center text-[#0047AB] text-xs font-bold">
                        {fb.tutorName.charAt(0)}
                      </div>
                      <p 
                        className="font-bold text-[#0047AB] cursor-pointer hover:underline"
                        onClick={() => onSelectTutor(fb.tutorId)}
                      >
                        {fb.tutorName}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[10px] text-gray-400 font-medium">
                        {new Date(fb.timestamp).toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US')}
                      </span>
                      <button 
                        onClick={() => handleMarkAsDone(fb.id)}
                        className="text-[10px] font-bold text-green-600 hover:underline flex items-center gap-1"
                      >
                        <CheckCircle size={12} />
                        {t('markAsDone')}
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{fb.messageContent}</p>
                  
                  {fb.replies && fb.replies.length > 0 && (
                    <div className="mt-3 space-y-2 pl-4 border-l-2 border-[#89CFF0]/30">
                      {fb.replies.map((reply: any, idx: number) => (
                        <div key={idx} className="flex items-start gap-2">
                          <div className="w-6 h-6 rounded-full bg-[#89CFF0]/20 flex items-center justify-center text-[#0047AB] text-[10px] font-bold">
                            {reply.senderName.charAt(0)}
                          </div>
                          <div className="text-xs">
                            <p className="font-bold text-[#0047AB]">{reply.senderName}</p>
                            <p className="text-gray-600">{reply.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function AddTutorCard({ mentor }: { mentor: UserProfile }) {
  const { t } = useLang();
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<{email: string, pass: string} | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const email = formData.email.trim().toLowerCase();
      const customId = formData.id.trim();

      // 1. Duplicate ID Check using a dedicated collection
      const idRef = doc(db, 'tutor_ids', customId);
      const idSnap = await getDoc(idRef);
      
      if (idSnap.exists()) {
        throw new Error('This Tutor ID is already in use by another mentor');
      }

      // 2. Create real Firebase Auth account using a secondary app instance
      // Use customId as the password
      const secondaryApp = getApps().find(a => a.name === 'Secondary') || initializeApp(firebaseConfig, 'Secondary');
      const secondaryAuth = getAuth(secondaryApp);
      
      let uid = '';
      try {
        const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, customId);
        uid = userCredential.user.uid;
        await signOut(secondaryAuth);
      } catch (authErr: any) {
        if (authErr.code === 'auth/email-already-in-use') {
          throw new Error('Email already in use in Firebase Auth');
        }
        throw authErr;
      }

      // 3. Save data in Firestore using auth.uid as Document ID
      await setDoc(doc(db, 'users', uid), {
        uid: uid,
        email: email,
        password: customId, // Using customId as password
        name: formData.name,
        tutorCustomId: customId,
        role: 'tutor',
        isResigned: false,
        mentorId: mentor.uid,
        mentorName: mentor.name,
        subTeamName: mentor.subTeamName,
        teamLeaderName: mentor.teamLeaderName,
        teamNumber: mentor.teamNumber
      });

      await setDoc(doc(db, 'tutors', uid), {
        tutorCustomId: customId,
        id: customId,
        name: formData.name,
        status: 'active',
        mentorId: mentor.uid, // Add mentorId for filtered queries
        performance: { quality: 0, work: 0, total: 0 },
        studyPlan: { course1: '', course1Grade: '', course2: '', course2Grade: '', notes: '', materialLink: '' },
        vacationCount: 0,
        redFlags: 0,
        yellowFlags: 0
      });

      // 4. Mark ID as used
      await setDoc(doc(db, 'tutor_ids', customId), {
        uid: uid,
        createdAt: new Date().toISOString()
      });

      setCreatedCredentials({ email: formData.email, pass: formData.password });
      setSuccess(true);
      setFormData({ id: '', name: '', email: '', password: '' });
      setTimeout(() => {
        setSuccess(false);
        setCreatedCredentials(null);
      }, 10000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg border border-[#89CFF0]/20 p-6"
    >
      <h3 className="text-lg font-bold text-[#0047AB] mb-6 flex items-center gap-2">
        <PlusCircle size={20} />
        {t('addTutor')}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('id')}</label>
            <input 
              type="text" 
              value={formData.id}
              onChange={(e) => setFormData({...formData, id: e.target.value})}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#89CFF0] outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('name')}</label>
            <input 
              type="text" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#89CFF0] outline-none"
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('email')}</label>
          <input 
            type="email" 
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#89CFF0] outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('password')}</label>
          <input 
            type="password" 
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#89CFF0] outline-none"
            required
          />
        </div>
        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-[#0047AB] text-white py-2.5 rounded-lg font-bold hover:bg-[#003580] transition-colors flex items-center justify-center gap-2"
        >
          {loading ? t('loading') : (
            <>
              <Plus size={20} />
              {t('addTutor')}
            </>
          )}
        </button>
        {success && createdCredentials && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-xl space-y-1">
            <p className="text-green-700 text-sm font-bold">{t('success')}</p>
            <p className="text-xs text-green-600">Email: {createdCredentials.email}</p>
            <p className="text-xs text-green-600">Password: {createdCredentials.pass}</p>
          </div>
        )}
      </form>
    </motion.div>
  );
}

function TutorDetail({ tutorId, isMentor, onBack, registerListener }: { tutorId: string, isMentor: boolean, onBack?: () => void, registerListener: any }) {
    const { t, lang } = useLang();
    const [details, setDetails] = useState<TutorDetails | null>(null);
    const [tutorProfile, setTutorProfile] = useState<UserProfile | null>(null);
    const [vacations, setVacations] = useState<Vacation[]>([]);
    const [reports, setReports] = useState<QualityReport[]>([]);
    const [flags, setFlags] = useState<Flag[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [sheetTotalStudy, setSheetTotalStudy] = useState<any[]>([]);
    const [coursesSearch, setCourseSearch] = useState("");
    const [loading, setLoading] = useState(true);

    // Edit states
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState<any>(null);

    const [confirmConfig, setConfirmConfig] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => {},
    }); // القفلة هنا بقت سليمة
    const hasAutoSynced = useRef(false);
    const [loading, setLoading] = useState(true);
    const [details, setDetails] = useState<TutorDetails | null>(null);
    const [flags, setFlags] = useState<Flag[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    useEffect(() => {
        // 1. حاجز أمان: لو مفيش ID للمدرس اقفل الدالة فوراً
        if (!tutorId) return;

        // ريست لعلامة المزامنة عند تغيير المدرس
        hasAutoSynced.current = false;
        setLoading(true);

        // 2. مراقب بيانات المدرس الأساسية (Real-time)
        const unsubDetails = onSnapshot(doc(db, 'tutors', tutorId), (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data() as TutorDetails;
                setDetails(data);

                const runSyncLogic = async () => {
                    // المزامنة التلقائية تشتغل مرة واحدة فقط لكل مدرس
                    if (!hasAutoSynced.current) {
                        hasAutoSynced.current = true;

                        // مزامنة الفلاجات (فقط لو اللينك موجود)
                        if (data.flagsSheetLink) {
                            console.log("Auto-syncing Flags...");
                            await syncFlagsFromSheets(data.flagsSheetLink).catch(e => console.error("Flags Sync:", e));
                        }

                        // مزامنة الكورسات (فقط لو اللينك موجود)
                        if (data.studySheetLink) {
                            console.log("Auto-syncing Study Plan...");
                            await syncStudyFromSheets(data.studySheetLink).catch(e => console.error("Study Sync:", e));
                        }
                    }
                };
                runSyncLogic();
            }
            setLoading(false);
        }, (error) => {
            console.error("Firebase Details Error:", error);
            setLoading(false);
        });

        // 3. مراقبين الـ Sub-collections (تحديث الشاشة لحظياً)
        const unsubFlags = onSnapshot(collection(db, 'tutors', tutorId, 'flags'), (s) => {
            setFlags(s.docs.map(d => ({ id: d.id, ...d.data() } as Flag)));
        });

        const unsubCourses = onSnapshot(collection(db, 'tutors', tutorId, 'courses'), (s) => {
            setCourses(s.docs.map(d => ({ id: d.id, ...d.data() } as Course)));
        });

        // 4. تنظيف الذاكرة
        return () => {
            unsubDetails();
            unsubFlags();
            unsubCourses();
        };
    }, [tutorId]);

    
  const handleSaveDetails = async () => {
    try {
      await updateDoc(doc(db, 'tutors', tutorId), editData);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddFlag = async () => {
    const newFlag: Omit<Flag, 'id'> = {
      type: 'yellow',
      reason: '',
      status: 'in progress',
      tutorFeedback: '',
      mentorFeedback: '',
      date: new Date().toISOString()
    };
    await addDoc(collection(db, 'tutors', tutorId, 'flags'), newFlag);
    await updateDoc(doc(db, 'tutors', tutorId), {
      yellowFlags: increment(1)
    });
  };

  const handleAddVacation = async () => {
    const newVal: Omit<Vacation, 'id'> = {
      date: new Date().toISOString().split('T')[0],
      type: 'Annual',
      reason: ''
    };
    await addDoc(collection(db, 'tutors', tutorId, 'vacations'), newVal);
    await updateDoc(doc(db, 'tutors', tutorId), {
      vacationCount: increment(1)
    });
  };

  const handleAddCourse = async () => {
    const newVal: Omit<Course, 'id'> = {
      name: '',
      grade: ''
    };
    await addDoc(collection(db, 'tutors', tutorId, 'courses'), newVal);
  };

  const handleAddReport = async () => {
    const newVal: Omit<QualityReport, 'id'> = {
      month: new Date().toLocaleString('default', { month: 'long' }),
      percentage: 0,
      meetingDate: '',
      meetingLink: '',
      recordedLink: '',
      postMeetingNotes: '',
      reportUrl: ''
    };
    await addDoc(collection(db, 'tutors', tutorId, 'qualityReports'), newVal);
  };

  const handleUploadReport = async (reportId: string, pdfLink: string) => {
      try {
        const fileId = pdfLink.includes('/d/') 
          ? pdfLink.split('/d/')[1]?.split('/')[0] 
          : pdfLink.split('id=')[1]?.split('&')[0];
        
        const directLink = fileId 
          ? `https://drive.google.com/uc?export=download&id=${fileId}` 
          : pdfLink;

        await updateDoc(doc(db, 'tutors', tutorId, 'qualityReports', reportId), {
          reportUrl: directLink,
          updatedAt: new Date().toISOString()
        });

        setConfirmConfig({
          isOpen: true,
          title: t('success'),
          message: 'Report link updated successfully',
          onConfirm: () => setConfirmConfig(prev => ({ ...prev, isOpen: false }))
        });
      } catch (err) {
        console.error(err);
        setConfirmConfig({
          isOpen: true,
          title: t('error'),
          message: 'Update failed',
          onConfirm: () => setConfirmConfig(prev => ({ ...prev, isOpen: false }))
        });
      }
    };

  const syncStudyFromSheets = async (savedUrl?: string) => {
    // 1. لو فيه لينك محفوظ استخدمه، لو مفيش اطلب لينك جديد
    const SHEET_URL = savedUrl || window.prompt("من فضلك أدخل رابط الـ CSV (Publish to Web):");

    if (!SHEET_URL || !SHEET_URL.includes('google.com')) {
        if (!savedUrl) alert("❌ خطأ: الرابط غير صحيح.");
        return;
    }

    Papa.parse(SHEET_URL, {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
            const rows = results.data as any[];
            // التأكد من جلب الـ ID الصحيح للمدرس
            const currentTutorId = String(details?.id || tutorId).trim();

            // 2. البحث عن صف المدرس داخل الشيت
            const currentRow = rows.find(r => String(r.ID || r.id).trim() === currentTutorId);

            if (!currentRow) {
                // في حالة الـ Auto-sync لا نريد إظهار alert مزعج لو المدرس مش في الشيت
                if (!savedUrl) alert(`❌ لم يتم العثور على المدرس رقم (${currentTutorId}) في الشيت.`);
                return;
            }

            const newCourses: any[] = [];

            // 3. فحص كل الأعمدة لاستخراج الكورسات الـ "Done"
            Object.keys(currentRow).forEach(col => {
                const value = String(currentRow[col]).trim().toLowerCase();
                
                if (value === "done & published" || value === "done") {
                    const cleanColName = col.replace(/\n/g, ' ').trim();

                    if (cleanColName.toLowerCase() === 'free') {
                        newCourses.push({ name: "Free", grade: "Done" });
                    } 
                    else {
                        // استخدام الـ Regex الخاص بك لاستخراج اسم الكورس M1, M2...
                        const match = cleanColName.match(/(M\d+[:\s\d-]*\[.*?\]|M\d+.*)/i);
                        newCourses.push({
                            name: match ? match[0] : cleanColName,
                            grade: "Done"
                        });
                    }
                }
            });

            // 4. التحديث في Firestore
            try {
                // حفظ الرابط في بيانات المدرس الأساسية (للمزامنة المستقبلية)
                const tutorRef = doc(db, 'tutors', tutorId);
                await updateDoc(tutorRef, {
                    studySheetLink: SHEET_URL
                });

                const coursesRef = collection(db, 'tutors', tutorId, 'courses');
                
                // جلب الداتا القديمة لمقارنتها (أو مسحها وإعادة إضافتها لضمان المزامنة)
                const oldDocs = await getDocs(coursesRef);
                
                // مسح القديم وإضافة الجديد
                await Promise.all(oldDocs.docs.map(doc => deleteDoc(doc.ref)));
                await Promise.all(newCourses.map(course => addDoc(coursesRef, {
                    ...course,
                    createdAt: new Date().toISOString()
                })));

                // التنبيه فقط في حالة الضغط اليدوي (Manual Sync)
                if (!savedUrl) {
                    alert(`✅ مبروك! تم تحديث (${newCourses.length}) كورس بنجاح.`);
                    // لا نفضل عمل window.location.reload() لأن الـ onSnapshot سيحدث الصفحة تلقائياً
                }
            } catch (err) {
                console.error("Firestore Update Error:", err);
                if (!savedUrl) alert("❌ فشل تحديث البيانات في Firestore");
            }
        }
    });
};

  const sortCourses = (data: any[]) => {
    return [...data].sort((a, b) => {
      const nameA = (a.name || "").toLowerCase();
      const nameB = (b.name || "").toLowerCase();

      // 1. الـ Free دايماً الأول
      if (nameA.includes("free")) return -1;
      if (nameB.includes("free")) return 1;

      // 2. الترتيب بالأرقام (M1, M2, M3...)
      const matchA = nameA.match(/m(\d+)/);
      const matchB = nameB.match(/m(\d+)/);

      if (matchA && matchB) {
        return parseInt(matchA[1]) - parseInt(matchB[1]);
      }

      return nameA.localeCompare(nameB);
    });
  };

  const syncFlagsFromSheets = async (savedUrl?: string) => {
  // 1. لو فيه لينك محفوظ (Auto-sync) استخدمه، لو مفيش اطلب لينك جديد (Manual Sync)
  let rawUrl = savedUrl || window.prompt("من فضلك أدخل رابط الشير (تأكد أنك واقف على تاب الفلاجات):");
  if (!rawUrl || !rawUrl.includes('google.com')) return;

  // استخراج الـ gid لضمان أننا نقرأ من التاب الصحيحة (Flags Tab)
  const gidMatch = rawUrl.match(/gid=([0-9]+)/);
  const gidParam = gidMatch ? `&gid=${gidMatch[1]}` : '';
  const SHEET_URL = rawUrl.replace(/\/edit.*$/, `/export?format=csv${gidParam}`);

  Papa.parse(SHEET_URL, {
    download: true,
    header: false, // هنا false لأننا بنتعامل مع الأرقام [2], [4] إلخ
    skipEmptyLines: true,
    complete: async (results) => {
      const rows = results.data as any[];

      // 🎯 تحديد الـ ID البشري للمدرس (مثل T-4538) للبحث عنه في الشيت
      const searchId = String(details?.tutorCustomId || details?.id || tutorId).trim();

      console.log("🔍 [DEBUG] Searching in sheet for ID:", searchId);

      // فلترة الصفوف بناءً على العمود رقم 3 (أندكس 2) اللي فيه الـ ID
      const tutorRows = rows.filter(row => 
        String(row[2] || '').trim() === searchId
      );

      if (tutorRows.length === 0) {
        // في الـ Auto-sync لا نظهر Alert لتجنب الإزعاج، نكتفي بالـ Console
        if (!savedUrl) alert(`لم يتم العثور على Tutor ID: ${searchId} في هذا الشيت.`);
        console.warn(`[Sync] No flags found for ${searchId}`);
        return;
      }

      // تحويل الصفوف لبيانات مفهومة مع الحفاظ على الترتيب الزمني
      const newFlags = tutorRows.map(row => ({
        date: `${row[4] || ''} - ${row[5] || ''}`, // تاريخ الفلاج + الـ Slot
        type: String(row[8] || 'Yellow Flag').trim(), // نوع الفلاج (Red/Yellow)
        status: String(row[12] || 'Working on').trim(), // الحالة من العمود M
        reason: row[9] || '-', // السبب من العمود J
        studentId: row[6] || 'N/A', // الـ Student ID من العمود G
        createdAt: new Date().toISOString(),
        rawDate: new Date(row[4] || 0).getTime() 
      }));

      // ترتيب الفلاجات من الأحدث للأقدم
      newFlags.sort((a, b) => b.rawDate - a.rawDate);

      try {
        const tutorUID = tutorId; // الـ UID الخاص بـ Firebase
        const tutorRef = doc(db, 'tutors', tutorUID);
        
        // 1. تحديث اللينك في ملف المدرس الأساسي لضمان عمل الـ Auto-sync مستقبلاً
        await updateDoc(tutorRef, { flagsSheetLink: rawUrl });

        // 2. مسح الفلاجات القديمة في Firestore لإضافة البيانات المحدثة
        const flagsRef = collection(db, 'tutors', tutorUID, 'flags');
        const oldDocs = await getDocs(flagsRef);
        await Promise.all(oldDocs.docs.map(d => deleteDoc(d.ref)));
        
        // 3. إضافة الفلاجات الجديدة مع الحفاظ على خانات الـ Feedback فارغة
        for (const flag of newFlags) {
          const { rawDate, ...flagToSave } = flag;
          await addDoc(flagsRef, {
              ...flagToSave,
              mentorFeedback: "", 
              tutorFeedback: ""
          });
        }

        // التنبيه فقط في حالة المزامنة اليدوية
        if (!savedUrl) {
          alert(`✅ تمام! لقيت ${newFlags.length} فلاج للمدرس ${searchId} وتم التحديث بنجاح.`);
        }
      } catch (err) {
        console.error("Firebase Error during flags sync:", err);
        if (!savedUrl) alert("حصلت مشكلة وأنا بحدث بيانات الفلاجات في Firebase.");
      }
    }
  });
};
  if (loading) return <Loading />;
  if (!details) return <div className="text-center py-12">{t('noData')}</div>;

  return (
    // هنا بيبدأ الـ JSX بتاعك.. لو لسه في أحمر، يبقى أنت محتاج تقفل القوس اللي بيقفل الـ Component كله تحت.
    <div className="space-y-8">
      {/* Header Info */}
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-[#89CFF0]/20">
        <div className="flex items-center gap-4">
          {isMentor && onBack && (
            <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ChevronRight className={lang === 'ar' ? '' : 'rotate-180'} />
            </button>
          )}
          <div className="w-16 h-16 rounded-full bg-[#89CFF0]/20 flex items-center justify-center text-[#0047AB] text-2xl font-black border-2 border-white shadow-sm">
            {details.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#0047AB]">{details.name}</h2>
            <p className="text-sm text-gray-500">
              ID: {details.id} | <span className={details.status === 'active' ? 'text-green-600' : 'text-red-600'}>{t(details.status)}</span>
              {tutorProfile?.mentorName && (
                <span className="mx-2">| {t('mentorName')}: {tutorProfile.mentorName}</span>
              )}
              {tutorProfile?.subTeamName && (
                <span className="mx-2">| {t('subTeamName')}: {tutorProfile.subTeamName}</span>
              )}
            </p>
          </div>
        </div>
        {isMentor && (
          <div className="flex gap-2">
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 bg-[#89CFF0] text-white rounded-lg font-bold hover:bg-[#78BEE0] flex items-center gap-2"
            >
              <Edit size={18} />
              {isEditing ? t('cancel') : t('edit')}
            </button>
            <button 
              onClick={() => {
                setConfirmConfig({
                  isOpen: true,
                  title: t('confirmAction'),
                  message: t('confirmResign'),
                  onConfirm: async () => {
                    await updateDoc(doc(db, 'tutors', tutorId), { status: 'resigned' });
                    setConfirmConfig(prev => ({ ...prev, isOpen: false }));
                  }
                });
              }}
              className="px-4 py-2 border border-orange-300 text-orange-600 rounded-lg font-bold hover:bg-orange-50 flex items-center gap-2"
            >
              <UserMinus size={18} />
              {t('resign')}
            </button>
            <button 
              onClick={() => {
                setConfirmConfig({
                  isOpen: true,
                  title: t('confirmAction'),
                  message: t('confirmDelete'),
                  onConfirm: async () => {
                    await deleteDoc(doc(db, 'tutors', tutorId));
                    await deleteDoc(doc(db, 'users', tutorId));
                    setConfirmConfig(prev => ({ ...prev, isOpen: false }));
                    onBack?.();
                  }
                });
              }}
              className="px-4 py-2 border border-red-300 text-red-600 rounded-lg font-bold hover:bg-red-50 flex items-center gap-2"
            >
              <Trash2 size={18} />
              {t('delete')}
            </button>
          </div>
        )}
      </div>

      <ConfirmDialog 
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* A) Study Plan */}
        <Card 
          title={
            <div className="flex justify-between items-center w-full">
              <span>{t('studyPlan')}</span>
              <button 
                onClick={syncStudyFromSheets}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs transition-colors flex items-center gap-1"
              >
                <span>Sync Sheets</span>
              </button>
            </div>
          } 
          icon={<BookOpen size={20} />}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="p-4 bg-[#89CFF0]/10 rounded-xl border border-[#89CFF0]/20">
                <p className="text-xs font-bold text-gray-500 uppercase mb-2">Course 1</p>
                <div className="grid grid-cols-2 gap-2">
                  {isEditing ? (
                    <>
                      <input 
                        placeholder={t('courseName')}
                        value={editData.studyPlan.course1}
                        onChange={(e) => setEditData({...editData, studyPlan: {...editData.studyPlan, course1: e.target.value}})}
                        className="w-full bg-white px-2 py-1 rounded border text-sm"
                      />
                      <input 
                        placeholder={t('grade')}
                        value={editData.studyPlan.course1Grade || ''}
                        onChange={(e) => setEditData({...editData, studyPlan: {...editData.studyPlan, course1Grade: e.target.value}})}
                        className="w-full bg-white px-2 py-1 rounded border text-sm"
                      />
                    </>
                  ) : (
                    <>
                      <p className="font-bold text-[#0047AB]">{details.studyPlan.course1 || '-'}</p>
                      <span className="px-2 py-0.5 bg-[#89CFF0]/20 text-[#0047AB] rounded text-xs font-bold w-fit">{details.studyPlan.course1Grade || '-'}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="p-4 bg-[#89CFF0]/10 rounded-xl border border-[#89CFF0]/20">
                <p className="text-xs font-bold text-gray-500 uppercase mb-2">Course 2</p>
                <div className="grid grid-cols-2 gap-2">
                  {isEditing ? (
                    <>
                      <input 
                        placeholder={t('courseName')}
                        value={editData.studyPlan.course2}
                        onChange={(e) => setEditData({...editData, studyPlan: {...editData.studyPlan, course2: e.target.value}})}
                        className="w-full bg-white px-2 py-1 rounded border text-sm"
                      />
                      <input 
                        placeholder={t('grade')}
                        value={editData.studyPlan.course2Grade || ''}
                        onChange={(e) => setEditData({...editData, studyPlan: {...editData.studyPlan, course2Grade: e.target.value}})}
                        className="w-full bg-white px-2 py-1 rounded border text-sm"
                      />
                    </>
                  ) : (
                    <>
                      <p className="font-bold text-[#0047AB]">{details.studyPlan.course2 || '-'}</p>
                      <span className="px-2 py-0.5 bg-[#89CFF0]/20 text-[#0047AB] rounded text-xs font-bold w-fit">{details.studyPlan.course2Grade || '-'}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase mb-1">{t('notes')}</p>
              {isEditing ? (
                <textarea 
                  value={editData.studyPlan.notes}
                  onChange={(e) => setEditData({...editData, studyPlan: {...editData.studyPlan, notes: e.target.value}})}
                  className="w-full bg-white px-3 py-2 rounded border h-20"
                />
              ) : <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{details.studyPlan.notes || '-'}</p>}
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase mb-1">{t('materialLink')}</p>
              {isEditing ? (
                <input 
                  value={editData.studyPlan.materialLink}
                  onChange={(e) => setEditData({...editData, studyPlan: {...editData.studyPlan, materialLink: e.target.value}})}
                  className="w-full bg-white px-3 py-2 rounded border"
                />
              ) : (
                details.studyPlan.materialLink ? (
                  <a href={details.studyPlan.materialLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1 text-sm">
                    {details.studyPlan.materialLink}
                  </a>
                ) : '-'
              )}
            </div>
            {isEditing && (
              <button onClick={handleSaveDetails} className="w-full bg-[#0047AB] text-white py-2 rounded-lg font-bold">{t('save')}</button>
            )}
          </div>
        </Card>

        {/* B) Vacations */}
        <Card title={t('vacations')} icon={<Calendar size={20} />} onAdd={isMentor ? handleAddVacation : undefined}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-gray-500 font-bold border-b">
                <tr>
                  <th className="pb-2 text-left">{t('id')}</th>
                  <th className="pb-2 text-left">{t('type')}</th>
                  <th className="pb-2 text-left">{t('reason')}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {vacations.map((v) => (
                  <tr key={v.id} className="group">
                    <td className="py-3">
                      {isMentor ? (
                        <input 
                          type="date" 
                          value={v.date} 
                          onChange={(e) => updateDoc(doc(db, 'tutors', tutorId, 'vacations', v.id), { date: e.target.value })}
                          className="bg-transparent border-none focus:ring-0 p-0 w-32"
                        />
                      ) : v.date}
                    </td>
                    <td className="py-3">
                      {isMentor ? (
                        <input 
                          value={v.type} 
                          onChange={(e) => updateDoc(doc(db, 'tutors', tutorId, 'vacations', v.id), { type: e.target.value })}
                          className="bg-transparent border-none focus:ring-0 p-0"
                        />
                      ) : v.type}
                    </td>
                    <td className="py-3">
                      {isMentor ? (
                        <div className="flex items-center gap-2">
                          <input 
                            value={v.reason} 
                            onChange={(e) => updateDoc(doc(db, 'tutors', tutorId, 'vacations', v.id), { reason: e.target.value })}
                            className="bg-transparent border-none focus:ring-0 p-0 flex-1"
                          />
                          <button 
                            onClick={async () => {
                              await deleteDoc(doc(db, 'tutors', tutorId, 'vacations', v.id));
                              await updateDoc(doc(db, 'tutors', tutorId), {
                                vacationCount: increment(-1)
                              });
                            }} 
                            className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ) : v.reason}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* C) Quality Report */}
        <Card title={t('qualityReport')} icon={<FileText size={20} />} onAdd={isMentor ? handleAddReport : undefined}>
          <div className="space-y-8 divide-y divide-gray-100">
            {reports.map((r) => (
              <div key={r.id} className="pt-6 first:pt-0 space-y-4 relative group">
                {isMentor && (
                  <button 
                    onClick={() => {
                      setConfirmConfig({
                        isOpen: true,
                        title: t('confirmAction'),
                        message: t('confirmDeleteReport'),
                        onConfirm: async () => {
                          await deleteDoc(doc(db, 'tutors', tutorId, 'qualityReports', r.id));
                          setConfirmConfig(prev => ({ ...prev, isOpen: false }));
                        }
                      });
                    }}
                    className="absolute top-0 right-0 p-1 text-red-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
                <div className="flex items-center justify-between">
                  {isMentor ? (
                    <input 
                      value={r.month}
                      onChange={(e) => updateDoc(doc(db, 'tutors', tutorId, 'qualityReports', r.id), { month: e.target.value })}
                      className="px-3 py-1 bg-[#89CFF0]/20 text-[#0047AB] rounded-full text-xs font-bold uppercase border-none focus:ring-0 w-32"
                    />
                  ) : (
                    <span className="px-3 py-1 bg-[#89CFF0]/20 text-[#0047AB] rounded-full text-xs font-bold uppercase">{r.month}</span>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-[#0047AB]">{r.percentage}%</span>
                    {isMentor && (
                      <input 
                        type="number" 
                        value={r.percentage} 
                        onChange={(e) => updateDoc(doc(db, 'tutors', tutorId, 'qualityReports', r.id), { percentage: Number(e.target.value) })}
                        className="w-16 px-2 py-1 border rounded text-sm"
                      />
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 font-bold mb-1">{t('meetingDate')}</p>
                    {isMentor ? (
                      <input 
                        type="datetime-local" 
                        value={r.meetingDate} 
                        onChange={(e) => updateDoc(doc(db, 'tutors', tutorId, 'qualityReports', r.id), { meetingDate: e.target.value })}
                        className="w-full border rounded px-2 py-1"
                      />
                    ) : <p className="font-medium">{r.meetingDate || '-'}</p>}
                  </div>
                  <div>
                    <p className="text-gray-500 font-bold mb-1">{t('meetingLink')}</p>
                    {isMentor ? (
                      <input 
                        value={r.meetingLink} 
                        onChange={(e) => updateDoc(doc(db, 'tutors', tutorId, 'qualityReports', r.id), { meetingLink: e.target.value })}
                        className="w-full border rounded px-2 py-1"
                      />
                    ) : r.meetingLink ? <a href={r.meetingLink} target="_blank" className="text-blue-600 underline">Link</a> : '-'}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase mb-1">{t('postMeetingNotes')}</p>
                  {isMentor ? (
                    <textarea 
                      value={r.postMeetingNotes} 
                      onChange={(e) => updateDoc(doc(db, 'tutors', tutorId, 'qualityReports', r.id), { postMeetingNotes: e.target.value })}
                      className="w-full border rounded px-3 py-2 text-sm h-16"
                    />
                  ) : <p className="text-sm bg-gray-50 p-2 rounded">{r.postMeetingNotes || '-'}</p>}
                </div>
                <div className="pt-2">
                  <p className="text-xs font-bold text-gray-500 uppercase mb-2">PDF Report</p>
                  <div className="flex items-center gap-3">
                    {r.reportUrl ? (
                      <a 
                        href={r.reportUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-bold hover:bg-red-100 transition-colors"
                      >
                        <FileText size={16} />
                        View PDF
                      </a>
                    ) : <span className="text-xs text-gray-400 italic">No PDF uploaded</span>}
                    
                    {isMentor && (
                      <button
                        className="px-4 py-2 bg-[#89CFF0] text-white rounded-lg text-xs flex items-center gap-2"
                        onClick={async () => {
                          const link = prompt("ادخل لينك الـفايل من جوجل درايف");
                          if (link) {
                            // هننادي على الفنكشن اللي بتبعت اللينك للداتا بيز علطول
                            await handleUploadReport(r.id, link); 
                          }
                        }}
                      >
                        <Upload size={16} />
                        {r.reportUrl ? 'Update PDF Link' : 'Add PDF Link'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* D) Performance */}
        <Card title={t('performance')} icon={<TrendingUp size={20} />}>
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-100">
              <div>
                <p className="text-xs font-bold text-green-600 uppercase">{t('total')}</p>
                <p className="text-3xl font-bold text-green-700">
                  {((details.performance.quality + details.performance.work) / 2).toFixed(1)}%
                </p>
              </div>
              <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center text-green-700">
                <CheckCircle size={24} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white border rounded-xl">
                <p className="text-xs font-bold text-gray-500 uppercase mb-1">{t('quality')}</p>
                {isMentor ? (
                  <input 
                    type="number" 
                    value={details.performance.quality} 
                    onChange={(e) => updateDoc(doc(db, 'tutors', tutorId), { 'performance.quality': Number(e.target.value) })}
                    className="w-full border rounded px-2 py-1"
                  />
                ) : <p className="text-xl font-bold text-[#0047AB]">{details.performance.quality}%</p>}
              </div>
              <div className="p-4 bg-white border rounded-xl">
                <p className="text-xs font-bold text-gray-500 uppercase mb-1">{t('work')}</p>
                {isMentor ? (
                  <input 
                    type="number" 
                    value={details.performance.work} 
                    onChange={(e) => updateDoc(doc(db, 'tutors', tutorId), { 'performance.work': Number(e.target.value) })}
                    className="w-full border rounded px-2 py-1"
                  />
                ) : <p className="text-xl font-bold text-[#0047AB]">{details.performance.work}%</p>}
              </div>
            </div>
          </div>
        </Card>

        {/* E) Total Study Card */}
        <Card 
          title={
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center w-full gap-2">
              <div className="flex items-center gap-2">
                <span>{t('totalStudy')}</span>
                {/* زر المزامنة يظهر فقط إذا وجد رابط، للحفاظ على نظافة الواجهة */}
                {details?.studySheetLink && (
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      syncStudyFromSheets(details.studySheetLink); 
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-[10px] cursor-pointer transition-colors font-bold"
                  >
                    Sync Now
                  </button>
                )}
              </div>

              <input 
                type="text"
                placeholder="Search courses..."
                value={courseSearch}
                onChange={(e) => setCourseSearch(e.target.value)}
                className="px-2 py-1 text-xs border rounded-md focus:outline-none focus:ring-1 focus:ring-[#89CFF0] w-full md:w-40 text-black font-normal"
                onClick={(e) => e.stopPropagation()} 
              />
            </div>
          } 
          icon={<BookOpen size={20} />}
          onAdd={isMentor ? handleAddCourse : undefined}
        >
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {/* التحقق: لو مفيش رابط ومفيش بيانات يدوية، اظهر رسالة "فارغ" */}
            {!details?.studySheetLink && courses.length === 0 ? (
              <div className="py-10 text-center opacity-40 flex flex-col items-center">
                <BookOpen size={40} className="mb-2 text-gray-300" />
                <p className="text-xs font-medium">No Study Plan Available</p>
              </div>
            ) : (() => {
              // --- الحفاظ على منطق الفلترة والترتيب الخاص بك كما هو ---
              const filtered = courses.filter(c => 
                (c.name || "").toLowerCase().includes(courseSearch.toLowerCase())
              );

              const sorted = [...filtered].sort((a, b) => {
                const nameA = (a.name || "").toLowerCase();
                const nameB = (b.name || "").toLowerCase();
                if (nameA.includes("free")) return -1;
                if (nameB.includes("free")) return 1;
                const matchA = nameA.match(/m(\d+)/);
                const matchB = nameB.match(/m(\d+)/);
                if (matchA && matchB) return parseInt(matchA[1]) - parseInt(matchB[1]);
                return nameA.localeCompare(nameB);
              });

              if (sorted.length === 0) return <p className="text-center text-gray-400 text-xs py-4">No results found</p>;

              return sorted.map((c) => (
                <div key={c.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group border border-transparent hover:border-[#89CFF0]/30 transition-all">
                  <div className="flex-1">
                    {isMentor ? (
                      <input 
                        value={c.name} 
                        onChange={(e) => updateDoc(doc(db, 'tutors', tutorId, 'courses', c.id), { name: e.target.value })}
                        className="bg-transparent border-none focus:ring-0 p-0 font-bold text-[#0047AB] w-full"
                        placeholder={t('courseName')}
                      />
                    ) : <p className="font-bold text-[#0047AB] text-sm">{c.name || '-'}</p>}
                  </div>
                  <div className="flex items-center gap-3">
                    {isMentor ? (
                      <input 
                        value={c.grade} 
                        onChange={(e) => updateDoc(doc(db, 'tutors', tutorId, 'courses', c.id), { grade: e.target.value })}
                        className="bg-white border rounded px-2 py-0.5 text-xs w-16 text-center font-bold"
                        placeholder={t('grade')}
                      />
                    ) : <span className="px-2 py-0.5 bg-[#89CFF0]/20 text-[#0047AB] rounded text-[10px] font-bold uppercase">{c.grade || '-'}</span>}
                    
                    {isMentor && (
                      <button 
                        onClick={() => {
                          if(window.confirm("Are you sure?")) deleteDoc(doc(db, 'tutors', tutorId, 'courses', c.id));
                        }} 
                        className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-opacity"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ));
            })()}
          </div>
        </Card>

        {/* F) Flags Card */}
        <Card 
          title={
            <div className="flex justify-between items-center w-full">
              <span>{t('flags')}</span>
              {/* زر المزامنة يظهر فقط للمنتور وعند وجود رابط */}
              {isMentor && details?.flagsSheetLink && (
                <button 
                  onClick={() => syncFlagsFromSheets(details.flagsSheetLink)}
                  className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-[10px] font-bold transition-colors cursor-pointer"
                >
                  Sync Flags
                </button>
              )}
            </div>
          } 
          icon={<FlagIcon size={20} />} 
          onAdd={isMentor ? handleAddFlag : undefined}
        >
          <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2">
            {/* التحقق: لو مفيش رابط ومفيش فلاجات، اظهر حالة فارغة */}
            {!details?.flagsSheetLink && flags.length === 0 ? (
              <div className="py-10 text-center opacity-40 flex flex-col items-center">
                <FlagIcon size={40} className="mb-2 text-gray-300" />
                <p className="text-xs font-medium">No Flags Reported</p>
              </div>
            ) : (
              flags.map((f) => (
                <div key={f.id} className="p-4 border rounded-xl space-y-3 relative group bg-white shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {/* منطق اختيار نوع الفلاج (Mentor vs Tutor) */}
                      {isMentor ? (
                        <select 
                          value={f.type} 
                          onChange={async (e) => {
                            const newType = e.target.value;
                            const oldType = f.type;
                            if (newType !== oldType) {
                              await updateDoc(doc(db, 'tutors', tutorId, 'flags', f.id), { type: newType });
                              await updateDoc(doc(db, 'tutors', tutorId), {
                                [newType.toLowerCase().includes('red') ? 'redFlags' : 'yellowFlags']: increment(1),
                                [oldType.toLowerCase().includes('red') ? 'redFlags' : 'yellowFlags']: increment(-1)
                              });
                            }
                          }}
                          className={`text-[10px] font-bold uppercase rounded-full px-2 py-0.5 border-none focus:ring-0 cursor-pointer ${
                            f.type?.toLowerCase().includes('red') ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'
                          }`}
                        >
                          <option value="Red Flag">Red Flag</option>
                          <option value="Yellow Flag">Yellow Flag</option>
                        </select>
                      ) : (
                        <span className={`text-[10px] font-bold uppercase rounded-full px-2 py-0.5 ${
                          f.type?.toLowerCase().includes('red') ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'
                        }`}>
                          {f.type}
                        </span>
                      )}

                      {/* منطق اختيار الحالة (Status) */}
                      {isMentor ? (
                        <select 
                          value={f.status} 
                          onChange={(e) => updateDoc(doc(db, 'tutors', tutorId, 'flags', f.id), { status: e.target.value })}
                          className="text-[10px] bg-gray-100 rounded-full px-2 py-0.5 border-none focus:ring-0 cursor-pointer font-medium"
                        >
                          <option value="Done">Done</option>
                          <option value="Working on">Working on</option>
                          <option value="We need to remove Flag">Remove Flag</option>
                          <option value="We need to change the status">Change Status</option>
                          <option value="First month">First month</option>
                        </select>
                      ) : (
                        <span className={`text-[10px] rounded-full px-2 py-0.5 font-medium ${
                          f.status === 'Done' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {f.status || 'Pending'}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-gray-400 font-mono">{f.date}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 bg-blue-50/50 p-1.5 rounded-lg">
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-tighter">Student ID:</span>
                    <span className="text-xs font-semibold text-blue-700">{f.studentId || 'N/A'}</span>
                  </div>

                  <div className="bg-gray-50 p-2 rounded-lg border-r-2 border-gray-200">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">السبب:</p>
                    {isMentor ? (
                      <textarea 
                        value={f.reason} 
                        onChange={(e) => updateDoc(doc(db, 'tutors', tutorId, 'flags', f.id), { reason: e.target.value })}
                        className="w-full text-sm border-none focus:ring-0 p-0 bg-transparent resize-none leading-relaxed"
                        placeholder={t('reason')}
                        rows={2}
                      />
                    ) : <p className="text-sm text-gray-700 leading-relaxed">{f.reason}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-dashed border-gray-100">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">{t('tutorFeedback')}</p>
                      {(!isMentor) ? (
                        <input 
                          value={f.tutorFeedback} 
                          onChange={(e) => updateDoc(doc(db, 'tutors', tutorId, 'flags', f.id), { tutorFeedback: e.target.value })}
                          className="w-full text-xs border rounded px-2 py-1 focus:ring-1 focus:ring-blue-100 outline-none"
                          placeholder="..."
                        />
                      ) : <p className="text-xs text-gray-600">{f.tutorFeedback || '-'}</p>}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">{t('mentorFeedback')}</p>
                      {isMentor ? (
                        <input 
                          value={f.mentorFeedback} 
                          onChange={(e) => updateDoc(doc(db, 'tutors', tutorId, 'flags', f.id), { mentorFeedback: e.target.value })}
                          className="w-full text-xs border rounded px-2 py-1 focus:ring-1 focus:ring-blue-100 outline-none"
                          placeholder="..."
                        />
                      ) : <p className="text-xs text-gray-600">{f.mentorFeedback || '-'}</p>}
                    </div>
                  </div>

                  {isMentor && (
                    <button 
                      onClick={async () => {
                        if(window.confirm("حذف الفلاج؟")){
                          await deleteDoc(doc(db, 'tutors', tutorId, 'flags', f.id));
                          await updateDoc(doc(db, 'tutors', tutorId), {
                            [f.type?.toLowerCase().includes('red') ? 'redFlags' : 'yellowFlags']: increment(-1)
                          });
                        }
                      }} 
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-red-300 hover:text-red-500 transition-opacity"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

function Card({ title, icon, children, onAdd }: { title: string, icon: React.ReactNode, children: React.ReactNode, onAdd?: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-2xl shadow-lg border border-[#89CFF0]/20 overflow-hidden flex flex-col"
    >
      <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-[#89CFF0]/5">
        <h3 className="text-md font-bold text-[#0047AB] flex items-center gap-2">
          {icon}
          {title}
        </h3>
        {onAdd && (
          <button onClick={onAdd} className="p-1.5 bg-[#89CFF0] text-white rounded-lg hover:bg-[#78BEE0] transition-colors">
            <Plus size={18} />
          </button>
        )}
      </div>
      <div className="p-6 flex-1">
        {children}
      </div>
    </motion.div>
  );
}
