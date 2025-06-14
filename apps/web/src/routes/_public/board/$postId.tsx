import { AutosizeTextarea } from '@/components/ui/autosize-textarea';
import { Button } from '@/components/ui/button'
import { client } from '@/utils/orpc';
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_public/board/$postId')({
  component: RouteComponent,
})



function RouteComponent() {

  const { postId } = Route.useParams();
  const { data } = useQuery({
    queryKey: [postId, 'comments'],
    queryFn: () => client.getPostComments({
      postId: postId
    })
  })

  const { data: post } = useQuery({
    queryKey: [postId, 'post'],
    queryFn: () => client.getPostById({ postId: postId})
  })
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
        {
          data?.comments.map((comment, i) => (
            <div className={'flex gap-1 py-4 space-y-2 w-full border-t-2'}>
              <div>
                <img src={comment.author?.image || 'https://picsum.photos/64'}/>
              </div>
              <div className='w-full'>
                <div className='flex gap-2 w-full'>
                  <h4>{ comment.author?.name }</h4>
                  <span>{comment.createdAt.toLocaleDateString()}</span> 
                  <span className='ml-auto'>dots</span>
                </div>
                <div>
                  <p>{comment.content}</p>
                </div>
              </div>
            </div>
          ))
        }
      </div>
      <div className="flex flex-col gap-4 sticky top-0 h-fit">
        <div className="border-1 p-4 bg-white z-10">
          <div>
            Got an idea
          </div>
          <Button>
            Submit a post
          </Button>
        </div>
        <div>
          <h4>Boards</h4>
          {/* Boards content */}
        </div>
      </div>
    </div>
  )
}
