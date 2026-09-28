import { Song } from "@/types";
import { getServerSupabase } from "@/libs/serverSupabase";


const getSongsByUserId = async (): Promise<Song[]> => {
    const supabase = getServerSupabase();

    const{
        data: sessionData,
        error: sessionError
    } = await supabase.auth.getSession();

    if (sessionError) {
        console.log(sessionError.message);
        return [];
    }

    const {data, error} = await supabase
    .from('songs')
    .select('*')
    .eq('user_id', sessionData.session?.user.id)
    .order('created_at', {ascending: false});

    if (error) {
        console.log(error.message);
    }
    return (data as any) || [];
};

export default getSongsByUserId;