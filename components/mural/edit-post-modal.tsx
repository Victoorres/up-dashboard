'use client';

import type React from 'react';

import { useRef, useState } from 'react';
import type { Post } from '@/types/post';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, ImageIcon, Quote, Hash } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { uploadImage } from '@/utils/image-upload';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { updatePost } from '@/lib/post-api';
import { useMuralUpdate } from '@/contexts/mural-update-context';
import { uploadImageCloudinary } from '@/lib/user-api';
import { useToast } from '@/hooks/use-toast';

interface EditPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: Post;
  onPostUpdated?: (post: Post) => void;
}

export function EditPostModal({ isOpen, onClose, post, onPostUpdated }: EditPostModalProps) {
  const { triggerUpdate } = useMuralUpdate();
  const [title, setTitle] = useState(post.title || '');
  const [content, setContent] = useState(post.content || '');
  const [hashtags, setHashtags] = useState<string[]>(post.hashtags || []);
  const [hashtagInput, setHashtagInput] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(post.attachedImage || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hashtagInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!content.trim()) return;

    try {
      setIsSubmitting(true);

      if (hashtagInput.trim()) {
        addHashtag();
      }

      let cloudinaryImageURL = null;
      if (image) {
        cloudinaryImageURL = await uploadImageCloudinary(image);
      }

      const updatedPost = await updatePost(post.id, {
        title: title.trim(),
        content: content.trim(),
        hashtags,
        attachedImage: cloudinaryImageURL || post.attachedImage || '',
      });

      if (onPostUpdated) {
        onPostUpdated(updatedPost);
      }

      triggerUpdate();
      toast({
        title: 'Post atualizado com sucesso! ✨',
        description: 'As alterações foram salvas.',
        duration: 2000,
      });
      onClose();
    } catch (error) {
      console.error('Error updating post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const addHashtag = () => {
    const tags = hashtagInput
      .split(/[\s,]+/)
      .map((tag) => tag.trim().replace(/^#/, ''))
      .filter((tag) => tag.length > 0);

    if (tags.length > 0) {
      const newTags = tags.filter((tag) => !hashtags.includes(tag));
      if (newTags.length > 0) {
        setHashtags([...hashtags, ...newTags]);
      }
      setHashtagInput('');
    }
  };

  const removeHashtag = (tag: string) => {
    setHashtags(hashtags.filter((t) => t !== tag));
  };

  const handleHashtagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addHashtag();
    } else if (e.key === ' ' || e.key === ',') {
      e.preventDefault();
      addHashtag();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleHashtagInputBlur = () => {
    if (hashtagInput.trim()) {
      addHashtag();
    }
  };

  const focusHashtagInput = () => {
    if (hashtagInputRef.current) {
      hashtagInputRef.current.focus();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] max-h-[70vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar post</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-[#511A2B]" htmlFor="title">
              Título (opcional)
            </Label>
            <div className="relative group">
              <Input
                id="title"
                placeholder="Título do post"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="pl-10 bg-white/80 border-[#511A2B]/20 rounded-xl text-[#511A2B] placeholder:text-[#511A2B]/50 focus:border-[#511A2B]/40"
              />
              <Quote className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 group-focus-within:text-primary transition-colors text-gray-400" />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[#511A2B]" htmlFor="content">
              Conteúdo
            </Label>
            <Textarea
              id="content"
              placeholder="O que você está pensando?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[120px] bg-white/80 border-[#511A2B]/20 rounded-xl text-[#511A2B] placeholder:text-[#511A2B]/50 focus:border-[#511A2B]/40"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[#511A2B]" htmlFor="hashtags">
              Hashtags
            </Label>
            <div className="relative group">
              <Input
                ref={hashtagInputRef}
                id="hashtags"
                placeholder="Hashtags (espaço ou vírgula para adicionar)"
                value={hashtagInput}
                onChange={(e) => setHashtagInput(e.target.value)}
                onKeyDown={handleHashtagInputKeyDown}
                onBlur={handleHashtagInputBlur}
                className="flex-1 w-full pl-10 bg-white/80 border-[#511A2B]/20 rounded-xl text-[#511A2B] placeholder:text-[#511A2B]/50 focus:border-[#511A2B]/40"
              />
              <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 group-focus-within:text-primary transition-colors text-gray-400" />
            </div>

            {hashtags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {hashtags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="bg-gray-100 hover:bg-gray-200 text-gray-700 pl-2 pr-1 py-1 flex items-center gap-1">
                    #{tag}
                    <Button variant="ghost" size="xs" onClick={() => removeHashtag(tag)}>
                      <X className="h-3 w-3" />
                      <span className="sr-only">Remover hashtag</span>
                    </Button>
                  </Badge>
                ))}
                <Button variant="ghost" size="xs" className="p-4" onClick={focusHashtagInput}>
                  + Adicionar mais
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-[#511A2B]" htmlFor="image">
              Imagem
            </Label>
            {imagePreview ? (
              <div className="relative group">
                <img src={imagePreview || '/placeholder.svg'} alt="Preview" className="w-full h-auto rounded-md" />
                <Button
                  type="button"
                  variant="destructive"
                  size="lg"
                  className="absolute top-2 right-2 h-8 w-8 rounded-full"
                  onClick={removeImage}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Remover imagem</span>
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-md p-6">
                <label htmlFor="image-upload" className="flex flex-col items-center justify-center cursor-pointer">
                  <ImageIcon className="h-8 w-8 text-gray-400" />
                  <span className="mt-2 text-sm text-gray-500">Clique para adicionar uma imagem</span>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!content.trim() || isSubmitting}
            className="bg-[#511A2B] hover:bg-[#511A2B]/90 text-white"
          >
            {isSubmitting ? 'Salvando...' : 'Salvar alterações'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
