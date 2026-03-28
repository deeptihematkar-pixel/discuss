import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { database, ref, onValue } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Send, Trash2, Loader2 } from 'lucide-react';

function timeAgo(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

export default function CommentsSection({ postId, currentUser }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchComments = async () => {
    try {
      const { data } = await api.get(`/posts/${postId}/comments`);
      setComments(data);
    } catch (err) {
      console.error('Failed to fetch comments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  // Real-time listener for comments
  useEffect(() => {
    const commentsRef = ref(database, `comments/${postId}`);
    const unsubscribe = onValue(commentsRef, () => {
      fetchComments();
    }, () => {});
    return () => unsubscribe();
  }, [postId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      const { data } = await api.post(`/posts/${postId}/comments`, { text: newComment.trim() });
      setComments((prev) => [...prev, data]);
      setNewComment('');
    } catch (err) {
      console.error('Failed to add comment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/posts/${postId}/comments/${deleteTarget}`);
      setComments((prev) => prev.filter((c) => c.id !== deleteTarget));
    } catch (err) {
      console.error('Failed to delete comment:', err);
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div data-testid={`comments-section-${postId}`} className="border-t border-[#E2E8F0] bg-[#F8FAFC]/30">
      <div className="p-4 space-y-3">
        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin text-[#64748B]" />
          </div>
        ) : comments.length === 0 ? (
          <p className="text-[#64748B] text-[13px] text-center py-3">No comments yet. Be the first!</p>
        ) : (
          comments.map((c) => (
            <div
              key={c.id}
              data-testid={`comment-${c.id}`}
              className="border-l-4 border-[#3B82F6] bg-white rounded-r-md pl-4 py-3 pr-3 shadow-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span data-testid={`comment-author-${c.id}`} className="font-semibold text-[#0F172A] text-[13px]">{c.author_username}</span>
                  <span className="text-[#64748B] text-xs">{timeAgo(c.timestamp)}</span>
                </div>
                {currentUser?.id === c.author_id && (
                  <button
                    data-testid={`comment-delete-btn-${c.id}`}
                    onClick={() => setDeleteTarget(c.id)}
                    className="p-1 rounded hover:bg-[#EF4444]/10 text-[#64748B] hover:text-[#EF4444] transition-colors shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <p data-testid={`comment-text-${c.id}`} className="text-[#0F172A] text-[13px] md:text-[15px] mt-1 leading-relaxed">{c.text}</p>
            </div>
          ))
        )}

        {/* Add comment form */}
        <form onSubmit={handleSubmit} className="flex gap-2 pt-1">
          <Input
            data-testid={`comment-input-${postId}`}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="flex-1 bg-white border-[#E2E8F0] focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 rounded-md text-[13px]"
          />
          <Button
            type="submit"
            data-testid={`comment-submit-${postId}`}
            disabled={submitting || !newComment.trim()}
            className="bg-[#3B82F6] text-white hover:bg-[#2563EB] rounded-md px-3 shadow-sm shrink-0"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </form>
      </div>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => { if (!v) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete comment?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete your comment.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="comment-delete-cancel">Cancel</AlertDialogCancel>
            <AlertDialogAction data-testid="comment-delete-confirm" onClick={handleDelete} disabled={deleting} className="bg-[#EF4444] text-white hover:bg-[#DC2626]">
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
