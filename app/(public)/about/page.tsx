import { redirect } from "next/navigation";

// This content now lives on the homepage as a section - see
// app/(public)/page.tsx and the "about" section id there.
export default function AboutRedirect() {
  redirect("/#about");
}
