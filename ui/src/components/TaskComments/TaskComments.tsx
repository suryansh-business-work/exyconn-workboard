import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Avatar,
  Paper,
  IconButton,
  Menu,
  MenuItem,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  Send as SendIcon,
  MoreVert as MoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  SmartToy as AIIcon,
} from '@mui/icons-material';
import { Comment, AddCommentPayload } from '../../types';
import { taskService, settingsService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import DeleteConfirmDialog from '../DeleteConfirmDialog/DeleteConfirmDialog';
import QuillEditor from '../QuillEditor';

interface TaskCommentsProps {
  taskId: string;
}

const TaskComments = ({ taskId }: TaskCommentsProps) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editingComment, setEditingComment] = useState<Comment | null>(null);
  const [editText, setEditText] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [rewriting, setRewriting] = useState<string | null>(null);

  useEffect(() => {
    fetchComments();
  }, [taskId]);

  const fetchComments = async () => {
    try {
      const data = await taskService.getComments(taskId);
      setComments(data);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!newComment.trim() || !user) return;

    setSubmitting(true);
    try {
      const payload: AddCommentPayload = {
        text: newComment.trim(),
        author: user.name,
        authorEmail: user.email,
      };
      const comment = await taskService.addComment(taskId, payload);
      setComments([...comments, comment]);
      setNewComment('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!editingComment || !editText.trim()) return;

    setSubmitting(true);
    try {
      const payload: AddCommentPayload = {
        text: editText.trim(),
        author: editingComment.author,
        authorEmail: editingComment.authorEmail,
      };
      const updated = await taskService.updateComment(taskId, editingComment.id, payload);
      setComments(comments.map((c) => (c.id === updated.id ? updated : c)));
      setEditingComment(null);
      setEditText('');
    } catch (error) {
      console.error('Failed to update comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedComment) return;

    try {
      await taskService.deleteComment(taskId, selectedComment.id);
      setComments(comments.filter((c) => c.id !== selectedComment.id));
    } catch (error) {
      console.error('Failed to delete comment:', error);
    } finally {
      setDeleteDialogOpen(false);
      setSelectedComment(null);
    }
  };

  const handleRewriteWithAI = async (comment: Comment) => {
    setRewriting(comment.id);
    try {
      const response = await settingsService.rewriteWithAI(comment.text, 'professional');
      setEditingComment(comment);
      setEditText(response.rewrittenText);
    } catch (error) {
      console.error('AI rewrite failed:', error);
    } finally {
      setRewriting(null);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, comment: Comment) => {
    setAnchorEl(event.currentTarget);
    setSelectedComment(comment);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  return (
    <Box className="task-comments">
      <Typography
        variant="h6"
        gutterBottom
        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
      >
        Comments
        <Typography
          variant="caption"
          sx={{ bgcolor: 'grey.200', px: 1, py: 0.5, borderRadius: 1 }}
        >
          {comments.length}
        </Typography>
      </Typography>

      {/* Comment List */}
      <Box sx={{ mb: 3 }}>
        {comments.length === 0 ? (
          <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
            No comments yet. Be the first to comment!
          </Typography>
        ) : (
          comments.map((comment) => (
            <Paper
              key={comment.id}
              sx={{
                p: 2,
                mb: 2,
                bgcolor: editingComment?.id === comment.id ? 'primary.50' : 'grey.50',
                border: '1px solid',
                borderColor:
                  editingComment?.id === comment.id ? 'primary.200' : 'grey.200',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}
              >
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>
                    {getInitials(comment.author)}
                  </Avatar>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle2">{comment.author}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(comment.createdAt)}
                      </Typography>
                      {comment.updatedAt !== comment.createdAt && (
                        <Typography variant="caption" color="text.secondary">
                          (edited)
                        </Typography>
                      )}
                    </Box>
                    {editingComment?.id === comment.id ? (
                      <Box sx={{ mt: 1 }}>
                        <QuillEditor
                          value={editText}
                          onChange={setEditText}
                          placeholder="Edit your comment..."
                          minHeight={80}
                        />
                        <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                          <Button
                            size="small"
                            variant="contained"
                            onClick={handleEdit}
                            disabled={submitting}
                          >
                            Save
                          </Button>
                          <Button
                            size="small"
                            onClick={() => {
                              setEditingComment(null);
                              setEditText('');
                            }}
                          >
                            Cancel
                          </Button>
                        </Box>
                      </Box>
                    ) : (
                      <Box
                        sx={{ mt: 0.5, '& p': { m: 0 } }}
                        dangerouslySetInnerHTML={{ __html: comment.text }}
                      />
                    )}
                  </Box>
                </Box>
                {user?.email === comment.authorEmail && !editingComment && (
                  <Box>
                    {rewriting === comment.id ? (
                      <CircularProgress size={20} />
                    ) : (
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, comment)}
                      >
                        <MoreIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                )}
              </Box>
            </Paper>
          ))
        )}
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* Add Comment */}
      {user ? (
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>
            {getInitials(user.name)}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <QuillEditor
              value={newComment}
              onChange={setNewComment}
              placeholder="Write a comment..."
              minHeight={80}
            />
            <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                size="small"
                endIcon={submitting ? <CircularProgress size={16} /> : <SendIcon />}
                onClick={handleSubmit}
                disabled={submitting || !newComment.trim()}
              >
                Comment
              </Button>
            </Box>
          </Box>
        </Box>
      ) : (
        <Typography color="text.secondary" sx={{ textAlign: 'center' }}>
          Please login to add comments
        </Typography>
      )}

      {/* Context Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem
          onClick={() => {
            handleRewriteWithAI(selectedComment!);
            handleMenuClose();
          }}
        >
          <AIIcon fontSize="small" sx={{ mr: 1 }} />
          Rewrite with AI
        </MenuItem>
        <MenuItem
          onClick={() => {
            setEditingComment(selectedComment);
            setEditText(selectedComment?.text || '');
            handleMenuClose();
          }}
        >
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem
          onClick={() => {
            setDeleteDialogOpen(true);
            handleMenuClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Delete Confirmation */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        title="Delete Comment"
        message="Are you sure you want to delete this comment?"
        onClose={() => {
          setDeleteDialogOpen(false);
          setSelectedComment(null);
        }}
        onConfirm={handleDelete}
      />
    </Box>
  );
};

export default TaskComments;
