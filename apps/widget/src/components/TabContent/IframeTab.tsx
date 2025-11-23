import type React from 'react';
import { COLORS } from '../../constants';
import { removeTrailingSlash } from '../../utils/url';

/**
 * Props for the IframeTab component
 */
interface IframeTabProps {
  /** Portal base URL for iframe embedding */
  portalUrl?: string;
  /** Title for the iframe (used for accessibility) */
  title: string;
  /** Path to append to portalUrl (e.g., '/roadmap' or '/changelog') */
  path: string;
  /** Fallback message when portalUrl is not provided */
  fallbackMessage: string;
}

/**
 * IframeTab - Reusable component for embedding portal pages
 *
 * Used for both Roadmap and Changelog tabs. Embeds the portal page
 * in an iframe if portalUrl is provided, otherwise shows a fallback message.
 *
 * The iframe takes up the full height/width of the tab content area.
 *
 * @param portalUrl - Base URL of the portal
 * @param title - Iframe title for accessibility
 * @param path - Path to append to portalUrl
 * @param fallbackMessage - Message to show when portalUrl is missing
 */
const IframeTab: React.FC<IframeTabProps> = ({
  portalUrl,
  title,
  path,
  fallbackMessage,
}) => {
  return (
    <div style={{ height: '100%', width: '100%' }}>
      {portalUrl ? (
        <iframe
          className='iframe-container'
          src={`${removeTrailingSlash(portalUrl)}${path}`}
          title={title}
        />
      ) : (
        <div
          style={{
            padding: '16px',
            textAlign: 'center',
            color: COLORS.GRAY[500],
          }}
        >
          {fallbackMessage}
        </div>
      )}
    </div>
  );
};

export default IframeTab;
