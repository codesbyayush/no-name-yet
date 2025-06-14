import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { client } from '../utils/orpc';
import { Button } from './ui/button';
import { AutosizeTextarea } from './ui/autosize-textarea';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { toast } from 'sonner';

interface PostExampleProps {
  boardId: string;
}

export function PostExample({ boardId }: PostExampleProps) {
  const queryClient = useQueryClient();
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [postForm, setPostForm] = useState({
    title: '',
    description: '',
    type: 'suggestion' as 'bug' | 'suggestion',
    priority: 'medium' as 'low' | 'medium' | 'high'
  });

  // Fetch posts for the board
  const { data: postsData, isLoading } = useQuery({
    queryKey: ['boardPosts', boardId],
    queryFn: () => client.getBoardPosts({ boardId, offset: 0, take: 10 }),
    enabled: !!boardId
  });

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: (data: typeof postForm) => 
      client.createPost({
        boardId,
        ...data,
        tags: [],
        isAnonymous: false,
        attachments: []
      }),
    onSuccess: () => {
      toast.success('Post created successfully!');
      queryClient.invalidateQueries({ queryKey: ['boardPosts', boardId] });
      setPostForm({ title: '', description: '', type: 'suggestion', priority: 'medium' });
      setIsCreatingPost(false);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create post');
    }
  });

  // Comment mutation
  const createCommentMutation = useMutation({
    mutationFn: ({ feedbackId, content }: { feedbackId: string; content: string }) =>
      client.createComment({
        feedbackId,
        content,
        isInternal: false
      }),
    onSuccess: () => {
      toast.success('Comment added successfully!');
      queryClient.invalidateQueries({ queryKey: ['postComments'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to add comment');
    }
  });

  // Vote mutation
  const voteMutation = useMutation({
    mutationFn: ({ feedbackId, type }: { feedbackId: string; type: 'upvote' | 'downvote' }) =>
      client.voteOnPost({
        feedbackId,
        type,
        weight: 1
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boardPosts', boardId] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to vote');
    }
  });

  const handleCreatePost = () => {
    if (!postForm.title.trim() || !postForm.description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }
    createPostMutation.mutate(postForm);
  };

  const handleVote = (feedbackId: string, type: 'upvote' | 'downvote') => {
    voteMutation.mutate({ feedbackId, type });
  };

  if (isLoading) {
    return <div>Loading posts...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Post Creation Form */}
      <Card>
        <CardHeader>
          <CardTitle>Create New Post</CardTitle>
        </CardHeader>
        <CardContent>
          {!isCreatingPost ? (
            <Button onClick={() => setIsCreatingPost(true)}>
              Create Post
            </Button>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <Input
                  value={postForm.title}
                  onChange={(e) => setPostForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter post title..."
                  maxLength={200}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <AutosizeTextarea
                  value={postForm.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPostForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your feedback..."
                  maxLength={5000}
                />
              </div>

              <div className="flex gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Type</label>
                  <select
                    value={postForm.type}
                    onChange={(e) => setPostForm(prev => ({ ...prev, type: e.target.value as 'bug' | 'suggestion' }))}
                    className="border rounded px-3 py-2"
                  >
                    <option value="suggestion">Suggestion</option>
                    <option value="bug">Bug Report</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Priority</label>
                  <select
                    value={postForm.priority}
                    onChange={(e) => setPostForm(prev => ({ ...prev, priority: e.target.value as 'low' | 'medium' | 'high' }))}
                    className="border rounded px-3 py-2"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleCreatePost}
                  disabled={createPostMutation.isPending}
                >
                  {createPostMutation.isPending ? 'Creating...' : 'Create Post'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsCreatingPost(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Posts List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Posts</h2>
        {postsData?.posts?.map((post: any) => (
          <PostCard 
            key={post.id} 
            post={post} 
            onVote={handleVote}
            onComment={createCommentMutation.mutate}
          />
        ))}
      </div>
    </div>
  );
}

interface PostCardProps {
  post: any;
  onVote: (feedbackId: string, type: 'upvote' | 'downvote') => void;
  onComment: (params: { feedbackId: string; content: string }) => void;
}

function PostCard({ post, onVote, onComment }: PostCardProps) {
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [commentContent, setCommentContent] = useState('');

  // Fetch comments for this post
  const { data: commentsData } = useQuery({
    queryKey: ['postComments', post.id],
    queryFn: () => client.getPostCommentsWithReplies({ 
      feedbackId: post.id, 
      offset: 0, 
      take: 5 
    }),
    enabled: showCommentForm
  });

  const handleAddComment = () => {
    if (!commentContent.trim()) return;
    
    onComment({ 
      feedbackId: post.id, 
      content: commentContent 
    });
    setCommentContent('');
    setShowCommentForm(false);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Post Header */}
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{post.title}</h3>
              <p className="text-gray-600 mt-2">{post.description}</p>
            </div>
            <div className="flex gap-2">
              <Badge variant={post.type === 'bug' ? 'destructive' : 'default'}>
                {post.type}
              </Badge>
              <Badge variant="outline">
                {post.priority}
              </Badge>
            </div>
          </div>

          {/* Post Stats */}
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>👍 {post.stats?.upvotes || 0}</span>
            <span>👎 {post.stats?.downvotes || 0}</span>
            <span>💬 {post.stats?.comments || 0}</span>
            <span>By {post.author?.name || 'Anonymous'}</span>
            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onVote(post.id, 'upvote')}
            >
              👍 Upvote
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onVote(post.id, 'downvote')}
            >
              👎 Downvote
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowCommentForm(!showCommentForm)}
            >
              💬 Comment
            </Button>
          </div>

          {/* Comment Form */}
          {showCommentForm && (
            <div className="space-y-2 pt-4 border-t">
              <AutosizeTextarea
                value={commentContent}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCommentContent(e.target.value)}
                placeholder="Add a comment..."
                maxLength={2000}
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleAddComment}>
                  Add Comment
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowCommentForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Comments List */}
          {commentsData?.comments && commentsData.comments.length > 0 && (
            <div className="space-y-3 pt-4 border-t">
              <h4 className="font-medium">Comments</h4>
              {commentsData.comments.map((comment: any) => (
                <CommentCard key={comment.id} comment={comment} />
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface CommentCardProps {
  comment: any;
}

function CommentCard({ comment }: CommentCardProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-3 space-y-2">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="text-sm">{comment.content}</p>
        </div>
        <div className="flex gap-2 text-xs text-gray-500">
          <span>👍 {comment.stats?.upvotes || 0}</span>
          <span>👎 {comment.stats?.downvotes || 0}</span>
        </div>
      </div>
      
      <div className="flex justify-between items-center text-xs text-gray-500">
        <span>By {comment.author?.name || 'Anonymous'}</span>
        <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
      </div>

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-4 space-y-2">
          {comment.replies.map((reply: any) => (
            <div key={reply.id} className="bg-white rounded p-2 text-sm">
              <p>{reply.content}</p>
              <div className="text-xs text-gray-500 mt-1">
                By {reply.author?.name || 'Anonymous'} • {new Date(reply.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
