import { stackServerApp } from "@/stack/server";
import { redirect } from "next/navigation";

export default async function MobileAuthPage() {
  const user = await stackServerApp.getUser();

  if (!user) {
    redirect("/handler/sign-in?after_auth_return_to=%2Fmobile-auth");
  }

  const authJson = await user.getAuthJson();
  const accessToken = authJson?.accessToken;

  if (!accessToken) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-xl font-semibold">Login failed</h1>
          <p className="text-sm text-slate-500 mt-2">
            No access token was available.
          </p>
        </div>
      </main>
    );
  }

  const appRedirectUrl = `vantage://auth?access_token=${encodeURIComponent(
    accessToken
  )}`;

  redirect(appRedirectUrl);
}