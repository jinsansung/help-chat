import React, { useState, useCallback, useEffect } from 'react';
import { uploadMarkdown, getKnowledgeFiles, deleteMarkdown } from '../services/firebase';
import Spinner from './common/Spinner';
import { UploadIcon, DeleteIcon } from './icons';
import { KnowledgeFile } from '../types';

interface AdminPanelProps {
  onAuthSuccess: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onAuthSuccess }) => {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');
  
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const [knowledgeFiles, setKnowledgeFiles] = useState<KnowledgeFile[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(true);
  const [deletingFileId, setDeletingFileId] = useState<string | null>(null);

  const fetchFiles = useCallback(async () => {
    setLoadingFiles(true);
    try {
      const files = await getKnowledgeFiles();
      setKnowledgeFiles(files);
    } catch (e) {
      console.error("Failed to fetch knowledge files:", e);
      setStatusMessage("기존 파일을 불러오지 못했습니다.");
    } finally {
      setLoadingFiles(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchFiles();
    }
  }, [isAuthenticated, fetchFiles]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'adminarena') {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('비밀번호가 올바르지 않습니다.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const mdFiles = files.filter(file => file.type === 'text/markdown' || file.name.endsWith('.md'));
      
      if (mdFiles.length !== files.length) {
        setStatusMessage('마크다운(.md)이 아닌 파일은 제외되었습니다.');
      } else {
        setStatusMessage('');
      }
      setSelectedFiles(mdFiles);
    }
  };

  const handleUpload = useCallback(async () => {
    if (selectedFiles.length === 0) {
      setStatusMessage('먼저 파일을 선택해주세요.');
      return;
    }
    setUploading(true);
    setStatusMessage(`파일 ${selectedFiles.length}개를 업로드 중입니다...`);
    try {
      await uploadMarkdown(selectedFiles);
      setStatusMessage('지식 베이스가 성공적으로 업데이트되었습니다!');
      setSelectedFiles([]);
      await fetchFiles(); // Refresh file list
    } catch (e) {
      console.error('Upload failed:', e);
      setStatusMessage('업로드에 실패했습니다. 콘솔을 확인해주세요.');
    } finally {
      setUploading(false);
    }
  }, [selectedFiles, fetchFiles]);

  const handleDelete = useCallback(async (file: KnowledgeFile) => {
    if (!window.confirm(`'${file.fileName}' 파일을 정말 삭제하시겠습니까?`)) {
        return;
    }
    setDeletingFileId(file.id);
    try {
        await deleteMarkdown(file.id);
        setStatusMessage(`'${file.fileName}' 파일이 삭제되었습니다.`);
        setKnowledgeFiles(prev => prev.filter(f => f.id !== file.id));
    } catch (e) {
        console.error('Delete failed:', e);
        setStatusMessage(`'${file.fileName}' 파일 삭제에 실패했습니다.`);
    } finally {
        setDeletingFileId(null);
    }
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="p-6 h-full flex flex-col items-center justify-center bg-gray-50">
        <form onSubmit={handleLogin} className="w-full max-w-sm">
          <h3 className="text-xl font-semibold mb-4 text-center text-gray-800">관리자 로그인</h3>
          <p className="text-center text-gray-500 mb-6">지식 베이스를 관리하려면 비밀번호를 입력하세요.</p>
          <div className="mb-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-primary text-black font-bold py-2 px-4 rounded-lg hover:bg-primary-dark transition duration-300"
          >
            로그인
          </button>
          {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
        </form>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
        <div className="p-4 space-y-4">
            <h3 className="text-xl font-semibold text-gray-800">지식 베이스 업데이트</h3>
            <div>
                <label htmlFor="file-upload" className="w-full flex flex-col items-center px-4 py-6 bg-white text-primary-dark rounded-lg shadow-md tracking-wide uppercase border border-primary cursor-pointer hover:bg-primary hover:text-black">
                    <UploadIcon />
                    <span className="mt-2 text-base leading-normal">{selectedFiles.length > 0 ? `${selectedFiles.length}개 파일 선택됨` : '.md 파일 선택'}</span>
                    <input id="file-upload" type="file" accept=".md,text/markdown" className="hidden" onChange={handleFileChange} multiple />
                </label>
            </div>
            <button
                onClick={handleUpload}
                disabled={selectedFiles.length === 0 || uploading}
                className="w-full bg-primary text-black font-bold py-2 px-4 rounded-lg hover:bg-primary-dark transition duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
            >
                {uploading ? <Spinner /> : `파일 ${selectedFiles.length}개 업로드`}
            </button>
            {statusMessage && <p className="text-gray-600 text-sm text-center">{statusMessage}</p>}
        </div>
        <div className="flex-1 p-4 border-t border-gray-200 overflow-y-auto">
            <h4 className="text-lg font-semibold text-gray-700 mb-2">업로드된 파일</h4>
            {loadingFiles ? <div className="flex justify-center"><Spinner /></div> : (
                knowledgeFiles.length > 0 ? (
                    <ul className="space-y-2">
                        {knowledgeFiles.map(file => (
                            <li key={file.id} className="flex items-center justify-between bg-white p-2 rounded-lg shadow-sm">
                                <span className="text-gray-800 truncate pr-2">{file.fileName}</span>
                                <button onClick={() => handleDelete(file)} disabled={deletingFileId === file.id} className="text-red-500 hover:text-red-700 disabled:text-gray-400 p-1 rounded-full">
                                    {deletingFileId === file.id ? <Spinner/> : <DeleteIcon />}
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : <p className="text-gray-500 text-center">업로드된 지식 파일이 없습니다.</p>
            )}
        </div>
    </div>
  );
};

export default AdminPanel;