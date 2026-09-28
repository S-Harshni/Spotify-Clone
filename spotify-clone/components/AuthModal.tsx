 "use client";

import { useSessionContext, useSupabaseClient } from "@supabase/auth-helpers-react";
import Modal from "./Modal";
import { useRouter } from "next/navigation";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import useAuthModal from "@/hooks/useAuthModal";
import { useEffect } from "react";

const AuthModal = () => {
    const supabaseClient = useSupabaseClient();
    const router = useRouter();
    const { session } = useSessionContext();
    const { onClose, isOpen} = useAuthModal();

    // After a successful login (session appears while the modal is open), refresh and close.
    // Running this on every mount refreshed the page on each load, which looped on static hosting.
    useEffect(() => {
        if (session && isOpen) {
            router.refresh();
            onClose();
        }
    }, [session, isOpen, router, onClose]);

    const onChange = (open: boolean) => {
        if (!open) {
            onClose(); 
        }
    }
    return (
        <Modal
            title="Welcome back"
            description="Login to your account"
            isOpen={isOpen}
            onChange={onChange}
        >
            <Auth 
                theme="dark"
                magicLink
                providers={["github", "google"]}
                supabaseClient={supabaseClient}
                appearance={{
                    theme: ThemeSupa,
                    variables:{
                        default:{
                            colors:{
                                brand: '#404040',
                                brandAccent: '22c55e'
                            }
                        }
                    }
                }}
            />
        </Modal>
        );
    }

export default AuthModal;