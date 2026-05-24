// app/wish/[id]/create/page.js
import { redirect } from "next/navigation";

export default async function WishIdCreateRedirect({ params }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  redirect(`/wish/create?cardId=${id}`);
}
