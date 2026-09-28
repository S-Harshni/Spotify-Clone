import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

import { createDemoClient, DEMO_MODE } from "./demo";

// Supabase client for server components. Calling cookies() here (outside Supabase's own
// try/catch) lets Next.js see the dynamic usage and render these routes per request.
// Demo mode needs no cookies, so the pages can be statically exported.
export const getServerSupabase = () => {
    if (DEMO_MODE) return createDemoClient();
    const cookieStore = cookies();
    return createServerComponentClient({ cookies: () => cookieStore });
};
