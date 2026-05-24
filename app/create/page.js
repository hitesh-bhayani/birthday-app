// app/create/page.js
import { redirect } from "next/navigation";

export default function CreateRedirect() {
  redirect("/wish/create");
}
