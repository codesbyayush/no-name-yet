import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ThumbsUp, ThumbsDown, MessageCircle, Calendar, User } from "lucide-react"
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { client } from "@/utils/orpc"
import { useState, useCallback, useRef, useEffect } from "react"
import { AutosizeTextarea } from "../ui/autosize-textarea"

export function RenderPostsList() {
  // Replace dummy data with infinite query
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError
  } = useInfiniteQuery({
    queryKey: ['admin-posts'],
    queryFn: ({ pageParam = 0 }) => 
      client.getOrganizationMemberPosts({ offset: pageParam, take: 10 }),
    getNextPageParam: (lastPage) => 
      lastPage.pagination.hasMore ? lastPage.pagination.offset + lastPage.pagination.take : undefined,
    initialPageParam: 0,
  })

  // Flatten all posts from all pages
  const allPosts = data?.pages.flatMap(page => page.posts) ?? []

  // Intersection Observer for infinite scroll
  const observerRef = useRef<IntersectionObserver | null>(null)

  const lastPostCallback = useCallback((node: HTMLDivElement | null) => {
    if (isLoading) return
    if (observerRef.current) observerRef.current.disconnect()
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage()
      }
    }, {
      rootMargin: '100px' // Trigger 100px before reaching the element
    })
    
    if (node) observerRef.current.observe(node)
  }, [isLoading, hasNextPage, fetchNextPage, isFetchingNextPage])

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [])

  return (
    <div className="space-y-4 py-8">
      
      {isLoading && <div className="text-center py-4">Loading posts...</div>}
      {isError && <div className="text-center py-4 text-red-500">Error loading posts</div>}
      
      <div className="grid gap-4">
        {allPosts.map((post, i) => {
          const isSecondLastPost = i === allPosts.length - 2
          
          return (
            <div key={post.id} ref={isSecondLastPost ? lastPostCallback : null}>
              <PostCard post={post} />
            </div>
          )
        })}
        
        {/* Loading indicator for next page */}
        {isFetchingNextPage && (
          <div className="py-4 text-center">
            <div className="text-sm text-gray-500">Loading more posts...</div>
          </div>
        )}
        
        {/* End of posts indicator */}
        {!hasNextPage && allPosts.length > 0 && (
          <div className="py-4 text-center">
            <div className="text-sm text-gray-500">No more posts to load</div>
          </div>
        )}
      </div>
    </div>
  )
}

function PostCard({ post }: { post: any }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <div className="flex items-center gap-4 mx-auto w-5xl bg-stone-500/5 backdrop-blur-2xl p-5 rounded-xl">
            <div className="flex flex-1 gap-4 items-center">
                <span className="text-sm text-muted-foreground rounded-full bg-yellow-100/75 p-1 size-8 flex items-center justify-center">p</span>
                <span className="text-base font-medium line-clamp-1">{post.title}</span>
            </div>
            <div className="flex gap-3 items-center">
                <span className="text-sm text-stone-300/75 bg-stone-500/5 backdrop-blur-2xl px-3 py-1 rounded-lg">{post.board?.name || 'General'}</span>
                <span className="text-sm text-muted-foreground">{new Date(post.createdAt).toLocaleDateString()}</span>
            </div>

        </div>
      </SheetTrigger>
      <SheetContent className="w-[90%] h-[calc(100vh-2rem)] max-w-[90%] sm:max-w-[600px] md:w-[700px] lg:max-w-[1000px] lg:w-[1000px] overflow-y-auto border-1 border-primary-foreground m-4 p-4 rounded-2xl">
        <PostDetail post={post} />
      </SheetContent>
    </Sheet>
  )
}

function PostDetail({ post }: { post: any }) {
  const postId = post.id
  const [commentText, setCommentText] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const queryClient = useQueryClient()
      
  // Replace useQuery with useInfiniteQuery for comments
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingComments,
    isError: isErrorComments
  } = useInfiniteQuery({
    queryKey: [postId, 'comments'],
    queryFn: ({ pageParam = 0 }) => 
      client.getPostComments({ postId: postId, offset: pageParam, take: 10 }),
    getNextPageParam: (lastPage) => 
      lastPage.pagination.hasMore ? lastPage.pagination.offset + lastPage.pagination.take : undefined,
    initialPageParam: 0,
  })

  // Mutation for creating comments
  const createCommentMutation = useMutation({
    mutationFn: (content: string) => 
      client.publicCreateComment({
        feedbackId: postId,
        content,
        isInternal: false
      }),
    onSuccess: () => {
      // Clear the comment text
      setCommentText("")
      // Invalidate and refetch comments
      queryClient.invalidateQueries({ queryKey: [postId, 'comments'] })
    },
    onError: (error) => {
      console.error("Error creating comment:", error)
      // You could add a toast notification here
    }
  })

  // Handle comment submission
  const handleSubmitComment = async () => {
    if (!commentText.trim()) return
    
    setIsSubmitting(true)
    try {
      await createCommentMutation.mutateAsync(commentText.trim())
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle Enter key press in textarea
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmitComment()
    }
  }
    
  // Flatten all comments from all pages
  const allComments = data?.pages.flatMap(page => page.comments) ?? []
    
  // Intersection Observer for infinite scroll
  const observerRef = useRef<IntersectionObserver | null>(null)
    
  const lastCommentCallback = useCallback((node: HTMLDivElement | null) => {
    if (isLoadingComments) return
    if (observerRef.current) observerRef.current.disconnect()
      
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage()
      }
    }, {
      rootMargin: '100px' // Trigger 100px before reaching the element
    })
      
    if (node) observerRef.current.observe(node)
  }, [isLoadingComments, hasNextPage, fetchNextPage, isFetchingNextPage])
    
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [])

  return (
    <div className="flex gap-4 relative">
      <div className=" rounded-3xl w-5xl border-stone-200 px-6 flex-1">
        <div className={`py-6 space-y-2`}>
          <h4 className="font-semibold text-card-foreground capitalize text-lg">{post?.title}</h4>
          <p className="text-sm text-muted-foreground font-medium capitalize text-pretty">{post?.content}</p>
    
          <div className='ml-auto flex max-w-max pt-6 gap-3'>
            <div>Co ({allComments.length})</div>
            <div>Li (28)</div>
          </div>
        </div>
    
        <div className=' p-4 rounded-2xl bg-secondary/30 border border-secondary mt-6 flex flex-col items-end gap-3'>
          <AutosizeTextarea 
            className=' min-h-20 rounded-lg border-none bg-secondary/30 focus-visible:ring-1' 
            minHeight={50} 
            placeholder='Add a comment...'
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={isSubmitting}
          />
          <Button 
            className='ml-auto rounded-lg'
            onClick={handleSubmitComment}
            disabled={!commentText.trim() || isSubmitting}
          >
            {isSubmitting ? 'Posting...' : 'Comment'}
          </Button>
        </div>
            
        {/* Comments loading state */}
        {isLoadingComments && allComments.length === 0 && (
          <div className="py-4 text-center">
            <div className="text-sm text-gray-500">Loading comments...</div>
          </div>
        )}
            
        {/* Comments error state */}
        {isErrorComments && (
          <div className="py-4 text-center">
            <div className="text-sm text-red-500">Error loading comments</div>
          </div>
        )}
            
        {/* Comments list */}
        {allComments.map((comment, i) => {
          const isSecondLastComment = i === allComments.length - 2
          
          return (
            <div 
              key={comment.id}
              ref={isSecondLastComment ? lastCommentCallback : null}
              className={`flex gap-1 py-4 space-y-2 w-full border-secondary ${i === allComments.length - 1 ? 'border-b-0' : 'border-b-2'}`}
            >
              <div>
                <img src={comment.author?.image || 'https://picsum.photos/64'} alt="Avatar" className="w-8 h-8 rounded-full"/>
              </div>
              <div className='w-full'>
                <div className='flex gap-2 w-full'>
                  <h4>{comment.isAnonymous ? (comment.anonymousName || 'Anonymous') : comment.author?.name}</h4>
                  <span>{new Date(comment.createdAt).toLocaleDateString()}</span> 
                  <span className='ml-auto'>dots</span>
                </div>
                <div>
                  <p>{comment.content}</p>
                </div>
              </div>
            </div>
          )
        })}
            
        {/* Loading indicator for next page of comments */}
        {isFetchingNextPage && (
          <div className="py-4 text-center ">
            <div className="text-sm text-gray-500">Loading more comments...</div>
          </div>
        )}
            
        {/* No comments state */}
        {!isLoadingComments && allComments.length === 0 && (
          <div className="py-4 text-center ">
            <div className="text-sm text-gray-500">No comments yet. Be the first to comment!</div>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-4 sticky top-6 h-fit ">
        <div className="border-1 bg-secondary z-10 rounded-2xl border-stone-200 shadow-2xs p-4 w-3xs">
          <div className='flex gap-3 items-center'>
            <div>
              { post?.author?.image ? <img src={post?.author.image} className='rounded-full h-8'/> : <span className='bg-gray-800 rounded-full'>A</span>}
            </div>
            <div>
              <h4 className="font-medium capitalize text-sm py-1"> {post?.author?.name}</h4>
              <p className='text-xs text-stone-600 pl-px'>{post?.createdAt.toLocaleDateString()}</p>
            </div>
          </div>
          <div>
            { post?.board && 
            <div className='pt-4 pl-px'>
              <span className='pr-4 text-sm font-medium text-stone-600'>Board</span>
              <span className='bg-green-100 text-green-800 text-xs font-medium px-2 rounded-md p-1.5'> {post?.board.name}</span>
            </div>}
          </div>
            
        </div>
        <div className="border-1 bg-white z-10 rounded-2xl border-stone-200 shadow-2xs p-4">
          <h4 className="font-medium capitalize mb-2">Get Updates</h4>
          <Button variant={'secondary'} className='w-full border-1 border-stone-200 rounded-lg font-medium'>Subscribe</Button>
        </div>
      </div>
    </div>
  )
}
    