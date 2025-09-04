// import Editor from "@/components/wiki/editor";
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_admin/wiki')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>{/* <Editor /> */}</div>;
}
