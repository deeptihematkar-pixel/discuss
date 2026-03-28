import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { database, ref, onValue } from '@/lib/firebase';
import api from '@/lib/api';
import { cachePosts, getCachedPosts } from '@/lib/indexeddb';
import Header from '@/components/Header';
import PostCard from '@/components/PostCard';
import CreatePostModal from '@/components/CreatePostModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, MessageSquare, WifiOff, Loader2, Search, X, Hash, TrendingUp } from 'lucide-react';

export default function FeedPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [trendingTags, setTrendingTags] = useState([]);

  const fetchPosts = useCallback(async (search = '') => {
    try {
      const params = search ? { search } : {};
      const { data } = await api.get('/posts', { params });
      setPosts(data);
      if (!search) cachePosts(data);
    } catch (err) {
      console.error('Failed to fetch posts:', err);
      const cached = await getCachedPosts();
      if (cached.length > 0) setPosts(cached);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTrendingTags = useCallback(async () => {
    try {
      const { data } = await api.get('/hashtags/trending');
      setTrendingTags(data);
    } catch {}
  }, []);

  useEffect(() => {
    fetchPosts();
    fetchTrendingTags();
  }, [fetchPosts, fetchTrendingTags]);

  // Firebase real-time listener for posts
  useEffect(() => {
    const postsRef = ref(database, 'posts');
    const unsubscribe = onValue(postsRef, async () => {
      try {
        const params = activeSearch ? { search: activeSearch } : {};
        const { data } = await api.get('/posts', { params });
        setPosts(data);
        if (!activeSearch) cachePosts(data);
        fetchTrendingTags();
      } catch {}
    }, () => {});
    return () => unsubscribe();
  }, [activeSearch, fetchTrendingTags]);

  // Listen to votes and comments
  useEffect(() => {
    const votesRef = ref(database, 'votes');
    const commentsRef = ref(database, 'comments');
    const refresh = async () => {
      try {
        const params = activeSearch ? { search: activeSearch } : {};
        const { data } = await api.get('/posts', { params });
        setPosts(data);
        if (!activeSearch) cachePosts(data);
      } catch {}
    };
    const unsub1 = onValue(votesRef, refresh, () => {});
    const unsub2 = onValue(commentsRef, refresh, () => {});
    return () => { unsub1(); unsub2(); };
  }, [activeSearch]);

  useEffect(() => {
    const handleOnline = () => { setIsOffline(false); fetchPosts(activeSearch); };
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [fetchPosts, activeSearch]);

  const handleSearch = (e) => {
    e.preventDefault();
    setActiveSearch(searchQuery);
    setLoading(true);
    fetchPosts(searchQuery);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setActiveSearch('');
    setLoading(true);
    fetchPosts('');
  };

  const handleTagClick = (tag) => {
    setSearchQuery(tag);
    setActiveSearch(tag);
    setLoading(true);
    fetchPosts(tag);
  };

  const handlePostCreated = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
    setShowCreate(false);
    fetchTrendingTags();
  };

  const handlePostDeleted = (postId) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  const handlePostUpdated = (updatedPost) => {
    setPosts((prev) => prev.map((p) => (p.id === updatedPost.id ? updatedPost : p)));
  };

  const handleVoteChanged = (postId, voteData) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, upvote_count: voteData.upvote_count, downvote_count: voteData.downvote_count, votes: voteData.votes } : p
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
        {/* Header + Create */}
        <div className="flex items-center justify-between mb-4">
          <h1 data-testid="feed-title" className="font-heading text-xl sm:text-2xl font-bold text-[#0F172A]">Feed</h1>
          <Button
            data-testid="create-post-btn"
            onClick={() => setShowCreate(true)}
            className="bg-[#CC0000] text-white hover:bg-[#A30000] rounded-md px-4 py-2 font-medium shadow-sm"
          >
            <Plus className="w-4 h-4 mr-1.5" /> New Post
          </Button>
        </div>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
            <Input
              data-testid="feed-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search posts by title, content, author, or #hashtag..."
              className="pl-10 pr-10 bg-white border-[#E2E8F0] focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 rounded-xl text-[13px] md:text-[15px] h-10"
            />
            {(searchQuery || activeSearch) && (
              <button
                type="button"
                data-testid="feed-search-clear"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0F172A]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </form>

        {/* Active search indicator */}
        {activeSearch && (
          <div data-testid="active-search-badge" className="flex items-center gap-2 mb-4 bg-[#3B82F6]/8 border border-[#3B82F6]/15 rounded-lg px-3 py-2">
            <Search className="w-3.5 h-3.5 text-[#3B82F6]" />
            <span className="text-[#3B82F6] text-[13px] font-medium">
              Showing results for "{activeSearch}"
            </span>
            <button onClick={handleClearSearch} className="ml-auto text-[#3B82F6] hover:text-[#2563EB]">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Trending hashtags */}
        {trendingTags.length > 0 && !activeSearch && (
          <div data-testid="trending-tags" className="mb-5">
            <div className="flex items-center gap-1.5 mb-2">
              <TrendingUp className="w-3.5 h-3.5 text-[#64748B]" />
              <span className="text-[#64748B] text-xs font-semibold uppercase tracking-wider">Trending</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {trendingTags.slice(0, 8).map((t) => (
                <button
                  key={t.tag}
                  data-testid={`trending-tag-${t.tag}`}
                  onClick={() => handleTagClick(t.tag)}
                  className="inline-flex items-center gap-1 bg-white border border-[#E2E8F0] hover:border-[#3B82F6]/30 hover:bg-[#3B82F6]/5 rounded-full px-2.5 py-1 text-xs font-medium text-[#64748B] hover:text-[#3B82F6] transition-all"
                >
                  <Hash className="w-3 h-3" />
                  {t.tag}
                  <span className="text-[10px] opacity-60">({t.count})</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Posts */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-[#64748B]" />
          </div>
        ) : posts.length === 0 ? (
          <div data-testid="empty-feed" className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-[#F1F5F9] flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-7 h-7 text-[#64748B]" />
            </div>
            <h3 className="text-lg font-semibold text-[#0F172A] mb-1">
              {activeSearch ? 'No results found' : 'No posts yet'}
            </h3>
            <p className="text-[#64748B] text-[13px] md:text-[15px]">
              {activeSearch ? `Try a different search term` : 'Be the first to start a discussion!'}
            </p>
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
                onVoteChanged={handleVoteChanged}
                onTagClick={handleTagClick}
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
