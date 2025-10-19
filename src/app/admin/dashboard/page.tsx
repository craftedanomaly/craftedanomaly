'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase/client';
import { 
  FolderOpen, 
  Image as ImageIcon, 
  MessageSquare, 
  Eye,
  TrendingUp,
  Activity,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface DashboardStats {
  totalProjects: number;
  publishedProjects: number;
  draftProjects: number;
  totalMessages: number;
  unreadMessages: number;
  totalMedia: number;
  heroSlides: number;
}

interface RecentActivity {
  id: string;
  action: string;
  details: string;
  created_at: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    publishedProjects: 0,
    draftProjects: 0,
    totalMessages: 0,
    unreadMessages: 0,
    totalMedia: 0,
    heroSlides: 0,
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check Supabase session
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error || !session) {
          localStorage.removeItem('admin_authenticated');
          router.push('/admin');
        } else {
          localStorage.setItem('admin_authenticated', 'true');
          setIsChecking(false);
          fetchDashboardData();
        }
      } catch (error) {
        console.error('Auth check error:', error);
        router.push('/admin');
      }
    };

    checkAuth();
  }, [router]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // Fetch projects stats
      const { data: projects } = await supabase
        .from('projects')
        .select('status');

      // Fetch messages stats
      const { data: messages } = await supabase
        .from('contact_messages')
        .select('status');

      // Fetch media stats
      const { data: media } = await supabase
        .from('media')
        .select('id');

      // Fetch hero slides stats
      const { data: heroSlides } = await supabase
        .from('hero_slides')
        .select('id');

      // Fetch recent projects for activity
      const { data: recentProjects } = await supabase
        .from('projects')
        .select('id, title, status, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      // Fetch recent messages for activity
      const { data: recentMessages } = await supabase
        .from('contact_messages')
        .select('id, name, created_at')
        .order('created_at', { ascending: false })
        .limit(3);

      // Calculate stats
      const totalProjects = projects?.length || 0;
      const publishedProjects = projects?.filter(p => p.status === 'published').length || 0;
      const draftProjects = projects?.filter(p => p.status === 'draft').length || 0;
      const totalMessages = messages?.length || 0;
      const unreadMessages = messages?.filter(m => m.status === 'unread').length || 0;

      setStats({
        totalProjects,
        publishedProjects,
        draftProjects,
        totalMessages,
        unreadMessages,
        totalMedia: media?.length || 0,
        heroSlides: heroSlides?.length || 0,
      });

      // Create recent activities
      const activities: RecentActivity[] = [];
      
      // Add recent projects
      recentProjects?.forEach(project => {
        activities.push({
          id: project.id,
          action: project.status === 'published' ? 'Project published' : 'Project created',
          details: project.title,
          created_at: project.created_at,
        });
      });

      // Add recent messages
      recentMessages?.forEach(message => {
        activities.push({
          id: message.id,
          action: 'New message received',
          details: `From ${message.name}`,
          created_at: message.created_at,
        });
      });

      // Sort by date and take latest 6
      activities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setRecentActivities(activities.slice(0, 6));

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your portfolio.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0 }}
            className="bg-card border border-border rounded-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <FolderOpen className="h-8 w-8 text-blue-500" />
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-1">
              {isLoading ? '...' : stats.totalProjects}
            </h3>
            <p className="text-sm text-muted-foreground mb-2">Total Projects</p>
            <p className="text-xs text-accent">
              {stats.publishedProjects} published, {stats.draftProjects} drafts
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card border border-border rounded-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <MessageSquare className="h-8 w-8 text-green-500" />
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-1">
              {isLoading ? '...' : stats.totalMessages}
            </h3>
            <p className="text-sm text-muted-foreground mb-2">Messages</p>
            <p className="text-xs text-accent">
              {stats.unreadMessages} unread
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card border border-border rounded-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <ImageIcon className="h-8 w-8 text-purple-500" />
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-1">
              {isLoading ? '...' : stats.totalMedia}
            </h3>
            <p className="text-sm text-muted-foreground mb-2">Media Files</p>
            <p className="text-xs text-accent">Images & videos</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card border border-border rounded-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <Eye className="h-8 w-8 text-orange-500" />
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-1">
              {isLoading ? '...' : stats.heroSlides}
            </h3>
            <p className="text-sm text-muted-foreground mb-2">Hero Slides</p>
            <p className="text-xs text-accent">Homepage carousel</p>
          </motion.div>
        </div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card border border-border rounded-lg p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-foreground">Recent Activity</h2>
            <Activity className="h-5 w-5 text-muted-foreground" />
          </div>
          
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading activities...</p>
              </div>
            ) : recentActivities.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No recent activities</p>
              </div>
            ) : (
              recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start space-x-4 p-4 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="w-2 h-2 rounded-full bg-accent mt-2" />
                  <div className="flex-1">
                    <p className="text-foreground font-medium">{activity.action}</p>
                    <p className="text-sm text-muted-foreground">{activity.details}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                  </span>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8"
        >
          <Link href="/admin/projects">
            <div className="bg-card border border-border rounded-lg p-6 hover:border-accent transition-colors cursor-pointer group">
              <FolderOpen className="h-8 w-8 text-accent mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-foreground mb-2">Manage Projects</h3>
              <p className="text-sm text-muted-foreground">
                Create and publish new portfolio projects
              </p>
              <Button className="mt-4 w-full" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Go to Projects
              </Button>
            </div>
          </Link>

          <Link href="/admin/hero">
            <div className="bg-card border border-border rounded-lg p-6 hover:border-accent transition-colors cursor-pointer group">
              <ImageIcon className="h-8 w-8 text-accent mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-foreground mb-2">Hero Carousel</h3>
              <p className="text-sm text-muted-foreground">
                Manage homepage hero slides and media
              </p>
              <Button className="mt-4 w-full" size="sm" variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                Manage Slides
              </Button>
            </div>
          </Link>

          <Link href="/admin/messages">
            <div className="bg-card border border-border rounded-lg p-6 hover:border-accent transition-colors cursor-pointer group">
              <MessageSquare className="h-8 w-8 text-accent mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-foreground mb-2">View Messages</h3>
              <p className="text-sm text-muted-foreground">
                Check and respond to contact inquiries
              </p>
              <Button 
                className="mt-4 w-full" 
                size="sm" 
                variant={stats.unreadMessages > 0 ? "default" : "outline"}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                {stats.unreadMessages > 0 ? `${stats.unreadMessages} Unread` : 'View All'}
              </Button>
            </div>
          </Link>
        </motion.div>
    </div>
  );
}
