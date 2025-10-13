import { KnowledgeFile } from "../types";
// import { initializeApp } from "firebase/app";
// import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from "firebase/firestore";

// ====================================================================================
// [가이드] Firebase 설정 및 연동 방법
// ====================================================================================
// 이 챗봇의 지식 베이스는 Google Firebase의 Firestore 데이터베이스를 사용하여 저장됩니다.
// 아래의 단계별 안내에 따라 Firebase 프로젝트를 설정하고 이 코드와 연동하세요.
//
// --- 1단계: Firebase 프로젝트 생성 ---
// 1. Firebase 콘솔(https://console.firebase.google.com/)로 이동하여 Google 계정으로 로그인합니다.
// 2. '프로젝트 추가'를 클릭하고 프로젝트 이름을 지정합니다. (예: 'my-chatbot-knowledgebase')
// 3. Google Analytics는 필수가 아니므로 비활성화해도 됩니다. '프로젝트 만들기'를 클릭합니다.
//
// --- 2단계: Firestore 데이터베이스 생성 ---
// 1. 프로젝트 대시보드에서 왼쪽 메뉴의 '빌드' > 'Firestore Database'로 이동합니다.
// 2. '데이터베이스 만들기'를 클릭합니다.
// 3. "프로덕션 모드에서 시작"을 선택하고 '다음'을 클릭합니다.
// 4. Cloud Firestore 위치를 선택합니다. (보통 가장 가까운 리전 선택) '사용 설정'을 클릭합니다.
//
// --- 3단계: Firestore 보안 규칙 설정 ---
// 1. Firestore 페이지에서 '규칙' 탭으로 이동합니다.
// 2. 기존 규칙을 아래의 내용으로 변경합니다.
//
//    rules_version = '2';
//    service cloud.firestore {
//      match /databases/{database}/documents {
//        match /knowledgeBase/{document=**} {
//          allow read, write: if false; // 프로덕션 환경에서는 인증된 관리자만 접근 가능하도록 변경해야 합니다.
//                                      // 개발 초기에는 `if true;`로 설정하여 테스트할 수 있습니다.
//        }
//      }
//    }
//
// 3. '게시'를 클릭하여 규칙을 저장합니다.
//    (주의: `allow read, write: if true;`는 누구나 데이터베이스에 접근할 수 있게 하므로 개발 단계에서만 사용하세요!)
//
// --- 4단계: 웹 앱 등록 및 설정 키(Config) 가져오기 ---
// 1. 프로젝트 대시보드에서 '프로젝트 개요' 옆의 톱니바퀴 아이콘을 클릭하고 '프로젝트 설정'으로 이동합니다.
// 2. '내 앱' 섹션에서 웹 아이콘(</>)을 클릭하여 새 웹 앱을 등록합니다.
// 3. 앱 닉네임을 정하고 '앱 등록'을 클릭합니다. (Firebase 호스팅 설정은 건너뛰어도 됩니다.)
// 4. 'SDK 설정 및 구성' 섹션에서 `firebaseConfig` 객체를 찾을 수 있습니다. 이 객체를 복사하세요.
//
// --- 5단계: 코드에 Firebase 설정 적용 ---
// 1. 아래 `firebaseConfig` 상수를 방금 복사한 값으로 붙여넣으세요.
// 2. 이 파일 상단의 `import { initializeApp }...` 주석을 해제하세요.
// 3. 파일 하단의 "실제 Firebase 연동 코드" 부분의 주석을 해제하고, "MOCK (모의) 구현" 부분을 삭제하거나 주석 처리하세요.
// 4. 터미널에서 `npm install firebase` 명령어를 실행하여 Firebase SDK를 설치하세요.
// ====================================================================================

// 5단계: 아래에 당신의 Firebase 설정 키를 붙여넣으세요.
const firebaseConfig = {
  apiKey: "AIzaSyD0yavRTchwhwA97F6lr_9BYkLoXMksLSw",
  authDomain: "help-bot-55e76.firebaseapp.comm",
  projectId: "help-bot-55e76",
  storageBucket: help-bot-55e76.firebasestorage.app",
  messagingSenderId: "360675539401",
  appId: "1:360675539401:web:12fa60fc2e4e8ac7a0d018"
};

// ====================================================================================
// 실제 Firebase 연동 코드 (위 가이드 5단계를 완료한 후 주석 해제)
// ====================================================================================
/*
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

export const getKnowledgeFiles = async (): Promise<KnowledgeFile[]> => {
    const q = query(knowledgeBaseCollection, orderBy("fileName"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
        id: doc.id,
        fileName: doc.data().fileName
    }));
};

export const deleteMarkdown = async (fileId: string): Promise<void> => {
    const docRef = doc(db, "knowledgeBase", fileId);
    await deleteDoc(docRef);
};
*/
// ====================================================================================
// MOCK (모의) 구현 - Firebase 설정 전까지 UI 테스트 용도로 사용됩니다.
// ====================================================================================
interface MockKnowledgeFile extends KnowledgeFile {
    content: string;
}

let mockKnowledgeBase: MockKnowledgeFile[] = [
    {
        id: '1',
        fileName: 'sample-knowledge.md',
        content: `# 생활백서봇 지식 베이스 샘플

## 기본 정보
- 저희 서비스는 여러분의 생활을 편리하게 만드는 것을 목표로 합니다.
- 상담 가능 시간은 평일 오전 9시부터 오후 6시까지입니다.

## 주요 기능
- **기능 A:** 복잡한 서류 작업을 자동화합니다.
- **기능 B:** 실시간으로 유용한 생활 정보를 제공합니다.
- **기능 C:** 전문가와의 1:1 상담을 연결해드립니다.

## 요금제
- **베이직:** 월 10,000원 (기능 B)
- **프리미엄:** 월 30,000원 (모든 기능 포함)
- 단체 및 기업용 요금제는 별도 문의 바랍니다.`
    }
];

const mockFileToText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsText(file);
    });
};

export const uploadMarkdown = async (files: File[]): Promise<void> => {
  console.log(`(Mock) ${files.length}개의 파일을 업로드합니다.`);
  if (firebaseConfig.apiKey === "YOUR_API_KEY") {
    for (const file of files) {
        const content = await mockFileToText(file);
        const newFile: MockKnowledgeFile = {
            id: `${Date.now()}-${Math.random()}`,
            fileName: file.name,
            content: content,
        };
        mockKnowledgeBase.push(newFile);
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
    return;
  }
};

export const getMarkdown = async (): Promise<string | null> => {
  console.log("(Mock) 지식 베이스를 불러옵니다.");
  if (firebaseConfig.apiKey === "YOUR_API_KEY") {
    if (mockKnowledgeBase.length === 0) {
        return null;
    }
    const allContent = mockKnowledgeBase.map(doc => `--- START OF FILE: ${doc.fileName} ---\n\n${doc.content}\n\n--- END OF FILE: ${doc.fileName} ---`).join('\n\n');
    return new Promise(resolve => setTimeout(() => resolve(allContent), 500));
  }
  return null;
};

export const getKnowledgeFiles = async (): Promise<KnowledgeFile[]> => {
    console.log("(Mock) 파일 목록을 불러옵니다.");
    if (firebaseConfig.apiKey === "YOUR_API_KEY") {
        const fileList = mockKnowledgeBase.map(({ id, fileName }) => ({ id, fileName }));
        return new Promise(resolve => setTimeout(() => resolve(fileList), 500));
    }
    return [];
};

export const deleteMarkdown = async (fileId: string): Promise<void> => {
    console.log(`(Mock) ID가 ${fileId}인 파일을 삭제합니다.`);
    if (firebaseConfig.apiKey === "YOUR_API_KEY") {
        const initialLength = mockKnowledgeBase.length;
        mockKnowledgeBase = mockKnowledgeBase.filter(file => file.id !== fileId);
        if (mockKnowledgeBase.length === initialLength) {
            throw new Error("File not found");
        }
        await new Promise(resolve => setTimeout(resolve, 500));
        return;
    }
};