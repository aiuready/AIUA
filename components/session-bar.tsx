import { auth } from "@/auth";
import { signOutAction } from "@/lib/auth-actions";

// Minimal always-available "who am I / log out" strip. Not in the Webflow
// spec as its own component, but every gated screen needs a way to sign
// out to be testable at all - real nav per role comes later.
export async function SessionBar() {
  const session = await auth();
  if (!session?.user) return null;

  return (
    <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-2 text-xs text-neutral-600">
      <span>
        Signed in as {session.user.name} &middot; {session.user.role}
      </span>
      <form action={signOutAction}>
        <button type="submit" className="font-medium underline">
          Log out
        </button>
      </form>
    </div>
  );
}
