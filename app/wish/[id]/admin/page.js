// app/wish/[id]/admin/page.js
import { redirect } from "next/navigation";

export default async function WishAdminRedirect({ params }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  redirect(`/wish/${id}/edit`);
}
