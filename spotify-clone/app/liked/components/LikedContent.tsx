"use client";

import { useRouter } from "next/navigation";
import {Song} from "@/types";
import {useUser} from "@/hooks/useUser";
import { useEffect, useState } from "react";
import { DEMO_MODE, getDemoLikedSongs, LIKES_EVENT } from "@/libs/demo";
import MediaItem from "@/components/MediaItem";
import useOnPlay from "@/hooks/useOnPlay";
import LikeButton from "@/components/LikeButton";

interface LikedContentProps {
    songs: Song[];
}

const LikedContent: React.FC<LikedContentProps> = ({
    songs: initialSongs
}) => {
    const [songs, setSongs] = useState(initialSongs);
    const onPlay = useOnPlay(songs);

    // Demo mode: liked songs live in localStorage, so load them in the browser.
    useEffect(() => {
        if (!DEMO_MODE) return;
        const load = () => { getDemoLikedSongs().then(setSongs); };
        load();
        window.addEventListener(LIKES_EVENT, load);
        return () => window.removeEventListener(LIKES_EVENT, load);
    }, []);
    const router = useRouter();
    const {isLoading, user} = useUser();

    useEffect(() => {
        if (!isLoading && !user) {
            router.replace('/');
        }
    }, [isLoading, user, router]);

    if (songs.length === 0){
        return (
            <div className="
                flex
                flex-col
                gap-y-2
                w-full
                px-6
                text-neutral-400
            ">
                No Liked Songs.
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-y-2 w-full p-6">
            {songs.map((song) => (
                <div
                 key={song.id}
                 className="flex flex-col gap-y-2 w-full"
                >
                    <div className="flex-1">
                        <MediaItem 
                            onClick={(id: string) => onPlay(id)}
                            data={song}
                        />
                    </div>
                    <LikeButton songId={song.id}/>
                </div>
            ))}
            
        </div>
    );
}

export default LikedContent;