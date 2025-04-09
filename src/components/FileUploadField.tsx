import React, { useState, useRef } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { validateFile } from '../lib/utils/fileValidation';
import { Platform } from '../lib/types/scheduled-post';

interface FileUploadFieldProps {
  name: string;
  accept: string;
  platform: Platform;
  type: 'feed' | 'reel' | 'video' | 'thumbnail';
  label: string;
  description?: string;
  required?: boolean;
  onChange?: (file: File | null) => void;
}

function FileUploadField({
  name,
  accept,
  platform,
  type,
  label,
  description,
  required = false,
  onChange
}: FileUploadFieldProps) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [validating, setValidating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) {
      setFile(null);
      setError(null);
      onChange?.(null);
      return;
    }

    setValidating(true);
    setError(null);

    try {
      const result = await validateFile(selectedFile, platform, type);
      if (result.isValid) {
        setFile(selectedFile);
        onChange?.(selectedFile);
      } else {
        setFile(null);
        setError(result.error || 'ファイルが無効です。');
        onChange?.(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } catch (err) {
      setFile(null);
      setError('ファイルの検証中にエラーが発生しました。');
      onChange?.(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } finally {
      setValidating(false);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="mt-1">
        <input
          ref={fileInputRef}
          type="file"
          name={name}
          accept={accept}
          onChange={handleFileChange}
          className={`block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-indigo-50 file:text-indigo-700
            hover:file:bg-indigo-100
            ${error ? 'border-red-300' : 'border-gray-300'}
          `}
          required={required}
        />
        {description && (
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        )}
        {validating && (
          <div className="mt-2 flex items-center text-sm text-gray-500">
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ファイルを検証中...
          </div>
        )}
        {error && (
          <div className="mt-2 flex items-center text-sm text-red-600">
            <AlertCircle className="w-4 h-4 mr-2" />
            {error}
          </div>
        )}
        {file && !error && (
          <div className="mt-2 text-sm text-green-600">
            ✓ ファイルが選択されました
          </div>
        )}
      </div>
    </div>
  );
}

export default FileUploadField;