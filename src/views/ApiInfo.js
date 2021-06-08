import React, { useState } from "react";
import { Column, Card, Header, Row, PageCard } from "../components";
import '../locales/config';
import { useTranslation } from 'react-i18next';
import { CopyBlock, Code, dracula } from "react-code-blocks";

export function ApiInfo() {
    const { t } = useTranslation();
    
    const [languageListing, setLanguageListing] = useState("python");

    const catSettings = {
        python: <PythonLang />,
        rust: <RustLang />,
    }

    const languageCycle = [
        {
            name: t("ApiInfo.examples.python"),
            callback: () => setLanguageListing("python"),
        },
        {
            name: t("ApiInfo.examples.rust"),
            callback: () => setLanguageListing("rust"),
        },
    ];
    
    return (
        <>
            <Row>
                <Column>
                    <Header>
                        <h2>{t("ApiInfo.main")}</h2>
                    </Header>
                    <Card>
                        <h4>
                            without needing token:
                        </h4>
                        <h5>
                            Get the current playerlist of your server<br />
                            GET: https://manager-api.gametools.network/api/servers?serverid=SERVERID
                        </h5>
                        <h4>
                            With token:
                        </h4>
                        <h5>
                            add the token into the header (? means optional)
                        </h5>
                        <h5 style={{paddingTop: '.5rem'}}>
                            Get some basic lists about your server<br />
                            GET: https://manager-api.gametools.network/api/infolist?type=TYPE&serverid=SERVERID&groupid=GROUPID<br />
                            options for type: bannedList, adminList and vipList
                        </h5>
                        <h5 style={{paddingTop: '.5rem'}}>
                            Get the list of people that helped start your server<br />
                            GET: https://manager-api.gametools.network/api/firestarters?serverid=SERVERID&groupid=GROUPID
                        </h5>
                        <h5 style={{paddingTop: '.5rem'}}>
                            Get the logs what the admins did<br />
                            GET: https://manager-api.gametools.network/api/tailserverlog?serverid=SERVERID&groupid=GROUPID
                        </h5>
                        <h5 style={{paddingTop: '.5rem'}}>
                            Get the spectator logs<br />
                            GET: https://manager-api.gametools.network/api/spectators?serverid=SERVERID&groupid=GROUPID
                        </h5>
                        <h5 style={{paddingTop: '2rem'}}>
                            Get the list of all the people within your vBan list<br />
                            GET: https://manager-api.gametools.network/api/autoban?groupid=GROUPID
                        </h5>
                        <h5 style={{paddingTop: '.5rem'}}>
                            Add a player to your vBan list<br />
                            POST: https://manager-api.gametools.network/api/addautoban<br />
                            body: playername, groupid, reason
                        </h5>
                        <h5 style={{paddingTop: '.5rem'}}>
                            remove a player to your vBan list<br />
                            POST: https://manager-api.gametools.network/api/delautoban<br />
                            body: playername, groupid, reason
                        </h5>
                        <h5 style={{paddingTop: '2rem'}}>
                            add people to vip or banlist:<br />
                            POST: https://manager-api.gametools.network/api/changeserver<br />
                            body: request, playername, serverid, groupid, reason?, bantime?, playerid?<br />
                            options for request: addServerBan, removeServerBan, addServerVip and removeServerVip
                        </h5>
                        <h5 style={{paddingTop: '.5rem'}}>
                            kick a player<br />
                            POST: https://manager-api.gametools.network/api/changeplayer<br />
                            body: request, playername, reason, serverid, groupid, playerid?<br />
                            options for request: kickPlayer
                        </h5>
                        <h5 style={{paddingTop: '.5rem'}}>
                            move a player<br />
                            POST: https://manager-api.gametools.network/api/moveplayer<br />
                            body: playername, serverid, groupid, teamid
                        </h5>
                        <h5 style={{paddingTop: '.5rem'}}>
                            change the map<br />
                            POST: https://manager-api.gametools.network/api/changelevel<br />
                            body: serverid, mapnumber, groupid
                        </h5>
                    </Card>
                </Column>
            </Row>

            <Row>
                <Column>
                    <PageCard buttons={languageCycle} maxWidth="650" >
                        {catSettings[languageListing]}
                    </PageCard>
                </Column>
            </Row>
        </>
    );

}

function PythonLang() {
    return (<Code
        text={`import requests

url = "https://manager-api.gametools.network/api/spectators?serverid=SERVERID&groupid=GROUPID"

headers = {
"token": "TOKEN"
}

spectators = requests.get(
url, headers=headers).json()

print(spectators)`}
        language="python"
        theme={dracula}
      />)
}

function RustLang() {
    return (<Code
        text={`#[tokio::main]
async fn get_specs() -> Result<serde_json::Value, Box<dyn std::error::Error>> {
    let url = "https://manager-api.gametools.network/api/spectators?serverid=SERVERID&groupid=GROUPID";
    let client = reqwest::Client::new();

    let resp = client.get(url)
    .header("token", "TOKEN")
    .send()
    .await?
    .json::<serde_json::Value>()
    .await?;

    Ok(resp)
}

fn main() {
    println!("{:#?}", get_specs());
}

`}
        language="rust"
        theme={dracula}
      />)
}