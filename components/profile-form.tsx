"use client";

import { useActionState } from "react";
import { UserRound } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { updateProfileAction, type UpdateProfileState } from "@/app/profile/actions";

export function ProfileForm({
  name,
  bio,
  photoUrl,
  showBio,
}: {
  name: string;
  bio: string;
  photoUrl: string | null;
  showBio: boolean;
}) {
  const [state, formAction, pending] = useActionState<UpdateProfileState, FormData>(
    updateProfileAction,
    undefined
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-muted-foreground">
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- avatar can be a local dev-storage path or an external Spaces URL, not a fixed known set of remote hosts for next/image
            <img src={photoUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <UserRound size={28} />
          )}
        </span>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
          Photo
          <input
            type="file"
            name="photo"
            accept="image/jpeg,image/png,image/webp"
            className="text-sm text-muted-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-muted file:px-3 file:py-2 file:text-sm file:font-medium file:text-foreground"
          />
        </label>
      </div>

      <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
        Name
        <input
          name="name"
          defaultValue={name}
          required
          className="rounded-lg border border-border px-4 py-3 text-base text-foreground focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </label>

      {showBio && (
        <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
          Bio
          <textarea
            name="bio"
            defaultValue={bio}
            rows={4}
            className="rounded-lg border border-border px-4 py-3 text-base text-foreground focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>
      )}

      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className={buttonVariants({ fullWidthMobile: true, className: "disabled:opacity-60" })}
      >
        {pending ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
