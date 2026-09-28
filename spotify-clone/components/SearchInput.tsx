"use client";

import qs from "query-string";

import useDebounce from "@/hooks/useDebounce";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Input from "./Input";

const SearchInput = () => {
    const router = useRouter();
    const currentTitle = useSearchParams().get("title") || "";
    // Start from the URL's ?title= so shared/bookmarked searches aren't wiped on load.
    const [value, setValue] = useState <string>(currentTitle);
    const debouncedValue = useDebounce<string>(value,500);
    
    useEffect(() =>{
        if (debouncedValue === currentTitle) {
            return;
        }
        const query = {
            title: debouncedValue,
        };

        const url = qs.stringifyUrl({
            url: '/search',
            query: query
        });

        router.push(url);
    }, [debouncedValue, currentTitle, router]);
    
    
    return (
        <Input
            placeholder="What do you want to listen to?"
            value={value}
            onChange={(e) => setValue (e.target.value)}
        />
    );
}

export default SearchInput;