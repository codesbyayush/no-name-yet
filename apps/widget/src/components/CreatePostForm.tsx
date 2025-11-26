import { useMemo } from 'react';
import { useBoardDropdown } from '../hooks/useBoardDropdown';
import { useCreatePostForm } from '../hooks/useCreatePostForm';
import { styles } from './CreatePostForm.styles';

interface CreatePostFormProps {
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

export default function CreatePostForm({
  publicKey,
  apiUrl,
  defaultBoardId,
  onSuccess,
  user,
}: CreatePostFormProps) {
  const {
    boards,
    isLoadingBoards,
    error,
    isSubmitting,
    form,
    setForm,
    handleSubmit,
  } = useCreatePostForm({
    publicKey,
    apiUrl,
    defaultBoardId,
    onSuccess,
    user,
  });

  const { isBoardOpen, setIsBoardOpen, boardDropdownRef } = useBoardDropdown();

  const selectedBoardName = useMemo(
    () => boards.find((b) => b.id === form.board)?.name,
    [boards, form.board],
  );

  const isSubmitDisabled =
    isSubmitting ||
    !form.title.trim() ||
    !form.description.trim() ||
    !form.board;

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <div style={styles.container}>
        <div style={styles.inputContainer}>
          <input
            maxLength={250}
            onBlur={(e) => {
              e.target.style.borderColor = '#e5e7eb';
            }}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            onFocus={(e) => {
              e.target.style.borderColor = '#3b82f6';
            }}
            placeholder='Issue title'
            required
            style={styles.input}
            type='text'
            value={form.title}
          />
        </div>
        <div style={styles.textareaContainer}>
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
            placeholder='Add a clear description, steps, and context'
            required
            rows={5}
            style={styles.textarea}
            value={form.description}
          />
          <div style={styles.charCount}>{form.description.length}/5000</div>
        </div>
        <div style={styles.footer}>
          <div ref={boardDropdownRef} style={{ position: 'relative' }}>
            <button
              aria-expanded={isBoardOpen}
              aria-haspopup='listbox'
              disabled={isLoadingBoards || boards.length === 0}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
              }}
              onClick={() => setIsBoardOpen(!isBoardOpen)}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6';
              }}
              style={styles.dropdownButton(
                isLoadingBoards,
                boards.length === 0,
              )}
              type='button'
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
              <span style={{ marginLeft: '8px', color: '#6b7280' }}>▾</span>
            </button>
            {isBoardOpen && (
              <div style={styles.dropdownMenu}>
                <div style={styles.dropdownList}>
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
                      style={styles.dropdownItem(form.board === b.id)}
                      type='button'
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
                        <span style={{ marginLeft: '8px', color: '#2563eb' }}>
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
            disabled={isSubmitDisabled}
            style={styles.submitButton(!!isSubmitDisabled)}
            type='submit'
          >
            {isSubmitting ? 'Creating...' : 'Create issue'}
          </button>
        </div>
        {error && <div style={styles.error}>{error}</div>}
      </div>
    </form>
  );
}
