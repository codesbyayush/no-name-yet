import { useEffect, useMemo, useRef, useState } from 'react';
import { type ApiClient, type Board, createApiClient } from '../api';

interface CreatePostFormProps {
  publicKey: string;
  apiUrl: string;
  defaultBoardId?: string;
  onSuccess?: () => void;
}

interface PostFormState {
  title: string;
  description: string;
  board: string;
}

export default function CreatePostForm({
  publicKey,
  apiUrl,
  defaultBoardId,
  onSuccess,
}: CreatePostFormProps) {
  const apiClient = useRef<ApiClient>(createApiClient({ apiUrl, publicKey }));

  const [boards, setBoards] = useState<Board[]>([]);
  const [isLoadingBoards, setIsLoadingBoards] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isBoardOpen, setIsBoardOpen] = useState(false);
  const boardDropdownRef = useRef<HTMLDivElement | null>(null);

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

  const selectedBoardName = useMemo(
    () => boards.find((b) => b.id === form.board)?.name,
    [boards, form.board]
  );

  useEffect(() => {
    const onDocMouseDown = (e: MouseEvent) => {
      if (
        boardDropdownRef.current &&
        !boardDropdownRef.current.contains(e.target as Node)
      ) {
        setIsBoardOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsBoardOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocMouseDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocMouseDown);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

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
      // Use the widget public feedback API. We concatenate title + description to keep payload small/compatible

      // TODO: add type to the description - hardcoded suggestion for now
      const combinedDescription = `${form.title}\n\n${form.description}`;
      await apiClient.current.submitFeedback({
        boardId: form.board,
        type: 'suggestion',
        description: combinedDescription,
        browserInfo: {
          userAgent: navigator.userAgent,
          url: window.location.href,
          language: navigator.language,
          platform: navigator.platform,
          cookieEnabled: navigator.cookieEnabled,
          onLine: navigator.onLine,
          screenResolution: `${window.screen.width}x${window.screen.height}`,
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

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: 'flex',
        height: '100%',
        flexDirection: 'column',
      }}
    >
      <div style={{ padding: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <input
            maxLength={250}
            onBlur={(e) => {
              e.target.style.borderColor = '#e5e7eb';
            }}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            onFocus={(e) => {
              e.target.style.borderColor = '#3b82f6';
            }}
            placeholder="Issue title"
            required
            style={{
              width: '100%',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              paddingLeft: '12px',
              paddingRight: '12px',
              paddingTop: '12px',
              paddingBottom: '12px',
              fontWeight: 500,
              fontSize: '16px',
              outline: 'none',
            }}
            type="text"
            value={form.title}
          />
        </div>
        <div
          style={{
            marginTop: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <textarea
            maxLength={5000}
            onBlur={(e) => {
              e.target.style.borderColor = '#e5e7eb';
            }}
            onChange={(e) =>
              setForm((p) => ({ ...p, description: e.target.value }))
            }
            onFocus={(e) => {
              e.target.style.borderColor = '#3b82f6';
            }}
            placeholder="Add a clear description, steps, and context"
            required
            rows={5}
            style={{
              width: '100%',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              paddingLeft: '12px',
              paddingRight: '12px',
              paddingTop: '12px',
              paddingBottom: '12px',
              fontSize: '14px',
              outline: 'none',
              resize: 'vertical',
            }}
            value={form.description}
          />
          <div
            style={{
              textAlign: 'right',
              color: '#6b7280',
              fontSize: '12px',
            }}
          >
            {form.description.length}/5000
          </div>
        </div>
        <div
          style={{
            marginTop: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
          }}
        >
          <div ref={boardDropdownRef} style={{ position: 'relative' }}>
            <button
              aria-expanded={isBoardOpen}
              aria-haspopup="listbox"
              disabled={isLoadingBoards || boards.length === 0}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
              }}
              onClick={() => {
                if (isBoardOpen) {
                  setIsBoardOpen(false);
                } else {
                  setIsBoardOpen(true);
                }
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6';
              }}
              style={{
                display: 'flex',
                minWidth: '12rem',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                backgroundColor: '#f9fafb',
                paddingLeft: '12px',
                paddingRight: '12px',
                paddingTop: '8px',
                paddingBottom: '8px',
                textAlign: 'left',
                fontSize: '14px',
                outline: 'none',
                opacity: isLoadingBoards || boards.length === 0 ? 0.6 : 1,
                cursor: 'pointer',
              }}
              type="button"
            >
              <span
                style={{
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                }}
              >
                {selectedBoardName || boards[0]?.name || 'Select board'}
              </span>
              <span
                style={{
                  marginLeft: '8px',
                  color: '#6b7280',
                }}
              >
                ▾
              </span>
            </button>
            {isBoardOpen && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '100%',
                  left: 0,
                  zIndex: 1_000_002,
                  marginBottom: '4px',
                  width: '100%',
                  borderRadius: '6px',
                  border: '1px solid #e5e7eb',
                  backgroundColor: 'white',
                  boxShadow:
                    '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
                }}
              >
                <div
                  style={{
                    maxHeight: '240px',
                    overflow: 'auto',
                    paddingTop: '4px',
                    paddingBottom: '4px',
                  }}
                >
                  {boards.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => {
                        setForm((p) => ({ ...p, board: b.id }));
                        setIsBoardOpen(false);
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f3f4f6';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor =
                          form.board === b.id ? '#f9fafb' : 'transparent';
                      }}
                      style={{
                        display: 'flex',
                        width: '100%',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingLeft: '12px',
                        paddingRight: '12px',
                        paddingTop: '8px',
                        paddingBottom: '8px',
                        textAlign: 'left',
                        fontSize: '14px',
                        backgroundColor:
                          form.board === b.id ? '#f9fafb' : 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                      type="button"
                    >
                      <span
                        style={{
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                        }}
                      >
                        {b.name}
                      </span>
                      {form.board === b.id ? (
                        <span
                          style={{
                            marginLeft: '8px',
                            color: '#2563eb',
                          }}
                        >
                          ✓
                        </span>
                      ) : null}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <button
            disabled={
              isSubmitting ||
              !form.title.trim() ||
              !form.description.trim() ||
              !form.board
            }
            style={{
              borderRadius: '8px',
              backgroundColor:
                isSubmitting ||
                !form.title.trim() ||
                !form.description.trim() ||
                !form.board
                  ? '#9ca3af'
                  : '#2563eb',
              paddingLeft: '16px',
              paddingRight: '16px',
              paddingTop: '8px',
              paddingBottom: '8px',
              fontWeight: 600,
              fontSize: '14px',
              color: 'white',
              cursor:
                isSubmitting ||
                !form.title.trim() ||
                !form.description.trim() ||
                !form.board
                  ? 'not-allowed'
                  : 'pointer',
              border: 'none',
            }}
            type="submit"
          >
            {isSubmitting ? 'Creating...' : 'Create issue'}
          </button>
        </div>
        {error && (
          <div
            style={{
              marginTop: '12px',
              borderRadius: '6px',
              border: '1px solid #fecaca',
              backgroundColor: '#fef2f2',
              paddingLeft: '12px',
              paddingRight: '12px',
              paddingTop: '8px',
              paddingBottom: '8px',
              color: '#b91c1c',
              fontSize: '14px',
            }}
          >
            {error}
          </div>
        )}
      </div>
    </form>
  );
}
