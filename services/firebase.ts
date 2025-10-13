import { KnowledgeFile } from "../types";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { firebaseConfig } from './firebaseConfig'; // Import sensitive config from gitignored file

// ====================================================================================
// [가이드] Firebase 설정 및 연동 방법
// ====================================================================================
// 이 챗봇의 지식 베이스는 Google Firebase의 Firestore 데이터베이스를 사용하여 저장됩니다.
//
// --- 1단계: Firebase 프로젝트 생성 및 설정 ---
// 이전 안내에 따라 Firebase 프로젝트, Firestore, 웹 앱 설정을 완료하세요.
//
// --- 2단계: 보안을 위한 키 파일 분리 (매우 중요!) ---
// 1. `services` 폴더 안에 `firebaseConfig.ts`라는 새 파일을 만드세요.
// 2. 그 파일 안에 아래와 같은 형식으로 당신의 Firebase 설정 객체를 `export` 하세요.
//
//    // services/firebaseConfig.ts
//    export const firebaseConfig = {
//      apiKey: "...",
//      authDomain: "...",
//      // ... 나머지 키들
//    };
//
// 3. 이 `firebaseConfig.ts` 파일은 `.gitignore`에 의해 Git 추적에서 제외되므로,
//    당신의 비밀 키가 GitHub에 올라가지 않아 안전합니다.
//    (이 프로젝트에 포함된 `.gitignore` 파일이 자동으로 처리해줍니다.)
//
// --- 3단계: Firebase SDK 설치 ---
// 터미널에서 `npm install firebase` 또는 `yarn add firebase` 명령어를 실행하세요.
// ====================================================================================

// Initialize Firebase with the imported config
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const knowledgeBaseCollection = collection(db, "knowledgeBase");

const fileToText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsText(file);
    });
};

/**
 * Uploads one or more markdown files to the Firestore 'knowledgeBase' collection.
 */
export const uploadMarkdown = async (files: File[]): Promise<void> => {
  for (const file of files) {
    const content = await fileToText(file);
    await addDoc(knowledgeBaseCollection, { 
      fileName: file.name, 
      content: content, 
      uploadedAt: new Date() 
    });
  }
};

/**
 * Retrieves all markdown documents, concatenates their content, and returns it as a single string.
 * Each document's content is wrapped with file name headers.
 */
export const getMarkdown = async (): Promise<string | null> => {
  const q = query(knowledgeBaseCollection, orderBy("fileName"));
  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) {
    return null;
  }
  const allContent = querySnapshot.docs.map(doc => {
    const data = doc.data();
    return `--- START OF FILE: ${data.fileName} ---\n\n${data.content}\n\n--- END OF FILE: ${data.fileName} ---`
  }).join('\n\n');
  return allContent;
};

/**
 * Fetches the list of all uploaded knowledge files (id and fileName).
 */
export const getKnowledgeFiles = async (): Promise<KnowledgeFile[]> => {
    const q = query(knowledgeBaseCollection, orderBy("fileName"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
        id: doc.id,
        fileName: doc.data().fileName
    }));
};

/**
 * Deletes a specific markdown document from Firestore by its ID.
 */
export const deleteMarkdown = async (fileId: string): Promise<void> => {
    const docRef = doc(db, "knowledgeBase", fileId);
    await deleteDoc(docRef);
};
