import { UsersTable } from "@/components/users/usersTable";
import { HydrateClient } from "@/shared/helpers/trpc/server";

export default async function UsersPage() {
  return (
    <HydrateClient>
      <div className="flex flex-raw justify-between p-4">
        <UsersTable />
      </div>
    </HydrateClient>
  );
}
