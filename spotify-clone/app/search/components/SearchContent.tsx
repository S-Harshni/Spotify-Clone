"use client";

import LikeButton from "@/components/LikeButton";
import MediaItem from "@/components/MediaItem";
import useOnPlay from "@/hooks/useOnPlay";
import { Song } from "@/types";
import { useSearchParams } from "next/navigation";

interface SearchContentProps {
    songs: Song[];
}

const SearchContent: React.FC<SearchContentProps> = ({
    songs: allSongs
}) => {
    // Filter on the client so the page can be statically exported (no server searchParams).
    const title = (useSearchParams().get("title") || "").toLowerCase();
    const songs = title ? allSongs.filter((song) => song.title.toLowerCase().includes(title)) : allSongs;
    const onPlay = useOnPlay(songs);
    if (songs.length ==0){
        return (
            <div
                className="
                    flex
                    flex-col
                    gap-y-2
                    w-full
                    px-6
                    text-neutral-400
                "
            >
                No songs found.
            </div>
        )
    }
    return (
        <div className="flex flex-col gap-y-2 w-full px-6">
            {songs.map((song) =>(
                <div
                    key={song.id}
                    className="flex items-center gap-x-4 w-full"
                >
                    <div className="flex-1">
                        <MediaItem 
                            onClick={(id: string) => onPlay(id)}
                            data={song}
                        />

                    </div>
                    <LikeButton songId={song.id} />
                </div>
            ))}
        </div>
    );
}

export default SearchContent;