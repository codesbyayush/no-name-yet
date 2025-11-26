import { useEffect, useRef, useState } from 'react';
import { type ApiClient, type Board, createApiClient } from '../api';

interface UseCreatePostFormProps {
  publicKey: string;
  apiUrl: string;
  defaultBoardId?: string;
  onSuccess?: () => void;
  user?: {
    id?: string;
    name?: string;
    email?: string;
    companyId?: string;
  };
}

interface PostFormState {
  title: string;
  description: string;
  board: string;
}

export function useCreatePostForm({
  publicKey,
  apiUrl,
  defaultBoardId,
  onSuccess,
  user,
}: UseCreatePostFormProps) {
  const apiClient = useRef<ApiClient>(createApiClient({ apiUrl, publicKey }));

  const [boards, setBoards] = useState<Board[]>([]);
  const [isLoadingBoards, setIsLoadingBoards] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [form, setForm] = useState<PostFormState>({
    title: '',
    description: '',
    board: defaultBoardId || '',
  });

  useEffect(() => {
    let mounted = true;
    setIsLoadingBoards(true);
    apiClient.current
      .getPublicBoardsCached()
      .then((data) => {
        if (!mounted) {
          return;
        }
        setBoards(data);
        if (!form.board) {
          setForm((prev) => ({
            ...prev,
            board: defaultBoardId || data[0]?.id || '',
          }));
        }
      })
      .catch(() => setError('Failed to load boards'))
      .finally(() => setIsLoadingBoards(false));
    return () => {
      mounted = false;
    };
  }, [defaultBoardId, form.board]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.title.trim()) {
      setError('Please enter a title');
      return;
    }
    if (!form.description.trim()) {
      setError('Please enter a description');
      return;
    }
    if (!form.board) {
      setError('Please select a board');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.current.submitFeedback({
        boardId: form.board,
        title: form.title,
        description: form.description,
        metadata: {
          browser: {
            userAgent: navigator.userAgent,
            language: navigator.language,
            url: window.location.href,
            cookieEnabled: navigator.cookieEnabled,
            platform: navigator.platform,
            screenResolution: `${window.screen.width}x${window.screen.height}`,
            time: new Date().toISOString(),
            referrer: document.referrer,
          },
          user: user
            ? {
                id: user.id,
                email: user.email,
                companyId: user.companyId,
              }
            : undefined,
        },
      });
      onSuccess?.();
      setForm({
        title: '',
        description: '',
        board: defaultBoardId || boards[0]?.id || '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    boards,
    isLoadingBoards,
    error,
    isSubmitting,
    form,
    setForm,
    handleSubmit,
  };
}
