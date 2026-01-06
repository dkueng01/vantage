import { getApiClient } from "@/lib/api-client";
import { Category, DbCategory } from "@/lib/types";
import { CurrentUser } from "@stackframe/stack";
import { UserService } from "./user-service";

export const CategoryService = {
  async getAll(user: CurrentUser): Promise<Category[]> {
    const pg = await getApiClient(user);

    const { data, error } = await pg
      .from("categories")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) throw error;

    // Mapping von DB Format zu App Format
    return (data as DbCategory[]).map(c => ({
      id: c.id,
      name: c.name,
      color: c.color
    }));
  },

  async create(user: CurrentUser, name: string, color: string): Promise<Category> {
    await UserService.ensureUserExists(user); // Lazy Sync
    const pg = await getApiClient(user);

    const { data, error } = await pg
      .from("categories")
      .insert({
        user_id: user.id,
        name: name,
        color: color
      })
      .select()
      .single();

    if (error) throw error;
    const c = data as DbCategory;

    return { id: c.id, name: c.name, color: c.color };
  },

  async delete(user: CurrentUser, id: string): Promise<void> {
    const pg = await getApiClient(user);
    const { error } = await pg.from("categories").delete().eq("id", id);
    if (error) throw error;
  }
};