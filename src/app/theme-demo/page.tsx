import { getActiveTheme } from '@/app/actions/adminSystemActions';
import { getThemes } from '@/app/actions/adminSystemActions';

export default async function ThemeDemoPage() {
  const activeTheme = await getActiveTheme();
  const themes = await getThemes();

  return (
    <div className="min-h-screen bg-background text-text p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gradient mb-8">
          Dynamic Theme System Demo
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Current Theme Info */}
          <div className="card">
            <h2 className="text-2xl font-semibold mb-4">Current Active Theme</h2>
            {activeTheme ? (
              <div>
                <h3 className="text-xl font-medium mb-2">{activeTheme.displayName}</h3>
                <p className="text-text-secondary mb-4">{activeTheme.description}</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Colors:</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: activeTheme.config.colors.primary }}
                        ></div>
                        <span className="text-sm">Primary: {activeTheme.config.colors.primary}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: activeTheme.config.colors.secondary }}
                        ></div>
                        <span className="text-sm">Secondary: {activeTheme.config.colors.secondary}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: activeTheme.config.colors.accent }}
                        ></div>
                        <span className="text-sm">Accent: {activeTheme.config.colors.accent}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Fonts:</h4>
                    <div className="space-y-1 text-sm">
                      <div>Primary: {activeTheme.config.fonts.primary}</div>
                      <div>Secondary: {activeTheme.config.fonts.secondary}</div>
                      <div>Heading: {activeTheme.config.fonts.heading}</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-text-secondary">No active theme found</p>
            )}
          </div>

          {/* Theme Controls */}
          <div className="card">
            <h2 className="text-2xl font-semibold mb-4">Available Themes</h2>
            <div className="space-y-3">
              {themes.map((theme: any) => (
                <div key={theme.id} className="flex items-center justify-between p-3 bg-surface rounded-lg">
                  <div>
                    <h3 className="font-medium">{theme.displayName}</h3>
                    <p className="text-sm text-text-secondary">{theme.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <div 
                      className="w-6 h-6 rounded"
                      style={{ backgroundColor: theme.config.colors.primary }}
                      title={`Primary: ${theme.config.colors.primary}`}
                    ></div>
                    <div 
                      className="w-6 h-6 rounded"
                      style={{ backgroundColor: theme.config.colors.secondary }}
                      title={`Secondary: ${theme.config.colors.secondary}`}
                    ></div>
                    <div 
                      className="w-6 h-6 rounded"
                      style={{ backgroundColor: theme.config.colors.accent }}
                      title={`Accent: ${theme.config.colors.accent}`}
                    ></div>
                    {theme.isActive && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        Active
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Demo Components */}
        <div className="space-y-8">
          <h2 className="text-3xl font-bold">Theme in Action</h2>
          
          {/* Buttons Demo */}
          <div className="card">
            <h3 className="text-xl font-semibold mb-4">Buttons</h3>
            <div className="flex flex-wrap gap-4">
              <button className="btn-primary">Primary Button</button>
              <button className="btn-secondary">Secondary Button</button>
              <button className="btn-ghost">Ghost Button</button>
            </div>
          </div>

          {/* Cards Demo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card">
              <h3 className="text-lg font-semibold mb-2">Regular Card</h3>
              <p className="text-text-secondary">
                This card uses the current theme&apos;s background and text colors.
              </p>
            </div>
            <div className="card-gradient">
              <h3 className="text-lg font-semibold mb-2">Gradient Card</h3>
              <p className="text-text-secondary">
                This card uses a gradient background with the theme colors.
              </p>
            </div>
            <div className="card">
              <h3 className="text-lg font-semibold mb-2 text-gradient">Gradient Text</h3>
              <p className="text-text-secondary">
                This text uses a gradient effect with the theme&apos;s primary and secondary colors.
              </p>
            </div>
          </div>

          {/* Form Demo */}
          <div className="card">
            <h3 className="text-xl font-semibold mb-4">Form Elements</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Input Field</label>
                <input 
                  type="text" 
                  placeholder="Type something..." 
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Textarea</label>
                <textarea 
                  placeholder="Enter your message..." 
                  className="input h-20 resize-none"
                ></textarea>
              </div>
            </div>
          </div>

          {/* Color Palette Demo */}
          <div className="card">
            <h3 className="text-xl font-semibold mb-4">Color Palette</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <h4 className="font-medium mb-2">Primary</h4>
                <div className="space-y-1">
                  {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].map((shade) => (
                    <div key={shade} className="flex items-center gap-2">
                      <div 
                        className="w-8 h-4 rounded"
                        style={{ backgroundColor: `var(--primary-${shade})` }}
                      ></div>
                      <span className="text-xs">{shade}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Secondary</h4>
                <div className="space-y-1">
                  {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].map((shade) => (
                    <div key={shade} className="flex items-center gap-2">
                      <div 
                        className="w-8 h-4 rounded"
                        style={{ backgroundColor: `var(--secondary-${shade})` }}
                      ></div>
                      <span className="text-xs">{shade}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Accent</h4>
                <div className="space-y-1">
                  {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].map((shade) => (
                    <div key={shade} className="flex items-center gap-2">
                      <div 
                        className="w-8 h-4 rounded"
                        style={{ backgroundColor: `var(--accent-${shade})` }}
                      ></div>
                      <span className="text-xs">{shade}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Background</h4>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-8 h-4 rounded border"
                      style={{ backgroundColor: 'var(--background)' }}
                    ></div>
                    <span className="text-xs">Background</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-8 h-4 rounded border"
                      style={{ backgroundColor: 'var(--surface)' }}
                    ></div>
                    <span className="text-xs">Surface</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

