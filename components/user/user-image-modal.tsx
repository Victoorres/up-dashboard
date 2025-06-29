'use client';

import type React from 'react';

import { useState, useRef } from 'react';
import { X, Upload, Camera, Trash2, AlertCircle, CheckCircle, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { useUser } from '@/contexts/user-context';
import { toast } from 'sonner';
import { updateImageUser, uploadImageCloudinary } from '@/lib/user-api';

interface ProfileImageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserImageModal({ isOpen, onClose }: ProfileImageModalProps) {
  const { user, updateProfileImage } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const allowedTypes = ['image/jpeg', 'image/png'];

  if (!isOpen) return null;

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!allowedTypes.includes(file.type)) {
      setErrorMessage('Por favor, selecione apenas arquivos de imagem.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 2MB.');
      return;
    }

    setSelectedFile(file);
    setErrorMessage(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || !user) {
      setErrorMessage('Nenhuma imagem selecionada.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const cloudinaryImageURL = await uploadImageCloudinary(selectedFile);
      if (!cloudinaryImageURL) return;

      await updateImageUser(user.id, cloudinaryImageURL);
      updateProfileImage(cloudinaryImageURL);
      toast.success('Imagem de perfil atualizada com sucesso!');

      onClose();
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast.error(error instanceof Error ? error.message : 'Erro inesperado ao fazer upload');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearSelection = () => {
    setSelectedFile(null);
    setPreviewImage(null);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const currentImage = previewImage || user?.profileImage;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center space-x-3">
            <Camera className="w-6 h-6 text-[#511A2B]" />
            <h2 className="text-xl font-semibold text-[#511A2B]">Alterar imagem de perfil</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isLoading}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Messages */}
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="text-red-700">{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-green-700">{successMessage}</span>
            </div>
          )}

          {/* Current/Preview Image */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="w-64 h-64 rounded-full overflow-hidden border-3 border-primary/30 shadow-md">
                <img src={currentImage || '/placeholder.svg'} alt="Profile" className="w-full h-full object-cover" />
              </div>
              {selectedFile && (
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
                  onClick={handleClearSelection}
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>

            <div className="text-center">
              <p className="text-sm text-[#511A2B]/70">
                {previewImage ? 'Nova imagem selecionada' : 'Imagem atual do perfil'}
              </p>
              <p className="text-xs text-[#511A2B]/70 mt-1">Tamanho máximo: 2MB • Formatos: JPG, PNG</p>
              <p className="text-xs text-[#511A2B]/70 mt-1">{selectedFile ? 'Clique no X para remover' : ''}</p>
            </div>
          </div>

          {/* File Input */}
          <div className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png"
              onChange={handleFileSelect}
              className="hidden"
              disabled={isLoading}
            />

            <div className={`grid ${selectedFile ? 'grid-cols-2' : 'grid-cols-1'}  gap-3 pb-4`}>
              <Button
                variant="accent"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="flex items-center justify-center space-x-2"
              >
                <Upload className="w-4 h-4" />
                Escolher nova imagem
              </Button>
              {selectedFile && (
                <Button onClick={handleUpload} disabled={isLoading} variant="secondary">
                  <Save className="w-4 h-4" />
                  {isLoading ? 'Salvando...' : 'Salvar nova imagem'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
