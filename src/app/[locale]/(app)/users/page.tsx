import { UsersTable } from '@/components/users/usersTable';
import { HydrateClient } from '@/shared/helpers/trpc/server';
import type { SearchParams } from 'nuqs/server';


type UsersPageProps = {
    searchParams: Promise<SearchParams>;
}

export default async function UsersPage(props: UsersPageProps){
    const searchParams = await props.searchParams;

    return (
        <HydrateClient>
            <div className="flex flex-raw justify-between p-4">
                <UsersTable />
            </div>          
        </HydrateClient>
    );
}