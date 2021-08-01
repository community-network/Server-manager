import React from "react";
import { useQuery, useQueryClient, useMutation } from 'react-query';
import { Redirect } from 'react-router-dom';
import { OperationsApi } from "../api";
import { Switch, Column, Card, Header, Row, ButtonRow, Button, TextInput } from "../components";
import '../locales/config';
import { useTranslation } from 'react-i18next';
import styles from "./View.module.css";

export function GroupRow(props) {
    const { t } = useTranslation();
    var group = props.group;
    
    const queryClient = useQueryClient();
    const [groupState, setGroupState] = React.useState(null);
    const [canApply, setCanApply] = React.useState(false);
    const [applyStatus, setApplyStatus] = React.useState(null);
    const [errorUpdating, setError] = React.useState({ code: 0, message: "Unknown" });

    React.useEffect(() => {
        
        if (group) {
            const { makeOperations } = group;
            const originalGroupState = { makeOperations };
            if (groupState === null) {
                setGroupState(originalGroupState);
            } else {
                let newCanApply = false;
                for (var i in originalGroupState) {
                    newCanApply |= groupState[i] !== originalGroupState[i];
                }
                setCanApply(newCanApply);
            }
        }
    }, [group, groupState]);

    const editGroupSettings = useMutation(
        variables => OperationsApi.manEditGroup({ value: variables, gid: group.id }),
        {
            onMutate: async () => {
                setApplyStatus(true);
            },
            onSuccess: async () => {
                setApplyStatus(null);
            },
            onError: async (error) => {
                setApplyStatus(false);
                setError(error);
                setTimeout(_ => setApplyStatus(null), 2000);
            },
            onSettled: async () => {
                queryClient.invalidateQueries('server' + group.id);
            }
        }
    );

    const changeGroupState = (v) => {
        setGroupState(s => ({ ...s, ...v }));
    }

    const getGroupValue = (key) => {
        if (group && key in group) {
            return group[key]
        }
        return "";
    };
    // const [groupListRef, { width }] = useMeasure(); 
    //  ref={groupListRef} 
    var datetime = new Date(group.createdAt);
    return (
        <div className={styles.GroupRow}>
            <div className={styles.GroupHeader}>
                <span className={styles.GroupName}>{group.groupName}</span>

                {/* {width < 350? <span></span>: */}
                    {/* } */}
                <span className={styles.manageDev}>{t("dateTime", {date: datetime})}</span>
            </div>
            <table className={styles.ManagementTable}>
                <thead>
                    <tr className={styles.tableHeaders}>
                        <th>{t("man.worker.main")}</th>
                        <th>{t("man.worker.lastUpdate")}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr className={styles.BanRow}>
                        <td>
                            <span>{group.cookieAcc}</span>
                        </td>
                        <td>
                            <span>{group.lastUpdate!==undefined?t("dateTime", {date: new Date(group.lastUpdate)}):"-"}</span>
                        </td>
                    </tr>
                </tbody>
            </table>
            <table className={styles.ManagementTable}>
                <thead>
                    <tr className={styles.tableHeaders}>
                        <th>{t("man.owners.main")}</th>
                        <th>{t("man.owners.createdAt")}</th>
                    </tr>
                </thead>
                <tbody>
                    {group.owners.map(
                        (player, i) => 
                        <tr className={styles.BanRow}>
                            <td title={player.displayName} className={styles.row}>
                                <div className={styles.AvatarImg}><img src={player.avatar} alt="" /></div>
                                <span>{player.nickName}</span>
                            </td>
                            <td>
                                <span>{t("dateTime", {date: new Date(player.createdAt)})}</span>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
            <table className={styles.ManagementTable}>
                <thead>
                    <tr className={styles.tableHeaders}>
                        <th>{t("man.servers.main")}</th>
                        <th>{t("man.servers.status")}</th>
                        <th>{t("man.servers.lastUpdate")}</th>
                        <th>{t("man.servers.createdAt")}</th>
                    </tr>
                </thead>
                <tbody>
                    {group.servers.map(
                        (server, i) => 
                        <tr className={styles.BanRow}>
                            <td>
                                <span>{server.serverName}</span>
                            </td>
                            <td>
                                <span>{server?(server.isAdmin?t("serverStatus.running"):t("serverStatus.noAdmin")):t("serverStatus.noServer")}</span>
                            </td>
                            <td>
                                <span>{server.lastUpdate!==undefined?t("dateTime", {date: new Date(server.lastUpdate * 1000)}):"-"}</span>
                            </td>
                            <td>
                                <span>{t("dateTime", {date: new Date(server.createdAt)})}</span>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
            <br />
            <h5 className={styles.ManagementTitles}>{t("man.settings.main")}</h5>
            <Switch checked={getGroupValue("makeOperations")} name={t("man.settings.makeOperations")} callback={(v) => changeGroupState({ makeOperations: v })} />
            {
                (group && canApply) ? (
                    <ButtonRow>
                        <Button name={t("apply")} disabled={applyStatus !== null} callback={
                            _ => editGroupSettings.mutate(
                                groupState
                            )
                        } status={applyStatus} />
                        <h5 style={{ marginBottom: 0, alignSelf: "center", opacity: (applyStatus === false) ? 1 : 0 }}>Error {errorUpdating.code}: {errorUpdating.message}</h5>
                    </ButtonRow>
                ) : ""
            }
        </div>
    );
}

export function Manager() {
    const { t } = useTranslation();
    const [searchWord, setSearchWord] = React.useState("");
    const { isLoading, isError, data } = useQuery('devGroups', () => OperationsApi.getManGroups())
    
    var groups = [];

    if (!isLoading && !isError && data) {
        data.data.filter(p => p.groupName.toLowerCase().includes(searchWord.toLowerCase())).map((g, i) => {
            groups.push(<GroupRow key={i} group={g} />);
        });
    } else if (isError) {
        return <Redirect to="/" />;
    }

    return (
        <Row>
            <Column>
                <Header>
                    <h2>{t("man.main")}</h2>
                </Header>
                <Card style={{ paddingTop: "5px" }}>
                    <ButtonRow>
                        <h2 style={{ marginTop: "8px", marginRight: "10px" }}>{t("man.listGroups")}</h2>
                        <TextInput name={t("search")} callback={(v) => setSearchWord(v.target.value)} />
                    </ButtonRow>
                    {groups}
                </Card>
            </Column>
            <Column>

            </Column>
        </Row>
    );

}