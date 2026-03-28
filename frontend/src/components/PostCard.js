import { useState } from 'react';
import api from '@/lib/api';
import CommentsSection from '@/components/CommentsSection';
import ShareModal from '@/components/ShareModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ChevronUp, ChevronDown, MessageSquare, Share2, Pencil, Trash2, Github, ExternalLink, X, Check, Loader2, Hash } from 'lucide-react';

function timeAgo(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function PostCard({ post, currentUser, onDeleted, onUpdated, onVoteChanged, onTagClick }) {
  const [showComments, setShowComments] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(post.title || '');
  const [editContent, setEditContent] = useState(post.content);
  const [editGithub, setEditGithub] = useState(post.github_link || '');
  const [editPreview, setEditPreview] = useState(post.preview_link || '');
  const [saving, setSaving] = useState(false);
  const [voting, setVoting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isAuthor = currentUser?.id === post.author_id;
  const isProject = post.type === 'project';
  const hashtags = post.hashtags || [];
  const userVote = (post.votes || {})[currentUser?.id] || null; // "up", "down", or null

  const handleVote = async (voteType) => {
    if (voting) return;
    setVoting(true);
    try {
      const { data } = await api.post(`/posts/${post.id}/vote`, { vote_type: voteType });
      onVoteChanged(post.id, data);
    } catch {} finally { setVoting(false); }
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      const payload = { content: editContent };
      if (isProject) { payload.title = editTitle; payload.github_link = editGithub; payload.preview_link = editPreview; }
      const { data } = await api.put(`/posts/${post.id}`, payload);
      onUpdated(data);
      setEditing(false);
    } catch {} finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try { await api.delete(`/posts/${post.id}`); onDeleted(post.id); } catch {} finally { setDeleting(false); setShowDeleteConfirm(false); }
  };

  return (
    <div data-testid={`post-card-${post.id}`} className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      <div className="flex">
        {/* Vote column */}
        <div className="flex flex-col items-center py-4 px-2 md:px-3 bg-[#F8FAFC] border-r border-[#E2E8F0] shrink-0">
          <button
            data-testid={`post-upvote-btn-${post.id}`}
            onClick={() => handleVote('up')}
            disabled={voting}
            className={`p-1 rounded-md transition-all ${
              userVote === 'up' ? 'text-[#CC0000] bg-[#CC0000]/10' : 'text-[#64748B] hover:text-[#CC0000] hover:bg-[#CC0000]/5'
            }`}
          >
            <ChevronUp className="w-5 h-5" strokeWidth={userVote === 'up' ? 3 : 2} />
          </button>
          <span data-testid={`post-upvote-count-${post.id}`} className={`text-xs font-bold my-0.5 ${userVote === 'up' ? 'text-[#CC0000]' : 'text-[#0F172A]'}`}>
            {post.upvote_count || 0}
          </span>
          <div className="w-4 h-px bg-[#E2E8F0] my-0.5" />
          <span data-testid={`post-downvote-count-${post.id}`} className={`text-xs font-bold my-0.5 ${userVote === 'down' ? 'text-[#3B82F6]' : 'text-[#0F172A]'}`}>
            {post.downvote_count || 0}
          </span>
          <button
            data-testid={`post-downvote-btn-${post.id}`}
            onClick={() => handleVote('down')}
            disabled={voting}
            className={`p-1 rounded-md transition-all ${
              userVote === 'down' ? 'text-[#3B82F6] bg-[#3B82F6]/10' : 'text-[#64748B] hover:text-[#3B82F6] hover:bg-[#3B82F6]/5'
            }`}
          >
            <ChevronDown className="w-5 h-5" strokeWidth={userVote === 'down' ? 3 : 2} />
          </button>
        </div>

        {/* Content area */}
        <div className="flex-1 min-w-0">
          <div className="p-4 md:p-5">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2 min-w-0 flex-wrap">
                <span data-testid={`post-badge-${post.id}`}
                  className={isProject
                    ? 'bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/20 rounded-full px-2.5 py-0.5 text-xs font-semibold shrink-0'
                    : 'bg-[#FF6B6B]/10 text-[#CC0000] border border-[#FF6B6B]/20 rounded-full px-2.5 py-0.5 text-xs font-semibold shrink-0'
                  }>
                  {isProject ? 'Project' : 'Discussion'}
                </span>
                <span data-testid={`post-author-${post.id}`} className="font-semibold text-[#0F172A] text-[13px] md:text-[15px]">{post.author_username}</span>
                <span className="text-[#64748B] text-xs shrink-0">{timeAgo(post.timestamp)}</span>
              </div>
              {isAuthor && !editing && (
                <div className="flex items-center gap-1 shrink-0">
                  <button data-testid={`post-edit-btn-${post.id}`} onClick={() => setEditing(true)} className="p-1.5 rounded-md hover:bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A] transition-colors">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button data-testid={`post-delete-btn-${post.id}`} onClick={() => setShowDeleteConfirm(true)} className="p-1.5 rounded-md hover:bg-[#EF4444]/10 text-[#64748B] hover:text-[#EF4444] transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Body */}
            {editing ? (
              <div className="space-y-3">
                {isProject && <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="Project title" className="bg-[#F1F5F9] border-transparent focus:bg-white focus:border-[#3B82F6]" />}
                <Textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} placeholder="Content (use #hashtags inline)" rows={3} className="bg-[#F1F5F9] border-transparent focus:bg-white focus:border-[#3B82F6] resize-none" />
                {isProject && (
                  <>
                    <Input value={editGithub} onChange={(e) => setEditGithub(e.target.value)} placeholder="GitHub link" className="bg-[#F1F5F9] border-transparent focus:bg-white focus:border-[#3B82F6]" />
                    <Input value={editPreview} onChange={(e) => setEditPreview(e.target.value)} placeholder="Live preview link" className="bg-[#F1F5F9] border-transparent focus:bg-white focus:border-[#3B82F6]" />
                  </>
                )}
                <div className="flex gap-2">
                  <Button data-testid={`post-save-edit-${post.id}`} onClick={handleSaveEdit} disabled={saving} className="bg-[#CC0000] text-white hover:bg-[#A30000] rounded-md px-3 py-1.5 text-[13px] font-medium">
                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Check className="w-3.5 h-3.5 mr-1" /> Save</>}
                  </Button>
                  <Button onClick={() => setEditing(false)} variant="ghost" className="hover:bg-[#F1F5F9] text-[#64748B] rounded-md px-3 py-1.5 text-[13px]">
                    <X className="w-3.5 h-3.5 mr-1" /> Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {/* Project title */}
                {isProject && post.title && (
                  <h3 data-testid={`post-title-${post.id}`} className="font-semibold text-[#0F172A] text-[15px] md:text-[17px] mb-1.5 leading-snug">{post.title}</h3>
                )}
                {/* Content */}
                <p data-testid={`post-content-${post.id}`} className="text-[#0F172A] text-[13px] md:text-[15px] leading-relaxed whitespace-pre-wrap">{post.content}</p>

                {/* Hashtags */}
                {hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {hashtags.map((tag) => (
                      <button key={tag} data-testid={`post-hashtag-${tag}`} onClick={() => onTagClick?.(tag)}
                        className="inline-flex items-center gap-0.5 bg-[#F1F5F9] hover:bg-[#3B82F6]/10 border border-transparent hover:border-[#3B82F6]/20 rounded-full px-2 py-0.5 text-xs font-medium text-[#64748B] hover:text-[#3B82F6] transition-all">
                        <Hash className="w-3 h-3" />{tag}
                      </button>
                    ))}
                  </div>
                )}

                {/* Project links */}
                {isProject && (post.github_link || post.preview_link) && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {post.github_link && (
                      <a href={post.github_link} target="_blank" rel="noopener noreferrer" data-testid={`post-github-link-${post.id}`}
                        className="inline-flex items-center gap-1.5 bg-[#0F172A] text-white rounded-md px-3 py-1.5 text-xs font-medium hover:bg-[#1E293B] transition-colors">
                        <Github className="w-3.5 h-3.5" /> GitHub
                      </a>
                    )}
                    {post.preview_link && (
                      <a href={post.preview_link} target="_blank" rel="noopener noreferrer" data-testid={`post-preview-link-${post.id}`}
                        className="inline-flex items-center gap-1.5 bg-[#3B82F6] text-white rounded-md px-3 py-1.5 text-xs font-medium hover:bg-[#2563EB] transition-colors">
                        <ExternalLink className="w-3.5 h-3.5" /> Live Preview
                      </a>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Actions bar */}
          {!editing && (
            <div className="flex items-center gap-1 px-3 py-2 border-t border-[#E2E8F0] bg-[#F8FAFC]/50">
              <button data-testid={`post-comments-btn-${post.id}`} onClick={() => setShowComments(!showComments)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A] transition-colors">
                <MessageSquare className="w-4 h-4" />
                <span data-testid={`post-comment-count-${post.id}`}>{post.comment_count || 0}</span>
              </button>
              <button data-testid={`post-share-btn-${post.id}`} onClick={() => setShowShare(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A] transition-colors">
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
            </div>
          )}

          {showComments && <CommentsSection postId={post.id} currentUser={currentUser} />}
        </div>
      </div>

      <ShareModal open={showShare} onClose={() => setShowShare(false)} post={post} />

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete post?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. This will permanently delete your post and all its comments.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid={`post-delete-cancel-${post.id}`}>Cancel</AlertDialogCancel>
            <AlertDialogAction data-testid={`post-delete-confirm-${post.id}`} onClick={handleDelete} disabled={deleting} className="bg-[#EF4444] text-white hover:bg-[#DC2626]">
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
