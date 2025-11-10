import { UsersTable } from "@/components/users/usersTable";
import {
  getQueryClient,
  HydrateClient,
  trpc,
} from "@/shared/helpers/trpc/server";

export default async function UsersPage() {
  // Prefetch data on the server, they will be hydrated on the client
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(trpc.user.list.queryOptions());

  return (
    <HydrateClient>
      <div className="flex flex-raw justify-between p-4">
        <UsersTable />
      </div>
    </HydrateClient>
  );
}
