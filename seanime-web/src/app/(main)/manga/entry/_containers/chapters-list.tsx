import { __manga__chapterDownloadsDrawerIsOpenAtom } from "@/app/(main)/manga/_containers/chapter-downloads/chapter-downloads-drawer"
import {
    __manga_selectedProviderAtom,
    useClearMangaCache,
    useDownloadMangaChapter,
    useMangaChapterContainer,
} from "@/app/(main)/manga/_lib/manga.hooks"
import { MANGA_PROVIDER_OPTIONS, MangaChapterDetails, MangaDownloadData, MangaEntry } from "@/app/(main)/manga/_lib/manga.types"
import { useMangaDownloadDataUtils } from "@/app/(main)/manga/_lib/manga.utils"
import { __manga_selectedChapterAtom, ChapterReaderDrawer } from "@/app/(main)/manga/entry/_containers/chapter-reader/chapter-reader-drawer"
import { ConfirmationDialog, useConfirmationDialog } from "@/components/application/confirmation-dialog"
import { LuffyError } from "@/components/shared/luffy-error"
import { primaryPillCheckboxClass } from "@/components/shared/styling/classnames"
import { Button, IconButton } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { DataGrid, defineDataGridColumns } from "@/components/ui/datagrid"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Select } from "@/components/ui/select"
import { MangaDetailsByIdQuery } from "@/lib/anilist/gql/graphql"
import { useAtom, useSetAtom } from "jotai/react"
import React from "react"
import { FaDownload, FaRedo } from "react-icons/fa"
import { GiOpenBook } from "react-icons/gi"
import { IoBookOutline, IoLibrary } from "react-icons/io5"

type ChaptersListProps = {
    mediaId: string | null
    entry: MangaEntry
    details: MangaDetailsByIdQuery["Media"] | undefined
    downloadData: MangaDownloadData | undefined
    downloadDataLoading: boolean
}

export function ChaptersList(props: ChaptersListProps) {

    const {
        mediaId,
        entry,
        details,
        downloadData,
        downloadDataLoading,
        ...rest
    } = props

    const [showUnreadChapter, setShowUnreadChapter] = React.useState(false)
    const [showDownloadedChapters, setShowDownloadedChapters] = React.useState(false)

    const { chapterContainer, chapterIdToNumbersMap, chapterContainerError, chapterContainerLoading } = useMangaChapterContainer(mediaId)

    const [provider, setProvider] = useAtom(__manga_selectedProviderAtom)

    const { clearMangaCache, isClearingMangaCache } = useClearMangaCache()

    const setSelectedChapter = useSetAtom(__manga_selectedChapterAtom)

    const { downloadChapter, isSendingDownloadRequest } = useDownloadMangaChapter(mediaId)

    const {
        isChapterQueued,
        isChapterDownloaded,
        getProviderNumberOfDownloadedChapters,
    } = useMangaDownloadDataUtils(downloadData, downloadDataLoading)

    const openDownloadQueue = useSetAtom(__manga__chapterDownloadsDrawerIsOpenAtom)

    const retainUnreadChapters = React.useCallback((chapter: MangaChapterDetails) => {
        if (!entry.listData || !chapterIdToNumbersMap.has(chapter.id) || !entry.listData?.progress) return true

        const chapterNumber = chapterIdToNumbersMap.get(chapter.id)
        return chapterNumber && chapterNumber > entry.listData?.progress
    }, [chapterIdToNumbersMap, chapterContainer, entry])

    const confirmReloadSource = useConfirmationDialog({
        title: "Reload sources",
        actionIntent: "primary",
        actionText: "Reload",
        description: "This action will empty the cache for this manga and fetch the latest data from the selected source.",
        onConfirm: () => {
            if (mediaId) {
                clearMangaCache({ mediaId: Number(mediaId) })
            }
        },
    })

    /**
     * Chapter columns
     */
    const columns = React.useMemo(() => defineDataGridColumns<MangaChapterDetails>(() => [
        {
            accessorKey: "title",
            header: "Name",
            size: 10,
        },
        {
            header: "Number",
            size: 90,
            enableSorting: true,
            accessorFn: (row) => {
                return chapterIdToNumbersMap.get(row.id)
            },
        },
        {
            id: "_actions",
            size: 10,
            enableSorting: false,
            enableGlobalFilter: false,
            cell: ({ row }) => {
                return (
                    <div className="flex justify-end gap-2 items-center w-full">
                        {(!isChapterDownloaded(row.original) && !isChapterQueued(row.original)) && <IconButton
                            intent="gray-basic"
                            size="sm"
                            disabled={isSendingDownloadRequest}
                            onClick={() => downloadChapter(row.original)}
                            icon={<FaDownload className="text-sm" />}
                        />}
                        {isChapterQueued(row.original) && <p className="text-[--muted]">Queued</p>}
                        {isChapterDownloaded(row.original) && <p className="text-[--muted] px-1"><IoLibrary className="text-lg" /></p>}
                        <IconButton
                            intent="gray-subtle"
                            size="sm"
                            onClick={() => setSelectedChapter(row.original)}
                            icon={<GiOpenBook />}
                        />
                    </div>
                )
            },
        },
    ]), [chapterIdToNumbersMap, isSendingDownloadRequest, isChapterDownloaded, downloadData])

    const unreadChapters = React.useMemo(() => chapterContainer?.chapters?.filter(ch => retainUnreadChapters(ch)) ?? [], [chapterContainer, entry])
    const allChapters = React.useMemo(() => chapterContainer?.chapters?.toReversed() ?? [], [chapterContainer])

    React.useEffect(() => {
        setShowUnreadChapter(!!unreadChapters.length)
    }, [unreadChapters])

    const chapters = React.useMemo(() => {
        let d = showUnreadChapter ? unreadChapters : allChapters
        if (showDownloadedChapters) {
            d = d.filter(ch => isChapterDownloaded(ch) || isChapterQueued(ch))
        }
        return d
    }, [showUnreadChapter, unreadChapters, allChapters, showDownloadedChapters, isChapterDownloaded, isChapterQueued, downloadData])


    return (
        <div
            className="space-y-2"
        >

            <Button onClick={() => openDownloadQueue(true)}>
                Queue
            </Button>

            <div className="flex gap-2 items-center">
                <Select
                    fieldClass="w-fit"
                    options={MANGA_PROVIDER_OPTIONS}
                    value={provider}
                    onValueChange={setProvider}
                    leftAddon="Source"
                    intent="filled"
                    size="sm"
                    disabled={isClearingMangaCache}
                />

                <Button
                    leftIcon={<FaRedo />}
                    intent="white-subtle"
                    onClick={() => confirmReloadSource.open()}
                    loading={isClearingMangaCache}
                    size="sm"
                >
                    Reload sources
                </Button>
            </div>

            {(chapterContainerLoading || isClearingMangaCache) ? <LoadingSpinner /> : (
                chapterContainerError ? <LuffyError title="Oops!"><p>Failed to fetch chapters</p></LuffyError> : (
                    <>

                        {chapterContainer?.chapters?.length === 0 && (
                            <LuffyError title="No chapters found"><p>Try another source</p></LuffyError>
                        )}

                        {!!unreadChapters?.length && (
                            <>
                                <div className="flex gap-2 items-center w-full pb-2">
                                    <h3 className="px-1">Chapters</h3>
                                    <div className="flex flex-1"></div>
                                    <div>
                                        <Button
                                            intent="white"
                                            rounded
                                            leftIcon={<IoBookOutline />}
                                            onClick={() => {
                                                setSelectedChapter(unreadChapters[0])
                                            }}
                                        >
                                            Continue reading
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-4 border rounded-md bg-[--paper] p-4">

                                    <div className="flex flex-wrap items-center gap-4">
                                        <Checkbox
                                            label="Show unread"
                                            value={showUnreadChapter}
                                            onValueChange={v => setShowUnreadChapter(v as boolean)}
                                            fieldClass="w-fit"
                                            {...primaryPillCheckboxClass}
                                        />
                                        <Checkbox
                                            label={<span className="flex gap-2 items-center"><IoLibrary /> Show downloaded</span>}
                                            value={showDownloadedChapters}
                                            onValueChange={v => setShowDownloadedChapters(v as boolean)}
                                            fieldClass="w-fit"
                                            {...primaryPillCheckboxClass}
                                        />
                                    </div>

                                    <DataGrid<MangaChapterDetails>
                                        columns={columns}
                                        data={chapters}
                                        rowCount={chapters.length}
                                        isLoading={chapterContainerLoading}
                                        rowSelectionPrimaryKey={"id"}
                                        initialState={{
                                            pagination: {
                                                pageIndex: 0,
                                                pageSize: 10,
                                            },
                                        }}
                                        className=""
                                    />
                                </div>
                            </>
                        )}

                        {chapterContainer && <ChapterReaderDrawer
                            entry={entry}
                            chapterContainer={chapterContainer}
                            chapterIdToNumbersMap={chapterIdToNumbersMap}
                        />}
                    </>
                )
            )}

            <DownloadList data={downloadData} />

            <ConfirmationDialog {...confirmReloadSource} />
        </div>
    )
}

// /* -------------------------------------------------------------------------------------------------
//  * Download List
//  * -----------------------------------------------------------------------------------------------*/


type DownloadListProps = {
    data: MangaDownloadData | undefined
}

type DownloadListTableItem = { provider: string, chapterId: string, chapterNumber: string, queued: boolean, downloaded: boolean }

function DownloadList(props: DownloadListProps) {

    const {
        data,
        ...rest
    } = props

    // Transforms {downloaded: Record<string, { chapterId: string, chapterNumber: string }[]>,
    //                            queued: Record<string, { chapterId: string, chapterNumber: string }[]>}
    // to [{provider: string, chapterId: string, queued: boolean, downloaded: boolean}, ...]
    const tableData = React.useMemo(() => {
        let d: DownloadListTableItem[] = []
        if (data) {
            for (const provider in data.downloaded) {
                d = d.concat(data.downloaded[provider].map(ch => ({
                    provider,
                    chapterId: ch.chapterId,
                    chapterNumber: ch.chapterNumber,
                    queued: false,
                    downloaded: true,
                })))
            }
            for (const provider in data.queued) {
                d = d.concat(data.queued[provider].map(ch => ({
                    provider,
                    chapterId: ch.chapterId,
                    chapterNumber: ch.chapterNumber,
                    queued: true,
                    downloaded: false,
                })))
            }
        }
        return d
    }, [data])

    const columns = React.useMemo(() => defineDataGridColumns<DownloadListTableItem>(() => [
        {
            accessorKey: "chapterNumber",
            header: "Chapter",
            size: 10,
            cell: info => <span>Chapter {info.getValue<string>()}</span>,
        },
        {
            accessorKey: "provider",
            header: "Provider",
            size: 10,
        },
        {
            accessorKey: "chapterId",
            header: "Chapter ID",
            size: 10,
        },
        {
            id: "_actions",
            size: 10,
            enableSorting: false,
            enableGlobalFilter: false,
            cell: ({ row }) => {
                return (
                    <div className="flex justify-end gap-2 items-center w-full">
                        {row.original.queued && <p className="text-[--muted]">Queued</p>}
                        {row.original.downloaded && <p className="text-[--muted] px-1"><IoLibrary className="text-lg" /></p>}
                    </div>
                )
            },
        },
    ]), [tableData])

    if (!data || !tableData.length) return null

    return (
        <>
            <h3 className="pt-8">Downloads</h3>

            <div className="space-y-4 border rounded-md bg-[--paper] p-4">

                {/*<div className="flex flex-wrap items-center gap-4">*/}
                {/*    <Checkbox*/}
                {/*        label="Show unread"*/}
                {/*        value={showUnreadChapter}*/}
                {/*        onValueChange={v => setShowUnreadChapter(v as boolean)}*/}
                {/*        fieldClass="w-fit"*/}
                {/*        {...primaryPillCheckboxClass}*/}
                {/*    />*/}
                {/*    <Checkbox*/}
                {/*        label={<span className="flex gap-2 items-center"><IoLibrary /> Show downloaded</span>}*/}
                {/*        value={showDownloadedChapters}*/}
                {/*        onValueChange={v => setShowDownloadedChapters(v as boolean)}*/}
                {/*        fieldClass="w-fit"*/}
                {/*        {...primaryPillCheckboxClass}*/}
                {/*    />*/}
                {/*</div>*/}

                <DataGrid<DownloadListTableItem>
                    columns={columns}
                    data={tableData}
                    rowCount={tableData.length}
                    isLoading={false}
                    rowSelectionPrimaryKey={"id"}
                    initialState={{
                        pagination: {
                            pageIndex: 0,
                            pageSize: 10,
                        },
                    }}
                    className=""
                />
            </div>
        </>
    )
}
