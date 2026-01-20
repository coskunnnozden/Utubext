
import { initializeApp, FirebaseApp } from "firebase/app";
import { getFirestore, collection, addDoc, query, orderBy, limit, getDocs, Timestamp, Firestore } from "firebase/firestore";
import { AnalysisResult } from "../types";

// Firebase/Hosting ortamından veya env'den gelen değerleri kullan
const FIREBASE_PLACEHOLDER = "AIzaSy_Placeholder_Key";
const LOCAL_STORAGE_KEY = 'utubext_cloud_history_v2';

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || FIREBASE_PLACEHOLDER,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "utubext-ai.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "utubext-ai",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "utubext-ai.appspot.com",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.FIREBASE_APP_ID || "1:123456789:web:abcdef"
};

let db: Firestore | null = null;
let isFirebaseActive = false;

// Firebase Başlatma
if (firebaseConfig.apiKey !== FIREBASE_PLACEHOLDER) {
  try {
    const app: FirebaseApp = initializeApp(firebaseConfig);
    db = getFirestore(app);
    isFirebaseActive = true;
    console.info("utubext Cloud Engine: Firebase Firestore Connected.");
  } catch (e) {
    console.warn("utubext Cloud Engine: Firebase connection failed, using local vault.", e);
    isFirebaseActive = false;
  }
}

export const saveAnalysis = async (result: AnalysisResult) => {
  // 1. Cloud Save (Firebase)
  if (isFirebaseActive && db) {
    try {
      await addDoc(collection(db, "analyses"), {
        ...result,
        timestamp: Timestamp.now()
      });
    } catch (e: any) {
      console.error("utubext Cloud Save Error:", e.message);
      if (e.code === 'permission-denied') {
        console.warn("Check your Firestore Rules in Firebase Console!");
      }
    }
  }

  // 2. Local Save (Always active for reliability)
  try {
    const history = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
    const newEntry = { 
      ...result, 
      id: result.id || `local_${Date.now()}`, 
      timestamp: new Date().toISOString() 
    };
    const updatedHistory = [newEntry, ...history].slice(0, 50);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedHistory));
    return newEntry.id;
  } catch (err) {
    console.error("utubext Vault Error:", err);
    return null;
  }
};

export const getRecentAnalyses = async (count: number = 6): Promise<AnalysisResult[]> => {
  let results: AnalysisResult[] = [];

  // Önce Cloud'dan çekmeyi dene
  if (isFirebaseActive && db) {
    try {
      const q = query(collection(db, "analyses"), orderBy("timestamp", "desc"), limit(count));
      const querySnapshot = await getDocs(q);
      results = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as AnalysisResult));
    } catch (e) {
      console.warn("utubext Cloud Fetch Failed, reverting to Local Vault.");
    }
  }

  // Cloud boşsa veya hata verdiyse Local'den al
  if (results.length === 0) {
    try {
      const historyString = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (historyString) {
        results = JSON.parse(historyString).slice(0, count);
      }
    } catch (err) {
      console.error("utubext Vault Fetch Error:", err);
    }
  }

  return results;
};
