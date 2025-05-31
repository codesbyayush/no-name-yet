import React, { useState, useRef } from "react";

interface OmniFeedbackWidgetProps {
  tenantId: string;
  jwtAuthToken?: string;
  apiUrl?: string;
  theme?: {
    primaryColor?: string;
    buttonText?: string;
  };
  position?: 'center' | 'above-button';
  onClose?: () => void;
}

interface FeedbackData {
  type: "bug" | "suggestion";
  description: string;
  severity?: "low" | "medium" | "high" | "critical";
  category?: string;
  attachments?: File[];
}

const OmniFeedbackWidget: React.FC<OmniFeedbackWidgetProps> = ({
  tenantId,
  jwtAuthToken,
  apiUrl = "http://localhost:8080",
  theme = {},
  position = "above-button",
  onClose,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<
    "type" | "details" | "submit" | "success"
  >("type");
  const [feedbackData, setFeedbackData] = useState<FeedbackData>({
    type: "bug",
    description: "",
    severity: "medium",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Collect browser context
  const getBrowserContext = () => ({
    userAgent: navigator.userAgent,
    url: window.location.href,
    timestamp: new Date().toISOString(),
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
    },
  });

  const handleTypeSelection = (type: "bug" | "suggestion") => {
    setFeedbackData((prev) => ({ ...prev, type }));
    setCurrentStep("details");
  };

  const handleDescriptionChange = (description: string) => {
    setFeedbackData((prev) => ({ ...prev, description }));
  };

  const handleSeverityChange = (
    severity: "low" | "medium" | "high" | "critical",
  ) => {
    setFeedbackData((prev) => ({ ...prev, severity }));
  };

  const handleFileUpload = (files: FileList | null) => {
    if (files) {
      const fileArray = Array.from(files);
      setFeedbackData((prev) => ({ ...prev, attachments: fileArray }));
    }
  };

  const submitFeedback = async () => {
    if (!feedbackData.description.trim()) {
      setError("Please provide a description");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const browserContext = getBrowserContext();
      
      const payload = {
        tenantId,
        type: feedbackData.type,
        description: feedbackData.description,
        severity: feedbackData.type === "bug" ? feedbackData.severity : undefined,
        userAgent: browserContext.userAgent,
        url: browserContext.url,
        browserInfo: {
          platform: navigator.platform,
          language: navigator.language,
          cookieEnabled: navigator.cookieEnabled,
          onLine: navigator.onLine,
          screenResolution: `${window.screen.width}x${window.screen.height}`,
        },
        // For Phase 2, we'll handle attachments as metadata only
        attachments: feedbackData.attachments?.map((file, index) => ({
          id: `${Date.now()}-${index}`,
          name: file.name,
          type: file.type,
          size: file.size,
          url: `placeholder-url-${index}`, // Will be implemented in Phase 4
        })) || [],
      };

      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };
      
      if (jwtAuthToken) {
        headers.Authorization = `Bearer ${jwtAuthToken}`;
      }

      const response = await fetch(`${apiUrl}/api/feedback/submit`, {
        method: "POST",
        body: JSON.stringify(payload),
        headers,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `HTTP error! status: ${response.status}`);
      }

      setCurrentStep("success");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to submit feedback",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetWidget = () => {
    setCurrentStep("type");
    setFeedbackData({
      type: "bug",
      description: "",
      severity: "medium",
    });
    setError(null);
    setIsSubmitting(false);
  };

  const closeWidget = () => {
    setIsOpen(false);
    resetWidget();
    onClose?.();
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case "type":
        return (
          <div className="animate-in fade-in duration-200">
            <h3 className="text-lg font-semibold mb-5 text-gray-900">
              How can we help you today?
            </h3>
            <div className="flex flex-col gap-3">
              <button
                className="bg-white border-2 border-gray-200 rounded-lg p-5 cursor-pointer transition-all duration-200 text-left flex flex-col gap-2 hover:border-blue-500 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                onClick={() => handleTypeSelection("bug")}
              >
                <span className="text-2xl mb-1">🐛</span>
                <span className="font-medium">Report a Bug</span>
                <span className="text-xs text-gray-500 mt-1">
                  Something isn't working as expected
                </span>
              </button>
              <button
                className="bg-white border-2 border-gray-200 rounded-lg p-5 cursor-pointer transition-all duration-200 text-left flex flex-col gap-2 hover:border-blue-500 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                onClick={() => handleTypeSelection("suggestion")}
              >
                <span className="text-2xl mb-1">💡</span>
                <span className="font-medium">Suggest Improvement</span>
                <span className="text-xs text-gray-500 mt-1">
                  Share ideas for better processes or tools
                </span>
              </button>
            </div>
          </div>
        );

      case "details":
        return (
          <div className="animate-in fade-in duration-200">
            <h3 className="text-lg font-semibold mb-5 text-gray-900">
              {feedbackData.type === "bug"
                ? "Describe the issue"
                : "Share your suggestion"}
            </h3>

            <textarea
              className="w-full min-h-[100px] p-3 border-2 border-gray-200 rounded-md font-inherit text-sm resize-y transition-colors duration-200 mb-5 focus:outline-none focus:border-blue-500 placeholder:text-gray-500"
              placeholder={
                feedbackData.type === "bug"
                  ? "Please describe what happened and what you expected..."
                  : "Tell us about your improvement idea..."
              }
              value={feedbackData.description}
              onChange={(e) => handleDescriptionChange(e.target.value)}
              rows={4}
            />

            {feedbackData.type === "bug" && (
              <div className="mb-5">
                <label className="block mb-2 font-medium text-gray-700">
                  How urgent is this issue?
                </label>
                <div className="flex gap-2 flex-wrap">
                  {(["low", "medium", "high", "critical"] as const).map(
                    (severity) => (
                      <button
                        key={severity}
                        className={`py-2 px-4 border-2 rounded-full cursor-pointer text-xs font-medium transition-all duration-200 capitalize focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                          feedbackData.severity === severity
                            ? "bg-blue-500 border-blue-500 text-white"
                            : "bg-white border-gray-200 text-gray-700 hover:border-blue-500"
                        }`}
                        onClick={() => handleSeverityChange(severity)}
                      >
                        {severity.charAt(0).toUpperCase() + severity.slice(1)}
                      </button>
                    ),
                  )}
                </div>
              </div>
            )}

            <div className="mb-5">
              <label className="block mb-2 font-medium text-gray-700">
                Attach files (optional)
              </label>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx"
                onChange={(e) => handleFileUpload(e.target.files)}
                className="w-full p-2 border-2 border-dashed border-gray-200 rounded-md bg-gray-50 cursor-pointer transition-colors duration-200 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              />
              {feedbackData.attachments &&
                feedbackData.attachments.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {feedbackData.attachments.map((file, index) => (
                      <span
                        key={index}
                        className="bg-gray-200 px-2 py-1 rounded text-xs text-gray-700"
                      >
                        {file.name}
                      </span>
                    ))}
                  </div>
                )}
            </div>

            {error && (
              <div className="bg-red-100 text-red-800 p-3 rounded-md mb-4 text-sm border border-red-200">
                {error}
              </div>
            )}

            <div className="flex gap-3 justify-end mt-6">
              <button
                className="py-3 px-6 bg-gray-100 text-gray-700 border border-gray-200 rounded-md text-sm font-medium cursor-pointer transition-all duration-200 min-w-[100px] hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                onClick={() => setCurrentStep("type")}
              >
                Back
              </button>
              <button
                className="py-3 px-6 bg-blue-500 text-white border-none rounded-md text-sm font-medium cursor-pointer transition-all duration-200 min-w-[100px] hover:bg-blue-600 disabled:bg-gray-500 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                onClick={submitFeedback}
                disabled={isSubmitting || !feedbackData.description.trim()}
              >
                {isSubmitting ? "Submitting..." : "Submit Feedback"}
              </button>
            </div>
          </div>
        );

      case "success":
        return (
          <div className="animate-in fade-in duration-200">
            <div className="text-center py-5">
              <div className="text-5xl mb-4">✅</div>
              <h3 className="text-green-600 mb-3 text-lg font-semibold">
                Thank you for your feedback!
              </h3>
              <p className="text-gray-500 mb-6 leading-relaxed">
                We've received your{" "}
                {feedbackData.type === "bug" ? "bug report" : "suggestion"} and
                will review it soon.
              </p>
              <button
                className="py-3 px-6 bg-blue-500 text-white border-none rounded-md text-sm font-medium cursor-pointer transition-all duration-200 min-w-[100px] hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                onClick={closeWidget}
              >
                Done
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="omni-feedback-widget fixed z-[999999] font-sans text-sm leading-relaxed text-gray-800">
      {/* Floating Action Button */}
      <button
        className="fixed bottom-5 right-5 w-15 h-15 rounded-full border-none cursor-pointer shadow-lg transition-all duration-300 flex items-center justify-center z-[1000000] hover:scale-110 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        style={{ backgroundColor: theme.primaryColor || "#007bff" }}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close feedback widget" : "Open feedback widget"}
      >
        <span className="text-2xl text-white">💬</span>
      </button>

      {/* Widget Modal */}
      {isOpen && (
        <>
          {position === 'center' ? (
            <div className="fixed inset-0  flex items-center justify-center z-[1000001] p-5">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden animate-in zoom-in-95 fade-in duration-300">
                <div className="p-5 pb-4 border-b border-gray-200 flex items-center justify-between">
                  <h2 className="m-0 text-xl font-semibold text-gray-900">
                    Feedback
                  </h2>
                  <button
                    className="bg-none border-none text-2xl cursor-pointer text-gray-500 p-0 w-8 h-8 flex items-center justify-center rounded-md transition-all duration-200 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onClick={closeWidget}
                    aria-label="Close"
                  >
                    ×
                  </button>
                </div>
                <div className="p-6 max-h-[calc(90vh-80px)] overflow-y-auto">
                  {renderStepContent()}
                </div>
              </div>
            </div>
          ) : (
            <div className="fixed bottom-20 right-5 z-[1000001] w-96 max-w-[calc(100vw-40px)]">
              <div className="bg-white rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-300 max-h-[calc(100vh-140px)]">
                <div className="p-5 pb-4 border-b border-gray-200 flex items-center justify-between">
                  <h2 className="m-0 text-xl font-semibold text-gray-900">
                    Feedback
                  </h2>
                  <button
                    className="bg-none border-none text-2xl cursor-pointer text-gray-500 p-0 w-8 h-8 flex items-center justify-center rounded-md transition-all duration-200 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onClick={closeWidget}
                    aria-label="Close"
                  >
                    ×
                  </button>
                </div>
                <div className="p-6 max-h-[calc(100vh-220px)] overflow-y-auto">
                  {renderStepContent()}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default OmniFeedbackWidget;
