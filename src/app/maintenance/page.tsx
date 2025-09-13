import { getAdminSettings } from '@/app/actions/adminSystemActions';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function MaintenancePage() {
  const settings = await getAdminSettings('system');
  const maintenanceMode = settings.find((s: any) => s.key === 'maintenance_mode')?.value === 'true';
  
  if (!maintenanceMode) {
    // Redirect to login if maintenance mode is not enabled
    redirect('/auth/signin');
  }

  const siteName = settings.find((s: any) => s.key === 'site_name')?.value || 'LoveConnect';
  const siteDescription = settings.find((s: any) => s.key === 'site_description')?.value || 'We are currently performing maintenance. Please check back soon.';

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-red-500 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        {/* Logo */}
        <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
          </svg>
        </div>

        {/* Site Name */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {siteName}
        </h1>

        {/* Maintenance Message */}
        <div className="mb-8">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            We&apos;re Under Maintenance
          </h2>
          <p className="text-gray-600 leading-relaxed">
            {siteDescription}
          </p>
        </div>

        {/* Status */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">Maintenance in progress</span>
          </div>
        </div>

        {/* Footer */}
        <div className="text-xs text-gray-500">
          <p>Thank you for your patience</p>
          <p className="mt-1">We&apos;ll be back online shortly</p>
        </div>
      </div>
    </div>
  );
}
