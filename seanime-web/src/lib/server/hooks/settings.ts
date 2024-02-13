import { SeaEndpoints } from "@/lib/server/endpoints"
import { useSeaMutation } from "@/lib/server/queries/utils"

export function useDefaultSettingsPaths() {

    return {
        getDefaultVlcPath: (os: string) => {
            switch (os) {
                case "windows":
                    return "C:\\Program Files\\VideoLAN\\VLC\\vlc.exe"
                case "linux":
                    return "/usr/bin/vlc" // Default path for VLC on most Linux distributions
                case "darwin":
                    return "/Applications/VLC.app/Contents/MacOS/VLC" // Default path for VLC on macOS
                default:
                    return "C:\\Program Files\\VideoLAN\\VLC\\vlc.exe"
            }
        },
        getDefaultQBittorrentPath: (os: string) => {
            switch (os) {
                case "windows":
                    return "C:/Program Files/qBittorrent/qbittorrent.exe"
                case "linux":
                    return "/usr/bin/qbittorrent" // Default path for Client on most Linux distributions
                case "darwin":
                    return "/Applications/Client.app/Contents/MacOS/qBittorrent" // Default path for Client on macOS
                default:
                    return "C:/Program Files/qBittorrent/qbittorrent.exe"
            }
        },
    }

}

export function getDefaultMpcSocket(os: string) {
    switch (os) {
        case "windows":
            return "\\\\.\\pipe\\mpv_ipc"
        case "linux":
            return "/tmp/mpv_socket" // Default socket for VLC on most Linux distributions
        case "darwin":
            return "/tmp/mpv_socket" // Default socket for VLC on macOS
        default:
            return "/tmp/mpv_socket"
    }
}

export function useOpenDefaultMediaPlayer() {

    const { mutate } = useSeaMutation({
        endpoint: SeaEndpoints.START_MEDIA_PLAYER,
        mutationKey: ["open-default-media-player"],
    })

    return {
        startDefaultMediaPlayer: () => mutate(),
    }

}

export function useStartMpvPlaybackDetection() {

    const { mutate } = useSeaMutation({
        endpoint: SeaEndpoints.START_MPV_PLAYBACK_DETECTION,
        mutationKey: ["start-mpv-playback-detection"],
    })

    return {
        startMpvPlaybackDetection: () => mutate(),
    }

}

export function useOpenMediaEntryInExplorer() {

    const { mutate } = useSeaMutation<boolean, { mediaId: number }>({
        endpoint: SeaEndpoints.OPEN_MEDIA_ENTRY_IN_EXPLORER,
        mutationKey: ["open-media-entry-in-explorer"],
    })

    return {
        openEntryInExplorer: (mediaId: number) => mutate({
            mediaId: mediaId,
        }),
    }

}

export function useOpenInExplorer() {

    const { mutate } = useSeaMutation<boolean, { path: string }>({
        endpoint: SeaEndpoints.OPEN_IN_EXPLORER,
        mutationKey: ["open-in-explorer"],
    })

    return {
        openInExplorer: (path: string) => mutate({
            path: path,
        }),
    }

}
