import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { AdSwitch } from "../Ads";
import { OperationsApi } from "../api/api";
import { IUserInfo } from "../api/ReturnTypes";
import {
  ButtonRow,
  ButtonUrl,
  Card,
  CardRow,
  Column,
  Header,
  TopRow,
  UserRow,
} from "../components";
import ChangeLanguage from "../locales/ChangeLanguage";
import "../locales/config";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
let _: React.div;

export default function Account() {
  const { t } = useTranslation();
  document.title = `${t("pageTitle.main")} | ${t("account.main")}`;
  const history = useNavigate();
  const queryClient = useQueryClient();

  const logoutExecutor = useMutation({
    mutationFn: async () => OperationsApi.logout(),

    // When mutate is called:
    onMutate: async () => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({
        queryKey: ["user"],
      });
      // Snapshot the previous value
      const prevUser = queryClient.getQueryData(["user"]);
      // Optimistically update to the new value
      queryClient.setQueryData(["user"], () => {
        return {
          discord: {
            name: "",
            discriminator: 0,
            avatar: "",
          },
          auth: {
            inGuild: false,
            isAdmin: false,
            isDeveloper: false,
            isManager: false,
            isOwner: false,
            signedIn: false,
          },
        };
      });
      history("/");
      // Return a context object with the snapshotted value
      return { prevUser };
    },

    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["user"],
      });
    },
  });

  const {
    error: userError,
    data: user,
    isLoading,
  }: UseQueryResult<IUserInfo, { code: number; message: string }> = useQuery({
    queryKey: ["user"],
    queryFn: () => OperationsApi.user,
  });

  if (!userError && !isLoading && !!user) {
    if (!user.auth.signedIn) {
      return null;
    }
  } else if (userError || isLoading) {
    return null;
  }

  const userLine = <UserRow discord={user.discord} />;

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
            <ButtonUrl
              name={t("sidebar.logout")}
              onClick={() => {
                logoutExecutor.mutate();
              }}
            />
            <ButtonUrl
              href="https://discord.gametools.network/"
              name={t("sidebar.help")}
            />
            <ChangeLanguage />
            <ButtonUrl
              href="https://github.com/sponsors/community-network"
              name={t("sidebar.sponsor")}
            />
            <ButtonUrl
              href="https://explore.transifex.com/gametools/"
              name={t("translation.help")}
            />
            <AdSwitch />
          </ButtonRow>
        </Card>
      </Column>
      <Column>
        <Header />
        <Card>
          <h2>{t("account.permissions.main")}</h2>
          {user?.auth?.isAdmin && (
            <CardRow>{t("account.permissions.admin")}</CardRow>
          )}
          {user?.auth?.isOwner && (
            <CardRow>{t("account.permissions.server")}</CardRow>
          )}
          {user?.auth?.isManager && (
            <CardRow>{t("account.permissions.system")}</CardRow>
          )}
        </Card>
      </Column>
    </TopRow>
  );
}
