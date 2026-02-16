'use client'

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-dark-950 p-8">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
            Critical Thinking Network
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            A minimalistic, clean interface for academic discourse and resource sharing
          </p>
        </div>

        {/* Typography Showcase */}
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Typography Showcase
            </h2>
            <div className="space-y-4">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
                Heading 1 - Bold & Impactful
              </h1>
              <h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">
                Heading 2 - Clear Hierarchy
              </h2>
              <h3 className="text-2xl font-medium text-gray-900 dark:text-gray-100">
                Heading 3 - Structured Content
              </h3>
              <h4 className="text-xl font-medium text-gray-900 dark:text-gray-100">
                Heading 4 - Subtle Emphasis
              </h4>
              <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                Body text with Inter font family provides excellent readability and a clean, modern appearance. 
                The carefully chosen font weights and letter spacing create a harmonious reading experience 
                that reduces eye strain during long reading sessions.
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Small text for captions, metadata, and secondary information maintains clarity at reduced sizes.
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                Extra small text for fine print and minimal details.
              </p>
            </div>
          </div>

          {/* UI Components */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              UI Components
            </h2>
            <div className="space-y-6">
              {/* Buttons */}
              <div className="space-y-3">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Buttons</h3>
                <div className="flex flex-wrap gap-3">
                  <button className="btn-primary">Primary Button</button>
                  <button className="btn-secondary">Secondary Button</button>
                  <button className="btn-ghost">Ghost Button</button>
                </div>
              </div>

              {/* Cards */}
              <div className="space-y-3">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Cards</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="card p-6">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      Discussion Post
                    </h4>
                    <p className="text-gray-700 dark:text-gray-300 mb-3">
                      This is an example of how a discussion post would look with our minimalistic typography.
                    </p>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <span>@username</span>
                      <span className="mx-2">•</span>
                      <span>2 hours ago</span>
                    </div>
                  </div>
                  <div className="card p-6">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      Resource Card
                    </h4>
                    <p className="text-gray-700 dark:text-gray-300 mb-3">
                      Academic resources are displayed with clear hierarchy and readable typography.
                    </p>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <span>Computer Science</span>
                      <span className="mx-2">•</span>
                      <span>PDF</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Elements */}
              <div className="space-y-3">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Form Elements</h3>
                <div className="space-y-4 max-w-md">
                  <input 
                    type="text" 
                    placeholder="Username" 
                    className="input"
                  />
                  <input 
                    type="email" 
                    placeholder="Email address" 
                    className="input"
                  />
                  <textarea 
                    placeholder="Write your thoughts..." 
                    rows={3}
                    className="textarea"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Color Palette */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Color Palette
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="w-full h-16 bg-primary-600 rounded-lg"></div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Primary</p>
                <p className="text-xs text-gray-500">#1d9bf0</p>
              </div>
              <div className="space-y-2">
                <div className="w-full h-16 bg-gray-900 dark:bg-gray-100 rounded-lg"></div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Text</p>
                <p className="text-xs text-gray-500">#111827</p>
              </div>
              <div className="space-y-2">
                <div className="w-full h-16 bg-gray-500 rounded-lg"></div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Secondary</p>
                <p className="text-xs text-gray-500">#6b7280</p>
              </div>
              <div className="space-y-2">
                <div className="w-full h-16 bg-gray-200 dark:bg-dark-800 rounded-lg border border-gray-300 dark:border-dark-700"></div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Background</p>
                <p className="text-xs text-gray-500">#f3f4f6</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="text-center pt-8 border-t border-gray-200 dark:border-dark-800">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Ready to explore the full application?
            </p>
            <div className="flex justify-center gap-4">
              <a href="/auth/login" className="btn-primary">
                Sign In
              </a>
              <a href="/auth/register" className="btn-secondary">
                Register
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}