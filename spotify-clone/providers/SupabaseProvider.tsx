"use client";

import { Database } from "@/types_db";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { useState } from "react";
import { createDemoClient, DEMO_MODE, DEMO_SESSION } from "@/libs/demo";

interface SupabaseProviderProps {
    children: React.ReactNode;
};

const SupabaseProvider: React.FC<SupabaseProviderProps> = ({
    children
}) => {
    const [SupabaseClient] = useState(() =>
        DEMO_MODE ? createDemoClient() : createClientComponentClient<Database>()
    );

    return(
        <SessionContextProvider
            supabaseClient={SupabaseClient}
            initialSession={DEMO_MODE ? (DEMO_SESSION as any) : undefined}
        >
            {children}
        </SessionContextProvider>
    )
}

export default SupabaseProvider;