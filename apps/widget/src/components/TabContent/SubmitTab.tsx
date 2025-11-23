import type React from 'react';
import { COLORS } from '../../constants';
import CreatePostForm from '../CreatePostForm';

/**
 * Props for the SubmitTab component
 */
interface SubmitTabProps {
  /** API endpoint URL */
  apiUrl: string;
  /** Public API key */
  publicKey: string;
  /** Default board ID for submissions */
  boardId?: string;
  /** Callback when submission succeeds */
  onSuccess?: () => void;
}

/**
 * SubmitTab - Feedback submission tab content
 *
 * Displays a header with gradient background and the feedback submission form.
 * The header provides context about what users can submit and reassures them
 * that their feedback will be read.
 *
 * @param apiUrl - API endpoint URL
 * @param publicKey - Public API key
 * @param boardId - Default board ID
 * @param onSuccess - Callback when submission succeeds
 */
const SubmitTab: React.FC<SubmitTabProps> = ({
  apiUrl,
  publicKey,
  boardId,
  onSuccess,
}) => {
  return (
    <>
      {/* Header with gradient background */}
      <div
        style={{
          background: `linear-gradient(to bottom, ${COLORS.GRADIENT.START} 0%, ${COLORS.GRADIENT.END} 60%, transparent 100%)`,
          paddingBottom: '32px',
          color: 'white',
        }}
      >
        <div style={{ padding: '20px' }}>
          {/* Avatar placeholder */}
          <div
            style={{
              marginBottom: '32px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <div
              style={{
                height: '32px',
                width: '32px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
              }}
            />
          </div>

          {/* Header text */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div
              style={{
                fontWeight: 600,
                fontSize: '20px',
                lineHeight: '24px',
              }}
            >
              Share your feedback
            </div>
            <div
              style={{
                fontWeight: 700,
                fontSize: '24px',
                lineHeight: '28px',
              }}
            >
              Tell us what's working and what's not
            </div>
            <div
              style={{
                fontSize: '14px',
                opacity: 0.9,
              }}
            >
              Your message goes straight to the team, we read every submission.
            </div>
          </div>
        </div>
      </div>

      {/* Feedback form */}
      <CreatePostForm
        apiUrl={apiUrl}
        defaultBoardId={boardId}
        onSuccess={onSuccess}
        publicKey={publicKey}
      />
    </>
  );
};

export default SubmitTab;
