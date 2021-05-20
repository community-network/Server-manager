import React from "react";
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { Redirect, useHistory} from 'react-router-dom';
import { OperationsApi } from "../api";
import { Column, Card, Header, CardRow, UserRow, TopRow, Button, ButtonRow, ButtonUrl } from "../components";
import '../locales/config';
import { useTranslation } from 'react-i18next';

export default function Account() {
    var history = useHistory();
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
                            isOwner: false,
                            signedIn: false
                        }
                    };
                });
                history.push('/');
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
    var userLine = "";

    if (!userError && !isLoading && user) {
        if (!user.auth.signedIn) {
            return <Redirect to="/" />;
        } else {
            userLine = <UserRow discord={user.discord} />;
        }
    } else if (userError && !isLoading) {
        return <Redirect to="/" />;
    }

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
                        <ButtonUrl name={t("sidebar.logout")} onClick={() => { logoutExecutor.mutate({}); }} name={t("sidebar.logout")} />
                        <ButtonUrl href="https://discord.gametools.network/" name={t("sidebar.help")} />
                    </ButtonRow>
                </Card>
            </Column>
            <Column>
                <Header />
                <Card>
                    <h2>{t("account.permissions.main")}</h2>
                    <CardRow>{t("account.permissions.admin")}</CardRow>
                    <CardRow>{t("account.permissions.server")}</CardRow>
                    <CardRow>{t("account.permissions.system")}</CardRow>
                </Card>
            </Column>
        </TopRow>
    );

}