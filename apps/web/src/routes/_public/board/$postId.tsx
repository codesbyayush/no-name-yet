import { AutosizeTextarea } from '@/components/ui/autosize-textarea';
import { Button } from '@/components/ui/button'
import { client } from '@/utils/orpc';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useState, useCallback, useRef, useEffect } from "react";
import { CreateEditPost } from "@/components/create-edit-post";

export const Route = createFileRoute('/_public/board/$postId')({
  component: RouteComponent,
})



function RouteComponent() {

  const { postId } = Route.useParams();
  
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

  // Flatten all comments from all pages
  const allComments = data?.pages.flatMap(page => page.comments) ?? []

  const { data: post } = useQuery({
    queryKey: [postId, 'post'],
    queryFn: () => client.getPostById({ postId: postId})
  })

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
      <div className="border-1 px-4 flex-1">
        <div className={`py-4 space-y-2`}>
            <h4 className="font-semibold text-lg">{post?.title}</h4>
            <p className="text-sm text-[#0007149f]">{post?.content}</p>

              <div className='ml-auto'> comms, likes</div>
              <div>

              <AutosizeTextarea />
              <div>

              <Button className='ml-auto'>
                Comment
              </Button>
              </div>
              </div>
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
              className={'flex gap-1 py-4 space-y-2 w-full border-t-2'}
            >
              <div>
                <img src={comment.author?.image || 'https://picsum.photos/64'} alt="Avatar" className="w-8 h-8 rounded-full"/>
              </div>
              <div className='w-full'>
                <div className='flex gap-2 w-full'>
                  <h4>{comment.author?.name}</h4>
                  <span>{comment.createdAt.toLocaleDateString()}</span> 
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
          <div className="py-4 text-center border-t-2">
            <div className="text-sm text-gray-500">Loading more comments...</div>
          </div>
        )}
        
        {/* End of comments indicator */}
        {!hasNextPage && allComments.length > 0 && (
          <div className="py-4 text-center border-t-2">
            <div className="text-sm text-gray-500">No more comments to load</div>
          </div>
        )}
        
        {/* No comments state */}
        {!isLoadingComments && allComments.length === 0 && (
          <div className="py-4 text-center border-t-2">
            <div className="text-sm text-gray-500">No comments yet. Be the first to comment!</div>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-4 sticky top-0 h-fit">
        <div className="border-1 p-4 bg-white z-10">
          <div className="mb-2 text-sm text-gray-600">
            Got an idea?
          </div>
          <CreateEditPost 
            boardId={post?.boardId || ''} // TODO: Get actual board ID from context
            mode="create"
            onSuccess={() => {
              // Refresh the posts list
              window.location.reload(); // Temporary until we have proper invalidation
            }}
          />
        </div>
        <div>
          <h4>Boards</h4>
          {/* Boards content */}
        </div>
      </div>
    </div>
  )
}
