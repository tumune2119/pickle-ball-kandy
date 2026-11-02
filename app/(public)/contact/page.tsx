import { redirect } from "next/navigation";

// This content now lives on the homepage as a section - see
// app/(public)/page.tsx and the "contact" section id there.
export default function ContactRedirect() {
  redirect("/#contact");
}
