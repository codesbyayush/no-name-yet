import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getFeedbacks = () => {
  return {
    data: [
      {
        id: "fb_01h8k9j2m3n4p5q6r7s8t9u0",
        boardId: "board_01h8k9j2m3n4p5q6r7s8t9u1",
        type: "bug",
        title: "Search functionality not working on mobile",
        description:
          "When I try to search for items on my mobile device, the search bar doesn't respond to touch inputs. This happens consistently across different mobile browsers (Chrome, Safari, Firefox). The issue started after the latest update.",
        status: "open",
        userId: "user_01h8k9j2m3n4p5q6r7s8t9u2",
        userEmail: "john.doe@example.com",
        userName: "John Doe",
        userAgent:
          "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
        url: "https://app.example.com/dashboard/search",
        browserInfo: {
          platform: "iPhone",
          language: "en-US",
          cookieEnabled: true,
          onLine: true,
          screenResolution: "375x812",
        },
        attachments: [
          {
            id: "att_01h8k9j2m3n4p5q6r7s8t9u3",
            name: "mobile-search-bug.png",
            type: "image/png",
            size: 245760,
            url: "https://s3.amazonaws.com/feedback-attachments/mobile-search-bug.png",
          },
        ],
        aiAnalysis: {
          category: "Technical Issue",
          sentiment: "Frustrated",
          summary:
            "User experiencing mobile search functionality failure across multiple browsers",
          suggestedResponse:
            "Thank you for reporting this issue. We'll prioritize this mobile bug and have our development team investigate the search functionality.",
          confidence: 0.85,
        },
        createdAt: "2024-01-15T10:30:00Z",
        updatedAt: "2024-01-15T10:30:00Z",
        isAnonymous: false,
        tags: ["mobile", "search", "bug", "ui"],
        priority: "high",
      },
      {
        id: "fb_01h8k9j2m3n4p5q6r7s8t9u4",
        boardId: "board_01h8k9j2m3n4p5q6r7s8t9u1",
        type: "suggestion",
        title: "Add dark mode support",
        description:
          "It would be great if the application had a dark mode option. Many users prefer dark themes, especially when working in low-light environments or during evening hours. This would improve user experience and reduce eye strain.",
        status: "in_progress",
        userId: null,
        userEmail: null,
        userName: "Anonymous User",
        userAgent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        url: "https://app.example.com/settings",
        browserInfo: {
          platform: "Win32",
          language: "en-US",
          cookieEnabled: true,
          onLine: true,
          screenResolution: "1920x1080",
        },
        attachments: [
          {
            id: "att_01h8k9j2m3n4p5q6r7s8t9u5",
            name: "dark-mode-mockup.jpg",
            type: "image/jpeg",
            size: 512000,
            url: "https://s3.amazonaws.com/feedback-attachments/dark-mode-mockup.jpg",
          },
        ],
        aiAnalysis: {
          category: "Feature Request",
          sentiment: "Positive",
          summary:
            "User requesting dark mode implementation for better user experience",
          suggestedResponse:
            "Great suggestion! Dark mode is on our roadmap and we're actively working on implementing it.",
          confidence: 0.92,
        },
        createdAt: "2024-01-14T14:22:00Z",
        updatedAt: "2024-01-15T09:15:00Z",
        isAnonymous: true,
        tags: ["dark-mode", "ui", "feature-request", "accessibility"],
        priority: "medium",
      },
      {
        id: "fb_01h8k9j2m3n4p5q6r7s8t9u6",
        boardId: "board_01h8k9j2m3n4p5q6r7s8t9u1",
        type: "bug",
        title: "Data export fails for large datasets",
        description:
          "When trying to export data with more than 10,000 records, the export process fails with a timeout error. This is critical for our monthly reporting needs. The error message shows 'Request timeout after 30 seconds'.",
        status: "resolved",
        userId: "user_01h8k9j2m3n4p5q6r7s8t9u7",
        userEmail: "sarah.manager@company.com",
        userName: "Sarah Manager",
        userAgent:
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        url: "https://app.example.com/data/export",
        browserInfo: {
          platform: "MacIntel",
          language: "en-US",
          cookieEnabled: true,
          onLine: true,
          screenResolution: "2560x1440",
        },
        attachments: [
          {
            id: "att_01h8k9j2m3n4p5q6r7s8t9u8",
            name: "export-error-screenshot.png",
            type: "image/png",
            size: 189440,
            url: "https://s3.amazonaws.com/feedback-attachments/export-error-screenshot.png",
          },
          {
            id: "att_01h8k9j2m3n4p5q6r7s8t9u9",
            name: "browser-console-log.txt",
            type: "text/plain",
            size: 4096,
            url: "https://s3.amazonaws.com/feedback-attachments/browser-console-log.txt",
          },
        ],
        aiAnalysis: {
          category: "Critical Bug",
          sentiment: "Urgent",
          summary:
            "Data export functionality failing for large datasets causing business impact",
          suggestedResponse:
            "This is a critical issue affecting business operations. We'll escalate this to our development team immediately.",
          confidence: 0.95,
        },
        createdAt: "2024-01-12T16:45:00Z",
        updatedAt: "2024-01-14T11:30:00Z",
        isAnonymous: false,
        tags: ["export", "critical", "timeout", "performance"],
        priority: "high",
      },
      {
        id: "fb_01h8k9j2m3n4p5q6r7s8t9u10",
        boardId: "board_01h8k9j2m3n4p5q6r7s8t9u1",
        type: "suggestion",
        title: "Improve notification system",
        description:
          "The current notification system is quite basic. It would be helpful to have more granular notification preferences, such as choosing which types of events to be notified about, and the ability to set quiet hours.",
        status: "open",
        userId: "user_01h8k9j2m3n4p5q6r7s8t9u11",
        userEmail: "alex.developer@startup.com",
        userName: "Alex Developer",
        userAgent:
          "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        url: "https://app.example.com/notifications",
        browserInfo: {
          platform: "Linux x86_64",
          language: "en-US",
          cookieEnabled: true,
          onLine: true,
          screenResolution: "1920x1080",
        },
        attachments: [],
        aiAnalysis: {
          category: "Enhancement",
          sentiment: "Constructive",
          summary:
            "User requesting enhanced notification system with granular controls",
          suggestedResponse:
            "Thank you for the detailed feedback. We'll consider adding more notification customization options in future updates.",
          confidence: 0.88,
        },
        createdAt: "2024-01-13T09:12:00Z",
        updatedAt: "2024-01-13T09:12:00Z",
        isAnonymous: false,
        tags: ["notifications", "enhancement", "ux"],
        priority: "low",
      },
      {
        id: "fb_01h8k9j2m3n4p5q6r7s8t9u12",
        boardId: "board_01h8k9j2m3n4p5q6r7s8t9u1",
        type: "bug",
        title: "Memory leak in dashboard widgets",
        description:
          "After keeping the dashboard open for several hours, the browser becomes unresponsive. Browser dev tools show memory usage continuously increasing. This happens consistently in Chrome and Firefox on Windows.",
        status: "closed",
        userId: "user_01h8k9j2m3n4p5q6r7s8t9u13",
        userEmail: "qa.tester@company.com",
        userName: "QA Tester",
        userAgent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
        url: "https://app.example.com/dashboard",
        browserInfo: {
          platform: "Win32",
          language: "en-US",
          cookieEnabled: true,
          onLine: true,
          screenResolution: "1920x1080",
        },
        attachments: [
          {
            id: "att_01h8k9j2m3n4p5q6r7s8t9u14",
            name: "memory-profile.json",
            type: "application/json",
            size: 2048000,
            url: "https://s3.amazonaws.com/feedback-attachments/memory-profile.json",
          },
        ],
        aiAnalysis: {
          category: "Performance Issue",
          sentiment: "Technical",
          summary:
            "Browser memory leak in dashboard widgets causing performance degradation",
          suggestedResponse:
            "Thank you for the detailed report. We've identified and fixed the memory leak issue in the latest update.",
          confidence: 0.9,
        },
        createdAt: "2024-01-10T13:20:00Z",
        updatedAt: "2024-01-13T15:45:00Z",
        isAnonymous: false,
        tags: ["memory-leak", "performance", "dashboard", "bug"],
        priority: "high",
      },
    ],
  };
};
