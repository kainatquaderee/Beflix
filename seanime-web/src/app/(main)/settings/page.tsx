"use client"
import { useAnimeListTorrentProviderExtensions } from "@/api/hooks/extensions.hooks"
import { useGetMediastreamSettings } from "@/api/hooks/mediastream.hooks"
import { useSaveSettings } from "@/api/hooks/settings.hooks"
import { useGetTorrentstreamSettings } from "@/api/hooks/torrentstream.hooks"
import { useServerStatus, useSetServerStatus } from "@/app/(main)/_hooks/use-server-status"
import { SettingsSubmitButton } from "@/app/(main)/settings/_components/settings-submit-button"
import { FilecacheSettings } from "@/app/(main)/settings/_containers/filecache-settings"
import { MediastreamSettings } from "@/app/(main)/settings/_containers/mediastream-settings"
import { TorrentstreamSettings } from "@/app/(main)/settings/_containers/torrentstream-settings"
import { UISettings } from "@/app/(main)/settings/_containers/ui-settings"
import { BetaBadge } from "@/components/shared/beta-badge"
import { PageWrapper } from "@/components/shared/page-wrapper"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { cn } from "@/components/ui/core/styling"
import { Field, Form } from "@/components/ui/form"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DEFAULT_TORRENT_CLIENT, DEFAULT_TORRENT_PROVIDER, getDefaultMpcSocket, settingsSchema, TORRENT_PROVIDER } from "@/lib/server/settings"
import { atom } from "jotai"
import { useAtom } from "jotai/react"
import React from "react"
import { CgMediaPodcast, CgPlayListSearch } from "react-icons/cg"
import { FaBookReader, FaDiscord } from "react-icons/fa"
import { FcClapperboard, FcFolder, FcVideoCall, FcVlc } from "react-icons/fc"
import { HiPlay } from "react-icons/hi"
import { ImDownload } from "react-icons/im"
import { IoLibrary } from "react-icons/io5"
import { MdNoAdultContent, MdOutlineBroadcastOnHome, MdOutlineDownloading, MdOutlinePalette } from "react-icons/md"
import { PiVideoFill } from "react-icons/pi"
import { RiFolderDownloadFill } from "react-icons/ri"
import { SiAnilist, SiBittorrent } from "react-icons/si"
import { TbDatabaseExclamation } from "react-icons/tb"
import { DiscordRichPresenceSettings } from "./_containers/discord-rich-presence-settings"

const tabsRootClass = cn("w-full grid grid-cols-1 lg:grid lg:grid-cols-[300px,1fr] gap-4")

const tabsTriggerClass = cn(
    "text-base px-6 rounded-md w-fit md:w-full border-none data-[state=active]:bg-[--subtle] data-[state=active]:text-white dark:hover:text-white",
    "h-12 lg:h-10 lg:justify-start px-3",
)

const tabsListClass = cn(
    "w-full flex flex-wrap md:flex-nowrap h-fit md:h-12",
    "lg:block",
)

export const dynamic = "force-static"

const tabAtom = atom<string>("seanime")

export default function Page() {
    const status = useServerStatus()
    const setServerStatus = useSetServerStatus()

    const { mutate, data, isPending } = useSaveSettings()

    const [tab, setTab] = useAtom(tabAtom)

    const { data: torrentProviderExtensions } = useAnimeListTorrentProviderExtensions()

    const { data: mediastreamSettings, isFetching: mediastreamSettingsLoading } = useGetMediastreamSettings(true)

    const { data: torrentstreamSettings } = useGetTorrentstreamSettings()

    React.useEffect(() => {
        if (!isPending && !!data?.settings) {
            setServerStatus(data)
        }
    }, [data, isPending])

    return (
        <PageWrapper className="p-4 sm:p-8 space-y-4">
            <div className="flex flex-col gap-4 md:flex-row justify-between items-center">
                <div className="space-y-1">
                    <h2 className="text-center lg:text-left">Settings</h2>
                    <p className="text-[--muted]">App version: {status?.version}-{status?.os}</p>
                </div>
                <div>

                </div>
            </div>
            {/*<Separator/>*/}


            {/*<Card className="p-0 overflow-hidden">*/}
            <Tabs
                value={tab}
                onValueChange={setTab}
                className={tabsRootClass}
                triggerClass={tabsTriggerClass}
                listClass={tabsListClass}
            >
                <TabsList className="flex-wrap max-w-full">
                    <TabsTrigger value="seanime"><IoLibrary className="text-lg mr-3" /> Seanime</TabsTrigger>
                    <TabsTrigger value="anilist"><SiAnilist className="text-lg mr-3" /> AniList</TabsTrigger>
                    <TabsTrigger value="torrent"><CgPlayListSearch className="text-lg mr-3" /> Torrent Provider</TabsTrigger>
                    <TabsTrigger value="media-player"><PiVideoFill className="text-lg mr-3" /> Media Player</TabsTrigger>
                    <TabsTrigger value="torrent-client"><MdOutlineDownloading className="text-lg mr-3" /> Torrent Client</TabsTrigger>
                    <TabsTrigger value="mediastream" className="relative"><MdOutlineBroadcastOnHome className="text-lg mr-3" /> Media
                                                                                                                                streaming</TabsTrigger>
                    <TabsTrigger value="torrentstream" className="relative"><SiBittorrent className="text-lg mr-3" /> Torrent streaming</TabsTrigger>
                    <TabsTrigger value="manga"><FaBookReader className="text-lg mr-3" /> Manga</TabsTrigger>
                    <TabsTrigger value="onlinestream"><CgMediaPodcast className="text-lg mr-3" /> Online streaming</TabsTrigger>
                    <TabsTrigger value="discord"><FaDiscord className="text-lg mr-3" /> Discord</TabsTrigger>
                    <TabsTrigger value="nsfw"><MdNoAdultContent className="text-lg mr-3" /> NSFW</TabsTrigger>
                    <TabsTrigger value="cache"><TbDatabaseExclamation className="text-lg mr-3" /> Cache</TabsTrigger>
                    <TabsTrigger value="ui"><MdOutlinePalette className="text-lg mr-3" /> User Interface</TabsTrigger>
                </TabsList>

                <div className="">
                    <Form
                        schema={settingsSchema}
                        onSubmit={data => {
                            mutate({
                                library: {
                                    libraryPath: data.libraryPath,
                                    autoUpdateProgress: data.autoUpdateProgress,
                                    disableUpdateCheck: data.disableUpdateCheck,
                                    torrentProvider: data.torrentProvider,
                                    autoScan: data.autoScan,
                                    enableOnlinestream: data.enableOnlinestream,
                                    disableAnimeCardTrailers: data.disableAnimeCardTrailers,
                                    enableManga: data.enableManga,
                                    dohProvider: data.dohProvider === "-" ? "" : data.dohProvider,
                                    openTorrentClientOnStart: data.openTorrentClientOnStart,
                                    openWebURLOnStart: data.openWebURLOnStart,
                                    refreshLibraryOnStart: data.refreshLibraryOnStart,
                                },
                                mediaPlayer: {
                                    host: data.mediaPlayerHost,
                                    defaultPlayer: data.defaultPlayer,
                                    vlcPort: data.vlcPort,
                                    vlcUsername: data.vlcUsername || "",
                                    vlcPassword: data.vlcPassword,
                                    vlcPath: data.vlcPath || "",
                                    mpcPort: data.mpcPort,
                                    mpcPath: data.mpcPath || "",
                                    mpvSocket: data.mpvSocket || "",
                                    mpvPath: data.mpvPath || "",
                                },
                                torrent: {
                                    defaultTorrentClient: data.defaultTorrentClient,
                                    qbittorrentPath: data.qbittorrentPath,
                                    qbittorrentHost: data.qbittorrentHost,
                                    qbittorrentPort: data.qbittorrentPort,
                                    qbittorrentPassword: data.qbittorrentPassword,
                                    qbittorrentUsername: data.qbittorrentUsername,
                                    transmissionPath: data.transmissionPath,
                                    transmissionHost: data.transmissionHost,
                                    transmissionPort: data.transmissionPort,
                                    transmissionUsername: data.transmissionUsername,
                                    transmissionPassword: data.transmissionPassword,
                                },
                                discord: {
                                    enableRichPresence: data?.enableRichPresence ?? false,
                                    enableAnimeRichPresence: data?.enableAnimeRichPresence ?? false,
                                    enableMangaRichPresence: data?.enableMangaRichPresence ?? false,
                                },
                                anilist: {
                                    hideAudienceScore: data.hideAudienceScore,
                                    enableAdultContent: data.enableAdultContent,
                                    blurAdultContent: data.blurAdultContent,
                                },
                            })
                        }}
                        defaultValues={{
                            libraryPath: status?.settings?.library?.libraryPath,
                            mediaPlayerHost: status?.settings?.mediaPlayer?.host,
                            torrentProvider: status?.settings?.library?.torrentProvider || DEFAULT_TORRENT_PROVIDER, // (Backwards compatibility)
                            autoScan: status?.settings?.library?.autoScan,
                            defaultPlayer: status?.settings?.mediaPlayer?.defaultPlayer,
                            vlcPort: status?.settings?.mediaPlayer?.vlcPort,
                            vlcUsername: status?.settings?.mediaPlayer?.vlcUsername,
                            vlcPassword: status?.settings?.mediaPlayer?.vlcPassword,
                            vlcPath: status?.settings?.mediaPlayer?.vlcPath,
                            mpcPort: status?.settings?.mediaPlayer?.mpcPort,
                            mpcPath: status?.settings?.mediaPlayer?.mpcPath,
                            mpvSocket: status?.settings?.mediaPlayer?.mpvSocket,
                            mpvPath: status?.settings?.mediaPlayer?.mpvPath,
                            defaultTorrentClient: status?.settings?.torrent?.defaultTorrentClient || DEFAULT_TORRENT_CLIENT, // (Backwards
                                                                                                                             // compatibility)
                            qbittorrentPath: status?.settings?.torrent?.qbittorrentPath,
                            qbittorrentHost: status?.settings?.torrent?.qbittorrentHost,
                            qbittorrentPort: status?.settings?.torrent?.qbittorrentPort,
                            qbittorrentPassword: status?.settings?.torrent?.qbittorrentPassword,
                            qbittorrentUsername: status?.settings?.torrent?.qbittorrentUsername,
                            transmissionPath: status?.settings?.torrent?.transmissionPath,
                            transmissionHost: status?.settings?.torrent?.transmissionHost,
                            transmissionPort: status?.settings?.torrent?.transmissionPort,
                            transmissionUsername: status?.settings?.torrent?.transmissionUsername,
                            transmissionPassword: status?.settings?.torrent?.transmissionPassword,
                            hideAudienceScore: status?.settings?.anilist?.hideAudienceScore ?? false,
                            autoUpdateProgress: status?.settings?.library?.autoUpdateProgress ?? false,
                            disableUpdateCheck: status?.settings?.library?.disableUpdateCheck ?? false,
                            enableOnlinestream: status?.settings?.library?.enableOnlinestream ?? false,
                            disableAnimeCardTrailers: status?.settings?.library?.disableAnimeCardTrailers ?? false,
                            enableManga: status?.settings?.library?.enableManga ?? false,
                            enableRichPresence: status?.settings?.discord?.enableRichPresence ?? false,
                            enableAnimeRichPresence: status?.settings?.discord?.enableAnimeRichPresence ?? false,
                            enableMangaRichPresence: status?.settings?.discord?.enableMangaRichPresence ?? false,
                            enableAdultContent: status?.settings?.anilist?.enableAdultContent ?? false,
                            blurAdultContent: status?.settings?.anilist?.blurAdultContent ?? false,
                            dohProvider: status?.settings?.library?.dohProvider || "-",
                            openTorrentClientOnStart: status?.settings?.library?.openTorrentClientOnStart ?? false,
                            openWebURLOnStart: status?.settings?.library?.openWebURLOnStart ?? false,
                            refreshLibraryOnStart: status?.settings?.library?.refreshLibraryOnStart ?? false,
                        }}
                        stackClass="space-y-4"
                    >
                        <TabsContent value="seanime" className="space-y-6">

                            <h3>Library</h3>

                            <Field.DirectorySelector
                                name="libraryPath"
                                label="Library directory"
                                leftIcon={<FcFolder />}
                                help="Directory where your anime library is located. (Keep the casing consistent)"
                                shouldExist
                            />
                            <Separator />
                            <Field.Switch
                                name="autoScan"
                                label="Automatically refresh library"
                                help={<div>
                                    <p>If enabled, your library will be refreshed in the background when new files are added/deleted. Make sure to
                                       lock your files regularly.</p>
                                    <p>
                                        <em>Note:</em> This works best when single files are added/deleted. If you are adding a batch, not all
                                                       files
                                                       are guaranteed to be picked up.
                                    </p>
                                </div>}
                            />
                            <Field.Switch
                                name="refreshLibraryOnStart"
                                label="Refresh library on startup"
                                help={<div>
                                    <p>If enabled, your library will be refreshed in the background when the server starts. Make sure to
                                       lock your files regularly.</p>
                                    <p>
                                        <em>Note:</em> Visit the scan summary page to see the results.
                                    </p>
                                </div>}
                            />
                            <Separator />
                            <Field.Switch
                                name="autoUpdateProgress"
                                label="Automatically update progress"
                                help="If enabled, your progress will be automatically updated without having to confirm it when you watch 80% of an episode."
                            />
                            <Separator />

                            <h3>Server</h3>

                            <Field.Switch
                                name="disableUpdateCheck"
                                label="Do not check for updates"
                                help="If enabled, Seanime will not check for new releases."
                            />
                            <Field.Switch
                                name="openTorrentClientOnStart"
                                label="Open torrent client on startup"
                            />
                            <Field.Switch
                                name="openWebURLOnStart"
                                label="Open localhost web URL on startup"
                            />

                            <SettingsSubmitButton isPending={isPending} />

                        </TabsContent>

                        <TabsContent value="nsfw" className="space-y-6">

                            <h3>NSFW</h3>

                            <Field.Switch
                                name="enableAdultContent"
                                label="Enable adult content"
                                help="If disabled, adult content will be hidden from search results and your library."
                            />
                            <Field.Switch
                                name="blurAdultContent"
                                label="Blur adult content"
                                help="If enabled, adult content will be blurred."
                            />

                            <SettingsSubmitButton isPending={isPending} />

                        </TabsContent>

                        <TabsContent value="anilist" className="space-y-6">

                            <h3>AniList</h3>

                            <Field.Switch
                                name="hideAudienceScore"
                                label="Hide audience score"
                                help="If enabled, the audience score will be hidden until you decide to view it."
                            />

                            <Field.Switch
                                name="disableAnimeCardTrailers"
                                label="Disable anime card trailers"
                                help=""
                            />

                            <SettingsSubmitButton isPending={isPending} />

                        </TabsContent>

                        <TabsContent value="manga" className="space-y-6">

                            <h3>Manga</h3>

                            <Field.Switch
                                name="enableManga"
                                label={<span className="flex gap-1 items-center">Enable</span>}
                                help="Read manga series, download chapters and track your progress."
                            />

                            <SettingsSubmitButton isPending={isPending} />

                        </TabsContent>

                        <TabsContent value="onlinestream" className="space-y-6">

                            <h3>Online streaming</h3>

                            <Field.Switch
                                name="enableOnlinestream"
                                label={<span className="flex gap-1 items-center">Enable </span>}
                                help="Watch anime episodes from online sources."
                            />

                            <SettingsSubmitButton isPending={isPending} />

                        </TabsContent>

                        <TabsContent value="discord" className="space-y-6">

                            <h3>Discord</h3>

                            <DiscordRichPresenceSettings />

                            <SettingsSubmitButton isPending={isPending} />

                        </TabsContent>

                        <TabsContent value="torrent" className="space-y-6">

                            <h3>Torrent Provider</h3>

                            <Field.Select
                                name="torrentProvider"
                                // label="Torrent Provider"
                                help="Used by the search engine and auto downloader. AnimeTosho is recommended for better results. Select 'None' if you don't need torrent support."
                                leftIcon={<RiFolderDownloadFill className="text-orange-500" />}
                                options={[
                                    ...(torrentProviderExtensions?.filter(ext => ext?.settings?.type === "main")?.map(ext => ({
                                        label: ext.name,
                                        value: ext.id,
                                    })) ?? []).sort((a, b) => a?.label?.localeCompare(b?.label) ?? 0),
                                    { label: "None", value: TORRENT_PROVIDER.NONE },
                                ]}
                            />


                            {/*<Separator />*/}

                            {/*<h3>DNS over HTTPS</h3>*/}

                            {/*<Field.Select*/}
                            {/*    name="dohProvider"*/}
                            {/*    // label="Torrent Provider"*/}
                            {/*    help="Choose a DNS over HTTPS provider to resolve domain names for torrent search."*/}
                            {/*    leftIcon={<FcFilingCabinet className="-500" />}*/}
                            {/*    options={[*/}
                            {/*        { label: "None", value: "-" },*/}
                            {/*        { label: "Cloudflare", value: "cloudflare" },*/}
                            {/*        { label: "Quad9", value: "quad9" },*/}
                            {/*    ]}*/}
                            {/*/>*/}

                            <SettingsSubmitButton isPending={isPending} />

                        </TabsContent>

                        <TabsContent value="media-player" className="space-y-4">

                            <h3>Media Player</h3>

                            <Field.Select
                                name="defaultPlayer"
                                label="Default player"
                                leftIcon={<FcVideoCall />}
                                options={[
                                    { label: "MPV", value: "mpv" },
                                    { label: "VLC", value: "vlc" },
                                    { label: "MPC-HC", value: "mpc-hc" },
                                ]}
                                help="Player that will be used to open files and track your progress automatically."
                            />

                            <Field.Text
                                name="mediaPlayerHost"
                                label="Host"
                                help="VLC/MPC-HC"
                            />

                            <Accordion
                                type="single"
                                className=""
                                triggerClass="text-[--muted] dark:data-[state=open]:text-white px-0 dark:hover:bg-transparent hover:bg-transparent dark:hover:text-white hover:text-black"
                                itemClass="border-b"
                                contentClass="pb-8"
                                collapsible
                            >
                                <AccordionItem value="vlc">
                                    <AccordionTrigger>
                                        <h4 className="flex gap-2 items-center"><FcVlc /> VLC</h4>
                                    </AccordionTrigger>
                                    <AccordionContent className="space-y-4">
                                        <div className="flex flex-col md:flex-row gap-4">
                                            <Field.Text
                                                name="vlcUsername"
                                                label="Username"
                                            />
                                            <Field.Text
                                                name="vlcPassword"
                                                label="Password"
                                            />
                                            <Field.Number
                                                name="vlcPort"
                                                label="Port"
                                                formatOptions={{
                                                    useGrouping: false,
                                                }}
                                                hideControls
                                            />
                                        </div>
                                        <Field.Text
                                            name="vlcPath"
                                            label="Application path"
                                        />
                                    </AccordionContent>
                                </AccordionItem>

                                <AccordionItem value="mpc-hc">
                                    <AccordionTrigger>
                                        <h4 className="flex gap-2 items-center"><FcClapperboard /> MPC-HC</h4>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <div className="flex flex-col md:flex-row gap-4">
                                            <Field.Number
                                                name="mpcPort"
                                                label="Port"
                                                formatOptions={{
                                                    useGrouping: false,
                                                }}
                                                hideControls
                                            />
                                            <Field.Text
                                                name="mpcPath"
                                                label="Application path"
                                            />
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>

                                <AccordionItem value="mpv">
                                    <AccordionTrigger>
                                        <h4 className="flex gap-2 items-center"><HiPlay className="mr-1 text-purple-100" /> MPV</h4>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <div className="flex gap-4">
                                            <Field.Text
                                                name="mpvSocket"
                                                label="Socket"
                                                placeholder={`Default: '${getDefaultMpcSocket(status?.os ?? "")}'`}
                                            />
                                            <Field.Text
                                                name="mpvPath"
                                                label="Application path"
                                                placeholder="Defaults to 'mpv' command"
                                                help="Leave empty to automatically use the 'mpv' command"
                                            />
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>

                            <SettingsSubmitButton isPending={isPending} />

                        </TabsContent>

                        <TabsContent value="torrent-client" className="space-y-4">

                            <h3>Torrent Client</h3>

                            <Field.Select
                                name="defaultTorrentClient"
                                label="Default torrent client"
                                options={[
                                    { label: "qBittorrent", value: "qbittorrent" },
                                    { label: "Transmission", value: "transmission" },
                                ]}
                            />

                            <Accordion
                                type="single"
                                className=""
                                triggerClass="text-[--muted] dark:data-[state=open]:text-white px-0 dark:hover:bg-transparent hover:bg-transparent dark:hover:text-white hover:text-black"
                                itemClass="border-b"
                                contentClass="pb-8"
                                collapsible
                                defaultValue={status?.settings?.torrent?.defaultTorrentClient}
                            >
                                <AccordionItem value="qbittorrent">
                                    <AccordionTrigger>
                                        <h4 className="flex gap-2 items-center"><ImDownload className="text-blue-400" /> qBittorrent</h4>
                                    </AccordionTrigger>
                                    <AccordionContent className="p-0 py-4 space-y-4">
                                        <Field.Text
                                            name="qbittorrentHost"
                                            label="Host"
                                        />
                                        <div className="flex flex-col md:flex-row gap-4">
                                            <Field.Text
                                                name="qbittorrentUsername"
                                                label="Username"
                                            />
                                            <Field.Text
                                                name="qbittorrentPassword"
                                                label="Password"
                                            />
                                            <Field.Number
                                                name="qbittorrentPort"
                                                label="Port"
                                                formatOptions={{
                                                    useGrouping: false,
                                                }}
                                            />
                                        </div>
                                        <Field.Text
                                            name="qbittorrentPath"
                                            label="Executable"
                                        />
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="transmission">
                                    <AccordionTrigger>
                                        <h4 className="flex gap-2 items-center"><ImDownload className="text-orange-200" /> Transmission</h4>
                                    </AccordionTrigger>
                                    <AccordionContent className="p-0 py-4 space-y-4">
                                        <Field.Text
                                            name="transmissionHost"
                                            label="Host"
                                        />
                                        <div className="flex flex-col md:flex-row gap-4">
                                            <Field.Text
                                                name="transmissionUsername"
                                                label="Username"
                                            />
                                            <Field.Text
                                                name="transmissionPassword"
                                                label="Password"
                                            />
                                            <Field.Number
                                                name="transmissionPort"
                                                label="Port"
                                                formatOptions={{
                                                    useGrouping: false,
                                                }}
                                            />
                                        </div>
                                        <Field.Text
                                            name="transmissionPath"
                                            label="Executable"
                                        />
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>

                            <SettingsSubmitButton isPending={isPending} />

                        </TabsContent>

                    </Form>

                    <TabsContent value="cache" className="space-y-6">

                        <h3>Cache</h3>

                        <FilecacheSettings />

                    </TabsContent>

                    <TabsContent value="mediastream" className="space-y-6">

                        <h3>Media streaming <BetaBadge /></h3>

                        <MediastreamSettings settings={mediastreamSettings} isLoading={mediastreamSettingsLoading} />

                    </TabsContent>

                    <TabsContent value="ui" className="space-y-6">

                        <h3>User Interface</h3>

                        <UISettings />

                    </TabsContent>

                    <TabsContent value="torrentstream" className="space-y-6">

                        <h3>Torrent streaming <BetaBadge /></h3>

                        <TorrentstreamSettings settings={torrentstreamSettings} />

                    </TabsContent>

                </div>
            </Tabs>
            {/*</Card>*/}

        </PageWrapper>
    )

}
