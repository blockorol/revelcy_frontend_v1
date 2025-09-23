import { useAuth } from "@storage/AuthContext";

export function getHeaderJsonWithAuth() {
    const {user} = useAuth();
    return {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${user?.jwt}`

    }
}