import { Song } from "@/types";
import { getServerSupabase } from "@/libs/serverSupabase";

const getLikedSongs = async (): Promise<Song[]> => {
    const supabase = getServerSupabase();

    const {
        data: {
            session
        }
    } = await supabase.auth.getSession();

    const {data, error} = await supabase
    .from ('liked_songs')
    .select('*, songs(*)')
    .eq ('user_id', session?.user?.id)
    .order('created_at', {ascending: false});

    if (error) {
        console.log(error);
        return [];
    }

    if (!data) {
        return [];
    }

    return data.map((item: any) => ({
        ...item.songs
    }))
};

export default getLikedSongs;