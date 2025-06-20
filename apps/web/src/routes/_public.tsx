import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";

export const Route = createFileRoute("/_public")({
  component: PublicLayout,
});

function PublicLayout() {
  const location = useLocation();

  const publicLinks = [
    { to: "/board", label: "Board" },
    { to: "/roadmap", label: "Roadmap" },
    { to: "/changelog", label: "Changelog" },
  ];

  return (
    <div className="flex h-full flex-col items-center">
      {/* Navigation Header */}
      <nav className="w-[60rem] flex justify-between items-center gap-4 p-4">
        {/* Mobile Menu Button
        <div className="block sm:hidden">
          <button className="p-2 rounded-full bg-gray-50 text-gray-700 shadow-sm hover:bg-gray-100 transition-colors">
            <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path 
                fill="none" 
                stroke="currentColor" 
                strokeLinecap="round" 
                strokeWidth="2" 
                d="M3 6h18M3 12h8m-8 6h13"
              />
            </svg>
          </button>
        </div> */}

        {/* Logo and Navigation Links */}
        <div className="flex items-center justify-center gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-lg overflow-hidden bg-transparent">
              <img 
                alt="UserJot Logo" 
                className="w-full h-full object-cover transition-opacity duration-200" 
                src="https://cdn.userjot.com/img/01ivoikltj8uzcg0yh9gqz2r3u3pjoxv4s9f.jpeg"
              />
            </div>
            <div className="hidden xs:block">
              <span className="text-lg font-medium text-gray-900">UserJot</span>
            </div>
          </Link>

          {/* Separator */}
          <div className="hidden sm:block w-px h-6 bg-gray-300"></div>

          {/* Navigation Links */}
          <div className="hidden sm:flex items-center gap-1">
            <Link 
              to="/board" 
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                location.pathname.includes('/board') 
                  ? 'bg-gray-100 text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Feedback
            </Link>

            <Link 
              to="/roadmap" 
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                location.pathname === '/roadmap' 
                  ? 'bg-gray-100 text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Roadmap
            </Link>

            <Link 
              to="/board" 
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                location.pathname === '/updates' 
                  ? 'bg-gray-100 text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Updates
            </Link>
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex justify-end">
          <div className="flex items-center gap-2">
            {/* Notification/Inbox Button */}
            <button className="p-2 rounded-full bg-gray-50 text-gray-700 shadow-sm hover:bg-gray-100 transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path 
                  opacity="0.12" 
                  fill="currentColor" 
                  d="m21.51 15.94.48-1.95H18.7c-.63 0-.94 0-1.23.08-.26.07-.49.2-.69.36-.23.18-.41.44-.76.97l-.1.15c-.35.52-.53.78-.76.97-.21.16-.44.29-.69.36-.29.08-.6.08-1.23.08h-2.58c-.63 0-.94 0-1.23-.09-.26-.08-.49-.21-.69-.37-.23-.19-.41-.45-.76-.98l-.11-.15c-.35-.53-.53-.79-.76-.98-.21-.17-.44-.3-.69-.37-.29-.09-.6-.09-1.23-.09H1.9l.48 1.94c.54 2.16.81 3.25 1.41 4.05.53.71 1.24 1.26 2.06 1.61.92.39 2.04.39 4.27.39h3.5c2.23 0 3.35 0 4.27-.4.81-.35 1.53-.91 2.06-1.62.6-.81.87-1.89 1.41-4.06Z"
                />
                <path 
                  fill="none" 
                  stroke="currentColor" 
                  strokeLinecap="round" 
                  strokeWidth="2" 
                  d="M2.49 14h2.78c.62 0 .93 0 1.22.08.25.07.48.2.68.36.22.18.4.44.75.97l.1.15c.34.52.52.78.75.97.2.16.43.29.68.36.28.08.59.08 1.22.08h2.57c.62 0 .93 0 1.22-.09.25-.08.48-.21.68-.37.22-.19.4-.45.75-.98l.1-.15c.34-.53.52-.79.75-.98.2-.17.43-.3.68-.37.28-.09.59-.09 1.22-.09h2.78m-12.5-7h6m-5 4h4M3.4 7.99l-.62 2.46c-.15.56-.22.84-.27 1.12-.32 1.55-.32 3.15-.01 4.7.05.28.12.56.26 1.12v0c.17.69.26 1.04.38 1.34.66 1.69 2.2 2.89 4.01 3.13.31.04.68.04 1.4.04h6.67c.72 0 1.08 0 1.4-.05a5.03 5.03 0 0 0 4.01-3.14c.11-.31.2-.66.38-1.35v0c.14-.57.21-.85.26-1.13.31-1.56.31-3.16 0-4.71-.06-.29-.13-.57-.27-1.13l-.62-2.47c-.55-2.17-.82-3.26-1.42-4.06a5.051 5.051 0 0 0-2.07-1.62c-.93-.4-2.05-.4-4.28-.4H11.1c-2.24 0-3.35 0-4.28.39-.82.34-1.54.9-2.07 1.61-.61.8-.88 1.88-1.42 4.05Z"
                />
              </svg>
            </button>

            {/* User Avatar Button */}
            <button className="p-0.5 rounded-full border border-gray-200 bg-gray-50 shadow-sm hover:bg-gray-100 transition-colors">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200">
                <img 
                  alt="User Avatar" 
                  className="w-full h-full object-cover transition-opacity duration-200" 
                  src="https://img.userjot.com/img/s_64x64,f_webp/https://cdn.userjot.com/img/vlw2klbsw2kf4ukgtswk837f"
                />
              </div>
            </button>
          </div>
        </div>
      </nav>
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
