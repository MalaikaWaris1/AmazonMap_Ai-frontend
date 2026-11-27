import { createContext, useContext, useState } from "react";
import { useAuth } from "./AuthContext.jsx";
import {
    createWorkspaceApi,
    inviteMemberApi,
    joinWorkspaceApi,
} from "../api/workspaceService.js";

const WorkspaceContext = createContext(null);

export const WorkspaceProvider = ({ children }) => {
    const { accessToken } = useAuth();

    const [activeWorkspace, setActiveWorkspace] = useState(() => {
        const saved = localStorage.getItem("amazonmap_active_workspace");
        return saved ? JSON.parse(saved) : null;
    });

    const [inviteLink, setInviteLink] = useState(() => {
        return localStorage.getItem("amazonmap_invite_link") || "";
    });

    const [wsLoading, setWsLoading] = useState(false);

    const createWorkspace = async ({ name, slug }) => {
        setWsLoading(true);
        try {
            const response = await createWorkspaceApi({ name, slug }, accessToken);
            setActiveWorkspace(response.workspace);
            setInviteLink(response.inviteLink || "");
            localStorage.setItem("amazonmap_active_workspace", JSON.stringify(response.workspace));
            localStorage.setItem("amazonmap_invite_link", response.inviteLink || "");
            return response;
        } finally {
            setWsLoading(false);
        }
    };

    const inviteMember = async ({ workspaceId, email }) => {
        setWsLoading(true);
        try {
            return await inviteMemberApi(
                { workspaceId: workspaceId || activeWorkspace?._id, email },
                accessToken
            );
        } finally {
            setWsLoading(false);
        }
    };

    const joinWorkspace = async ({ slug, token }) => {
        setWsLoading(true);
        try {
            const response = await joinWorkspaceApi({ slug, token }, accessToken);
            setActiveWorkspace(response.workspace);
            localStorage.setItem("amazonmap_active_workspace", JSON.stringify(response.workspace));
            return response;
        } finally {
            setWsLoading(false);
        }
    };

    return (
        <WorkspaceContext.Provider
            value={{
                activeWorkspace,
                setActiveWorkspace,
                inviteLink,
                wsLoading,
                createWorkspace,
                inviteMember,
                joinWorkspace,
            }}
        >
            {children}
        </WorkspaceContext.Provider>
    );
};

export const useWorkspace = () => {
    const context = useContext(WorkspaceContext);
    if (!context) {
        throw new Error("useWorkspace must be used inside a WorkspaceProvider");
    }
    return context;
};