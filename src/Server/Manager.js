
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { OperationsApi } from "../api";
import { useTranslation } from 'react-i18next';


/**
 * Hook to get user info
 */
 export function useUser(sid) {
    return useQuery(
        ['user'], 
        () => OperationsApi.user
    )
}


/**
 * Hook to get server info based on server id
 */
export function useServer(sid) {
    return useQuery(
        ['server' + sid], 
        () => OperationsApi.getServer(sid)
    );
}

/**
 * Hook to get game based on server id
 */
export function useGame(sid) {
    return useQuery(
        ['serverGame' + sid], 
        () => OperationsApi.getServerGame(sid)
    );
}

/**
 * Hook to unban player
 */
export function useUnban() {
    const { t } = useTranslation();
    const [unbanStatus, changeUnbanStatus] = useState({ name: t("server.action.unban"), status: false });
    const unbanPlayerMutation = useMutation(
        v => OperationsApi.unbanPlayer(v), {
            onMutate: async () => {
                changeUnbanStatus({ name: "Pending..", status: true });
                return { status: unbanStatus }
            },
            onSettled: (data, error, variables, context) => {
                changeUnbanStatus(context.status);
            },
        }
    );
    return [unbanStatus, unbanPlayerMutation];
}

/**
 * Hook to remove VIP from a player
 */
export function useRemoveVip() {
    const { t } = useTranslation();
    const [removeVipStatus, changeRemoveVipStatus] = useState({ name: t("server.action.removeVip"), status: false });
    const RemoveVip = useMutation(
        v => OperationsApi.removeVip(v), {
            onMutate: async () => {
                changeRemoveVipStatus({ name: "Pending..", status: true });
                return { status: removeVipStatus }
            },
            onSettled: (data, error, variables, context) => {
                changeRemoveVipStatus(context.status);
            },
        }
    );
    return [removeVipStatus, RemoveVip];
}

/**
 * Hook to add VIP for a player
 */
 export function useAddVip() {
    const { t } = useTranslation();
    var [addVipStatus, changeAddVipStatus] = useState({ name: t("server.action.addVip"), status: false });
    const AddVip = useMutation(
        v => OperationsApi.addVip(v), {
            onMutate: async () => {
                changeAddVipStatus({ name: "Pending..", status: true });
                return { status: addVipStatus }
            },
            onSettled: (data, error, variables, context) => {
                changeAddVipStatus(context.status);
            },
        }
    );
    return [addVipStatus, AddVip];
}

/**
 * Hook to mave a player
 */
 export function useMovePlayer() {
    const queryClient = useQueryClient();
    const movePlayer = useMutation(
        variables => OperationsApi.movePlayer(variables),
        {
            // When mutate is called:
            onMutate: async ({ sid, team, name }) => {
                // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
                //await queryClient.cancelQueries('serverGame' + sid)
                // Snapshot the previous value
                const previousGroup = queryClient.getQueryData('serverGame' + sid)
                // Optimistically update to the new value
                // queryClient.setQueryData('serverGame' + sid, old => {
                //     if (team === "1") {
                //         old.data[0].players[1].players.push(old.data[0].players[0].players.find(e => (!e) ? false : e.name === name));
                //         old.data[0].players[0].players = old.data[0].players[0].players.filter(p => (!p) ? false : p.name !== name);
                //     } else {
                //         old.data[0].players[0].players.push(old.data[0].players[1].players.find(e => (!e) ? false : e.name === name));
                //         old.data[0].players[1].players = old.data[0].players[1].players.filter(p => (!p) ? false : p.name !== name);
                //     }
                //     return old;
                // })
                // Return a context object with the snapshotted value
                return { previousGroup, sid }
            },
            // If the mutation fails, use the context returned from onMutate to roll back
            onError: (err, newTodo, context) => {
                //queryClient.setQueryData('serverGame' + context.sid, context.previousGroup)
            },
            // Always refetch after error or success:
            onSettled: (data, error, variables, context) => {
                //queryClient.invalidateQueries('groupId' + context.gid)
            },
        }
    );
    return movePlayer;
}
