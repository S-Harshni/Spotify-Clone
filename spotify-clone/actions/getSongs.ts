import { Song } from "@/types";
import { getServerSupabase } from "@/libs/serverSupabase";


const getSongs = async (): Promise<Song[]> => {
    const supabase = getServerSupabase();

    const {data, error} = await supabase
    .from ('songs')
    .select('*')
    .order('created_at', {ascending: false});

    if (error) {
        console.log(error);
    }

    return (data as any) || [];
};

export default getSongs;