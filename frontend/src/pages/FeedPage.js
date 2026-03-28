import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { database, ref, onValue } from '@/lib/firebase';
import api from '@/lib/api';
import { cachePosts, getCachedPosts } from '@/lib/indexeddb';
import Header from '@/components/Header';
import PostCard from '@/components/PostCard';
import CreatePostModal from '@/components/CreatePostModal';
import { Button } from '@/components/ui/button';
import { Plus, MessageSquare, WifiOff, Loader2 } from 'lucide-react';

export default function FeedPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  const fetchPosts = useCallback(async () => {
    try {
      const { data } = await api.get('/posts');
      setPosts(data);
      cachePosts(data);
    } catch (err) {
      console.error('Failed to fetch posts:', err);
      const cached = await getCachedPosts();
      if (cached.length > 0) setPosts(cached);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Firebase real-time listener
  useEffect(() => {
    const postsRef = ref(database, 'posts');
    const unsubscribe = onValue(postsRef, async () => {
      // When Firebase data changes, re-fetch from our API to get full post data with counts
      try {
        const { data } = await api.get('/posts');
        setPosts(data);
        cachePosts(data);
      } catch (err) {
        console.warn('Real-time update fetch failed:', err);
      }
    }, (err) => {
      console.warn('Firebase listener error:', err);
    });

    return () => unsubscribe();
  }, []);

  // Also listen to likes and comments changes
  useEffect(() => {
    const likesRef = ref(database, 'likes');
    const commentsRef = ref(database, 'comments');
    
    const refreshPosts = async () => {
      try {
        const { data } = await api.get('/posts');
        setPosts(data);
        cachePosts(data);
      } catch {}
    };

    const unsub1 = onValue(likesRef, refreshPosts, () => {});
    const unsub2 = onValue(commentsRef, refreshPosts, () => {});

    return () => { unsub1(); unsub2(); };
  }, []);

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => { setIsOffline(false); fetchPosts(); };
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [fetchPosts]);

  const handlePostCreated = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
    setShowCreate(false);
  };

  const handlePostDeleted = (postId) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  const handlePostUpdated = (updatedPost) => {
    setPosts((prev) => prev.map((p) => (p.id === updatedPost.id ? updatedPost : p)));
  };

  const handleLikeToggled = (postId, likeData) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, like_count: likeData.like_count, liked_by: likeData.liked_by }
          : p
      )
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header />
      
      {isOffline && (
        <div data-testid="offline-banner" className="bg-[#F59E0B]/10 border-b border-[#F59E0B]/20 py-2 px-4 flex items-center justify-center gap-2">
          <WifiOff className="w-4 h-4 text-[#F59E0B]" />
          <span className="text-[#F59E0B] text-[13px] font-medium">You're offline. Showing cached content.</span>
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 md:px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 data-testid="feed-title" className="font-heading text-xl sm:text-2xl font-bold text-[#0F172A]">Feed</h1>
          <Button
            data-testid="create-post-btn"
            onClick={() => setShowCreate(true)}
            className="bg-[#CC0000] text-white hover:bg-[#A30000] rounded-md px-4 py-2 font-medium shadow-sm"
          >
            <Plus className="w-4 h-4 mr-1.5" /> New Post
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-[#64748B]" />
          </div>
        ) : posts.length === 0 ? (
          <div data-testid="empty-feed" className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-[#F1F5F9] flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-7 h-7 text-[#64748B]" />
            </div>
            <h3 className="text-lg font-semibold text-[#0F172A] mb-1">No posts yet</h3>
            <p className="text-[#64748B] text-[13px] md:text-[15px]">Be the first to start a discussion!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUser={user}
                onDeleted={handlePostDeleted}
                onUpdated={handlePostUpdated}
                onLikeToggled={handleLikeToggled}
              />
            ))}
          </div>
        )}
      </div>

      <CreatePostModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={handlePostCreated}
      />
    </div>
  );
}
