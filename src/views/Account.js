import React from "react";
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useNavigate} from 'react-router-dom';
import { OperationsApi } from "../api";
import { Column, Card, Header, CardRow, UserRow, TopRow, ButtonRow, ButtonUrl } from "../components";
import '../locales/config';
import { useTranslation } from 'react-i18next';
import ChangeLanguage from '../locales/ChangeLanguage';

export default function Account() {
    var history = useNavigate();
    const queryClient = useQueryClient();

    const logoutExecutor = useMutation(
        v => OperationsApi.logout(),
        {
            // When mutate is called:
            onMutate: async (v) => {
                // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
                await queryClient.cancelQueries('user');
                // Snapshot the previous value
                const prevUser = queryClient.getQueryData('user');
                // Optimistically update to the new value
                queryClient.setQueryData('user', old => {
                    return {
                        discord: {
                            name: "",
                            discriminator: 0,
                            avatar: ""
                        },
                        auth: {
                            inGuild: false,
                            isAdmin: false,
                            isDeveloper: false,
                            isManager: false,
                            isOwner: false,
                            signedIn: false
                        }
                    };
                });
                history('/');
                // Return a context object with the snapshotted value
                return { prevUser }
            },
            // Always refetch after error or success:
            onSettled: (data, error, variables, context) => {
                queryClient.invalidateQueries('user')
            },
        }
    );
    
    const { t } = useTranslation();
    const { error: userError, data: user, isLoading } = useQuery('user', () => OperationsApi.user);


    if (!userError && !isLoading && !!user) {
        if (!user.auth.signedIn) {
           return null;
        }
    } else if (userError || isLoading) {
        return null;
    }

    let userLine = <UserRow discord={user.discord} />;

    return (
        <TopRow>
            <Column>
                <Header>
                    <h2>{t("account.main")}</h2>
                </Header>
                <Card>
                    <h2>{t("account.discordProfile")}</h2>
                    {userLine}
                    <p></p>
                    <ButtonRow>
                        <ButtonUrl name={t("sidebar.logout")} onClick={() => { logoutExecutor.mutate({}); }} />
                        <ButtonUrl href="https://discord.gametools.network/" name={t("sidebar.help")} />
                        <ChangeLanguage/>
                        <ButtonUrl href="https://github.com/sponsors/community-network" name={t("sidebar.sponsor")} />
                    </ButtonRow>
                </Card>
            </Column>
            <Column>
                <Header />
                <Card>
                    <h2>{t("account.permissions.main")}</h2>
                    {
                        (user && user.auth.isAdmin) ? (
                            <CardRow>{t("account.permissions.admin")}</CardRow>
                        ) : (
                            <></>
                        )
                    }
                    {
                        (user && user.auth.isOwner) ? (
                            <CardRow>{t("account.permissions.server")}</CardRow>
                        ) : (
                            <></>
                        )
                    }
                    {
                        (user && user.auth.isManager) ? (
                            <CardRow>{t("account.permissions.system")}</CardRow>
                        ) : (
                            <></>
                        )
                    }
                </Card>
            </Column>
        </TopRow>
    );

}