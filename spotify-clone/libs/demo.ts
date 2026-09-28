// Demo mode (NEXT_PUBLIC_DEMO_MODE=true): an in-browser stand-in for the Supabase client so the
// app runs as a static site (GitHub Pages) with no Supabase project. It implements only the
// calls this app makes: songs / liked_songs / users / subscriptions queries, storage public URLs,
// and a permanently signed-in demo user. Liked songs are stored in localStorage.
import demoSongs from "./demoSongs.json";
import { asset } from "./asset";
import { Song } from "@/types";

export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

const DEMO_USER = {
    id: "demo-user",
    email: "demo@example.com",
    aud: "authenticated",
    role: "authenticated",
    app_metadata: {},
    user_metadata: { full_name: "Demo Listener" },
    created_at: "2026-01-01T00:00:00Z",
};

export const DEMO_SESSION = {
    access_token: "demo-token",
    refresh_token: "demo-refresh",
    token_type: "bearer",
    expires_in: 60 * 60 * 24 * 365,
    expires_at: 4102444800,
    user: DEMO_USER,
};

const LIKES_KEY = "spotify-demo-likes";
export const LIKES_EVENT = "spotify-demo-likes-changed";

type Row = Record<string, any>;
type Result = { data: any; error: { message: string } | null };

function readLikes(): Row[] {
    if (typeof window === "undefined") return [];
    try {
        return JSON.parse(localStorage.getItem(LIKES_KEY) || "[]");
    } catch {
        return [];
    }
}

function writeLikes(rows: Row[]) {
    try {
        localStorage.setItem(LIKES_KEY, JSON.stringify(rows));
        window.dispatchEvent(new Event(LIKES_EVENT));
    } catch {
        // storage unavailable: likes just won't persist
    }
}

function tableRows(table: string): Row[] {
    switch (table) {
        case "songs":
            return demoSongs as Row[];
        case "liked_songs":
            return readLikes().map((like) => ({
                ...like,
                songs: (demoSongs as Row[]).find((s) => s.id === like.song_id),
            }));
        case "users":
            return [{ id: DEMO_USER.id, full_name: "Demo Listener", avatar_url: null }];
        default:
            return [];
    }
}

// Minimal thenable query builder: from(t).select().eq().ilike().in().order().single(),
// plus insert() and delete().eq() for liked_songs.
class DemoQuery implements PromiseLike<Result> {
    private filters: ((r: Row) => boolean)[] = [];
    private sortKey: string | null = null;
    private ascending = true;
    private one = false;
    private op: "select" | "insert" | "delete" = "select";
    private payload: Row | null = null;

    constructor(private table: string) {}

    select() { return this; }
    eq(col: string, value: unknown) { this.filters.push((r) => r[col] === value); return this; }
    in(col: string, values: unknown[]) { this.filters.push((r) => values.includes(r[col])); return this; }
    ilike(col: string, pattern: string) {
        const needle = pattern.replace(/%/g, "").toLowerCase();
        this.filters.push((r) => String(r[col] ?? "").toLowerCase().includes(needle));
        return this;
    }
    order(col: string, opts?: { ascending?: boolean }) {
        this.sortKey = col;
        this.ascending = opts?.ascending ?? true;
        return this;
    }
    single() { this.one = true; return this; }
    insert(row: Row) { this.op = "insert"; this.payload = row; return this; }
    delete() { this.op = "delete"; return this; }

    private run(): Result {
        if (this.op === "insert") {
            if (this.table !== "liked_songs") return { data: null, error: { message: "Read-only in the demo" } };
            writeLikes([...readLikes(), { ...this.payload, created_at: new Date().toISOString() }]);
            return { data: null, error: null };
        }
        if (this.op === "delete") {
            const keep = readLikes().filter((r) => !this.filters.every((f) => f(r)));
            writeLikes(keep);
            return { data: null, error: null };
        }
        let rows = tableRows(this.table).filter((r) => this.filters.every((f) => f(r)));
        if (this.sortKey) {
            const k = this.sortKey;
            rows = [...rows].sort((a, b) => (a[k] > b[k] ? 1 : a[k] < b[k] ? -1 : 0) * (this.ascending ? 1 : -1));
        }
        if (this.one) {
            return rows.length ? { data: rows[0], error: null } : { data: null, error: { message: "No rows found" } };
        }
        return { data: rows, error: null };
    }

    then<T1 = Result, T2 = never>(
        onfulfilled?: ((value: Result) => T1 | PromiseLike<T1>) | null,
        onrejected?: ((reason: unknown) => T2 | PromiseLike<T2>) | null
    ): PromiseLike<T1 | T2> {
        return Promise.resolve(this.run()).then(onfulfilled, onrejected);
    }
}

export function createDemoClient(): any {
    return {
        from: (table: string) => new DemoQuery(table),
        storage: {
            from: (bucket: string) => ({
                getPublicUrl: (path: string) => ({ data: { publicUrl: asset(`/demo/${bucket}/${path}`) } }),
                upload: async () => ({ data: null, error: { message: "Uploads are disabled in the live demo" } }),
            }),
        },
        auth: {
            getSession: async () => ({ data: { session: DEMO_SESSION }, error: null }),
            getUser: async () => ({ data: { user: DEMO_USER }, error: null }),
            onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
            signOut: async () => ({ error: { message: "The live demo always uses the demo account" } }),
        },
    };
}

// Liked songs for the demo user, newest first.
export async function getDemoLikedSongs(): Promise<Song[]> {
    const { data } = await createDemoClient()
        .from("liked_songs")
        .select("*, songs(*)")
        .order("created_at", { ascending: false });
    return ((data as Row[]) || []).map((item) => item.songs).filter(Boolean) as Song[];
}
