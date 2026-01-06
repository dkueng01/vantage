import { getApiClient } from "@/lib/api-client";
import { CurrentUser } from "@stackframe/stack";

export const UserService = {
  async ensureUserExists(user: CurrentUser): Promise<void> {
    const pg = await getApiClient(user);

    // 1. Prüfen ob User existiert
    const { data: existingUser } = await pg
      .from("users")
      .select("id")
      .eq("id", user.id)
      .single();

    if (existingUser) return;

    // 2. Wenn nicht, anlegen (ohne Email, wie gewünscht)
    const { error } = await pg
      .from("users")
      .insert({
        id: user.id
      });

    if (error) {
      // Ignorieren falls er parallel erstellt wurde (Duplicate Key)
      if (error.code !== '23505') throw error;
    }
  }
};