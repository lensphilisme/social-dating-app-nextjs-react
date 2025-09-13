import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedAdminSystem() {
  console.log('🌱 Seeding admin system...');

  // Create default admin settings
  const defaultSettings = [
    {
      key: 'site_name',
      value: 'NextMatch',
      description: 'The name of the dating site',
      category: 'general',
      isPublic: true
    },
    {
      key: 'site_description',
      value: 'A modern dating platform for meaningful connections',
      description: 'Site description for SEO and branding',
      category: 'general',
      isPublic: true
    },
    {
      key: 'max_photos_per_user',
      value: '10',
      description: 'Maximum number of photos a user can upload',
      category: 'media',
      isPublic: false
    },
    {
      key: 'max_video_size_mb',
      value: '50',
      description: 'Maximum video file size in MB',
      category: 'media',
      isPublic: false
    },
    {
      key: 'max_audio_duration_seconds',
      value: '300',
      description: 'Maximum audio recording duration in seconds',
      category: 'media',
      isPublic: false
    },
    {
      key: 'auto_approve_photos',
      value: 'false',
      description: 'Whether to auto-approve photos or require manual moderation',
      category: 'moderation',
      isPublic: false
    },
    {
      key: 'require_email_verification',
      value: 'true',
      description: 'Whether email verification is required for new users',
      category: 'auth',
      isPublic: false
    },
    {
      key: 'maintenance_mode',
      value: 'false',
      description: 'Enable maintenance mode to disable site access',
      category: 'system',
      isPublic: false
    },
    {
      key: 'registration_enabled',
      value: 'true',
      description: 'Allow new user registrations',
      category: 'auth',
      isPublic: false
    },
    {
      key: 'default_theme',
      value: 'modern',
      description: 'Default theme for new users',
      category: 'theme',
      isPublic: true
    },
    // Navigation Settings
    {
      key: 'nav_home_visible',
      value: 'true',
      description: 'Show Home link in navigation',
      category: 'navigation',
      isPublic: false
    },
    {
      key: 'nav_discover_visible',
      value: 'true',
      description: 'Show Discover link in navigation',
      category: 'navigation',
      isPublic: false
    },
    {
      key: 'nav_matches_visible',
      value: 'true',
      description: 'Show Matches link in navigation',
      category: 'navigation',
      isPublic: false
    },
    {
      key: 'nav_messages_visible',
      value: 'true',
      description: 'Show Messages link in navigation',
      category: 'navigation',
      isPublic: false
    },
    {
      key: 'nav_members_visible',
      value: 'true',
      description: 'Show Members link in navigation',
      category: 'navigation',
      isPublic: false
    },
    {
      key: 'nav_favorites_visible',
      value: 'true',
      description: 'Show Favorites link in navigation',
      category: 'navigation',
      isPublic: false
    },
    {
      key: 'nav_questions_visible',
      value: 'true',
      description: 'Show Questions link in navigation',
      category: 'navigation',
      isPublic: false
    },
    {
      key: 'nav_reports_visible',
      value: 'true',
      description: 'Show Reports link in navigation',
      category: 'navigation',
      isPublic: false
    },
    // Navigation Order Settings
    {
      key: 'nav_home_order',
      value: '1',
      description: 'Display order for Home link in navigation',
      category: 'navigation',
      isPublic: false
    },
    {
      key: 'nav_discover_order',
      value: '2',
      description: 'Display order for Discover link in navigation',
      category: 'navigation',
      isPublic: false
    },
    {
      key: 'nav_matches_order',
      value: '3',
      description: 'Display order for Matches link in navigation',
      category: 'navigation',
      isPublic: false
    },
    {
      key: 'nav_messages_order',
      value: '4',
      description: 'Display order for Messages link in navigation',
      category: 'navigation',
      isPublic: false
    },
    {
      key: 'nav_members_order',
      value: '5',
      description: 'Display order for Members link in navigation',
      category: 'navigation',
      isPublic: false
    },
    {
      key: 'nav_favorites_order',
      value: '6',
      description: 'Display order for Favorites link in navigation',
      category: 'navigation',
      isPublic: false
    },
    {
      key: 'nav_questions_order',
      value: '7',
      description: 'Display order for Questions link in navigation',
      category: 'navigation',
      isPublic: false
    },
    {
      key: 'nav_reports_order',
      value: '8',
      description: 'Display order for Reports link in navigation',
      category: 'navigation',
      isPublic: false
    },
    // Additional Navigation Items
    {
      key: 'nav_match_requests_visible',
      value: 'true',
      description: 'Show Match Requests link in navigation',
      category: 'navigation',
      isPublic: false
    },
    {
      key: 'nav_match_requests_order',
      value: '9',
      description: 'Display order for Match Requests link in navigation',
      category: 'navigation',
      isPublic: false
    },
    {
      key: 'nav_dashboard_visible',
      value: 'true',
      description: 'Show Dashboard link in navigation',
      category: 'navigation',
      isPublic: false
    },
    {
      key: 'nav_dashboard_order',
      value: '10',
      description: 'Display order for Dashboard link in navigation',
      category: 'navigation',
      isPublic: false
    },
    {
      key: 'nav_settings_visible',
      value: 'true',
      description: 'Show Settings link in navigation',
      category: 'navigation',
      isPublic: false
    },
    {
      key: 'nav_settings_order',
      value: '11',
      description: 'Display order for Settings link in navigation',
      category: 'navigation',
      isPublic: false
    },
    // Announcement Settings
    {
      key: 'announcements_enabled',
      value: 'true',
      description: 'Enable announcement system',
      category: 'announcements',
      isPublic: false
    },
    {
      key: 'announcements_default_delay',
      value: '5',
      description: 'Default delay in seconds before showing announcements after login',
      category: 'announcements',
      isPublic: false
    },
    {
      key: 'announcements_default_duration',
      value: '10',
      description: 'Default duration in seconds to show each announcement',
      category: 'announcements',
      isPublic: false
    },
    {
      key: 'announcements_max_concurrent',
      value: '3',
      description: 'Maximum number of concurrent announcements',
      category: 'announcements',
      isPublic: false
    },
    {
      key: 'announcements_auto_expire',
      value: 'true',
      description: 'Automatically expire announcements after end date',
      category: 'announcements',
      isPublic: false
    },
    // Report Management Settings
    {
      key: 'auto_ban_enabled',
      value: 'false',
      description: 'Enable automatic user banning based on report count',
      category: 'reports',
      isPublic: false
    },
    {
      key: 'auto_ban_report_threshold',
      value: '5',
      description: 'Number of reports required for automatic ban',
      category: 'reports',
      isPublic: false
    },
    {
      key: 'auto_ban_duration_days',
      value: '7',
      description: 'Duration of automatic ban in days (0 for permanent)',
      category: 'reports',
      isPublic: false
    },
    {
      key: 'auto_unban_enabled',
      value: 'false',
      description: 'Enable automatic unbanning after ban duration expires',
      category: 'reports',
      isPublic: false
    },
    {
      key: 'report_auto_resolve_hours',
      value: '72',
      description: 'Hours after which unresolved reports are automatically closed',
      category: 'reports',
      isPublic: false
    },
    // Announcement Settings
    {
      key: 'announcements_enabled',
      value: 'true',
      description: 'Enable system announcements feature',
      category: 'announcements',
      isPublic: false
    },
    {
      key: 'announcement_max_duration_days',
      value: '30',
      description: 'Maximum duration an announcement can be active (days)',
      category: 'announcements',
      isPublic: false
    },
    {
      key: 'announcement_auto_expire',
      value: 'true',
      description: 'Automatically expire announcements after max duration',
      category: 'announcements',
      isPublic: false
    },
    {
      key: 'announcement_max_concurrent',
      value: '3',
      description: 'Maximum number of concurrent active announcements',
      category: 'announcements',
      isPublic: false
    },
    // User Management Settings
    {
      key: 'user_verification_required',
      value: 'false',
      description: 'Require manual verification for new users',
      category: 'users',
      isPublic: false
    },
    {
      key: 'user_auto_approve',
      value: 'true',
      description: 'Automatically approve new user registrations',
      category: 'users',
      isPublic: false
    },
    {
      key: 'user_profile_completion_required',
      value: 'true',
      description: 'Require users to complete their profile before using the app',
      category: 'users',
      isPublic: false
    },
    {
      key: 'user_age_verification_required',
      value: 'true',
      description: 'Require age verification for user registration',
      category: 'users',
      isPublic: false
    },
    {
      key: 'user_minimum_age',
      value: '18',
      description: 'Minimum age required for user registration',
      category: 'users',
      isPublic: false
    },
    // Matching Settings
    {
      key: 'matching_algorithm',
      value: 'location_based',
      description: 'Matching algorithm to use (location_based, interest_based, hybrid)',
      category: 'matching',
      isPublic: false
    },
    {
      key: 'matching_max_distance_km',
      value: '50',
      description: 'Maximum distance for location-based matching (km)',
      category: 'matching',
      isPublic: false
    },
    {
      key: 'matching_age_range_flexibility',
      value: '5',
      description: 'Age range flexibility for matching (years)',
      category: 'matching',
      isPublic: false
    },
    {
      key: 'matching_require_mutual_like',
      value: 'true',
      description: 'Require mutual likes before allowing messaging',
      category: 'matching',
      isPublic: false
    },
    // Security Settings
    {
      key: 'security_enable_2fa',
      value: 'false',
      description: 'Enable two-factor authentication for admin users',
      category: 'security',
      isPublic: false
    },
    {
      key: 'security_session_timeout_minutes',
      value: '60',
      description: 'Session timeout in minutes for admin users',
      category: 'security',
      isPublic: false
    },
    {
      key: 'security_max_login_attempts',
      value: '5',
      description: 'Maximum login attempts before account lockout',
      category: 'security',
      isPublic: false
    },
    {
      key: 'security_enable_ip_whitelist',
      value: 'false',
      description: 'Enable IP whitelist for admin access',
      category: 'security',
      isPublic: false
    },
    // Notification Settings
    {
      key: 'notifications_email_enabled',
      value: 'true',
      description: 'Enable email notifications',
      category: 'notifications',
      isPublic: false
    },
    {
      key: 'notifications_push_enabled',
      value: 'true',
      description: 'Enable push notifications',
      category: 'notifications',
      isPublic: false
    },
    {
      key: 'notifications_sms_enabled',
      value: 'false',
      description: 'Enable SMS notifications',
      category: 'notifications',
      isPublic: false
    },
    {
      key: 'notifications_digest_frequency',
      value: 'daily',
      description: 'Frequency of notification digests (hourly, daily, weekly)',
      category: 'notifications',
      isPublic: false
    }
  ];

  for (const setting of defaultSettings) {
    await prisma.adminSettings.upsert({
      where: { key: setting.key },
      update: setting,
      create: setting
    });
  }

  // Create default themes
  const defaultThemes = [
    {
      name: 'modern',
      displayName: 'Modern',
      description: 'Clean, modern design with purple accents',
      isActive: true,
      isDefault: true,
      config: {
        colors: {
          primary: '#8B5CF6',
          secondary: '#EC4899',
          accent: '#06B6D4',
          background: '#FFFFFF',
          surface: '#F8FAFC',
          text: '#1F2937',
          textSecondary: '#6B7280'
        },
        fonts: {
          primary: 'Inter',
          secondary: 'Inter',
          heading: 'Inter'
        },
        spacing: {
          xs: '0.25rem',
          sm: '0.5rem',
          md: '1rem',
          lg: '1.5rem',
          xl: '2rem'
        },
        borderRadius: {
          sm: '0.375rem',
          md: '0.5rem',
          lg: '0.75rem',
          xl: '1rem'
        }
      }
    },
    {
      name: 'classic',
      displayName: 'Classic',
      description: 'Traditional design with blue accents',
      isActive: false,
      isDefault: false,
      config: {
        colors: {
          primary: '#3B82F6',
          secondary: '#1E40AF',
          accent: '#F59E0B',
          background: '#FFFFFF',
          surface: '#F1F5F9',
          text: '#1E293B',
          textSecondary: '#64748B'
        },
        fonts: {
          primary: 'Roboto',
          secondary: 'Roboto',
          heading: 'Roboto'
        },
        spacing: {
          xs: '0.25rem',
          sm: '0.5rem',
          md: '1rem',
          lg: '1.5rem',
          xl: '2rem'
        },
        borderRadius: {
          sm: '0.25rem',
          md: '0.375rem',
          lg: '0.5rem',
          xl: '0.75rem'
        }
      }
    },
    {
      name: 'dark',
      displayName: 'Dark Mode',
      description: 'Dark theme with neon accents',
      isActive: false,
      isDefault: false,
      config: {
        colors: {
          primary: '#A855F7',
          secondary: '#EC4899',
          accent: '#10B981',
          background: '#0F172A',
          surface: '#1E293B',
          text: '#F1F5F9',
          textSecondary: '#94A3B8'
        },
        fonts: {
          primary: 'Inter',
          secondary: 'Inter',
          heading: 'Inter'
        },
        spacing: {
          xs: '0.25rem',
          sm: '0.5rem',
          md: '1rem',
          lg: '1.5rem',
          xl: '2rem'
        },
        borderRadius: {
          sm: '0.375rem',
          md: '0.5rem',
          lg: '0.75rem',
          xl: '1rem'
        }
      }
    }
  ];

  for (const theme of defaultThemes) {
    await prisma.theme.upsert({
      where: { name: theme.name },
      update: theme,
      create: theme
    });
  }

  // Create default moderation rules
  const defaultModerationRules = [
    {
      name: 'Inappropriate Language',
      description: 'Detect and flag inappropriate language in messages and profiles',
      type: 'INAPPROPRIATE_CONTENT' as const,
      pattern: '\\b(fuck|shit|bitch|asshole|damn|hell)\\b',
      action: 'FLAG' as const,
      severity: 'MEDIUM' as const,
      isActive: true,
      config: {
        caseSensitive: false,
        wholeWord: true
      }
    },
    {
      name: 'Spam Detection',
      description: 'Detect spam patterns in messages',
      type: 'SPAM' as const,
      pattern: '(buy|sell|click|free|money|win|prize)',
      action: 'FLAG' as const,
      severity: 'HIGH' as const,
      isActive: true,
      config: {
        caseSensitive: false,
        wholeWord: false
      }
    },
    {
      name: 'Contact Information',
      description: 'Detect attempts to share contact information',
      type: 'INAPPROPRIATE_CONTENT' as const,
      pattern: '(phone|email|whatsapp|telegram|instagram|facebook|twitter)',
      action: 'WARN_USER' as const,
      severity: 'LOW' as const,
      isActive: true,
      config: {
        caseSensitive: false,
        wholeWord: false
      }
    }
  ];

  for (const rule of defaultModerationRules) {
    await prisma.contentModerationRule.create({
      data: rule
    });
  }

  // Create default admin dashboard
  const defaultDashboard = {
    name: 'Main Dashboard',
    description: 'Default admin dashboard with key metrics and controls',
    isDefault: true,
    isPublic: false,
    config: {
      widgets: [
        {
          id: 'user_stats',
          type: 'stats',
          title: 'User Statistics',
          position: { x: 0, y: 0, w: 6, h: 4 },
          config: {
            metrics: ['total_users', 'active_users', 'new_users_today', 'verified_users']
          }
        },
        {
          id: 'moderation_queue',
          type: 'queue',
          title: 'Moderation Queue',
          position: { x: 6, y: 0, w: 6, h: 4 },
          config: {
            types: ['PHOTO', 'MESSAGE', 'PROFILE'],
            limit: 10
          }
        },
        {
          id: 'recent_activity',
          type: 'activity',
          title: 'Recent Activity',
          position: { x: 0, y: 4, w: 12, h: 4 },
          config: {
            limit: 20
          }
        }
      ]
    }
  };

  await prisma.adminDashboard.create({
    data: defaultDashboard
  });

  console.log('✅ Admin system seeded successfully!');
}

export default seedAdminSystem;
